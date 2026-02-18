---
title: "🚀 实战进阶：CF Workers 私有订阅 + 优选 IP + 小火箭分流保号全攻略"
author: "Velox"
pubDatetime: 2026-02-14T23:55:00Z
description: "拒绝节点裸奔与 IP 乱跳！教你利用 CF Workers 手搓私密订阅接口，配合 time.is 优选 IP 榨干带宽，并实现小火箭智能分流。"
featured: true
draft: false
tags:
  - VPS
  - Cloudflare
  - Shadowrocket
  - 极客
---

# 📖 引言

在折腾 VPS 的路上，我们总会遇到这样的矛盾：追求极致速度时，IP 容易乱跳导致账号风控；追求稳定时，直连延迟又让人抓狂。

今天这篇文章，我们将通过 **Cloudflare Workers**、**优选 IP** 以及 **小火箭（Shadowrocket）分流规则**，打造一个既能“起飞”又能“安稳”的科学上网终极形态！🔥

---

## 🛠️ 第一步：手搓 Serverless 私有订阅中心

为了实现节点的分组管理，同时保证安全性，我们不使用 GitHub 公开仓库，而是直接把节点“藏”在 Cloudflare 的内存里。

### 1. 炼化节点（Base64 编码） 🧪
小火箭识别订阅的核心是 **Base64**。
* 收集你服务器上的所有节点明文链接（`vless://...` 或 `vmess://...`），一行一个。
* 使用 [Base64 Encode 编码工具](https://www.base64encode.org/) 将这些明文整体进行编码。
* 你会得到一段类似 `dmxlc3M6...` 的长字符串。

### 2. 部署 Worker 代码 ☁️
在 [Cloudflare 控制台](https://dash.cloudflare.com/) 新建一个 Worker，填入以下逻辑。它可以根据不同的路径吐出不同的节点包：

```javascript
export default {
  async fetch(request) {
    const url = new URL(request.url);
    
    // 📂 抽屉 A：GCP 节点
    if (url.pathname === '/gcp') {
      return new Response("这里替换成你GCP节点的Base64乱码", { 
        headers: { "Content-Type": "text/plain; charset=utf-8" } 
      });
    }
    
    // 📂 抽屉 B：BWG 节点
    if (url.pathname === '/rn') {
      return new Response("这里替换成你BWG节点的Base64乱码", { 
        headers: { "Content-Type": "text/plain; charset=utf-8" } 
      });
    }

    return new Response("404 Not Found", { status: 404 });
  }
};
```

### 3. 小火箭导入 📱
在小火箭中点击 `+` 号，类型选 `Subscribe`，URL 填写：
* `https://你的Worker名字.workers.dev/gcp` (备注：GCP 专线)
* `https://你的Worker名字.workers.dev/rn` (备注：BWG 固定)

---

## ⚡ 第二步：寻找“天命 IP”（优选 IP 榨干带宽）

> **⚠️ 重要前提**：本章节的操作适用于你已经拥有了通过 **Cloudflare Workers** 或 **Pages** 部署的节点。优选 IP 的本质是更换连接 Cloudflare 机房的入口。

### 🔍 寻找天命 IP
在本地 CMD 终端直接 Ping 知名且高质量的反代域名：
* **`ping time.is`** (老牌稳定)
* **`ping www.visa.com.sg`** (亚太地区神级反代)

如果你测得延迟在 **100ms** 左右且 **0% 丢包**，那么这个 IP（如 `172.67.68.157`）就是你的最优解！虽然查询显示它在 [旧金山](https://www.ip138.com/)，但 100ms 的延迟证明它实际走的是近处的亚太机房。🛰️

### 🔧 小火箭换芯设置
* **地址 (Address)**：填入优选域名 `time.is` 或测出的 IP `172.67.68.157`。
* **主机名 (Host/SNI)**：**绝对不能改！** 保持原有的服务器伪装域名（如 `*****.dpdns.org`）。

---

## 🛡️ 第三步：小火箭智能分流（安全护城河）

最后一步，我们要让小火箭像“交警”一样调度流量，解决优选 IP 带来的归属地跳变问题。

### 🚦 调度逻辑 🚦
* **🚀 高速通道**：不敏感流量（YouTube、Netflix）走 **CF 极速节点**（配上优选 IP），极致丝滑。
* **🔒 安全通道**：敏感流量（Google、ChatGPT、Twitter）强行绑定到 **RN 固定节点**，确保出口 IP 永不跳变！

### 📝 操作指南 📝
1. **模式切换**：首页“全局路由”改为 **配置 (Config)**。
2. **添加规则**：进入配置编辑 -> 规则 (Rules) -> 点击 `+`。
   * **类型**：`DOMAIN-SUFFIX` (域名后缀)
   * **域名**：`google.com` (或 `openai.com`)
   * **策略**：从列表底部选中你的 **【BWG 固定节点】**！
3. **默认策略**：回到首页，选中你的 **CF 极速节点**（点亮小黄点）并开启开关。

---

## 🎉 总结

通过这套配置，你不仅实现了节点的分组自动化，还做到了**“看 4K 不卡顿，上 Google 不跳 IP”**。

这就是折腾的意义：**掌控规则，享受自由！** 🚀

如果这篇教程对你有帮助，欢迎转发给更多小伙伴！👇
