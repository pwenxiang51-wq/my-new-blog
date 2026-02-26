---
title: "[优化] Debian 11 开启 BBR：压榨 VPS 的每一滴网络性能"
pubDatetime: 2025-11-22T15:51:00.000+08:00
description: "Debian 11 内核已自带 BBR，只需两行命令开启，即可在复杂的网络环境中显著提升传输速度和抗丢包能力。"
tags:
  - VPS
  - Optimization
  - Linux
  - Debian
---

VPS 到手后的第一件事，除了安全防护，就是开启 BBR。在复杂的国际网络环境中，开启 BBR 和不开启 BBR，速度体验简直是天壤之别。

Debian 11 的内核（5.10+）已经默认内置了 BBR 模块，我们只需要简单的几行命令就能“唤醒”它。

### 第一步：检查现有状态

在开启之前，我们可以先看看当前的 TCP 拥塞控制算法是什么：

    sysctl net.ipv4.tcp_congestion_control

如果输出的是 `cubic` 或 `reno`，说明你还在用老式的算法，不仅慢，还容易丢包。

### 第二步：一键开启 BBR

直接复制下面这两行指令，粘贴到 SSH 中运行：

    echo "net.core.default_qdisc=fq" >> /etc/sysctl.conf
    echo "net.ipv4.tcp_congestion_control=bbr" >> /etc/sysctl.conf

然后，让配置立即生效：

    sysctl -p

### 第三步：验证是否成功

再次查询算法状态：

    sysctl net.ipv4.tcp_congestion_control

如果这次输出的是 `bbr`，恭喜你，你的 VPS 网络性能已经解锁了“物理外挂”。

![BBR 开启成功](/assets/four.png)

---
🛠️ 如何彻底关闭 BBR
在你的终端（黑框）里按顺序执行以下指令：

修改系统内核参数：
将拥塞控制算法改回 Linux 默认的 cubic。

```Bash
sudo sysctl -w net.ipv4.tcp_congestion_control=cubic
```
从配置文件中移除 BBR：
你需要删掉 /etc/sysctl.conf 里的 BBR 开启指令，否则重启后它又会自动开启。

```Bash
sudo sed -i '/net.core.default_qdisc=fq/d' /etc/sysctl.conf
sudo sed -i '/net.ipv4.tcp_congestion_control=bbr/d' /etc/sysctl.conf
```
刷新配置生效：

```Bash
sudo sysctl -p
```
### 进阶：为什么要用 BBR？

传统的 TCP 拥塞控制（像 Cubic）一遇到丢包就误以为网络堵了，立马把速度降下来。而 BBR 是基于“模型预测”的，它不管丢包，只看带宽和延迟，能极大地利用带宽，非常适合高延迟、易丢包的国际线路。



---

> **💡 提示：** > 本文首发于我的个人博客 **[Velo.x 的极客空间](https://222382.xyz)**。我在那里存放了更完整的 **[VPS 榨干计划：零成本搭建 Docker 镜像加速器 + KMS 激活服务 运维系列教程](https://222382.xyz/posts/vps-docker-kms-guide/)**，排版更精美，更新也更及时，欢迎来踩踩！🚀

---
