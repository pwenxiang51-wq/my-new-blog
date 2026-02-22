---
title: Astro 机器人部署指南 🚀
author: Velox
pubDatetime: 2026-02-22T16:36:55+08:00
slug: astro-telegram-bot
featured: false
draft: false
tags:
  - Astro
  - Telegram Bot
  - Cloudflare Worker
description: 一步步教你如何部署 Astro 机器人
---


### Step 1: 创建 Worker
1. 起一个极客的名字（比如 `velox-astro-api`），点击 **Deploy**。

### Step 2: 注入“赛博魔法”源码
1. 部署后，点击 **Edit code**，将默认代码清空。
2. 复制并粘贴以下完整代码：
```javascript
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
    
    await sendTgMsg(env.TG_BOT_TOKEN, chatId, "⚡️ 收到灵感！正在召唤 Groq AI 润色并排版 Markdown...");
    
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
      
      await sendTgMsg(env.TG_BOT_TOKEN, chatId, `✅ **发布成功！**\n\n📌 **标题: ${data.title}\n🔗 文件名: \`${data.slug}.md\`\n\nGitHub Action 已自动触发编译！`);
      
    } catch (error) {
      await sendTgMsg(env.TG_BOT_TOKEN, chatId, `❌ 翻车了！**\n报错：${error.message}`);
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
  
  const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
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
```
3. 点击右上角 **Deploy 保存。

### Step 3: 配置环境变量 
1. 退回 Worker 管理页，点击 Settings -> Variables and Secrets**。
2. 点击 **Add**，依次添加我们准备好的四个大写变量：
   * `TG_BOT_TOKEN`
   * `GROQ_API_KEY`
   * `GH_TOKEN`
   * `GH_REPO`
3. 务必选择 `Secret`（加密机密）以保证安全，点击 **Save**。

## 最后一步：给 Telegram 机器人“接线” (Webhook)
目前你的 Worker 已经活了，并拥有了一个类似 `https://velox-astro-api.xxx.workers.dev` 的专属域名。
我们需要告诉 Telegram：**以后收到消息，请直接转交到这个地址！

打开你的浏览器，地址栏输入以下魔法拼接链接并回车：
```text
https://api.telegram.org/bot【这里换成你的TG机器人Token】/setWebhook?url=https://【这里换成你Worker的专属网页地址】
```
*⚠️ 注意：`bot` 和你的 Token 之间不要有空格！*

如果网页返回：`{"ok":true,"result":true,"description":"Webhook was set"}`，那么恭喜你，全线贯通！

