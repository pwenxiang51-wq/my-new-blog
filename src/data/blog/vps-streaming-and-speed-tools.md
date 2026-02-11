---
title: "☁️ RackNerd 玩机全记录：流媒体解锁与三网测速 5 大神器合集"
pubDatetime: 2025-11-23T23:58:00.000+08:00
description: "折腾 VPS 的尽头是重装？本文汇总了在 RackNerd 1G 内存小车上实现 Gemini 和 Netflix 全绿解锁的 5 个核心脚本，带你跳过那些“打不开”的坑。"
tags:
  - VPS
  - Tutorial
  - Gemini
  - Netflix
---

> **摘要**：在 RackNerd 1G 内存的小车上，如何达成“全绿”成就？本文分享我反复折腾后总结的 5 个核心管理与检测脚本，助你彻底解决解锁难题并摸清机器性能。

---

## 🛠️ VPS 玩家必备：5 大核心脚本全集

### 1. 🌈 流媒体解锁全能检测 (lmc999 脚本)
这是每位 VPS 玩家的“体检单”，Gemini 能不能用，全看它给出的“Yes”。

* **功能**：一键检测是否解锁 Netflix（非自制剧）、Disney+、YouTube Premium 以及 **Google Gemini**。
* **命令**：
```bash
bash <(curl -L -s [https://raw.githubusercontent.com/lmc999/RegionRestrictionCheck/main/check.sh](https://raw.githubusercontent.com/lmc999/RegionRestrictionCheck/main/check.sh))
```

### 2. 🕵️ IP 质量与风控检测 (IPQuality)
想知道你的 IP 干净不干净？直接看欺诈分（Fraud Score）。

* **功能**：查询 IP 风险等级、欺诈分及是否为 IDC 机房 IP。
* **命令**：
```bash
bash <(curl -sL [https://raw.githubusercontent.com/xykt/IPQuality/main/ip.sh](https://raw.githubusercontent.com/xykt/IPQuality/main/ip.sh))
```

### 3. 🗺️ 路由追踪工具 (NextTrace)
抓出流量“环球旅行”的元凶，看看为什么你的 VPS 访问变慢。

* **功能**：可视化追踪回国路由，精准识别绕路。
* **命令**：
```bash
curl nxtrace.org/nt | bash
# 测试回国线路（以阿里 DNS 为例）
nexttrace 223.5.5.5
```

### 4. 🚀 三网测速与性能综合测试 (ecs.sh)
这是 NodeSeek 等社区大佬最常用的脚本，测速数据非常详尽。

* **功能**：包含 CPU 性能测试、三网（电信/联通/移动）多节点下载与上传速度测试。
* **命令**：
```bash
curl -L [https://gitlab.com/spiritysdx/zaobao/-/raw/main/ecs.sh](https://gitlab.com/spiritysdx/zaobao/-/raw/main/ecs.sh) -o ecs.sh && chmod +x ecs.sh && bash ecs.sh
```

### 5. 枢纽管理：Sing-box 与 WARP 管理
最后是咱们日常用来调优和管理“变身”出口的两个快捷指令。

* **Sing-box 管理**：`sb`（用于切换 IPv4 优先权，确保解锁）。
* **WARP 管理**：`cf`（用于开启 WARP 全局模式或切换内核）。

---

## 💡 Velo.x 的避坑总结：关于解锁 Gemini

在 **RackNerd 1G 内存**机器上，不建议折腾复杂的 Socks5 分流，往往会导致规则无法匹配而打不开 Gemini。 

* **最稳配置**：进入 `sb` 菜单，选 `4` 进入优先级设置，强制开启 **IPv4 优先 (WARP)**。
* **结果**：虽然 IP 会显示为 Cloudflare 且存在绕路现象，但能换来 **Gemini: Yes** 的全绿通关，这才是最重要的！

---
**更多硬核折腾记录，欢迎访问我的博客：[blog.222382.xyz](https://blog.222382.xyz)** ✌️
