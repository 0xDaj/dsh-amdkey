/**
 * key 池与持久化。
 *
 * 所有状态都存在 $DSH_HOME/amdkey.json：
 *   { keys: [{ key, usedTokens, cooldownUntil, lastUsedAt, exhausted }], settings: {...} }
 *
 * 读写都走一个串行队列，避免并发请求同时改文件把内容写坏。
 */
import { existsSync, mkdirSync, readFileSync, renameSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { CATALOG_BY_ID, DEFAULT_ENABLED } from './catalog.js';

const FILE_NAME = 'amdkey.json';

const DEFAULTS = {
    cooldownHours: 24,
    port: 18888,
};

/** 单次写入的原子替换：先写临时文件再 rename，避免半截内容。 */
function atomicWrite(file, text) {
    const tmp = `${file}.tmp-${process.pid}`;
    mkdirSync(dirname(file), { recursive: true });
    writeFileSync(tmp, text, 'utf8');
    renameSync(tmp, file);
}

/** 一个 key 是否是合理形状。AMD 的 key 形如 rc-<hex>。 */
export function isPlausibleKey(value) {
    if (typeof value !== 'string') return false;
    const t = value.trim();
    if (t.length < 8 || t.length > 200) return false;
    if (/\s/.test(t)) return false;
    return /^[A-Za-z0-9._\-]+$/.test(t);
}

/** 掩码：保留前段，末尾 8 位换成星号。与界面的显示规则一致。 */
export function maskKey(key) {
    if (typeof key !== 'string') return '********';
    if (key.length <= 8) return '********';
    return `${key.slice(0, key.length - 8)}********`;
}

export class KeyStore {
    /** @param {string} dshHome 解析后的 $DSH_HOME */
    constructor(dshHome) {
        this.file = join(dshHome, FILE_NAME);
        this.state = {
            keys: [],
            settings: { ...DEFAULTS },
            models: [...DEFAULT_ENABLED],
        };
        this.chain = Promise.resolve();
        this.load();
    }

    load() {
        try {
            if (!existsSync(this.file)) return;
            const raw = readFileSync(this.file, 'utf8');
            const parsed = JSON.parse(raw);
            const keys = Array.isArray(parsed?.keys) ? parsed.keys : [];
            this.state.keys = keys
                .filter(entry => entry && isPlausibleKey(entry.key))
                .map(entry => ({
                    key: String(entry.key).trim(),
                    usedTokens: Number(entry.usedTokens) || 0,
                    cooldownUntil: Number(entry.cooldownUntil) || 0,
                    lastUsedAt: Number(entry.lastUsedAt) || 0,
                    exhausted: Boolean(entry.exhausted),
                }));
            const s = parsed?.settings;
            this.state.settings = {
                cooldownHours: Number(s?.cooldownHours) || DEFAULTS.cooldownHours,
                port: Number(s?.port) || DEFAULTS.port,
            };
            // 勾选的模型：只保留目录里还存在的 id，未知 id 静默丢弃。
            const stored = Array.isArray(parsed?.models) ? parsed.models : null;
            this.state.models = stored === null
                ? [...DEFAULT_ENABLED]
                : stored.filter(id => typeof id === 'string' && CATALOG_BY_ID.has(id));
        }
        catch {
            // 文件坏了就当空的：key 是敏感数据，不猜、不修，只报告。
            this.state = {
                keys: [],
                settings: { ...DEFAULTS },
                models: [...DEFAULT_ENABLED],
            };
        }
    }

    /** 当前勾选的模型 id。 */
    getModels() {
        return [...this.state.models];
    }

    /**
     * 整体替换勾选列表。
     * @param {string[]} ids
     * @returns {{ models: string[], dropped: string[] }}
     */
    setModels(ids) {
        const list = Array.isArray(ids) ? ids : [];
        const kept = [];
        const dropped = [];
        const seen = new Set();
        for (const raw of list) {
            const id = typeof raw === 'string' ? raw.trim() : '';
            if (!CATALOG_BY_ID.has(id)) { if (id !== '') dropped.push(id); continue; }
            if (seen.has(id)) continue;
            seen.add(id);
            kept.push(id);
        }
        this.state.models = kept;
        void this.persist();
        return { models: [...kept], dropped };
    }

    /** 串行写入，返回写入后的快照。 */
    persist() {
        this.chain = this.chain.then(() => {
            atomicWrite(this.file, `${JSON.stringify(this.state, null, 2)}\n`);
            return this.state;
        }).catch(() => this.state);
        return this.chain;
    }

    getSettings() {
        return { ...this.state.settings };
    }

    setSettings(patch) {
        const next = { ...this.state.settings };
        if (patch.cooldownHours !== undefined) {
            const v = Number(patch.cooldownHours);
            if (Number.isInteger(v) && v >= 1 && v <= 720) next.cooldownHours = v;
        }
        if (patch.port !== undefined) {
            const v = Number(patch.port);
            if (Number.isInteger(v) && v >= 1024 && v <= 65535) next.port = v;
        }
        this.state.settings = next;
        void this.persist();
        return { ...next };
    }

    /** 现在是否在冷却中。 */
    static isCooling(entry, now = Date.now()) {
        return entry.cooldownUntil > now;
    }

    /** 可用 = 不在冷却 且 未标记耗尽。 */
    static isUsable(entry, now = Date.now()) {
        if (entry.exhausted) return false;
        return entry.cooldownUntil <= now;
    }

    /** 添加若干 key，返回 { added, skipped }。 */
    addKeys(input) {
        const list = Array.isArray(input) ? input : [input];
        const added = [];
        const skipped = [];
        const seen = new Set(this.state.keys.map(e => e.key));

        for (const raw of list) {
            const key = typeof raw === 'string' ? raw.trim() : '';
            if (!isPlausibleKey(key)) { skipped.push({ key: maskKey(key || String(raw)), reason: '格式不正确' }); continue; }
            if (seen.has(key)) { skipped.push({ key: maskKey(key), reason: '已存在' }); continue; }
            seen.add(key);
            this.state.keys.push({ key, usedTokens: 0, cooldownUntil: 0, lastUsedAt: 0, exhausted: false });
            added.push(key);
        }

        if (added.length > 0) void this.persist();
        return { added: added.length, skipped };
    }

    /** 按掩码或完整值删除。 */
    removeKey(target) {
        const before = this.state.keys.length;
        this.state.keys = this.state.keys.filter(entry => entry.key !== target && maskKey(entry.key) !== target);
        const removed = before - this.state.keys.length;
        if (removed > 0) void this.persist();
        return removed;
    }

    /**
     * 取一个可用 key。
     * @returns {{ key: string, index: number } | null}
     */
    pick(now = Date.now()) {
        const idx = this.state.keys.findIndex(entry => KeyStore.isUsable(entry, now));
        if (idx === -1) return null;
        return { key: this.state.keys[idx].key, index: idx };
    }

    /** 记录一次成功请求的用量。 */
    recordUsage(key, tokens) {
        const entry = this.state.keys.find(e => e.key === key);
        if (!entry) return;
        const add = Number(tokens);
        if (Number.isFinite(add) && add > 0) entry.usedTokens += add;
        entry.lastUsedAt = Date.now();
        void this.persist();
    }

    /**
     * 标记一个 key 进入冷却。
     * @param {string} key
     * @param {boolean} exhausted 是否是配额耗尽（而非临时限流）
     */
    markCooldown(key, exhausted = false) {
        const entry = this.state.keys.find(e => e.key === key);
        if (!entry) return;
        const hours = this.state.settings.cooldownHours;
        entry.cooldownUntil = Date.now() + hours * 3600 * 1000;
        entry.exhausted = exhausted;
        void this.persist();
    }

    /**
     * 按毫秒数冷却一个 key。
     * 限流用这个：AMD 回 60 秒，就只停 65 秒，不占用配额耗尽的 24 小时规则。
     * @param {string} key
     * @param {number} ms 冷却时长（毫秒）
     * @param {boolean} exhausted 是否标记为配额耗尽
     */
    markCooldownMs(key, ms, exhausted = false) {
        const entry = this.state.keys.find(e => e.key === key);
        if (!entry) return;
        entry.cooldownUntil = Date.now() + Math.max(0, Number(ms) || 0);
        entry.exhausted = exhausted;
        void this.persist();
    }

    /**
     * 立即清除一个 key 的冷却与耗尽标记。
     * 用于误判场景：网络抖动、上游 5xx 被记成配额耗尽，24h 太重。
     */
    revive(key) {
        const entry = this.state.keys.find(e => e.key === key);
        if (!entry) return false;
        entry.cooldownUntil = 0;
        entry.exhausted = false;
        void this.persist();
        return true;
    }

    /** 供界面使用的脱敏视图。 */
    snapshot(now = Date.now()) {
        return {
            settings: this.getSettings(),
            counts: {
                total: this.state.keys.length,
                usable: this.state.keys.filter(e => KeyStore.isUsable(e, now)).length,
                cooling: this.state.keys.filter(e => KeyStore.isCooling(e, now)).length,
                exhausted: this.state.keys.filter(e => e.exhausted).length,
            },
            totalUsedTokens: this.state.keys.reduce((sum, e) => sum + e.usedTokens, 0),
            keys: this.state.keys.map(entry => ({
                masked: maskKey(entry.key),
                usedTokens: entry.usedTokens,
                cooling: KeyStore.isCooling(entry, now),
                cooldownUntil: entry.cooldownUntil,
                lastUsedAt: entry.lastUsedAt,
                exhausted: entry.exhausted,
            })),
        };
    }

    /** 完整 key 列表，仅给本地代理使用，绝不出现在任何 HTTP 响应里。 */
    rawKeys() {
        return this.state.keys.map(e => e.key);
    }
}
