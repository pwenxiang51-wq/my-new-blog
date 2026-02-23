---
author: Velox
pubDatetime: 2026-01-13T10:00:00Z
title: Groq 虽快，但遇到长文怎么办？Cloudflare 部署 Gemini 完美互补方案
postSlug: deploy-gemini-on-cloudflare
featured: true
draft: false
tags:
  - Cloudflare
  - Gemini
  - Telegram
  - AI
  - 教程
description: 给你的 Telegram 机器人装上 Google 的大脑。支持 Gemini 1.5/2.0/3.0 自动切换、图片识别、AI 绘画，与 Groq 形成完美的快慢互补组合。
---

在上一篇文章中，我们介绍了天下武功唯快不破的 **Groq**。它秒回的体验确实爽，但在处理**长文档分析**、**图片识别**或者**复杂逻辑推理**时，Groq 的免费模型有时会显得力不从心（或者 Token 不够用）。

**我们需要一个“B计划”。**

今天分享的是基于 **Cloudflare Workers** 部署的 **Google Gemini** 全能机器人。它不仅拥有 Google 最强的多模态能力（能看懂图），我还在这份代码里加入了**“灾难恢复机制”** —— 它可以自动在 Gemini 3.0 和 2.0 模型之间切换，确保你的机器人永远在线。

## 🤖 为什么需要 Gemini？

如果说 Groq 是**“快银”**，那 Gemini 就是**“奇异博士”**：

1.  **超长上下文**：Gemini 1.5/2.0 系列支持百万级的 Token，丢进去一本书它都能读完。
2.  **多模态视觉**：直接发给它一张照片，它能看懂并在几秒钟内告诉你图里有什么。
3.  **免费额度大方**：Google AI Studio 的免费层级非常慷慨，适合个人使用。

## 🛠️ 功能亮点 (不死鸟版)

这份代码包含了以下硬核功能：

* **🛡️ 严格鉴权**：只允许你设置的 `ALLOWED_ID` 使用，防止被白嫖。
* **🔄 自动降级双引擎**：默认尝试调用最新的 **Gemini 3.0** 模型；如果 3.0 报错，自动切换到 **Gemini 2.0 Flash**，绝不装死。
* **🎨 AI 绘画集成**：输入 `/draw 提示词`，直接调用 Cloudflare 的 SDXL 模型画图。
* **🧠 记忆功能**：利用 Cloudflare KV 存储上下文，它记得你们之前的聊天内容。

---

## 🚀 部署步骤

### 1. 准备工作

* **Cloudflare 账号**：必须有。
* **Google API Key**：去 [Google AI Studio](https://aistudio.google.com/) 申请一个 Key。
* **Telegram Bot Token**：找 `@BotFather` 申请。
* **你的 Telegram ID**：找 `@userinfobot` 获取（用于鉴权）。

### 2. 创建 Cloudflare Worker

1.  登录 Cloudflare 面板，进入 **Workers & Pages**。
2.  点击 **Create Application** -> **Create Worker**。
3.  命名为 `gemini-bot`，点击 **Deploy**。
4.  点击 **Edit code** 进入代码编辑页面。

### 3. 获取核心代码

为了方便维护和更新，我将完整代码开源在 GitHub。请点击下方链接获取：

👉 **[GitHub 仓库：Velox-Gemini-Bot](https://github.com/pwenxiang51-wq/Velox-Gemini-Bot)**

**操作指南**：
1.  点击上面的链接进入仓库。
2.  打开 **`worker.js`** 文件。
3.  点击右上角的 **Copy raw file** 按钮复制全部代码。
4.  回到 Cloudflare Worker 编辑器，覆盖粘贴进去。

### 4. 配置环境变量 (Settings -> Variables)

这是最重要的一步，请仔细填写：

| 变量名 | 描述 |
| :--- | :--- |
| `TG_TOKEN` | 你的 Telegram Bot Token |
| `GEMINI_KEY` | 你的 Google AI Studio API Key |
| `ALLOWED_ID` | 你的 Telegram User ID (只允许你使用) |

### 5. 绑定资源 (Settings -> Bindings)

为了实现记忆和画图，还需要绑定两个 Cloudflare 资源：

1.  **KV Namespace (记忆)**:
    * 在 Workers 首页创建一个 KV，名字随便（比如 `GEMINI_MEMORY`）。
    * 回到 Worker 的设置，点击 **Add Binding** -> **KV Namespace**。
    * Variable name 填 `DB` (必须是这个)。
    * Namespace 选刚才创建的那个。

2.  **Workers AI (画图)**:
    * 点击 **Add Binding** -> **Workers AI**。
    * Variable name 填 `AI` (必须是这个)。

### 6. 激活机器人

部署完成后，记下 Worker 的访问域名（例如 `gemini-bot.your-name.workers.dev`）。

在浏览器访问一次以下链接（替换成你的信息）：
`https://你的Worker域名/init`

如果页面显示 `Webhook OK`，恭喜你，你的全能 AI 助手已经上线了！

---

## 🎉 总结：双剑合璧

现在，你的 Telegram 列表里应该有了两员大将：

* ⚡ **Groq 机器人**：负责日常闲聊、快速问答、翻译，主打一个**快**。
* 🧠 **Gemini 机器人**：负责看图说话、画图、写长文、分析复杂逻辑，主打一个**强**。

有了这套“快慢互补”的方案，无论遇到什么场景，你都能从容应对。



---

> **💡 提示：** > 本文首发于我的个人博客 **[Velo.x 的极客空间](https://222382.xyz)**。我在那里存放了更完整的 **[velox AI v7.0 终极版：自带“中译英”大脑，彻底解决 SDXL 绘图听不懂中文的痛点！ 运维系列教程](https://222382.xyz/posts/ultimate-velox-ai-v7/)**，排版更精美，更新也更及时，欢迎来踩踩！🚀

---
