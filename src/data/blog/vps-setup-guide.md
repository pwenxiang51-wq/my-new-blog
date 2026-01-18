Markdown

---
title: "[实战] 从零开始：VPS 节点搭建 + 域名绑定全流程 (甬哥脚本版)"
author: Velo.x
pubDatetime: 2026-01-18T12:00:00Z
description: VPS 买了不能只当摆设。本文分享利用甬哥一键脚本搭建 Sing-box 节点，并配合 Cloudflare 绑定自定义域名的保姆级教程。
featured: true
draft: false
tags:
  - VPS
  - Cloudflare
  - Linux
  - 教程
---

> **前言**：VPS 买了不能只当摆设。今天分享一套最稳的方案：利用 **甬哥 (yonggekkk) 一键脚本** 搭建 Sing-box 节点，并配合 **Cloudflare** 绑定自定义域名。

这样不仅搭建简单（一行代码），而且以后连接节点用的就是你自己帅气的域名（如 `vps.222382.xyz`），而不是冷冰冰的 IP 数字。

---

### 第一步：域名解析 (Cloudflare)

在操作 VPS 之前，先去给它分配一个“门牌号”。

1. 登录 Cloudflare 后台，点击你的域名。
2. 进入 **DNS** -> **记录 (Records)**。
3. 点击 **添加记录 (Add record)**，按下图填写：

| 类型 | 名称 | 内容 | 代理状态 |
| :--- | :--- | :--- | :--- |
| A | vps | 你的VPS IP | **仅 DNS (灰色云)** |

> **⚠️ 重点提醒**：**一定要把“小黄云”点灰**！否则脚本无法申请 SSL 证书。

![Cloudflare 解析设置](/assets/one.png)

### 第二步：使用 CMD 连接 VPS

Windows 用户不需要下载第三方软件，直接用系统自带的 CMD 即可。

1. 按 `Win + R`，输入 `cmd` 回车。
2. 输入连接命令（将下面信息替换为你自己的）：

```bash
# 格式：ssh root@你的IP -p端口号
ssh root@192.168.1.1 -p22
输入密码登录（密码输入时看不见是正常的，输完直接回车）。

第三步：运行一键脚本
进入 VPS 后，复制下面这行代码，在 CMD 里 右键粘贴 并回车：

Bash

bash <(wget -qO- https://raw.githubusercontent.com/yonggekkk/sing-box-yg/main/sb.sh)
第四步：安装与绑定
脚本菜单出现后，按以下逻辑操作：

输入 1 选择“安装/更新”。

选择协议：推荐 Hysteria2 (速度快) 或 Vless Reality (稳定)。

绑定域名验证：

是否拥有域名？输入 y。

请输入解析好的域名？输入你的完整域名（例如 vps.222382.xyz）。

脚本会自动申请 SSL 证书并完成配置。

第五步：获取链接
一切完成后，屏幕上会显示红绿色的节点信息。

找到 “复制通用链接” 那一行，复制下来，导入到 Shadowrocket 或 v2rayN。你会发现，现在的节点地址已经是你的域名了！

💡 小贴士：以后怎么管理？
任何时候想修改配置或查看状态，只需要在 SSH 里输入下面两个命令唤出菜单：

Bash

sudo -i  # 先获取 root 权限
sb       # 唤出脚本菜单
