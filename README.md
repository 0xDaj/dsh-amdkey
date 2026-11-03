# dsh-amdkey

AMD Radeon Cloud 的多 Key 轮换插件，面向 DeepSeek Harness。

十几个账号、每个 1.0 pts/天，用满自动切下一个。

## 它解决什么问题

DSH 的 `apiKey` 字段只接受单个字符串（源码里 `normalizeApiKey` 直接 `.trim()`），一个请求也只能带一个 `Authorization` 头。所以多 Key 轮换只能在中间层做。

本插件在 `127.0.0.1:18888` 起一个本地代理：

```
DSH ──> 127.0.0.1:18888 ──> 插件代理 ──> developer.amd.com.cn
                              │
                              ├─ Key 池（你填的十几个）
                              ├─ 5xx / 网关故障 → 不冷却，换下一个 key
                              ├─ 429 限流 → 只停 65 秒（读 Retry-After）
                              ├─ 429 配额耗尽 → 冷却 24 小时
                              └─ 全部不可用 → 503 + 中文说明
```

## 界面

聊天框顶部多一个 **AMDkey** 标签（排在「轨迹」右边）。

### Key 管理页

- **额度卡片**：今日已用 / 今日剩余 / 今日 Token / RPM 上限，全部来自官方 `/usage` 接口
- **进度条**：日额度消耗比例 + 重置倒计时
- **Key 列表**：序号、掩码、状态徽章、环形剩余比例、已用 pts
  - 眼睛图标：显示/隐藏完整 key
  - 复制图标：复制完整 key
  - **⟳ 恢复按钮**：误判时立即清除冷却（冷却中/已耗尽的行才有）
- **批量粘贴**：一行一个，重复自动跳过
- **设置**：冷却时长、代理端口

### 模型选择页

- 16 个模型可选，勾选后**立即生效**（用 DSH 的 `internal/update` 热更新通道）
- 显示上下文长度、是否支持图片、思考档位数
- 非对话模型（OCR/语音）标注并禁用

## 关键设计

### 冷却策略

| 上游返回 | 处理 |
|---|---|
| 5xx / 网关故障 | **不冷却**，换下一个 key |
| 429 + `rate limit` | 冷却 **65 秒**（尊重 `Retry-After`） |
| 429 + 配额/余额/额度 | 冷却 24 小时，标记耗尽 |
| 429 + HTML/空 body/截断 | **不冷却**（不算有效判定） |
| 401 / 403 | 冷却 24 小时 |

限流只停 65 秒是核心——AMD 的 RPM 是 20/分钟，60 秒后自然恢复，冷却 24 小时会让 key 池迅速枯竭。

### 配额判定从严

误判的代价是 key 白停 24 小时，所以判定要求：

1. 响应体必须是合法 JSON（HTML 错误页、空 body、截断响应都不算）
2. `error.message` / `error.type` 明确出现配额词（支持中文「配额/余额/额度」）
3. 「rate limit」「too many requests」单独出现时只算限流，不标耗尽

### 额度数据

`/radeon/api/v1/usage` 返回真实额度（单位 pts = 美元）：

```json
{
  "daily_cost_limit_usd": 1,
  "daily_cost_used_usd": 0.0288,
  "daily_cost_remaining_usd": 0.9712,
  "rpm_limit": 20,
  "daily_reset_epoch": 1793737501,
  "today": { "requests": 16, "errors": 2, "total_tokens": 291408 }
}
```

这个端点**不消耗 RPM、不计费**（实测连查 3 次 `requests` 计数不变），插件做了 60 秒缓存。

多 key 时汇总：已用/剩余累加，RPM 取最大，重置时间取最近。

## 安装

```powershell
cd "$env:USERPROFILE\.dsh\profiles\desktop"
pnpm add file:../../plugins/amdkey
```

然后在 `package.json` 的 `dsh.profile.bundles` 里加 `"dsh-amdkey"`，重启 DSH。

### 必须的一步：配置凭据

`llm-pi-ai` 只认 `apiKeyEnv`，不认 `apiKey` 字段。在 `~/.dsh/.credentials.yaml` 的 `refs` 下加一条：

```yaml
refs:
  RADEON_LOCAL_KEY: "任意非空字符串"
```

这个值只是进代理的「门票」——代理会覆盖 `Authorization` 头，用池子里的真 key 转发，所以填什么都可以。

## 数据存在哪

```
$DSH_HOME/amdkey.json
```

```json
{
  "keys": [{ "key": "rc-...", "usedTokens": 0, "cooldownUntil": 0, "lastUsedAt": 0, "exhausted": false }],
  "settings": { "cooldownHours": 24, "port": 18888 },
  "models": ["DeepSeek-V4.1-Flash", "..."]
}
```

写入走原子替换（临时文件 + rename），并发请求不会把文件写坏。

## 已知限制

- **端口改动需重启**：代理在 `apply` 阶段绑定端口
- **复制/显示依赖回环访问**：`/amdkey/api/reveal` 只接受 `127.0.0.1` 请求
- **环形按日额度算**：多 key 时每行显示的是该 key 自己的 1.0 pts 使用率
- **流式响应的 token 无法精确统计**：SSE 的 `usage` 在最后一片里，中途断开的流不计

## License

MIT
