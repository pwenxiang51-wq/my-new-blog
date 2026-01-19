---
title: "[全网首发] 零成本打造最强 AI 机器人：Groq + Cloudflare Workers + TG Bot，速度快到飞起！"
pubDatetime: 2026-01-20T10:00:00.000+08:00
description: "不想买 VPS 挂机器人？嫌 GPT 响应太慢？本文教你用 Groq 的 LPU 芯片配合 Cloudflare Workers，免费搭建一个秒回消息的 Telegram AI 机器人。"
tags:
  - AI
  - Telegram
  - Cloudflare
  - Tutorial
---

只要你玩过 AI，一定听说过 **Groq**。它不是那个马斯克的 Grok，而是一家靠自研 LPU (语言处理单元) 芯片震惊世界的公司。它的特点只有一个字：**快！** 快到让 GPT-4 看起来像老奶奶过马路。

今天这篇教程，我们利用 **Cloudflare Workers (Serverless)** 来白嫖 Groq 的算力，把全世界最快的 AI 模型（Llama 3）塞进你的 Telegram 里。

**最重要的是：完全免费，不需要服务器！**

### 准备工作

在开始之前，你需要准备好这三样东西：
1.  **Cloudflare 账号**：用于部署后端代码。
2.  **Groq API Key**：去 [Groq Cloud](https://console.groq.com/keys) 申请一个免费的 Key。
3.  **Telegram Bot Token**：找 @BotFather 申请一个机器人 Token。

### 第一步：创建 Cloudflare Worker

1.  登录 Cloudflare 面板，在左侧菜单点击 **Workers & Pages**。
2.  点击 **Create Application** -> **Create Worker**。
3.  名字随便取（比如 `my-groq-bot`），点击 **Deploy**。
4.  部署完成后，点击 **Edit code** 进入代码编辑页面。

### 第二步：写入后端代码

删除编辑器里原有的所有代码，复制粘贴下面这段代码：

```javascript
const GROQ_API_URL = "[https://api.groq.com/openai/v1/chat/completions](https://api.groq.com/openai/v1/chat/completions)";

export default {
  async fetch(request, env) {
    // 仅处理 POST 请求
    if (request.method === "POST") {
      try {
        const payload = await request.json();
        
        // 检查是否为 Telegram 消息
        if (payload.message && payload.message.text) {
          const chatId = payload.message.chat.id;
          const userText = payload.message.text;

          // 1. 调用 Groq API
          const aiResponse = await getGroqReply(userText, env.GROQ_API_KEY);
          
          // 2. 回复 Telegram
          await sendTelegramMessage(chatId, aiResponse, env.TG_BOT_TOKEN);
        }
        
        return new Response("OK");
      } catch (e) {
        return new Response("Error processing request", { status: 500 });
      }
    }
    return new Response("Method not allowed", { status: 405 });
  }
};

// 调用 Groq 接口
async function getGroqReply(content, apiKey) {
  const response = await fetch(GROQ_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      messages: [{ role: "user", content: content }],
      model: "llama3-70b-8192", // 这里选用了 Llama3 70B 模型，速度与智商并存
      temperature: 0.7
    })
  });
  
  const data = await response.json();
  return data.choices[0].message.content;
}

// 发送 Telegram 消息
async function sendTelegramMessage(chatId, text, botToken) {
  const url = `https://api.telegram.org/bot${botToken}/sendMessage`;
  await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      chat_id: chatId,
      text: text,
      parse_mode: "Markdown" // 支持 Markdown 格式
    })
  });
}
