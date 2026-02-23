---
author: Velo.x
pubDatetime: 2026-01-18T12:00:00Z
title: 博客重生指南：从零配置 Git 到日常推送（全流程保姆级教程）
postSlug: git-full-guide
featured: true
draft: false
tags:
  - 教程
  - Git
  - 博客
  - 环境搭建
description: 之前的教程太简单了，万一换了新电脑怎么办？这篇文章记录了从下载 Git 安装包、配置 SSH 密钥到拉取博客源码的全过程。只要照做，任何一台新电脑都能立刻变成你的博客工作台。
---

之前的文章只写了日常推送，但我突然意识到一个问题：**如果我换了台新笔记本，或者系统重装了，对着那五行代码是没法干活的。**

所以，这篇是**“灾难恢复级”**的完整教程。无论你是刚入门，还是换了新设备，按照这个 CMD 命令行操作流程，绝对能让你的 Astro 博客满血复活。

## 🛠️ 第一阶段：环境搭建（新电脑必做）

### 1. 下载并安装 Git

首先，我们需要把 Git 这个工具装进电脑里。

* **下载地址**：[Git 官网下载页面](https://git-scm.com/download/win)
* **安装方式**：下载 `64-bit Git for Windows Setup`，双击运行。
* **注意**：安装过程中会出现大概十几个选项，**全程无脑点击 "Next"（下一步）** 即可，默认配置已经足够好用。

### 2. 验证安装

按下 `Win + R` 键，输入 `cmd` 并回车，打开小黑窗。输入以下命令：

```bash
git --version
```

如果出现了类似 `git version 2.xx.x` 的字样，说明安装成功。

### 3. 自报家门（配置身份）

Git 需要知道是谁在提交代码。在 CMD 中依次执行下面两行（把名字和邮箱换成你自己的）：

```bash
git config --global user.name "Velo.x"
git config --global user.email "你的GitHub注册邮箱@example.com"
```

### 4. 配置 SSH 密钥（实现免密推送）

这一步最关键！如果不做，每次推送都要输密码，非常麻烦。我们需要生成一把“钥匙”，把公钥给 GitHub，私钥留给自己。

**在 CMD 中执行：**

```bash
ssh-keygen -t ed25519 -C "你的GitHub注册邮箱@example.com"
```

* **操作**：出现提示时，**连续按 3 次回车键**（不要设密码），直到看见一个矩形的字符画，说明钥匙生成了。

**查看公钥内容：**

```bash
type %USERPROFILE%\.ssh\id_ed25519.pub
```

* **操作**：复制屏幕上显示的那一长串以 `ssh-ed25519` 开头的字符。
* **去 GitHub 备案**：
    1.  打开 [GitHub SSH 设置页面](https://github.com/settings/keys)。
    2.  点击 **New SSH key**。
    3.  Title 随便填（比如 `Lenovo-Laptop`），Key 粘贴刚才复制的内容。
    4.  点击 **Add SSH key**。

---

## 📥 第二阶段：找回博客（拉取源码）

环境装好了，现在要把托管在 GitHub 上的博客源码“克隆”回本地。

### 1. 找个风水宝地

假设我们要把博客放在桌面上。在 CMD 中执行：

```bash
cd Desktop
```

### 2. 克隆仓库

去你的 GitHub 仓库页面，点击绿色的 `<> Code` 按钮，选择 **SSH**，复制那个地址（类似 `git@github.com:Velo-x/my-blog.git`）。

然后在 CMD 中执行：

```bash
git clone git@github.com:你的用户名/你的仓库名.git
```

* 如果是第一次连接，它会问你 `Are you sure...?`，输入 `yes` 并回车。

### 3. 安装依赖（非常重要！）

Git 只存代码，不存依赖包（`node_modules`）。**新电脑如果不执行这一步，博客是跑不起来的。**

```bash
cd 你的仓库文件夹名
npm install
```

看到进度条跑完，你的博客环境就彻底在新电脑上复活了！🎉

---

## 🔄 第三阶段：日常管理（五步工作流）

环境搭好后，以后每次写文章，只需要重复下面这 5 个步骤。建议死记硬背！

### 1. 进门（cd）

打开终端，必须先进入博客文件夹。

```bash
cd Desktop\my-new-blog
```

### 2. 同步（git pull）

动笔前先从云端拉取最新进度，防止冲突。

```bash
git pull
```

### 3. 写文章 & 预览

使用你的编辑器（VS Code）写文章。写完想看看效果？

```bash
npm run dev
```

* 按 `Ctrl + C` 可以退出预览模式。

### 4. 打包（git add）

把修改过的文件放入暂存区。注意有个点 `.`。

```bash
git add .
```

### 5. 贴单（git commit）

```bash
git commit -m "新增文章：Git教程"
```

### 6. 发货（git push）

```bash
git push
```

看到进度条跑完，Cloudflare 就会自动开始部署了。

---

## ⚡️ 附录：网络卡顿怎么办？

在国内使用 GitHub，`git clone` 或 `git push` 经常会遇到 `Connection reset` 或 `Time out`。

如果你有“魔法”工具，可以给 Git 单独挂个代理（假设你的代理端口是 `7890`，请根据软件设置自行修改）：

**开启代理：**
```bash
git config --global http.proxy [http://127.0.0.1:7890](http://127.0.0.1:7890)
git config --global https.proxy [http://127.0.0.1:7890](http://127.0.0.1:7890)
```

**取消代理（万一网络正常了）：**
```bash
git config --global --unset http.proxy
git config --global --unset https.proxy
```

## 总结

这一套流程走下来，你就拥有了**跨设备管理博客**的能力。

* **新电脑**：从阶段一做到阶段二。
* **老电脑**：只做阶段三。

建议把这篇文章收藏进浏览器的书签，以备不时之需！🚀



---

> **💡 提示：** > 本文首发于我的个人博客 **[Velo.x 的极客空间](https://222382.xyz)**。我在那里存放了更完整的 **[TG/WA双号保命指南：13块钱搞定 Giffgaff 实体卡转 eSIM，稳用25年！系列教程](https://222382.xyz/posts/giffgaff-esim-telegram-whatsapp/)**，排版更精美，更新也更及时，欢迎来踩踩！🚀

---
