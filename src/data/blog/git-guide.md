---
author: Velo.x
pubDatetime: 2026-01-20T13:20:00Z
title: 只需要四行代码，优雅地管理博客
postSlug: git-four-steps
featured: true
draft: false
tags:
  - 教程
  - Git
  - 博客
description: 很多新手（包括我自己）在使用 GitHub 博客时，经常遇到“冲突”报错。其实只要养成一个好习惯，只需要记住这四个“魔法咒语”，就能让博客永远同步。
---

折腾了一大圈，终于把我的 Astro 博客搭建好了。在踩了很多坑之后，我总结出了这套最稳的操作流程。

无论你是刚打开电脑准备写文章，还是写完准备发布，严格按照这个顺序来，绝对不会出错。

## 📦 Git 同步四部曲

### 第零步：同步（git pull）

**这步最重要！** 动笔之前，先检查云端有没有新东西。防止你在网页上改了代码，本地却不知道，最后导致打架。

打开终端，输入：

    bash
git pull
含义：从云端“拉取”最新的修改。

场景：每次准备写文章前，习惯性敲一下。如果不报错，就说明是安全的。

第一步：打包（git add）
写完文章后，我们需要把散落在房间里的文件捡起来，放进“快递盒”。

Bash
git add .
注意：add 后面有个空格，然后是一个点 .（代表全部）。

第二步：贴单（git commit）
给快递盒封口，并写上备注。

Bash
git commit -m "更新了文章"
建议：引号里的备注最好写清楚，比如“新增教程”、“修改Logo”，方便以后查账。

第三步：发货（git push）
最后一步，把快递交给 GitHub。

Bash
git push
效果：看到进度条跑完，你的博客源码就更新了。几分钟后，Cloudflare 就会自动部署到全世界。

⚡️ 进阶小技巧：网络加速
如果你在国内，git push 经常卡住（Connection reset），可以给 Git 开个加速挂（注意端口号要改成你代理软件的端口，比如 10808）：

Bash
git config --global http.proxy [http://127.0.0.1:10808](http://127.0.0.1:10808)
git config --global https.proxy [http://127.0.0.1:10808](http://127.0.0.1:10808)
总结
以后写博客的黄金流程：

上线：git pull （先同步，保平安）

写文：在 VS Code 里尽情创作

打包：git add .

贴单：git commit -m "update"

发货：git push

搞定收工！🚀
