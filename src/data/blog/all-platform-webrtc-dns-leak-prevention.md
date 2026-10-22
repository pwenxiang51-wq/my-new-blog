---
title: 🚀[实战] 全端封杀 DNS 与 WebRTC 泄露：PC / iOS / Android TUN 模式实战
author: Velox
pubDatetime: 2026-03-27T18:00:00+08:00
slug: all-platform-webrtc-dns-leak-prevention
featured: true
draft: false
tags:
  - 节点架构
  - WebRTC封杀
  - DNS泄露
  - 极客防御
description: 彻底解决 WebRTC 与 DNS 泄露。从底层重构 PC、iOS、Android 代理配置，利用 TUN 模式实现全局流量接管。
---

在做 TikTok、Amazon 测评或跨境电商时，即使使用顶级静态住宅 IP，只要 **WebRTC** 或 **DNS** 泄露，真实 IP 仍会暴露，账号极易被关联风控。

本文给出 **PC（v2rayN + sing-box）**、**iOS（Shadowrocket）**、**Android（NekoBox）** 三端的完整防泄露配置。核心思路是：**开启 TUN 模式实现系统级流量接管，配合 FakeIP / DoH 和针对性规则，彻底封死 WebRTC 与 DNS 侧漏。**

---

## 前置条件：节点协议必须做好混淆

后面所有防泄露措施的前提是：你的海外节点协议本身已经具备良好的混淆与抗检测能力。

如果节点还在使用特征明显、无混淆的老协议，数据包出网后很容易被 **DPI** 识别并干扰。这种情况下，客户端再怎么防泄露也意义有限。

推荐方向：

- **TCP 类**：**VLESS-Reality**（借用合法大厂证书做伪装）
- **UDP 类**：**Hysteria2** / **TUIC v5**（基于 **QUIC**，抗限速与干扰能力较强）

在节点协议过关的基础上，再谈 **TUN** 接管和防泄露才有实际价值。

---

## 什么是 TUN 模式？

普通代理通常只能接管应用层流量（浏览器、指定 App）。系统底层的 **UDP** 探测（**WebRTC** 常用）、部分系统 **DNS** 请求、**ICMP** 等仍可能直接走真实网络，导致 IP 泄露。

**TUN 模式**会在系统网络层虚拟一张网卡，把几乎所有出站流量（**TCP** / **UDP** / **ICMP**）强制吸入代理隧道。开启后，应用想直连真实网络会更困难，防泄露效果远好于单纯的系统代理或 PAC。

简单说：**宁可断网，也不让真实流量漏出去。**

---

## 一、PC 端（v2rayN + sing-box）

默认内核处理 **UDP** 时不够干净，建议统一切到 **sing-box**。**TUN** 模式可按需开启——想做到全局流量接管、最大限度防泄露时推荐开启；如果只代理部分应用，也可以不开。

### 1. 切换 Core

进入「设置」→「参数设置」→「Core 类型设置」，将 **VLESS**、**Hysteria2**、**TUIC**、**VMess** 全部切换为 **sing-box**。

**sing-box** 对 **TUN** 路由和 **UDP** 处理更严谨，也是 **Hysteria2** 的原生实现。

### 2. TUN 模式设置

进入「参数设置」→「Tun 模式设置」：

- **自动路由**、**严格路由**：全部开启
- **协议栈（Stack）**：选 **`system`**（性能最好）
- **MTU**：设为 **`1500`**
- **解析策略**：进入「DNS 设置」→「sing-box 自定义 DNS」，将 Outbound 默认解析策略设为 **`ipv4_only`**（配合关闭 **IPv6**，减少 **WebRTC** 通过 IPv6 泄露的可能）

### 3. DNS 与路由规则

**DNS：**

- 开启 **FakeIP**
- **直连 DNS**：`223.5.5.5` 或 `119.29.29.29`
- **远程 DNS**：`https://8.8.8.8/dns-query`（**DoH**）
- **代理目标解析策略**：`AsIs`

开启 **FakeIP** 后，系统解析会返回 `198.18.x.x` 虚拟地址，探针很难拿到真实解析结果。

**路由（自定义规则）：**

1. 域名包含 **`stun`**、**`turn`**、**`webrtc`**，以及 **`geosite:category-ads-all`** → **`block`**
2. 端口 **`443`** + 网络 **`udp`** → **`block`**（封杀 **QUIC** 直连逃逸）

### 4. Chrome 额外处理

1. 安装扩展 **WebRTC Control**，阻止本地 IP 通过 **WebRTC** 暴露。
2. 设置 → 搜索「DNS」→ 安全 → 关闭 **「使用安全 DNS」**。
3. 地址栏输入 `chrome://flags/`，搜索 **`QUIC`**，将 **Experimental QUIC protocol** 设为 **Disabled**，然后重启浏览器。

配置完成后重启 **v2rayN**，再去做泄露测试。

---

## 二、iOS 端（Shadowrocket）

**Shadowrocket** 本身基于 **VpnService**，具备 **TUN** 能力，但系统 **DNS** 仍可能偷跑。建议直接编辑配置文本，而不是只依赖 UI。

进入「配置」→ 找到对应配置 →「纯文本编辑」。

### 1. 强制使用加密 DoH

在 **`[General]`** 中把 **`dns-server`** 和 **`fallback-dns-server`** 改成：

```ini
dns-server = https://dns.google/dns-query, https://1.1.1.1/dns-query
fallback-dns-server = https://dns.google/dns-query, https://1.1.1.1/dns-query
```

这样 **DNS** 请求本身也走 **HTTPS**，运营商更难明文嗅探或劫持。

### 2. 开启双核 DNS（兼顾国内 App）

全部走海外 **DoH** 会导致部分国内服务（App Store、抖音等）解析异常。在 **`[General]`** 增加：

```ini
remote-dns = true
dns-direct-system = true
```

- **`remote-dns = true`**：代理流量走远程 DNS
- **`dns-direct-system = true`**：命中直连规则的流量使用系统 DNS，国内 CDN 解析正常

### 3. 其他关键参数

继续在 **`[General]`** 补充：

```ini
private-ip-answer = true
udp-policy-not-supported-behaviour = REJECT
ipv6 = false
mode = rule
is-skip-local-ip-queries-enabled = false
hijack-dns = 8.8.8.8:53, 8.8.4.4:53, 1.1.1.1:53, 9.9.9.9:53
```

说明简要：

- **`private-ip-answer = true`**：允许私有 IP 响应，减少国内加速 IP 被误判
- **`udp-policy-not-supported-behaviour = REJECT`**：不支持 **UDP** 时直接拒绝，逼 **QUIC** 降级 **TCP**
- **`ipv6 = false`**：关闭 **IPv6**，减少一条泄露路径
- **`hijack-dns`**：劫持常见明文 **DNS** 端口

> 注：原配置里的 **`mode = pcb`** 按实际 **Shadowrocket** 版本调整，多数情况用 **`rule`** 即可。以你客户端实际支持的值为准。

### 4. 封杀 WebRTC 相关域名

在 **`[Rule]`** 中添加：

```ini
DOMAIN-KEYWORD,stun,REJECT
DOMAIN-KEYWORD,turn,REJECT
```

### 5. 生效建议

修改并导入后，建议开一次**飞行模式**（保持几秒）再关闭，清空系统网络缓存，然后重新连接测试。

---

## 三、Android 端（NekoBox）

**NekoBox** 基于 **sing-box**，图形界面较完整，但仍需按下面步骤严格配置。

### 1. DNS 双核

「设置」→「DNS 设置」：

- **远程 DNS**：`https://dns.google/dns-query`
- **直连 DNS**：`https://223.5.5.5/dns-query`
- **启用 DNS 路由**：必须开启（关闭会导致 DNS 泄漏风险）
- **启用 FakeDNS**：可先开启，若出现代理关闭后部分 App 无法上网再关闭

### 2. 路由分流（国内直连）

「设置」→「路由设置」：开启 **「绕过局域网地址」**。

主界面「路由」标签：

- **`geosite:cn`** → **绕过（中国 域名规则）** 并启用
- **`geoip:cn`** → **绕过（中国 IP 规则）** 并启用
- **`gooleapis.cn`**→ **代理（中国play商店规则）** 并启用

保证微信、支付宝、抖音等国内 App 直连，速度与稳定性更好。

### 3. 防泄露规则

在「路由」自定义规则中：

**屏蔽 QUIC：** 并启用

- 新建规则：

1. domain 分别添加：**`dst port:443`**、**`network:udp`**
                  
**屏蔽 WebRTC：** 并启用

- 新建规则：

1. domain 分别添加：**`keyword:stun`**、**`keyword:turn`**、**`keyword:rtc`**
2. outbound 设为 **屏蔽（Block）** 或 **拒绝（Reject）**

### 4. 其他调优

「设置」：

- **TUN 实现**：默认 **`gVisor`** 即可，**MTU** 改为 **`1500`**
- 「杂项」中开启 **「当网络发生变化时重置出站连接」**（Wi-Fi / 蜂窝切换时更稳定）

---

## 验证：必须做的两步测试

三端配置完成后，**重启客户端**，然后访问以下页面检查：

### 1. WebRTC 测试

[https://browserleaks.com/webrtc](https://browserleaks.com/webrtc)

期望结果：

- **Public IP Address** 显示为 **`n/a`**，或仅显示你的代理节点 IP
- 不应出现真实本地 / 运营商 IP

### 2. DNS 泄露测试

[https://browserleaks.com/dns](https://browserleaks.com/dns)

期望结果：

- 解析结果应全部来自海外 DNS 服务商（**Google**、**Cloudflare** 等）
- 不应出现国内运营商（**China Telecom**、**China Unicom**、**China Mobile** 等）相关记录

只要这两项都干净，**WebRTC** 与 **DNS** 泄露基本可视为已封死。

---

## 总结

通过 **TUN** 全局接管 + **FakeIP / DoH** + 针对性屏蔽 **WebRTC / QUIC** 规则，三端都能把最常见的真实 IP 泄露路径堵上。

前提仍然是节点协议本身足够干净。客户端防泄露解决的是「本地侧漏」，节点混淆解决的是「传输特征」。两者缺一不可。

配置完成后务必做 **BrowserLeaks** 验证，不要只凭感觉判断。

---

> 本文首发于 [Velox 的极客空间](https://222382.xyz)。
