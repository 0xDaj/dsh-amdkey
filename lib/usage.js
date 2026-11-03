/**
 * 从 Radeon 的 /radeon/api/v1/usage 读取真实额度。
 *
 * 额度单位是 pts（美元），不是 token：
 *   daily_cost_limit_usd       每日额度（1.0）
 *   daily_cost_used_usd        今日已用
 *   daily_cost_remaining_usd   今日剩余
 *   rpm_limit                  每分钟请求上限（20）
 *   daily_reset_at / _epoch    重置时间
 *
 * 这个端点不消耗 RPM、不计费（实测连查 3 次 requests 计数不变），
 * 但仍然做缓存：代理转发时没必要每次都问。
 */
import { request as httpsRequest } from 'node:https';

const HOST = 'developer.amd.com.cn';
const PATH = '/radeon/api/v1/usage';

/** 缓存时长：60 秒。额度变化没那么快，界面 60 秒刷一次足够。 */
const CACHE_MS = 60_000;

/** 单个 key 的查询超时。 */
const TIMEOUT_MS = 10_000;

/**
 * 查一个 key 的额度。
 * @param {string} apiKey
 * @returns {Promise<object|null>} 解析后的 usage，失败返回 null
 */
function fetchUsage(apiKey) {
    return new Promise((resolve) => {
        const req = httpsRequest({
            host: HOST,
            port: 443,
            path: PATH,
            method: 'GET',
            headers: { authorization: `Bearer ${apiKey}` },
        }, (res) => {
            const chunks = [];
            res.on('data', c => chunks.push(c));
            res.on('end', () => {
                if (res.statusCode !== 200) { resolve(null); return; }
                try {
                    resolve(JSON.parse(Buffer.concat(chunks).toString('utf8')));
                }
                catch { resolve(null); }
            });
        });

        req.on('error', () => resolve(null));
        req.setTimeout(TIMEOUT_MS, () => {
            req.destroy();
            resolve(null);
        });
        req.end();
    });
}

/**
 * 额度缓存与分发。
 */
export class UsageTracker {
    /**
     * @param {import('./keystore.js').KeyStore} store
     * @param {object} logger
     */
    constructor(store, logger) {
        this.store = store;
        this.logger = logger;
        /** @type {Map<string, { at: number, data: object|null }>} */
        this.cache = new Map();
        this.refreshing = false;
    }

    /** 缓存键用 key 本身（内存内，不落盘）。 */
    #cacheFor(key) {
        return this.cache.get(key);
    }

    /**
     * 取一个 key 的额度，命中缓存直接返回。
     * @param {string} key
     * @param {boolean} force 跳过缓存
     */
    async get(key, force = false) {
        const hit = this.#cacheFor(key);
        if (!force && hit !== undefined && Date.now() - hit.at < CACHE_MS) {
            return hit.data;
        }
        const data = await fetchUsage(key);
        this.cache.set(key, { at: Date.now(), data });
        return data;
    }

    /**
     * 刷新所有 key 的额度（并发，失败不影响其它）。
     * @param {boolean} force
     * @returns {Promise<Map<string, object|null>>} key -> usage
     */
    async refreshAll(force = false) {
        if (this.refreshing) {
            // 已有刷新在跑，返回当前缓存，避免并发风暴
            const out = new Map();
            for (const key of this.store.rawKeys()) {
                out.set(key, this.#cacheFor(key)?.data ?? null);
            }
            return out;
        }
        this.refreshing = true;
        try {
            const keys = this.store.rawKeys();
            const results = await Promise.all(keys.map(k => this.get(k, force)));
            const out = new Map();
            keys.forEach((k, i) => out.set(k, results[i]));
            return out;
        }
        finally {
            this.refreshing = false;
        }
    }

    /**
     * 汇总所有 key 的额度，供界面顶部卡片使用。
     * 多个 key 时：已用/剩余累加，RPM 取最大值，重置时间取最近的。
     * @returns {Promise<object>}
     */
    async summary() {
        const all = await this.refreshAll(false);
        let used = 0;
        let limit = 0;
        let remaining = 0;
        let rpm = 0;
        let resetEpoch = 0;
        let requests = 0;
        let errors = 0;
        let tokens = 0;
        let okCount = 0;

        for (const usage of all.values()) {
            if (usage === null) continue;
            okCount += 1;
            used += Number(usage.daily_cost_used_usd) || 0;
            limit += Number(usage.daily_cost_limit_usd) || 0;
            remaining += Number(usage.daily_cost_remaining_usd) || 0;
            rpm = Math.max(rpm, Number(usage.rpm_limit) || 0);
            requests += Number(usage.today?.requests) || 0;
            errors += Number(usage.today?.errors) || 0;
            tokens += Number(usage.today?.total_tokens) || 0;
            const epoch = Number(usage.daily_reset_epoch) || 0;
            if (epoch > 0 && (resetEpoch === 0 || epoch < resetEpoch)) resetEpoch = epoch;
        }

        return {
            ok: okCount > 0,
            keysReported: okCount,
            usedPts: used,
            limitPts: limit,
            remainingPts: remaining,
            usedRatio: limit > 0 ? used / limit : 0,
            rpmLimit: rpm,
            resetEpoch,
            todayRequests: requests,
            todayErrors: errors,
            todayTokens: tokens,
        };
    }

    /**
     * 单个 key 的额度视图，供列表每行使用。
     * @param {string} key
     */
    async perKey(key) {
        const u = await this.get(key, false);
        if (u === null) return null;
        const used = Number(u.daily_cost_used_usd) || 0;
        const limit = Number(u.daily_cost_limit_usd) || 0;
        return {
            usedPts: used,
            limitPts: limit,
            remainingPts: Number(u.daily_cost_remaining_usd) || 0,
            ratio: limit > 0 ? used / limit : 0,
            resetEpoch: Number(u.daily_reset_epoch) || 0,
            requests: Number(u.today?.requests) || 0,
            errors: Number(u.today?.errors) || 0,
            tokens: Number(u.today?.total_tokens) || 0,
            lastRequestAt: u.today?.last_request_at ?? null,
        };
    }
}
