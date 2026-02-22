---
title: 🚀 赛博极客流水线：用 Cloudflare Worker + TG 机器人全自动发布 Astro 博客
author: Velox
pubDatetime: 2026-02-21T20:00:00+08:00
slug: cloudflare-worker-tg-bot-astro-auto-publish
featured: true
draft: false
tags:
  - Serverless
  - Cloudflare Worker
  - Astro
  - Telegram Bot
  - 自动化
description: 彻底告别本地终端和繁琐的 Markdown 格式！利用 Cloudflare Worker 缝合 TG 机器人与 Groq AI 大模型，实现手机端随时随地、零成本全自动排版并发布技术博客的终极工作流。
---

## 💡 痛点：被“数字枷锁”困住的灵感

作为一名重度折腾 Serverless 和静态博客（比如 Astro、Hugo）的极客，我们最常遇到的痛点是什么？
灵感往往在一瞬间爆发（比如在地铁上、马桶上想到了一个绝妙的服务器配置方案），但如果要发布一篇标准的 Astro 博客，你必须：
1. 打开电脑，新建 `.md` 文件。
2. 小心翼翼地手敲 `---` 包裹的 Frontmatter（标题、时间、极其严格的缩进格式）。
3. 敲完正文后，还要 `git add .`、`git commit`、`git push`。

一套流程下来，灵感早就凉透了。

今天，我们将利用 **Telegram 机器人（接收消息） + Groq AI（自动排版润色） + Cloudflare Worker（无服务器中转调度） + GitHub API（精准推送）**，打造一条纯白嫖、零成本的**“赛博全自动博客流水线”**。

以后，你只需要在手机上给你的 TG 机器人发一句语音或大白话，它就会瞬间排版成完美的 Markdown 并自动发布到你的博客上！

---

## 🛠️ 准备工作：集齐“四大神器”的密钥

在部署 Cloudflare Worker 之前，我们必须先拿到四个核心机密变量。请一步步操作并妥善保存在你的记事本中。

### 1. `TG_BOT_TOKEN` (Telegram 机器人密钥)
这是我们与云端通信的入口。
* 打开 Telegram，搜索并添加官方的 [**@BotFather**](https://t.me/BotFather)。
* 发送指令 `/newbot`，按提示给机器人起个名字和一个以 `bot` 结尾的用户名（如 `my_blog_bot`）。
* 创建成功后，BotFather 会返回一串红色的 **HTTP API Token**（例如：`123456789:AAH_xxx...`），复制保存。

### 2. `GROQ_API_KEY` (AI 大脑密钥)
我们将白嫖极其大方且速度极快的 Groq AI，让它帮我们自动生成文件名、补全 Astro 的头部格式并排版 Markdown。
* 登录 [**Groq Cloud Console**](https://console.groq.com/keys)。
* 点击 **Create API Key**，随便起个名字，生成并复制那一串以 `gsk_` 开头的密钥。

### 3. `GH_TOKEN` (GitHub 仓库写入授权)
Worker 需要这把钥匙，才能把生成的文章直接塞进你的源码库。
* 打开你的 GitHub [**Developer settings - Personal access tokens (classic)**](https://github.com/settings/tokens/new)。
* 点击 **Generate new token (classic)**。
* **Expiration** 选择 `No expiration`（永久）。
* **⚠️ 核心权限**：在 Select scopes 列表中，**必须且仅需勾选 `repo` (Full control of private repositories) 的主复选框**。
* 滑到底部生成，复制那串 `ghp_` 开头的长密码（刷新后不可见，务必保存好）。

### 4. `GH_REPO` (目标仓库路径)
这个最简单，就是你的 GitHub 账号名加上你的博客仓库名。
* 例如：`pwenxiang51-wq/my-new-blog`。

---

## 🚀 核心部署：在 Cloudflare 锻造 Worker 节点

这是整个系统的“心脏”，**全程无需本地环境，纯网页端操作！**

### Step 1: 创建 Worker
1. 登录 [**Cloudflare 控制台**](https://dash.cloudflare.com/)，点击左侧 **Workers & Pages**。
2. 点击 **Create application** -> **Create Worker**。
3. 起一个极客的名字（比如 `velox-astro-api`），点击 **Deploy**。

### Step 2: 注入“赛博魔法”源码
1. 部署后，点击 **Edit code**，将默认代码清空。
2. 复制并粘贴以下完整代码（代码中已写死东八区时间及 Astro 标准目录结构，可自行根据需要修改路径）：

````javascript
export default {
  async fetch(request, env, ctx) {
    if (request.method !== "POST") return new Response("🚀 Velox 的私人 Astro 发布节点已就绪！");

    let update;
    try {
      update = await request.json();
    } catch (e) {
      return new Response("OK");
    }

    if (!update.message || !update.message.text) return new Response("OK");
    const chatId = update.message.chat.id;
    const text = update.message.text;

    await sendTgMsg(env.TG_BOT_TOKEN, chatId, "⚡ 收到灵感！正在召唤 Groq AI 润色并排版 Markdown...");

    try {
      const aiResponse = await callGroq(env.GROQ_API_KEY, text);
      const data = JSON.parse(aiResponse);

      // 生成精准东八区时间
      const d = new Date();
      d.setUTCHours(d.getUTCHours() + 8);
      const pubDatetime = d.toISOString().replace(/\.\d{3}Z$/, '+08:00');

      // 严格拼接 Astro Frontmatter
      const finalMarkdown = `---
title: ${data.title}
author: Velox
pubDatetime: ${pubDatetime}
slug: ${data.slug}
featured: false
draft: false
tags:
${data.tags.map(t => `  - ${t}`).join('\n')}
description: ${data.description}
---

${data.content}
`;

      // 推送到 GitHub
      const path = `src/data/blog/${data.slug}.md`;
      const base64Content = btoa(unescape(encodeURIComponent(finalMarkdown)));
      
      const ghRes = await fetch(`https://api.github.com/repos/${env.GH_REPO}/contents/${path}`, {
        method: "PUT",
        headers: {
          "Authorization": `Bearer ${env.GH_TOKEN}`,
          "User-Agent": "Cloudflare-Worker",
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          message: `🤖 Auto-publish via TG Bot: ${data.title}`,
          content: base64Content
        })
      });

      if (!ghRes.ok) throw new Error(await ghRes.text());

      await sendTgMsg(env.TG_BOT_TOKEN, chatId, `✅ **发布成功！**\n\n📌 **标题**: ${data.title}\n🔗 **文件名**: \`${data.slug}.md\`\n\nGitHub Action 已自动触发编译！`);

    } catch (error) {
      await sendTgMsg(env.TG_BOT_TOKEN, chatId, `❌ **翻车了！**\n报错：${error.message}`);
    }
    return new Response("OK");
  }
};

async function sendTgMsg(token, chatId, text) {
  await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ chat_id: chatId, text: text })
  });
}

async function callGroq(apiKey, userText) {
  const prompt = `你是一个极客架构师。用户会发草稿给你。请整理成逻辑清晰、带Markdown标题的技术文章。
为了适配Astro，必须且只能返回纯JSON格式：
{
  "slug": "文章英文短链接，全小写短横线连接",
  "title": "中文标题，带Emoji",
  "description": "精炼简介",
  "tags": ["SEO", "VPS"],
  "content": "排版后的纯Markdown正文，不要写前言。"
}
严禁输出任何其他说明文字！`;

  const res = await fetch("[https://api.groq.com/openai/v1/chat/completions](https://api.groq.com/openai/v1/chat/completions)", {
    method: "POST",
    headers: { "Authorization": `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "llama-3.3-70b-versatile",
      messages: [
        { role: "system", content: prompt },
        { role: "user", content: userText }
      ],
      temperature: 0.2,
      response_format: { type: "json_object" }
    })
  });
  const json = await res.json();
  if (!json.choices) throw new Error(JSON.stringify(json));
  return json.choices[0].message.content;
}
````
3. 点击右上角 **Deploy** 保存。

### Step 3: 配置环境变量 (最容易翻车的一步)
1. 退回 Worker 管理页，点击 **Settings** -> **Variables and Secrets**。
2. 点击 **Add**，依次添加我们准备好的四个大写变量：
   * `TG_BOT_TOKEN`
   * `GROQ_API_KEY`
   * `GH_TOKEN`
   * `GH_REPO`
3. 务必选择 `Secret`（加密机密）以保证安全，点击 **Save**。

---

## 🔗 最后一步：给 Telegram 机器人“接线” (Webhook)

目前你的 Worker 已经活了，并拥有了一个类似 `https://velox-astro-api.xxx.workers.dev` 的专属域名。
我们需要告诉 Telegram：**以后收到消息，请直接转交到这个地址！**

打开你的浏览器，地址栏输入以下魔法拼接链接并回车：

`https://api.telegram.org/bot【这里换成你的TG机器人Token】/setWebhook?url=https://【这里换成你Worker的专属网页地址】`

*⚠️ 注意：`bot` 和你的 Token 之间不要有空格！*

如果网页返回：`{"ok":true,"result":true,"description":"Webhook was set"}`，那么恭喜你，全线贯通！

---

## 🎉 验收：见证赛博魔法

现在，掏出你的手机，打开 Telegram，对你的机器人发一句：
> *"测试一下刚部署的自动化博客流水线，这套 Serverless 系统太爽了！"*

一分钟内，你将看到 Groq AI 瞬间接管排版，GitHub 自动落库提交，Cloudflare Pages 被唤醒重构……而你，只需要喝杯咖啡，享受全自动化带来的极致愉悦！😎
