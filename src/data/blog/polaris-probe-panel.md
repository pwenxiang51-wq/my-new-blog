---
title: ✨[实战] 打造 Polaris 探针Web面板
author: Velox
pubDatetime: 2026-10-31T20:00:00+08:00
slug: polaris-probe-panel
featured: true
draft: false
tags:
  - VPS
  - Polaris
  - Docker
  - Cloudflare
  - Telegram
description: 用 Go 标准库做的私有 VPS 监控台，单管理员、探针上报、只走 Cloudflare Tunnel。本文先写装前必须拿到的两个东西，再写安装、脚本改动后的拉取、卸载。
---

> 一句话：用 Go 标准库做的私有 VPS 监控台，单管理员、探针上报，不对外开面板端口。

- 仓库：[https://github.com/pwenxiang51-wq/Polaris](https://github.com/pwenxiang51-wq/Polaris)
- 协议：AGPL-3.0
- 作者：Velox

![登录页](https://pub-65eb3861e8d64d24a3280e55bd221735.r2.dev/blog-img-1793466402708.jpg)

---

## 为什么要自己写一个 🧭

市面上监控方案很多：**Prometheus** + **Grafana** 全家桶、各种 **SaaS** 探针、宝塔类面板……对「就几台小鸡、自己用」来说，往往偏重：

- 依赖一堆组件（数据库、`Exporter`、前端构建链）
- 暴露面大，权限模型偏多租户
- **UI** 好看，但安全默认值不一定适合「代码公开、实例私有」

我想要的很简单：

1. **自己看自己的机器**（**CPU** / **内存** / **磁盘** / **负载** / **流量** / **TCP** 探测）
2. **`Agent` 不 `SSH`、不 `root` 也能报**
3. **面板只走 `Cloudflare Tunnel` + `Turnstile`**
4. 二进制嵌入 **UI**，部署像丢一个盒子

于是有了 **Polaris（北极星）**。

---

## 它现在能做什么 🛰️

### 探针侧（`polaris-agent`）

- 每 **15 秒** 向面板上报一次，面板前端每 `10` 秒刷新
- 读 **`/proc`**、**`statfs`**、网卡计数，不依赖额外守护进程
- 公网 **IP** 优先从本机接口地址识别，必要时再走受控回退，**IP** 变了才重新查地理，平时不反复去问第三方
- **不调用** **`ipify`** / **`ipwho.is`**（地理信息统一由面板查，避免探针出网噪音）
- 可选 **TCP** 探测目标（延迟 / 丢包可视化），这台 **VPS** 机子探的是电信、联通、移动三条到国内的线路

### 面板侧（`polaris`）

- 登录：账号 + 密码（**`PBKDF2-SHA256`**）+ **`Cloudflare Turnstile`**
- 节点卡：在线状态、资源条、速率、`24h` 曲线采样
- 地理信息：国家 / 地区 / 城市 / **`ISP`** / **`ASN`**，失败可重试与退避
- 只走 Cloudflare Tunnel + Turnstile：登录要密码加人机验证，面板端口不对宿主机发布，8080 只在 Compose 内网给隧道用。
- 管理元数据：到期日、价格、月流量 / 累计额度、计入模式（入站+出站 / 仅出站）
- 通知：**走 `Telegram`**，离线超过 `5` 分钟发、恢复也发，月额度 **`80%` / `90%` / `100%`**、到期前 **`7` / `3` / `1`** 天发，**`Telegram`** 提醒是英文、标题在前
- 界面是中文，深色底 **`#0b0f0d`**、面板 **`#121915`**、点缀 **`#b4ff71`**

---

![UI 展示页](https://pub-65eb3861e8d64d24a3280e55bd221735.r2.dev/blog-img-1793521231105.jpg)

<div style="display:flex;gap:12px;">
<img src="https://pub-65eb3861e8d64d24a3280e55bd221735.r2.dev/blog-img-1793467451843.jpg" alt="手机总览" style="width:50%;">
<img src="https://pub-65eb3861e8d64d24a3280e55bd221735.r2.dev/blog-img-1793467497323.jpg" alt="手机节点详情" style="width:50%;">
</div>

> UI 展示页是节点总览，上面一张是PC局部浏览图，下面两张是手机上的样子：左边是手机总览，右边是点进单个节点后的手机节点详情，CPU、内存、下行、上行、VPS 详情、三网 TCP 建连延迟都在里面.

## 手机：加到主屏幕 📱

浏览器加到主屏幕就是一个独立的 Web 应用，打开没有地址栏，跟 App 差不多。

- iOS：用 Safari 打开面板，点分享 → 添加到主屏幕，桌面上就是 Polaris 星标图标，点开直接进面板。
- Android：用 Chrome 打开面板，点菜单 → 添加到主屏幕 / 安装应用，同样是独立图标、独立窗口。

> 注意两点：加到主屏幕后打开还是要登录，人机验证一样要过；如果以后图标、启动图换了，iOS 那边删了重加一次才生效，只改服务器是刷不掉旧图标的。隧道加载要几秒，打开先是深色底，那是在加载数据，不是死了。

---

## 架构一览 🏗️

```text
┌─────────────┐      HTTPS 上报 / 15s      ┌──────────────────┐
│ polaris-agent│ ─────────────────────────► │  polaris (Go)    │
│  (无特权)    │  POST /api/v1/report       │  嵌入式 Web UI   │
└─────────────┘  Token 哈希校验            │  store / session │
                                           │  数据卷: /data   │
                                           │  nodes · history │
                                           └────────┬─────────┘
                                                    │
                    ┌───────────────────────────────┼──────────────┐
                    │ 仅 Compose 内网               │ 通知         │
                    ▼                               ▼
           ┌────────────────┐              ┌──────────────┐
           │  cloudflared   │              │  Telegram    │
           │  (CF Tunnel)   │              └──────────────┘
           └────────┬───────┘
                    ▲ HTTPS
                    │
           用户浏览器 / Turnstile
```

设计原则可以概括成三句：

1. **标准库优先**：**`HTTP`**、模板、嵌入、压缩，尽量少拉第三方。
2. **探针可信边界清晰**：**`Token`** 只存哈希；原始 **`Token`** 创建时看一次，丢了就重建节点。
3. **公网只暴露隧道入口**：面板端口不对宿主机发布。

---

## 一、装前：先拿到两个东西

后面 `setup-secrets.sh` 问的密钥、Token，全是从下面这两处来的，**先建好再装，不要边装边找**。

### 1. 建 Tunnel，拿隧道 Token

1. 进 Cloudflare 控制台， **Networks → Tunnels → Create a tunnel**，选 `Remotely managed`。
2. 给隧道起个名字，创建后会给一段隧道 `Token`，**先复制保存好**，后面 `setup` 会问。
3. 在隧道里加一条 `Public Hostname：子域名填面板域名，Service 选 HTTP`，URL 填 `http://polaris:8080`。
4. `DNS` 那条记录 Cloudflare 会自己处理，不用手动再加。

### 2. 建 Turnstile，拿 Site Key 和 Secret Key

1. 进 `Cloudflare` 控制台，**Application Security → Turnstile → Add widget**。
2. 域名填面板域名，模式用默认的 `Managed` 就行。
3. 创建后会给 `Site Key` 和 `Secret Key`，**两个都要保存好**。
4. 后面 `setup` 问 **Turnstile Secret** 时填两遍，填完回显头 4 位、尾 4 位、总长度，全文不显示。

---

## 二、安装 🚀

### 1. 初始化密钥

```bash
cd /opt
git clone https://github.com/pwenxiang51-wq/Polaris
cd /opt/Polaris
bash ./scripts/setup-secrets.sh
```

**按提示填：面板域名、管理员账号、管理员密码、Turnstile Site Key、Turnstile Secret key、Telegram Token（可选）、Telegram Chat ID、Cloudflare Tunnels Token**。

- **密码至少 `14` 位，两次一样就过。** 只卡长度，不卡复杂度，`14` 个 **`1`** 能过，复杂到 **`UUID`** 那种也能过，想简单就简单设，想复杂就复杂设。
- **Turnstile Secret、隧道 Token 都填两遍，填完回显头 4 位、尾 4 位、总长度，全文不显示**。
- **Telegram Token 填完回显长度，Chat ID 只能填数字**。
- **密钥目录 700，文件 440，Telegram 文件属组脚本直接写成面板进程的 10001，不用手动改**。

### 2. 启动

```bash
docker compose up -d --build
```

```bash
docker compose ps
```

> polaris-polaris-1 应为 Up (healthy)，polaris-cloudflared-1 为 Up。重编镜像必须带 `--build`，只用 `--force-recreate` 是只重建容器、不重编镜像。

### 3. 下载 Go，版本跟面板用的 1.27 对得上就行

> 下面第 3 步和第 4 步，面板机和新加的 VPS 都要做。面板机做完第 1 步和第 2 步，再做第 3 步和第 4 步。新加的 VPS 不做第 1 步和第 2 步，直接做第 3 步和第 4 步，不跑 `setup-secrets.sh`，不用 `docker compose`。新加 VPS 之前，先在面板上添加这台 VPS，把整段探针配置复制下来，再去这台 VPS 上做第 3 步和第 4 步。每个 VPS 用自己的 Token，别拿已建好那台 VPS 的 Token 去复用。

```bash
wget https://go.dev/dl/go1.27.3.linux-amd64.tar.gz -O /tmp/go.tgz
```

ARM 机子把 `linux-amd64` 换成 `linux-arm64`。

### 4. 装探针

探针在主机上编，面板在 Docker 里编，探针运行只需要编出来的几 MB 文件。

1. 先把主机上旧 Go 删干净再解压：

```bash
rm -rf /usr/local/go
tar -C /usr/local -xzf /tmp/go.tgz
export PATH=$PATH:/usr/local/go/bin
```

2. 进仓库目录。面板机第 1 步已经克隆过了，直接进目录就行。新加的 VPS 还没有仓库，先克隆，再进目录：

面板机：

```bash
cd /opt/Polaris
```

新加的 VPS：

```bash
cd /opt
git clone https://github.com/pwenxiang51-wq/Polaris
cd /opt/Polaris
```

安装命令必须在 `/opt/Polaris` 这个目录里跑，当前目录里必须同时有 `polaris-agent` 和 `scripts/install-agent.sh`，在 `/root` 里直接跑会报找不到文件。

3. **编探针，一次粘贴整句，不要在 `-o` 后面断行**：

```bash
CGO_ENABLED=0 go build -trimpath -ldflags='-s -w' -o polaris-agent ./cmd/polaris-agent
```

```bash
ls -lh polaris-agent
```

4. 编出来看到几 MB 的文件才算编成，别的架构大小会不一样，不用死卡 5.2M。然后装探针：

```bash
sudo bash ./scripts/install-agent.sh
```

5. 第一次会停下，让你改环境文件：

```bash
sudoedit /etc/polaris-agent.env
```

6. 把面板上复制的整段探针配置原样粘贴进去，**`服务器地址`**、**`节点 ID`**、**`节点名`**、**`Token`** 全替换，不要只换 **`Token`** 一行。保存退出，再执行一次：

```bash
sudo bash ./scripts/install-agent.sh
```

**第二次跑之前脚本会查占位词和 Token 长度（面板 Token 是 43 位，合理范围 40-256 位），有占位词就直接停下，不启动；没占位词就启动，看到 active (running)，面板 50 秒内在线**。

> 登录面板，面板在线就说明装好了,可以点看板的小铅笔填写 `VPS 详情与套餐信息`。

> 如果不想在新加的 VPS 上装 Go，也可以把编好的探针文件直接拷过去，但光拷探针文件不够，还要把仓库克隆过来、把探针文件放到 `/opt/Polaris` 目录里，再进这个目录跑 `install-agent.sh`，效果一样，新加的 VPS 上就不用装 Go 了。

---

## 三、拉取

**仓库脚本、前端改了，不用重装，先拉后编，拉取单独跑一遍**：

```bash
cd /opt/Polaris
git pull origin main
docker compose up -d --build
docker compose ps
```

拉取不会动已建好的密钥文件。编完新镜像、容器起来，改动就生效。

> 语言切换那类前端改动：切完语言按钮，验证框不会立刻变，按 `F5` 刷新一次，重新生成的验证框才会跟新语言一致。

---

## 四、卸载 🧹

> 面板机卸载：面板、探针、验收三块都做。
>
> 新加的 VPS 卸载：只做探针那块，面板那块和 docker 验收不用做，新机子上没有面板容器，docker 那三句查了也是空的。

**面板**：

```bash
cd /opt/Polaris
docker compose down -v
cd /
rm -rf /opt/Polaris
docker rmi polaris:local cloudflare/cloudflared:latest golang:1.27-alpine
docker builder prune -f
```

**探针**：

```bash
systemctl stop polaris-agent
systemctl disable polaris-agent
rm /etc/systemd/system/polaris-agent.service
systemctl daemon-reload
rm /usr/local/bin/polaris-agent
rm /etc/polaris-agent.env
userdel polaris-agent
rm -rf /usr/local/go
rm -rf /opt/Polaris
rm -f /tmp/go.tgz
```

**go清理缓存**：

```bash
go clean -cache -modcache
```
> Go 编译缓存 `/root/go` 第一次编完很小，多次重编才会攒起来，平时稳定运行不涨，盘紧或者攒到 1、2G 再用这条指令平时不用清。

**验收**：

```bash
docker system df
docker ps -a
docker volume ls
```

全是 `0` 才算干净。

> 卸了探针，面板上那台 VPS 不会自动消失，只会变离线，要彻底删还得在面板上把那台 VPS 的条目也删了。

---

## 写在最后 🌟

装好之后日常就很简单：打开面板，看一眼节点在不在线、CPU、内存、流量、到期、三网延迟，有离线、额度、到期提醒 `Telegram` 会直接发过来，不用经常 `SSH` 上去查。

Polaris 从一开始就不是给多人、多租户做的，就是给自己几台小鸡用的：私有、轻量、自己编译、自己部署，代码可以公开，实例必须私有。够用，就不往上加东西了。

---

> 本文首发于 [Velox 的极客空间](https://222382.xyz)。
