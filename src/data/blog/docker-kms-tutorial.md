---
title: 【实战】VPS 榨干计划：零成本搭建 Docker 镜像加速器 + KMS 激活服务
author: Velox
pubDatetime: 2026-02-04T16:30:00+08:00
slug: vps-docker-kms-guide
featured: true
draft: false
tags:
  - VPS
  - Docker
  - Cloudflare
  - KMS
  - 实战
description: 手把手教你利用 Cloudflare Workers 搭建私有 Docker 镜像加速器，解决拉取慢的问题；同时在 VPS 上部署 KMS 服务，实现 Windows/Office 一键激活。
---
手里有闲置的 VPS（如 RackNerd、GCP）和 Cloudflare 账号，不仅仅可以用来挂探针，还能部署一些极其实用的“基础设施”。

今天这篇教程，我们将搭建两个神级工具，既能解决国内或廉价 VPS 拉取镜像慢的问题，又能让你拥有自己的正版 Windows/Office 激活服务。哪怕你以后换了 VPS，这套服务也能轻松带走。

---

## 🚀 项目一：Cloudflare 专属 Docker 镜像加速器

### 1. 为什么要搞这个？
* **解决龟速下载**：很多国外廉价 VPS 线路一般，直接从 Docker Hub 拉取镜像速度像蜗牛。
* **避开官方限流**：Docker Hub 对匿名用户有每 6 小时 100 次拉取的限制，折腾猛了容易报错 `toomanyrequests`。
* **完全免费**：利用 Cloudflare Workers 的边缘网络加速，不消耗自己 VPS 的流量。

### 2. 部署步骤 (Cloudflare 端)

我们不需要服务器，直接用 Cloudflare Workers 即可。

1.  登录 [Cloudflare Dashboard](https://dash.cloudflare.com/)。
2.  点击左侧 **Workers & Pages** -> **Create Application** -> **Create Worker**。
3.  名字随便取（比如 `docker-proxy`），点击 **Deploy**。
4.  进入编辑页面，点击 **Edit code**，清空原有代码，粘贴以下代码：

```javascript
import { connect } from 'cloudflare:sockets';

// ⚠️这里配置你的专属域名
const routes = {
  // 把下面的 docker.222382.xyz 换成你自己的域名
  "docker.222382.xyz": "[https://registry-1.docker.io](https://registry-1.docker.io)",
};

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const upstream = routes[url.hostname];
    
    if (!upstream) {
       return new Response(JSON.stringify({
         routes: routes,
         msg: "Docker Proxy is working! Please use the correct domain." 
       }), { status: 404 });
    }

    const newUrl = new URL(upstream + url.pathname + url.search);
    const newReq = new Request(newUrl, {
      method: request.method,
      headers: request.headers,
      body: request.body,
      redirect: "follow",
    });
    
    return fetch(newReq);
  },
};
```

5.  **绑定域名**：保存代码后，去 **Settings** -> **Triggers** -> **Add Custom Domain**，绑定你的域名（例如 `docker.222382.xyz`）。

### 3. 使用步骤 (VPS 端)

SSH 连接到你的 VPS，执行以下命令，让 Docker 自动走这个加速通道：

```bash
# 创建配置文件夹
mkdir -p /etc/docker

# 写入配置 (把里面的网址换成你刚才绑定的域名)
tee /etc/docker/daemon.json <<-'EOF'
{
  "registry-mirrors": ["[https://docker.222382.xyz](https://docker.222382.xyz)"]
}
EOF

# 重启 Docker 生效
systemctl daemon-reload
systemctl restart docker
```

**验证成功：** 输入 `docker info`，在输出的一大堆信息里找到 `Registry Mirrors`，如果下面显示了你的域名，就是成功了！从此拉镜像速度起飞。

---

## 🔑 项目二：私有 KMS 激活服务 (Windows/Office)

### 1. 它是干什么的？
以后你（或者朋友同事）重装了系统，**再也不用去网上下载那些可能带病毒的“激活工具”了**。只需要一行命令连上你自己的服务器，瞬间激活正版状态。

### 2. 部署步骤

这个服务需要跑在 VPS 上，占用极低（几乎不占内存）。

**第一步：在 VPS 上运行服务**
复制下面这行命令执行：

```bash
docker run -d -p 1688:1688 --restart=always --name kms mikolatero/vlmcsd
```
* `-p 1688:1688`：开放 1688 端口（微软激活专用）。
* `--restart=always`：VPS 重启后它也会自动启动。

**第二步：配置域名解析 (重要!)**
1.  去 Cloudflare -> **DNS**。
2.  添加 A 记录：Name 填 `kms`，Content 填你 VPS 的 IP。
3.  **⚠️注意：Proxy status 必须是灰色 (DNS Only)**，不能开启 CDN，因为激活走的是 TCP 协议。

### 3. 如何使用？

找一台没激活的 Windows（支持 VL 版本），管理员身份打开 CMD，输入：

```cmd
:: 设置服务器
slmgr /skms kms.222382.xyz
:: 激活
slmgr /ato
```

如果弹出“成功地激活了产品”，恭喜你，搭建成功！

---

## 🧐 常用指令教学：如何检查服务状态？

很多小白部署完不知道成没成功，这里教大家一个最重要的 Docker 指令：`docker ps`。

在 SSH 里输入：

```bash
docker ps
```

你会看到类似下面的一张表，每一列都很重要：

| 列名 | 含义 | 应该看到什么？ |
| :--- | :--- | :--- |
| **CONTAINER ID** | 容器的身份证号 | 一串随机字符 |
| **IMAGE** | 运行的是哪个软件 | `mikolatero/vlmcsd` |
| **STATUS** | 运行状态 (**最重要**) | 必须显示 `Up x hours` (已运行x小时)。如果没显示，或者列表是空的，说明服务挂了。 |
| **PORTS** | 端口映射 | `0.0.0.0:1688->1688/tcp` (说明端口通了) |

**总结：** 只要 `docker ps` 能看到你的 `kms` 容器，并且状态是 `Up`，就说明你的服务正在稳稳地运行中！

---

## 📦 进阶教程：迁移与卸载

VPS 到期了要换机器？或者不想用了想删掉？看这里。

### 1. VPS 到期了，怎么迁移到新机器？

**对于 Docker 加速器：**
* **不需要迁移服务端**！因为加速器是跑在 Cloudflare 上的，永远不会过期。
* 你只需要在**新买的 VPS** 上，重新执行一遍上面 **“项目一 -> 3. 使用步骤”** 里的那几行命令，新 VPS 就能立刻享受加速。

**对于 KMS 激活服务：**
1.  **在新 VPS 上**：安装好 Docker，然后重新执行一遍 `docker run` 那行命令。
2.  **在 Cloudflare 上**：修改 DNS 记录，把 `kms` 域名的 IP 地址改成**新 VPS 的 IP**。
3.  **搞定**！你的激活服务无缝切换，Windows 客户端那边完全无感知，不需要做任何修改。

### 2. 我不想用了，怎么彻底删除？

如果你想把这些服务从你的 VPS 上彻底清理干净，不留一点痕迹：

**删除 Docker 加速器配置：**
```bash
# 删除配置文件
rm /etc/docker/daemon.json

# 重启 Docker
systemctl restart docker
```

**删除 KMS 激活服务：**
```bash
# 1. 强制停止并删除容器
docker rm -f kms

# 2. 删除下载的镜像文件 (清理掉残留的垃圾文件)
docker rmi mikolatero/vlmcsd
```

执行完这些，你的 VPS 就恢复到了最初的一尘不染的状态。
