---
title: "[开源] Velox AI v7.0 发布：集成 Llama 3.1 + SDXL + 记忆库，这是目前最完美的免费 TG 助理方案。"
### 🛠️ 部署指南 (保姆级教程)

为了让所有人都能用上这个最终版，我已经将包含**“自动翻译层”**的完整代码开源到了 GitHub。

**GitHub 项目地址：**
[Velox-groqAI-Bot (v7.0 Final Code)](https://github.com/pwenxiang51-wq/Velox-groqAI-Bot)

![GitHub 仓库截图](/assets/twelve.png)

#### 第一步：准备三个“原材料”

就像做菜需要买菜一样，我们先去三个地方领免费的“食材”。

1.  **领 Groq 密钥 (API Key)**
    * 点击这里直达：[Groq Cloud 控制台](https://console.groq.com/keys)。
    * 登录后（推荐直接用 Google 账号登录），点击 **Create API Key**。
    * 名字随便填，点击 Submit，然后**复制**那串以 `gsk_` 开头的字符，存到记事本里。

2.  **领机器人身份证 (Bot Token)**
    * 打开 Telegram，搜索 `@BotFather`（这是官方认证的机器人之父）。
    * 点击 **Start**，然后发送指令：`/newbot`。
    * 它会问你怎么称呼机器人？回复一个名字，比如：`我的超级AI`。
    * 它会问你要什么用户名？回复一个英文名（**必须以 bot 结尾**），比如：`velox_ai_bot`。
    * 成功后，它会发给你一段红色的字符（HTTP API Token），**复制**它，存到记事本里。

3.  **获取你自己的 ID (Admin ID)**
    * 在 Telegram 搜索 `@userinfobot`。
    * 点击 **Start**，它回复你的那串数字（Id），就是你的 ID。复制它。

#### 第二步：部署 Cloudflare Worker

1.  登录 [Cloudflare 面板](https://dash.cloudflare.com/)。
2.  在左侧菜单点击 **Workers & Pages** -> **Create**。
3.  点击 **Create Worker** -> **Deploy** (蓝色按钮)。
4.  看到 "Congratulations" 后，点击 **Edit code** (编辑代码)。
5.  **关键操作**：把编辑器里原来的代码全删了，把 GitHub 里 `v7-final.js` 的代码**全部复制粘贴**进去。
6.  点击右上角的 **Save and Deploy** (保存并部署)。

#### 第三步：填写配置 (Variables)

代码写好了，我们需要把刚才领到的“原材料”填进去。

1.  点击左上角的 Worker 名字返回详情页。
2.  点击顶部标签栏的 **Settings** (设置) -> **Variables and Secrets** (变量)。
3.  点击 **Add** (添加)，依次添加下面三个变量：

| 变量名 (Name) | 填什么值 (Value) | 说明 |
| :--- | :--- | :--- |
| `GROQ_API_KEY` | `gsk_xxxx...` | 第一步领到的 Groq 密钥 |
| `TG_BOT_TOKEN` | `12345:xxxx...` | 第一步领到的机器人 Token |
| `ADMIN_ID` | `12345678` | 第一步获取的你自己的 ID |

4.  填完后，点击 **Deploy** (部署) 按钮让设置生效。

#### 第四步：给机器人装个“大脑” (KV 数据库)

这一步是为了让机器人能记住聊天记录。

1.  在 Cloudflare 左侧菜单点击 **Storage & Databases** -> **KV**。
2.  点击 **Create Namespace**，名字随便取（比如 `MEMORY`），点击 Add。
3.  **回到刚才的 Worker 页面** -> **Settings** -> **Variables**。
4.  向下滑动，找到 **KV Namespace Bindings** (KV 绑定)。
5.  点击 **Add binding**：
    * **Variable name**: 这里必须填 **`MEMORY`** (大写，不能改)。
    * **KV Namespace**: 选择你刚才创建的那个数据库。
6.  再次点击 **Deploy**。

#### 第五步：接通电话线 (Webhook)

这是最后一步！不做这一步，机器人是不会理你的。我们需要把 Telegram 和 Cloudflare 连起来。

请把下面这个链接复制到浏览器地址栏，但**先不要回车**，把里面的 `< >` 替换成你的真实信息：

text
[https://api.telegram.org/bot](https://api.telegram.org/bot)<你的Token>/setWebhook?url=<你的Worker域名>
怎么填？举个例子：

假如你的 Token 是 123:ABC

假如你的 Worker 域名是 my-bot.xxx.workers.dev (在 Worker 详情页左上角能看到)

那你最终访问的链接应该是：

https://api.telegram.org/bot123:ABC/setWebhook?url=https://my-bot.xxx.workers.dev

在浏览器访问这个链接，如果看到屏幕上显示 {"ok":true, ...}，恭喜你！大功告成！ 🎉

现在，去 Telegram 给你的机器人发一句“你好”，或者 /img 一只猫 试试吧！
