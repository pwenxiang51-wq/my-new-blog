---
title: 【实战】VPS 榨干计划：从零部署青龙面板薅羊毛 + 私人网盘搭建全纪录
author: Velox
pubDatetime: 2026-02-02T19:00:00+08:00
slug: vps-qinglong-alist-guide
featured: true
draft: false
tags:
  - VPS
  - Docker
  - 青龙面板
  - 薅羊毛
  - Alist
description:
  买的 VPS 不能只挂个探针！本文手把手教你用 Docker 部署青龙面板（自动领京豆）、解决依赖报错坑，配置 Alist 私人网盘，以及后期的迁移与卸载指南。
---

VPS 买来吃灰？那是对服务器最大的浪费！
这就带你把闲置的 VPS 变成 24 小时自动为你打工的“赚钱机器”和“私人数据中心”。

本文记录了我踩坑无数后总结出的**最佳实践路径**，包含从 PowerShell 登录、Docker 安装，到青龙面板的完美配置（解决各种红字报错）以及 Alist 网盘的搭建。

---
> ⚠️ **配置预警**：
> 本教程亲测有效，但建议 VPS 内存至少 **2GB** 以上。
> 如果你的内存只有 1GB（如 RackNerd 活动机），同时运行青龙和节点服务可能会导致内存溢出 (OOM) 甚至死机。小内存用户请谨慎折腾！
---

## 💻 第零章：连接服务器 & 环境准备

既然是保姆级教程，我们先从怎么进入服务器开始。

### 1. 使用 PowerShell 连接 VPS

不需要下载专门的软件（如 Xshell），直接在电脑上打开 **PowerShell** (Windows) 或 **终端** (Mac)，输入以下命令：

```bash
ssh root@你的VPS_IP
```

* **提示**：输入 `yes` 确认指纹。
* **密码**：输入密码时**屏幕上不会显示任何字符**，这是正常的，盲输完直接按回车即可。

### 2. 一键安装 Docker

现在的 VPS 系统（Ubuntu/Debian/CentOS）可能还没装 Docker，复制下面这行“万能命令”粘贴进去，回车执行：

```bash
curl -fsSL [https://get.docker.com](https://get.docker.com) | bash
```

等它跑完代码，再输入下面这两行确保 Docker 开机自启：

```bash
systemctl enable docker
systemctl start docker
```

搞定！现在你的服务器已经准备好起飞了。

---

## 🚀 第一章：青龙面板 —— 你的全自动打工仔

青龙面板是目前最强大的定时任务管理平台，主要用来跑各种签到脚本（京东、B站、阿里云盘等）。

### 1. 部署青龙容器

在 PowerShell 里复制以下命令回车：

```bash
docker run -dit \
  -v $PWD/ql/data:/ql/data \
  -p 5700:5700 \
  --name qinglong \
  --hostname qinglong \
  --restart always \
  whyour/qinglong:latest
```

* **访问地址**：`http://你的IP:5700`
* **初始化**：按照提示创建管理员账号，推送设置可以先跳过。

### 2. 拉取脚本仓库（避坑指南）

很多教程推荐的 `KingRan` 库经常挂（报错 404）。经过实测，目前最稳的是 **6dylan6**。

* 进入面板 -> **订阅管理** -> **新建订阅**：
    * **名称**：`6dylan6`
    * **类型**：公开仓库
    * **链接**：`https://github.com/6dylan6/jdpro.git` (国外机直连，国内机前面加 `https://ghproxy.net/`)
    * **分支**：`main`
    * **定时规则**：`0 2 * * *`
* 保存后，点击**运行**按钮。等待日志显示“执行结束”，定时任务列表里就会多出几百个任务。

### 3. 环境变量（配置 Cookie —— 最核心一步）

脚本怎么知道是哪个账号在跑？靠 Cookie。这是最关键的一步，很多人卡在这里。

**如何获取京东 Cookie (PC端)：**

1.  用浏览器（Chrome/Edge）打开 `m.jd.com` 并登录你的京东账号。
2.  按键盘 **F12** 打开开发者工具，点击 **网络 (Network)** 标签。
3.  **关键技巧**：在左上角搜索框输入 `pt_key`，然后按 **F5** 刷新网页。
4.  点击搜索结果中的第一个请求（通常是 `home` 或 `m.jd.com`）。
5.  在右侧 **标头 (Headers)** 里找到 **Cookie**，复制整串内容。
6.  我们只需要里面的 `pt_key=xxx;pt_pin=xxx;` 这两段即可（注意：**要把分号带上**）。

**填入青龙面板：**

* 进入面板 -> **环境变量** -> **新建变量**。
* **名称**：`JD_COOKIE`
* **值**：粘贴你刚才筛选出来的那串 `pt_key=...;pt_pin=...;`
* 点击确定。

### 4. 🚑 终极填坑：依赖管理（最重要！）

很多新手（包括我）运行脚本时会满屏红字报错：`Cannot find module 'got'` 或 `crypto-js`。这是因为裸机缺少 Node.js 依赖工具包。

**请严格按以下顺序安装，包治百病：**

#### 第一步：安装通用依赖全家桶

* 进入 **依赖管理** -> **新建依赖** -> 选择 **NodeJs**。
* **⚠️ 关键点：自动拆分选择【是】**。
* **名称**（复制粘贴下面这串）：
    ```text
    crypto-js moment png-js axios date-fns tslib @types/node request md5 ts-md5 tough-cookie jsdom ws
    ```
* 点击确定，等待状态全部变绿。

#### 第二步：单独修复 `got` 版本冲突

新版 `got` 语法变了，会导致旧脚本报错。必须强制安装 v11 版本。

* 再次 **新建依赖** -> 选择 **NodeJs**。
* **⚠️ 关键点：自动拆分选择【否】**。
* **名称**：`got@11`
* 点击确定。

做完这两步，再去运行“京东资产统计”，绝对一路绿灯！🟢

### 5. 🔔 进阶：开启通知

想每天早上醒来知道昨天赚了多少豆子？

* 打开 **系统设置** -> **通知设置**。
* 推荐使用 **TelegramRobot** (需要 Bot Token 和 Chat ID) 或者 **PushPlus** (微信推送)。
* 配置好后点击测试，以后每天脚本跑完都会给你发资产日报。

---

## ☁️ 第二章：Alist —— 聚合你的所有网盘

除了薅羊毛，VPS 还能把你的阿里云盘、百度网盘、夸克网盘聚合成一个网页，实现不限速看片。

### 1. 一键搭建

```bash
docker run -d --restart=always -v /etc/alist:/opt/alist/data -p 5244:5244 -e PUID=0 -e PGID=0 --name=alist xhofe/alist:latest
```

### 2. 获取密码

默认密码是随机的，我们需要手动查看或修改：

```bash
# 设置一个新密码，例如 123456
docker exec -it alist ./alist admin set 123456
```

### 3. 使用

* 访问 `http://你的IP:5244`，登录后在后台添加你的网盘账号即可。
* 这里可以挂载阿里云盘、夸克、百度云等，把它们变成你的“本地硬盘”。

---

## 🎮 第三章：还能玩什么？

青龙面板不只能跑京东，只要有脚本，万物皆可签到。

1.  **阿里云盘自动签到**：在订阅管理里添加阿里云盘的脚本库（搜 `alist_sign`），每天自动领容量。
2.  **网易云音乐打卡**：搜 `NeteaseCloudMusic` 脚本，自动听歌升级。
3.  **B站自动升级**：搜 `Bilibili-Task`，每天自动投币点赞。

**方法论**：找到 GitHub 上的脚本库链接 -> 放入订阅管理 -> 在环境变量里填入对应的 Cookie。

---

## 🚚 第四章：VPS 迁移指南

如果这台 VPS 到期了，想换一台新机器，怎么把这一堆配置（青龙数据、脚本、账号）原封不动地搬过去？

因为我们用了 Docker 挂载目录，迁移非常简单：

### 1. 打包数据（在旧 VPS 上）

假设你的青龙数据在 `/root/ql` 目录下：

```bash
cd /root
tar -czvf ql_backup.tar.gz ./ql
```

### 2. 传输数据

用 SCP 或者下载到本地，再上传到新 VPS 的 `/root` 目录下。

### 3. 恢复运行（在新 VPS 上）

```bash
# 解压数据
cd /root
tar -xzvf ql_backup.tar.gz

# 重新运行 Docker 命令（注意路径要对上）
docker run -dit -v $PWD/ql/data:/ql/data -p 5700:5700 --name qinglong --restart always whyour/qinglong:latest
```

搞定！登录上去你会发现，之前的账号、任务、依赖全都在，无缝衔接。

---

## 🗑️ 第五章：不想玩了？一键跑路

如果你觉得累了，想把服务器清空，或者重置环境，执行以下命令彻底删除：

```bash
# 1. 停止容器
docker stop qinglong alist

# 2. 删除容器
docker rm qinglong alist

# 3. 删除数据文件（慎用！会清空所有配置）
rm -rf /root/ql /etc/alist

# 4. 删除 Docker 镜像
docker rmi whyour/qinglong xhofe/alist
```

执行完这些，你的 VPS 就又回到了白纸一张的状态。

---

**最后总结：**

折腾 VPS 的乐趣不在于那几毛钱的京豆，而在于看着一行行代码跑通、报错消失那一刻的成就感。Serverless 虽好，但拥有一台完全属于自己的 Docker 主机，那种掌控感是无可替代的。

Enjoy your server! 🚀




---

> **💡 提示：** > 本文首发于我的个人博客 **[Velo.x 的极客空间](https://222382.xyz)**。我在那里存放了更完整的 **[Velox AI v7.0 终极版：自带“中译英”大脑，彻底解决 SDXL 绘图听不懂中文的痛点！系列教程](https://222382.xyz/posts/ultimate-velox-ai-v7/)**，排版更精美，更新也更及时，欢迎来踩踩！🚀

---
