/**
 * 本地代理：把 DSH 的请求转发到 Radeon Cloud，并在 429 / 配额错误时换 key。
 *
 * 设计取舍：
 *   - 只在「请求还没开始返回内容」时换 key。一旦流已经开始，换 key 会让上游收到
 *     两段拼接的回复，所以流中出错直接透传。
 *   - 429 分两种：带配额语义的（当天额度用完）标记为 exhausted；其余按限流处理，
 *     同样进冷却，但 exhausted=false，24 小时后自然恢复。
 *   - 全部 key 不可用时返回 503 并带明确说明，而不是继续拿一个已知坏 key 去撞。
 */
import { createServer } from 'node:http';
import { Agent as HttpsAgent, request as httpsRequest } from 'node:https';

const UPSTREAM_HOST = 'developer.amd.com.cn';
const UPSTREAM_PATH_PREFIX = '/radeon/api/v1';

/** 这些状态码代表「换一个 key 也许就好了」。 */
const RETRYABLE_STATUS = new Set([429, 401, 403]);

/**
 * 从响应头里取 Retry-After（秒数或 HTTP 日期），换算成毫秒。
 * 拿不到时返回 fallback。限流的最短冷却就靠它：AMD 回 60 秒，
 * 我们就只停 65 秒，而不是把整个 key 关 24 小时。
 */
function retryAfterMs(headers, fallbackMs) {
    const raw = headers?.['retry-after'];
    if (raw === undefined) return fallbackMs;
    const seconds = Number(raw);
    if (Number.isFinite(seconds) && seconds >= 0) return Math.min(seconds * 1000 + 5000, 600000);
    const when = Date.parse(String(raw));
    if (Number.isFinite(when)) {
        const delta = when - Date.now() + 5000;
        return delta > 0 ? Math.min(delta, 600000) : fallbackMs;
    }
    return fallbackMs;
}

/** 5xx 系：上游临时故障，换 key 重试即可，绝不冷却。 */
const SERVER_ERROR = (code) => code >= 500;

/** 从错误响应体里判断是不是配额耗尽。 */
/**
 * 判定一个 429 是不是真正的配额耗尽。
 *
 * 误判的代价是 key 白白冷却 24h，所以这里从严：
 *   - body 必须是合法 JSON（HTML 错误页、空 body、被截断的响应都不算）
 *   - error.message / error.type 里必须明确出现配额词
 *   - 「rate limit」「too many requests」这类限流词单独出现时不判耗尽
 *     （限流同样进冷却，但 exhausted=false，语义上还可能恢复）
 */
function looksLikeQuotaExhausted(status, bodyText) {
    if (status !== 429) return false;
    const text = (bodyText || '').trim();
    if (text.length === 0 || text.length > 8192) return false;
    if (!text.startsWith('{')) return false;
    let parsed;
    try { parsed = JSON.parse(text); } catch { return false; }
    const msg = String(parsed?.error?.message ?? '') + ' ' + String(parsed?.error?.type ?? '') + ' ' + String(parsed?.message ?? '');
    if (/rate.?limit|too many requests/i.test(msg) && !/quota|balance|credit|insufficient/i.test(msg)) return false;
    return /quota|balance|credit|insufficient|exceeded|额度|余额|配额/i.test(msg);
}

/** 从 OpenAI 兼容响应里取 usage.total_tokens。 */
function extractTokens(parsed) {
    const total = parsed?.usage?.total_tokens;
    if (typeof total === 'number' && Number.isFinite(total)) return total;
    const prompt = Number(parsed?.usage?.prompt_tokens) || 0;
    const completion = Number(parsed?.usage?.completion_tokens) || 0;
    return prompt + completion;
}

/**
 * @param {import('./keystore.js').KeyStore} store
 * @param {object} logger
 * @param {number} port
 * @returns {{ server: import('node:http').Server, actualPort: () => number, close: () => Promise<void> }}
 */
export function createProxy(store, logger, port) {
    const agent = new HttpsAgent({ keepAlive: true, maxSockets: 16 });

    function forward(req, res, bodyBuffer, apiKey) {
        return new Promise((resolve) => {
            const headers = {
                ...req.headers,
                host: UPSTREAM_HOST,
                authorization: `Bearer ${apiKey}`,
            };
            delete headers['content-length'];
            if (bodyBuffer !== null) headers['content-length'] = String(bodyBuffer.length);

            const options = {
                host: UPSTREAM_HOST,
                port: 443,
                method: req.method,
                path: UPSTREAM_PATH_PREFIX + req.url.replace(/^\/v1/, ''),
                headers,
                agent,
            };

            const upstream = httpsRequest(options, (up) => {
                resolve({ kind: 'response', upstream: up });
            });

            upstream.on('error', (error) => resolve({ kind: 'error', error }));
            upstream.setTimeout(600000, () => {
                upstream.destroy(new Error('upstream timeout'));
            });

            if (bodyBuffer !== null) upstream.write(bodyBuffer);
            upstream.end();
        });
    }

    function readBody(req) {
        return new Promise((resolve, reject) => {
            const chunks = [];
            req.on('data', c => chunks.push(c));
            req.on('end', () => resolve(chunks.length === 0 ? null : Buffer.concat(chunks)));
            req.on('error', reject);
        });
    }

    function sendJson(res, status, payload) {
        const text = JSON.stringify(payload);
        res.writeHead(status, {
            'content-type': 'application/json; charset=utf-8',
            'content-length': Buffer.byteLength(text),
        });
        res.end(text);
    }

    const server = createServer(async (req, res) => {
        // 只代理 /v1/*；其余交给插件自己的管理 API
        if (!req.url || !req.url.startsWith('/v1/')) {
            res.writeHead(404);
            res.end();
            return;
        }

        let bodyBuffer = null;
        if (req.method !== 'GET' && req.method !== 'HEAD') {
            try { bodyBuffer = await readBody(req); }
            catch (error) { sendJson(res, 400, { error: { message: `读取请求体失败：${error.message}` } }); return; }
        }

        // 依次尝试可用的 key，直到有一个开始返回内容
        const tried = new Set();
        // 最多换 3 个 key：全池重放会把一次请求拖成几十秒。
        const MAX_ATTEMPTS = 3;
        for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
            const picked = store.pick();
            if (picked === null) break;
            if (tried.has(picked.key)) break;
            tried.add(picked.key);

            const result = await forward(req, res, bodyBuffer, picked.key);

            if (result.kind === 'error') {
                logger.warn(`amdkey: 上游连接失败（key ${picked.key.slice(0, 8)}…）：${result.error.message}`);
                continue;
            }

            const up = result.upstream;

            // 5xx / 网关故障：上游临时问题，不是 key 的问题。不冷却，直接换下一个。
            if (SERVER_ERROR(up.statusCode)) {
                logger.warn(`amdkey: key ${picked.key.slice(0, 8)}… 返回 ${up.statusCode}（上游故障），不冷却，换下一个 key`);
                // 吃掉这个失败响应体，避免挂着不消费
                up.resume();
                continue;
            }

            if (RETRYABLE_STATUS.has(up.statusCode)) {
                // 收齐响应体再决定：429 的语义写在 body 里
                const chunks = [];
                up.on('data', c => chunks.push(c));
                await new Promise(resolve => up.on('end', resolve));
                const text = Buffer.concat(chunks).toString('utf8');
                const exhausted = looksLikeQuotaExhausted(up.statusCode, text);

                // 限流是暂时的：AMD 回 60 秒，就只停 65 秒。
                // 只有明确「配额/余额」才用配置里的长冷却（默认 24h）。
                if (exhausted) {
                    store.markCooldown(picked.key, true);
                    logger.warn(
                        `amdkey: key ${picked.key.slice(0, 8)}… 配额耗尽，冷却 ${store.getSettings().cooldownHours} 小时`,
                    );
                }
                else {
                    const waitMs = retryAfterMs(up.headers, 65000);
                    store.markCooldownMs(picked.key, waitMs, false);
                    logger.warn(
                        `amdkey: key ${picked.key.slice(0, 8)}… 限流（${up.statusCode}），冷却 ${Math.round(waitMs / 1000)} 秒`,
                    );
                }
                continue;
            }

            // 正常响应：原样流式回传
            res.writeHead(up.statusCode ?? 502, up.headers);
            up.pipe(res);

            // 非流式响应：等结束后记用量
            const chunks = [];
            up.on('data', c => chunks.push(c));
            up.on('end', () => {
                let tokens = 0;
                try {
                    const text = Buffer.concat(chunks).toString('utf8');
                    const parsed = JSON.parse(text);
                    tokens = extractTokens(parsed);
                }
                catch { /* 流式响应不是完整 JSON，只记时间不记 token */ }
                // 即使这次没有 usage（比如 /v1/models），也要更新 lastUsedAt，
                // 否则界面上永远显示「尚未使用」，看不出这个 key 正在被用。
                store.recordUsage(picked.key, tokens);
            });
            return;
        }

        // 一个可用的都没有
        const snap = store.snapshot();
        logger.error(`amdkey: 所有 key 都不可用（共 ${snap.counts.total} 个，冷却 ${snap.counts.cooling}，耗尽 ${snap.counts.exhausted}）`);
        sendJson(res, 503, {
            error: {
                message: `AMDkey：所有 key 都不可用（共 ${snap.counts.total} 个，冷却中 ${snap.counts.cooling}，已耗尽 ${snap.counts.exhausted}）。请到「AMDkey」标签添加新 key 或等待冷却结束。`,
                type: 'no_available_key',
            },
        });
    });

    return {
        server,
        listen() {
            return new Promise((resolve, reject) => {
                server.once('error', reject);
                server.listen(port, '127.0.0.1', () => {
                    server.removeListener('error', reject);
                    resolve(server.address().port);
                });
            });
        },
        close() {
            return new Promise((resolve) => {
                agent.destroy();
                server.close(() => resolve());
            });
        },
    };
}
