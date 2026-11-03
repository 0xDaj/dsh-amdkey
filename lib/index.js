/**
 * dsh-amdkey —— AMD Radeon Cloud 多 key 轮换 + 模型勾选。
 *
 * 服务端职责：
 *   1. 启动本地代理（默认 127.0.0.1:18888），把 /v1/* 转发到 Radeon，轮换 key；
 *   2. 挂载管理 API，供前端读写 key、设置、模型勾选；
 *   3. 把勾选的模型渲染成 provider 定义，写进 profile 的 llm-pi-ai 补丁。
 *
 * 关于「立即生效」：DSH 的 provider 定义属于补丁层，只在启动时组装。
 * 本插件改完补丁后会把「需要重启」如实告诉界面，而不是假装已经生效——
 * 那会让用户以为勾错了模型，去反复点击。
 */
import { KeyStore, maskKey } from './keystore.js';
import { createProxy } from './proxy.js';
import { UsageTracker } from './usage.js';
import { MODEL_CATALOG, CATALOG_BY_ID, DEFAULT_ENABLED, buildProviderConfig } from './catalog.js';
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

export const name = 'dsh-amdkey';

export const inject = [];

const PROVIDER_KEY = 'radeon-cloud';

/** 解析 $DSH_HOME，与 DSH 自己的顺序一致。 */
function resolveDshHome(ctx) {
    const fromCtx = ctx?.profileContext?.home;
    if (typeof fromCtx === 'string' && fromCtx !== '') return fromCtx;
    if (process.env.DSH_HOME) return process.env.DSH_HOME;
    const home = process.env.USERPROFILE || process.env.HOME || '';
    return home ? `${home}/.dsh` : '.dsh';
}

function readJsonBody(req) {
    return new Promise((resolve) => {
        const chunks = [];
        req.on('data', c => chunks.push(c));
        req.on('end', () => {
            try { resolve(JSON.parse(Buffer.concat(chunks).toString('utf8'))); }
            catch { resolve({}); }
        });
        req.on('error', () => resolve({}));
    });
}

function sendJson(res, status, payload) {
    const text = JSON.stringify(payload);
    res.writeHead(status, {
        'content-type': 'application/json; charset=utf-8',
        'content-length': Buffer.byteLength(text),
        'cache-control': 'no-store',
    });
    res.end(text);
}

/**
 * 把勾选的模型写进 profile 的 cordis.patch.yml，并尝试热重载 llm-pi-ai。
 *
 * 这里必须改 profile，而不是只改插件自己的补丁层：profile 里那个 `llm-pi-ai`
 * 条目会把插件层的 config 整份盖掉（DSH 的补丁语义是整份替换，不是深合并），
 * 所以只有写进 profile 这一份，provider 才会真正生效。
 *
 * 写完再 emit `internal/update`，让 loader 重载这一个条目——那是 DSH 自己的
 * 配置热更新通道，不需要重启整个进程。
 *
 * @param {object} ctx 插件上下文
 * @param {string} profileDir
 * @param {string[]} enabledIds
 * @param {number} port
 * @returns {{ changed: boolean, hotReloaded: boolean, error?: string }}
 */
function writeProviderToProfile(ctx, profileDir, enabledIds, port) {
    const file = join(profileDir, 'cordis.patch.yml');
    if (!existsSync(file)) return { changed: false, hotReloaded: false, error: '找不到 profile 的 cordis.patch.yml' };

    let text;
    try { text = readFileSync(file, 'utf8'); }
    catch (error) { return { changed: false, hotReloaded: false, error: `读不出 ${file}：${error.message}` }; }

    const provider = buildProviderConfig(enabledIds, `http://127.0.0.1:${port}/v1`);
    const rendered = renderProviderYaml(PROVIDER_KEY, provider);

    const lines = text.split(/\r?\n/);
    const entryIdx = lines.findIndex(l => /^-\s*id:\s*llm-pi-ai\s*$/.test(l));
    if (entryIdx === -1) return { changed: false, hotReloaded: false, error: 'profile 里没有 llm-pi-ai 条目' };

    const provIdx = lines.findIndex((l, i) => i > entryIdx && /^\s{4}providers:\s*$/.test(l));
    if (provIdx === -1) return { changed: false, hotReloaded: false, error: 'llm-pi-ai 条目里没有 providers 段' };

    let end = lines.length;
    for (let i = provIdx + 1; i < lines.length; i++) {
        const line = lines[i];
        if (line.trim() === '') continue;
        if (/^-\s*id:/.test(line)) { end = i; break; }
        if (/^\s{0,3}\S/.test(line)) { end = i; break; }
    }

    const blockStart = lines.findIndex((l, i) =>
        i > provIdx && i < end && new RegExp(`^\\s{6}${PROVIDER_KEY}:\\s*$`).test(l));

    let next;
    if (blockStart === -1) {
        next = [...lines.slice(0, end), ...rendered.split('\n'), ...lines.slice(end)].join('\n');
    }
    else {
        let blockEnd = end;
        for (let i = blockStart + 1; i < end; i++) {
            const line = lines[i];
            if (line.trim() === '') continue;
            const indent = line.match(/^(\s*)/)[1].length;
            if (indent <= 6) { blockEnd = i; break; }
        }
        next = [...lines.slice(0, blockStart), ...rendered.split('\n'), ...lines.slice(blockEnd)].join('\n');
    }

    if (next === text) return { changed: false, hotReloaded: false };
    try { writeFileSync(file, next, 'utf8'); }
    catch (error) { return { changed: false, hotReloaded: false, error: `写不进 ${file}：${error.message}` }; }

    // 尝试热重载：把新的 llm-pi-ai 配置推给 loader。
    // 拿不到 loader 或它不接受这次更新时，如实返回 hotReloaded:false，
    // 让界面提示重启，而不是假装已经生效。
    let hotReloaded = false;
    try {
        const loader = ctx.get?.('loader');
        const entry = loader?.entries?.find?.(e => e?.options?.id === 'llm-pi-ai');
        if (entry !== undefined && typeof entry.update === 'function') {
            const current = entry.options?.config ?? {};
            const merged = {
                ...current,
                providers: { ...(current.providers ?? {}), [PROVIDER_KEY]: provider },
            };
            const result = entry.update(merged);
            if (result && typeof result.then === 'function') result.catch(() => {});
            hotReloaded = true;
        }
    }
    catch (error) {
        ctx.logger?.warn?.(`amdkey: 热重载失败，需要重启 DSH：${error.message}`);
    }

    return { changed: true, hotReloaded };
}

/** 把一个 provider 定义渲染成 6 空格缩进的 YAML 块。 */
function renderProviderYaml(key, provider) {
    const L = [];
    const q = v => (typeof v === 'string' && /[:#]/.test(v) ? JSON.stringify(v) : String(v));
    L.push(`      ${key}:`);
    L.push(`        displayName: ${q(provider.displayName)}`);
    L.push(`        apiKeyEnv: ${q(provider.apiKeyEnv)}`);
    L.push(`        api: ${provider.api}`);
    L.push(`        baseURL: ${q(provider.baseURL)}`);
    L.push('        compat:');
    for (const [k, v] of Object.entries(provider.compat)) L.push(`          ${k}: ${v}`);
    L.push('        models:');
    for (const model of provider.models) {
        L.push(`          - id: ${q(model.id)}`);
        L.push(`            name: ${q(model.name)}`);
        L.push(`            contextWindow: ${model.contextWindow}`);
        L.push(`            input: [${model.input.join(', ')}]`);
        if (model.reasoningEfforts === false) {
            L.push('            reasoningEfforts: false');
        }
        else {
            L.push('            reasoningEfforts:');
            for (const [k, v] of Object.entries(model.reasoningEfforts)) L.push(`              ${k}: ${v}`);
        }
    }
    return L.join('\n');
}

/**
 * 插件入口。
 * @param {import('@deepseek-ai/cordis').Context} ctx
 */
export async function apply(ctx) {
    const dshHome = resolveDshHome(ctx);
    const profileDir = ctx?.profileContext?.dir
        ?? (process.env.DSH_HOME ? join(process.env.DSH_HOME, 'profiles', 'desktop') : join(dshHome, 'profiles', 'desktop'));
    const store = new KeyStore(dshHome);
    const usage = new UsageTracker(store, ctx.logger);

    const settings = store.getSettings();
    const proxy = createProxy(store, ctx.logger, settings.port);

    let actualPort = settings.port;
    try {
        actualPort = await proxy.listen();
        ctx.logger.info(`amdkey: 代理已启动 http://127.0.0.1:${actualPort} → https://developer.amd.com.cn`);
    }
    catch (error) {
        ctx.logger.error(`amdkey: 代理启动失败（端口 ${settings.port}）：${error.message}`);
    }

    // ── 管理 API ──────────────────────────────────────────────
    ctx.inject(['webServer'], (hostCtx) => {
        const webServer = hostCtx.get('webServer');
        if (webServer === undefined || typeof webServer.register !== 'function') {
            ctx.logger.warn('amdkey: webServer 不可用，管理 API 未挂载');
            return;
        }

        const routes = [];
        const mount = (path, handler) => {
            routes.push(webServer.register({ kind: 'exact', path, handler }));
        };

        mount('/amdkey/api/status', async (req, res) => {
            // 额度查询失败不能拖垮状态接口，所以单独兜住
            let credit = null;
            try { credit = await usage.summary(); } catch { credit = null; }
            // 每个 key 自己的额度：环和数字都用它
            const snap = store.snapshot();
            const perKey = [];
            for (const entry of store.rawKeys()) {
                let u = null;
                try { u = await usage.perKey(entry); } catch { u = null; }
                perKey.push(u);
            }
            snap.keys = snap.keys.map((k, i) => ({ ...k, credit: perKey[i] ?? null }));
            sendJson(res, 200, {
                ...snap,
                credit,
                port: actualPort,
                configuredPort: store.getSettings().port,
                models: store.getModels(),
                catalog: MODEL_CATALOG.map(m => ({
                    id: m.id,
                    name: m.name,
                    contextWindow: m.contextWindow,
                    input: m.input,
                    conversational: m.conversational,
                    effortCount: m.efforts === false ? 0 : Object.keys(m.efforts).length,
                    note: m.note ?? null,
                })),
            });
        });

        mount('/amdkey/api/keys', async (req, res) => {
            if (req.method !== 'POST') { sendJson(res, 405, { error: 'POST only' }); return; }
            const body = await readJsonBody(req);
            const raw = body?.keys;
            const list = typeof raw === 'string'
                ? raw.split(/\r?\n/).map(s => s.trim()).filter(Boolean)
                : Array.isArray(raw) ? raw : [];
            sendJson(res, 200, store.addKeys(list));
        });

        mount('/amdkey/api/keys/remove', async (req, res) => {
            if (req.method !== 'POST') { sendJson(res, 405, { error: 'POST only' }); return; }
            const body = await readJsonBody(req);
            sendJson(res, 200, { removed: store.removeKey(String(body?.key ?? '')) });
        });

        // 误判恢复：网络抖动或上游 5xx 可能被记成配额耗尽，冷却 24h 太重。
        // 这里立即清掉冷却与耗尽标记，让 key 马上回到池子。
        mount('/amdkey/api/keys/revive', async (req, res) => {
            if (req.method !== 'POST') { sendJson(res, 405, { error: 'POST only' }); return; }
            const body = await readJsonBody(req);
            const masked = String(body?.key ?? '');
            const full = store.rawKeys().find(k => maskKey(k) === masked);
            if (full === undefined) { sendJson(res, 404, { error: 'not found' }); return; }
            store.revive(full);
            sendJson(res, 200, { revived: true });
        });

        mount('/amdkey/api/settings', async (req, res) => {
            if (req.method !== 'POST') { sendJson(res, 405, { error: 'POST only' }); return; }
            const body = await readJsonBody(req);
            const next = store.setSettings({
                cooldownHours: body?.cooldownHours,
                port: body?.port,
            });
            sendJson(res, 200, { settings: next, note: '端口改动需重启 DSH 生效' });
        });

        // 模型勾选：存进 amdkey.json，写进 profile 的 provider 定义，并尝试热重载。
        mount('/amdkey/api/models', async (req, res) => {
            if (req.method !== 'POST') { sendJson(res, 405, { error: 'POST only' }); return; }
            const body = await readJsonBody(req);
            const result = store.setModels(body?.models);
            const written = writeProviderToProfile(ctx, profileDir, result.models, store.getSettings().port);
            let note;
            if (written.error) note = `写入失败：${written.error}`;
            else if (!written.changed) note = '没有变化';
            else if (written.hotReloaded) note = '已生效';
            else note = '已写入，但热重载未成功，需重启 DSH';
            sendJson(res, 200, {
                models: result.models,
                dropped: result.dropped,
                profileUpdated: written.changed,
                hotReloaded: written.hotReloaded,
                error: written.error ?? null,
                note,
            });
        });

        // 强制刷新额度（跳过 60 秒缓存）
        mount('/amdkey/api/credit', async (req, res) => {
            if (req.method !== 'POST') { sendJson(res, 405, { error: 'POST only' }); return; }
            let credit = null;
            try { credit = await usage.summary(); } catch (error) { credit = null; }
            sendJson(res, 200, { credit });
        });

        mount('/amdkey/api/reveal', async (req, res) => {
            if (req.method !== 'POST') { sendJson(res, 405, { error: 'POST only' }); return; }
            const remote = req.socket?.remoteAddress ?? '';
            const loopback = remote === '127.0.0.1' || remote === '::1' || remote === '::ffff:127.0.0.1';
            if (!loopback) { sendJson(res, 403, { error: 'loopback only' }); return; }
            const body = await readJsonBody(req);
            const masked = String(body?.masked ?? '');
            const full = store.rawKeys().find(k => maskKey(k) === masked);
            if (full === undefined) { sendJson(res, 404, { error: 'not found' }); return; }
            sendJson(res, 200, { key: full });
        });

        hostCtx.effect(() => () => {
            for (const dispose of routes) {
                try { dispose(); } catch { /* already gone */ }
            }
        });

        ctx.logger.info(`amdkey: 管理 API 已挂载（${routes.length} 条路由）`);
    });

    // ── 收尾 ──────────────────────────────────────────────────
    ctx.effect(() => () => {
        proxy.close().catch(() => {});
    });

    const snap = store.snapshot();
    const models = store.getModels();
    ctx.logger.info(
        `amdkey: ${snap.counts.total} 个 key（可用 ${snap.counts.usable}），已启用 ${models.length} 个模型`,
    );
}

export default { name, inject, apply };
