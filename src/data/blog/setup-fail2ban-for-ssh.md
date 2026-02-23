---
title: 配置 Fail2Ban 防止 SSH 暴力破解
pubDatetime: 2025-11-21T15:25:00.000+08:00
description: "改了端口还不够，再加上 Fail2Ban 这个自动封禁 IP 的保安，让你的 VPS 固若金汤。"
tags:
  - VPS
  - Security
  - Linux
---

VPS 裸奔在公网上，每天都会有无数个脚本尝试暴力破解你的 SSH 密码。如果你已经修改了 SSH 默认端口（比如改为 56789），虽然能躲过大部分扫描，但加上 Fail2Ban 才是双重保险。

Fail2Ban 的原理很简单：监控日志 -> 发现有人多次输错密码 -> 自动推算 IP 关进小黑屋。

### 环境说明

* 系统：Debian 11 / Ubuntu 20.04+
* SSH 端口：`56789` (请根据你实际修改的端口调整)

### 第一步：更新源并安装 Fail2Ban

首先更新系统软件包列表，然后直接安装：

    apt update && apt install fail2ban -y

### 第二步：配置防护规则 (重点)

Fail2Ban 默认只监控 22 端口，因为我们改了端口（比如 56789），所以必须新建一个配置文件来告诉它监控哪里。

**直接复制下面整段代码**，粘贴到 SSH 终端并回车（这段命令会自动生成配置文件）：

    cat > /etc/fail2ban/jail.local <<EOF
    [sshd]
    enabled = true
    port = 56789
    filter = sshd
    logpath = /var/log/auth.log
    maxretry = 5
    bantime = 3600
    findtime = 600
    EOF

*⚠️ 注意：如果你的 SSH 端口不是 56789，请务必修改上面代码块中的 `port = 56789` 这一行。*

**参数解释：**
* `maxretry = 5`: 允许输错 5 次密码。
* `findtime = 600`: 在 10 分钟（600秒）内输错 5 次就触发封禁。
* `bantime = 3600`: 封禁时间为 1 小时（3600秒）。

### 第三步：启动并设置开机自启

配置写好后，重启服务即可生效，并设置为开机自动运行：

    systemctl restart fail2ban && systemctl enable fail2ban

### 第四步：验证是否有效

你可以使用以下命令查看 SSH 防护模块的状态：

    fail2ban-client status sshd

如果运行正常，你会看到类似下图的输出：

![Fail2Ban 运行状态](/assets/three.png)

*(如图所示，Status 为 "active" 说明防护罩已经打开了。因为我们使用了高位端口，所以目前暂时没有笨蛋脚本撞上来，Banned IP 列表是空的。)*

---

### 附：Fail2Ban 常用维护命令

**1. 解封某个 IP (比如不小心把自己封了)：**

    # 将 1.2.3.4 替换成你实际要解封的 IP
    fail2ban-client set sshd unbanip 1.2.3.4

**2. 查看 Fail2Ban 运行日志 (排错用)：**

    tail -f /var/log/fail2ban.log



---

> **💡 提示：** > 本文首发于我的个人博客 **[Velo.x 的极客空间](https://222382.xyz)**。我在那里存放了更完整的 **[赛博写作流完全体：用 TG 机器人和 Cloudflare Workers 重构我的 Astro 博客系列教程](https://222382.xyz/posts/serverless-astro-tg-workflow/)**，排版更精美，更新也更及时，欢迎来踩踩！🚀

---
