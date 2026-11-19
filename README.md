<p align="center">
  <img src="assets/icon-180.png" width="110" height="110" alt="AMDkey">
</p>

<h1 align="center">AMDkey</h1>

<p align="center">
  <b>十几个 AMD 账号，一个 key 池。</b><br>
  用满了自动换下一个，不用你管。
</p>

<p align="center">
  <img src="https://img.shields.io/badge/DSH-plugin-58a6ff?style=flat-square" alt="DSH plugin">
  <img src="https://img.shields.io/badge/license-MIT-3fb950?style=flat-square" alt="MIT">
  <img src="https://img.shields.io/badge/node-%E2%89%A522-3fb950?style=flat-square" alt="node">
</p>

---

## 为什么会有这个东西

AMD Radeon Cloud 挺大方——每个账号每天 1.0 美元额度，白给。

但只给一个 key，一天就用完了。多注册几个账号，问题变成另一个：**DSH 只认一个 key**。

源码里写得很清楚：

```js
const normalizeApiKey = (key) => key.trim();   // 就一个字符串
```

一个请求，一个 `Authorization` 头。没有余地。

所以只能在下面垫一层。这个插件的全部工作，就是在 `127.0.0.1:18888` 放一个代理，替 DSH 决定这次用哪个 key。

```
┌─────────┐        ┌──────────────┐        ┌──────────────────────┐
│   DSH   │───────>│   AMDkey     │───────>│  developer.amd.com.cn │
└─────────┘        │  127.0.0.1   │        └──────────────────────┘
                   │              │
                   │  key 1  ✓    │
                   │  key 2  ✓    │
                   │  key 3  冷却 │
                   │  ...         │
                   └──────────────┘
```

DSH 以为自己在跟一个普通 provider 说话。它确实在。

---

## 装完之后

聊天框顶部会多一个 **AMDkey** 标签，就在「轨迹」右边。

<table>
<tr><td width="50%">

**Key 管理**

四张额度卡片，数字直接来自 AMD 官方接口——不是本地估算：

```
今日已用    今日剩余
0.0288 pts  0.9712 pts

今日 Token   RPM 上限
291K         20 /min
```

下面是 key 列表。每行一个环形，**环越满额度越多**，快用完才变黄变红。冷却中的行会多一个 ⟳，点一下立刻解除——有时候是网络抖了一下被误判，不该白等一天。

</td><td width="50%">

**模型选择**

16 个模型，勾上就生效，**不用重启**。

DSH 内部有个 `internal/update` 事件，改完配置往那儿一推，模型选择器当场刷新。

非对话的模型（OCR、语音那些）标出来但点不了——选了也用不上。

</td></tr>
</table>

---

## 冷却这件事，我改过三版

第一版很天真：429 就冷却 24 小时。

结果一次忙碌的会话就能把 16 个 key 全烧光——AMD 的限流是 **20 次/分钟**，60 秒后就恢复了，我却让那个 key 停了整整一天。池子空了，代理只能回 503，DSH 拿不到响应就一直重试，一次请求卡几十秒。

现在是这样：

| AMD 说什么 | 我怎么处理 | 为什么 |
|:---|:---|:---|
| 5xx、网关抽风 | **不冷却**，换下一个 | 这是 AMD 的问题，不是 key 的问题 |
| 429 + `rate limit` | 停 **65 秒** | 读 `Retry-After`，它说 60 我就停 65 |
| 429 + 配额/余额/额度 | 停 24 小时 | 真用完了，等重置 |
| 429 + HTML 错误页 | **不冷却** | 网关吐了个错误页，不算数 |
| 401 / 403 | 停 24 小时 | key 废了 |

**65 秒那个数字是重点。** 限流本来就是一分钟的事，按天关它，等于自己把池子抽干。

判断「真耗尽」也收紧了。以前只要响应体里出现 `quota` 就当耗尽——可一个 HTML 错误页里也可能有这个词。现在要求：必须是合法 JSON，必须 `error.message` 或 `error.type` 里明确写着配额耗尽，光说 `rate limit` 不算。

误判的代价是一个 key 白停一天。值得多写几行。

---

## 额度是真的

`/radeon/api/v1/usage` 这个接口没人提过，是我翻出来的：

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

单位是美元，不是 token。界面上那个 `pts` 就是它。

**调它不花额度、不占 RPM。** 我连查三次，`requests` 一直停在 16。不过还是加了 60 秒缓存——没必要每次请求都去问一遍。

多个 key 时怎么合并：已用和剩余累加，RPM 取最大，重置时间取最近的那个。

---

## 安装

```powershell
cd "$env:USERPROFILE\.dsh\profiles\desktop"
pnpm add file:../../plugins/amdkey
```

`package.json` 的 `dsh.profile.bundles` 里加上 `"dsh-amdkey"`，重启 DSH。

### 还差一步

`llm-pi-ai` 只认 `apiKeyEnv`，不认 `apiKey`。这个坑我踩了一晚上——配置里写 `apiKey: xxx` 它看都不看，直接报 `No API key for provider`。

去 `~/.dsh/.credentials.yaml`：

```yaml
refs:
  RADEON_LOCAL_KEY: "随便什么"
```

**填什么都行。** 它只是让 DSH 通过校验的门票，真 key 在代理那边，转发时会覆盖掉这个头。

---

## 数据在哪

```
$DSH_HOME/amdkey.json
```

```json
{
  "keys": [{ "key": "rc-...", "cooldownUntil": 0, "exhausted": false }],
  "settings": { "cooldownHours": 24, "port": 18888 },
  "models": ["DeepSeek-V4.1-Flash"]
}
```

写入走临时文件 + rename，两个请求同时落盘也不会把文件写坏。

---

## 几个坑

**改端口要重启** — 代理是在 `apply` 阶段绑的端口，改完不重启不生效。

**复制和显示只认本机** — `/amdkey/api/reveal` 会回完整 key，所以只接受来自 `127.0.0.1` 的请求。你从局域网 IP 打开 DSH 的话，这两个按钮会失败。

**流式响应的 token 算不准** — SSE 的 `usage` 在最后一片里，中途断开的流就统计不到。所以界面上那个数字偏小是正常的，看额度卡片更准。

---

## License

MIT

<br>

<p align="center">
  <sub>写这个是因为我有 14 个账号，而 DSH 只让我填一个 key。</sub>
</p>
