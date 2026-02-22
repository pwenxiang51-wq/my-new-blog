---
title: 用 Cloudflare Worker 配合 TG 机器人全自动发布 Astro 博客 🚀
author: Velox
pubDatetime: 2026-02-22T16:23:40+08:00
slug: cloudflare-worker-astro-blog-tg-bot
featured: false
draft: false
tags:
  - Cloudflare Worker
  - Astro 博客
  - TG 机器人
  - Serverless
description: 彻底告别本地敲代码，实现手机端随时随地发博客的赛博流水线
---


### **第一步：获取 GitHub 个人访问令牌**
去 GitHub 申请一把专属钥匙。在 **Developer settings** 里生成一个 **Personal Access Token**，最关键的是必须勾选 **repo** 权限。

### **第二步：配置 Cloudflare Worker**
在 Cloudflare 网页端手搓 Worker 节点。新建一个 Worker，贴入缝合代码，然后最重要的是要在设置里添加 4 个机密环境变量：
* **TG_BOT_TOKEN**
* **GROQ_API_KEY**
* **GH_TOKEN**
* **GH_REPO**

### **第三步：配置 Telegram 机器人 Webhook**
给 Telegram 机器人接线。在浏览器里拼接网址访问：`https://api.telegram.org/bot【你的机器人Token】/setWebhook?url=【Worker的网页地址】`。显示 **Webhook was set** 就大功告成了。

这套系统纯 **Serverless** 白嫖，零成本，极客感拉满。
