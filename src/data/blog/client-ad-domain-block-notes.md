---
title: 🛡️[自用] 客户端广告域名拦截备忘：Shadowrocket / Clash / V2rayN / NekoBox
author: Velox
pubDatetime: 2026-09-06T18:00:00+08:00
slug: client-ad-domain-block-notes
featured: true
draft: false
tags:
  - 客户端配置
  - 广告拦截
  - Shadowrocket
  - Clash
  - V2rayN
  - NekoBox
description: 自用备忘：在代理客户端用路由规则拦截常见谷歌/联盟广告域名。覆盖小火箭、Clash、V2rayN、NekoBox，不宣称全平台去广告，YouTube 正片广告有上限。
---

搞节点、搞分流久了，总会顺手想：「能不能顺便少看点广告？」

先把话说死：**这和 VPS 上的 vx脚本、和协议伪装不是一回事。**  
广告拦截做在 **客户端路由** 里——把常见广告/追踪域名丢进 `REJECT` / `block`。  
它能减一批请求，**不能**保证 YouTube 长视频零插播，也 **不是** 全平台去广告方案。

本文只是我自己的备忘清单，方便换机、重装客户端时复制。你要用，自己测；某条误杀就删。

---

## ⚠️ 能力边界（必读）

| 能做什么 | 不能做什么 |
|----------|------------|
| 拦部分谷歌广告、联盟广告、追踪域名 | 保证所有 App、所有网站无广告 |
| V2rayN 上我测过：部分长视频快进不再「必弹」一层广告 | YouTube 片头/中插稳定清零 |
| 规则短、好维护 | 替代专门去广告客户端 / Premium |

NekoBox 里若已开启：

```text
geosite:category-ads-all → 屏蔽
```

再叠一堆手写域名，收益往往有限。我的选择是：**NekoBox 维持系统自带这条即可，不再加长列表。**

---

## 🎯 规则针对谁（自用精简版）

主要覆盖：

- 谷歌广告相关：`doubleclick` / `googlesyndication` / `googleadservices` / `pagead` 等
- YouTube 广告相关域名：`ads.youtube.com`、`ad.youtube.com`（仅域名层，不是正片去广告神器）
- 少量常见联盟（小火箭/Clash 完整列表里有）

**不包含：** 国内信息流全家桶、所有短视频 App、游戏 SDK 全量黑名单。

---

## 🍏 一、Shadowrocket（小火箭）

配置 → 对应 `.conf` → 纯文本编辑。  
在 `[Rule]` 里、**局域网规则之后、国内直连大段之前**插入：

```ini
# === 🚫 自用精简去广告（非全平台） ===
DOMAIN-SUFFIX,doubleclick.net,REJECT
DOMAIN-SUFFIX,googleadservices.com,REJECT
DOMAIN-SUFFIX,googlesyndication.com,REJECT
DOMAIN-SUFFIX,googletagservices.com,REJECT
DOMAIN-SUFFIX,googletagmanager.com,REJECT
DOMAIN-SUFFIX,google-analytics.com,REJECT
DOMAIN-SUFFIX,adservice.google.com,REJECT
DOMAIN-SUFFIX,pagead2.googlesyndication.com,REJECT
DOMAIN-SUFFIX,ads.youtube.com,REJECT
DOMAIN-SUFFIX,ads.twitter.com,REJECT
DOMAIN-SUFFIX,ads.facebook.com,REJECT
DOMAIN-SUFFIX,an.facebook.com,REJECT
DOMAIN-SUFFIX,advertising.apple.com,REJECT
DOMAIN-SUFFIX,iadsdk.apple.com,REJECT
DOMAIN-SUFFIX,amazon-adsystem.com,REJECT
DOMAIN-SUFFIX,pubmatic.com,REJECT
DOMAIN-SUFFIX,openx.net,REJECT
DOMAIN-SUFFIX,rubiconproject.com,REJECT
DOMAIN-SUFFIX,criteo.com,REJECT
DOMAIN-SUFFIX,taboola.com,REJECT
DOMAIN-SUFFIX,outbrain.com,REJECT
DOMAIN-SUFFIX,moatads.com,REJECT
DOMAIN-SUFFIX,scorecardresearch.com,REJECT
DOMAIN-KEYWORD,adservice,REJECT
DOMAIN-KEYWORD,pagead,REJECT
```

说明：

- `googletagmanager` / `google-analytics` 可能影响部分站点统计；异常就删这两行。
- 改完建议飞行模式开关一次，再测。

---

## 🐱 二、Clash / Mihomo

在 `rules:` 中靠前位置（在最终 `MATCH` / 大分流之前）加入：

```yaml
  # === 自用精简去广告（非全平台） ===
  - DOMAIN-SUFFIX,doubleclick.net,REJECT
  - DOMAIN-SUFFIX,googleadservices.com,REJECT
  - DOMAIN-SUFFIX,googlesyndication.com,REJECT
  - DOMAIN-SUFFIX,googletagservices.com,REJECT
  - DOMAIN-SUFFIX,googletagmanager.com,REJECT
  - DOMAIN-SUFFIX,google-analytics.com,REJECT
  - DOMAIN-SUFFIX,adservice.google.com,REJECT
  - DOMAIN-SUFFIX,pagead2.googlesyndication.com,REJECT
  - DOMAIN-SUFFIX,ads.youtube.com,REJECT
  - DOMAIN-SUFFIX,ads.twitter.com,REJECT
  - DOMAIN-SUFFIX,ads.facebook.com,REJECT
  - DOMAIN-SUFFIX,an.facebook.com,REJECT
  - DOMAIN-SUFFIX,advertising.apple.com,REJECT
  - DOMAIN-SUFFIX,iadsdk.apple.com,REJECT
  - DOMAIN-SUFFIX,amazon-adsystem.com,REJECT
  - DOMAIN-SUFFIX,pubmatic.com,REJECT
  - DOMAIN-SUFFIX,openx.net,REJECT
  - DOMAIN-SUFFIX,rubiconproject.com,REJECT
  - DOMAIN-SUFFIX,criteo.com,REJECT
  - DOMAIN-SUFFIX,taboola.com,REJECT
  - DOMAIN-SUFFIX,outbrain.com,REJECT
  - DOMAIN-SUFFIX,moatads.com,REJECT
  - DOMAIN-SUFFIX,scorecardresearch.com,REJECT
  - DOMAIN-KEYWORD,adservice,REJECT
  - DOMAIN-KEYWORD,pagead,REJECT
```

有 `rule-provider` 广告集的，也可以只用订阅规则集，与本文手写二选一即可，不必堆两套。

---

## 💻 三、V2rayN（PC）

路径：路由设置 → 添加规则 → 出站选 **block**。

**Domain 框粘贴一行（英文逗号分隔）：**

```text
doubleclick.net,googleadservices.com,googlesyndication.com,googletagservices.com,adservice.google.com,pagead2.googlesyndication.com,ads.youtube.com,ad.youtube.com
```

| 项 | 值 |
|----|-----|
| 别名 | 广告拦截 |
| outboundTag | `block` |
| 规则类型 | Routing |
| 端口 / 进程 | 留空 |

勾选启用，顺序尽量靠前。

若内核/路由支持 geosite，也可试一条：

```text
geosite:category-ads-all
```

不生效再改回手写域名。

我本机体感：部分长视频快进时，不再像以前那样「一快进必弹一层」；**长视频中插仍可能有**，别当全能去广告。

---

## 🤖 四、NekoBox（Android）

作者更新频率另说，路由能力还在。

### 方案 A（推荐）：系统规则

路由页启用：

```text
geosite:category-ads-all → 屏蔽
```

有这一条，我个人 **不再** 叠一长串手写域名。

### 方案 B：自定义路由补强（可选）

若不用 geosite，可在自定义路由最前加：

```json
{
  "domain_suffix": [
    "doubleclick.net",
    "googleadservices.com",
    "googlesyndication.com",
    "googletagservices.com",
    "adservice.google.com",
    "pagead2.googlesyndication.com",
    "ads.youtube.com",
    "ad.youtube.com"
  ],
  "outbound": "block"
}
```

保存后重启核心。  
界面只能「一条域名一条规则」时，就逐条加，出站一律 **屏蔽**。

---

## 🧭 使用建议（自用纪律）

1. **先客户端、不进服务端脚本**——和节点订阅解耦，误杀好回滚。
2. **先短列表实战**，再考虑加长；列表越长越难排错。
3. 某站登录/支付异常：优先临时关闭广告规则排查。
4. YouTube 仍要强去广告：考虑官方 Premium 或其它客户端方案，**别只加域名幻想清零**。

---

## 🏆 小结

| 客户端 | 做法 |
|--------|------|
| 小火箭 | `[Rule]` 里 `DOMAIN-SUFFIX` / `KEYWORD` → `REJECT` |
| Clash | `rules` 里 → `REJECT` |
| V2rayN | 路由 `block` + 逗号域名串 |
| NekoBox | 优先 `geosite:category-ads-all`；可选 `domain_suffix` + `block` |

这是 **自用精简广告域名拦截备忘**，不是「全平台去广告工程」。  
节点该怎么稳还怎么稳；想少看点网页广告，再在客户端加一层即可。

---

> **💡 提示：**  
> 本文首发于 **[Velox 的极客空间](https://222382.xyz)**。防泄露、分流、节点架构相关文章会持续更新，欢迎来踩。🚀
