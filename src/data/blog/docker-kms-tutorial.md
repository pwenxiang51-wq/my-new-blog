---
title: 【实战】VPS 榨干计划：零成本搭建 Docker 镜像加速器 + KMS 激活服务（保姆级教程）
author: Velox
pubDatetime: 2026-02-03T16:45:00+08:00
slug: vps-docker-kms-guide
featured: true
draft: false
tags:
  - VPS
  - Docker
  - Cloudflare
  - KMS
  - 实战
description: 手把手教你利用 Cloudflare Workers 搭建私有 Docker 镜像加速器，解决拉取慢的问题；同时在 VPS 上部署 KMS 服务，实现 Windows/Office 一键激活。包含新手必看的 Docker 常用指令（下载、查看、删除）。
---

手里有闲置的 VPS（如 RackNerd、GCP）和 Cloudflare 账号，不仅仅可以用来挂探针，还能部署一些极其实用的“基础设施”。

今天这篇教程，我们将搭建两个神级工具，既能解决国内或廉价 VPS 拉取镜像慢的问题，又能让你拥有自己的正版 Windows/Office 激活服务。哪怕你以后换了 VPS，这套服务也能轻松带走。

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
  // 把下面的 docker.111111.xyz 换成你自己的域名
  "docker.111111.xyz": "[https://registry-1.docker.io](https://registry-1.docker.io)",
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

5.  **绑定域名**：保存代码后，去 **Settings** -> **Triggers** -> **Add Custom Domain**，绑定你的域名（例如 `docker.111111.xyz`）。

### 3. 使用步骤 (VPS 端)

SSH 连接到你的 VPS，执行以下命令，让 Docker 自动走这个加速通道：

```bash
# 创建配置文件夹
mkdir -p /etc/docker

# 写入配置 (把里面的网址换成你刚才绑定的域名)
tee /etc/docker/daemon.json <<-'EOF'
{
  "registry-mirrors": ["[https://docker.111111.xyz](https://docker.111111.xyz)"]
}
EOF

# 重启 Docker 生效
systemctl daemon-reload
systemctl restart docker
```

---

## 🛠️ 新手必看：如何验证、查看与清理？(实操演练)

很多小伙伴配置完了不知道生效没，也不敢乱下东西怕占内存。这里教你一套完整的操作闭环。

### 1. 验证加速效果 (下载测试)
我们在 VPS 上下载一个 Nginx 试试。注意：因为我们配置了加速器，你不需要输你的域名，直接输软件名，系统会自动加速！

```bash
docker pull nginx
```
**现象：** 如果你看到下载速度飞快，没有卡顿，说明加速成功。

### 2. 东西下到哪里了？(查看镜像)
下载下来的软件叫“镜像 (Image)”，它存在硬盘里，**不占运行内存**。
输入下面指令查看你下载了哪些东西：

```bash
docker images
```
你会看到一个列表：
* **REPOSITORY**: 软件名 (nginx)
* **TAG**: 版本 (latest)
* **SIZE**: 占用硬盘大小 (约 180MB)

### 3. 我不想要了，怎么删？(清理空间)
如果只是为了测试，或者以后不用这个软件了，留着会占硬盘空间。用这个指令删除：

```bash
# 删除 nginx 镜像
docker rmi nginx
```
*(注：`rmi` 意思是 Remove Image)*。再次输入 `docker images`，你会发现它消失了，硬盘空间回来了。

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

**第二步：配置域名解析 (重要!)**
1.  去 Cloudflare -> **DNS**。
2.  添加 A 记录：Name 填 `kms`，Content 填你 VPS 的 IP。
3.  **⚠️注意：Proxy status 必须是灰色 (DNS Only)**，不能开启 CDN，因为激活走的是 TCP 协议。

### 3. 如何使用？

找一台没激活的 Windows（支持 VL 版本），管理员身份打开 CMD，输入：

```cmd
:: 设置服务器
slmgr /skms kms.111111.xyz
:: 激活
slmgr /ato
```

如果弹出“成功地激活了产品”，恭喜你，搭建成功！

---

## 🧐 进阶指令：如何检查正在运行的服务？

刚才讲了 `docker images` 是看硬盘里躺着的“安装包”。
那怎么看哪些软件**正在运行**（占内存）呢？

输入：
```bash
docker ps
```

| 列名 | 含义 | 状态 |
| :--- | :--- | :--- |
| **IMAGE** | 运行的是哪个软件 | `mikolatero/vlmcsd` |
| **STATUS** | 运行状态 | 必须显示 `Up`，说明活着 |
| **PORTS** | 端口 | `1688`，说明路通了 |

**总结：**
* **`docker images`**：看家里买了哪些家具（看硬盘）。
* **`docker ps`**：看家里哪些电器插着电在工作（看内存/运行）。
* **`docker rmi`**：把不用的家具扔出去（清理硬盘）。

---

## 📦 迁移与卸载

VPS 到期了要换机器？或者不想用了想删掉？

### 1. VPS 到期了，怎么迁移到新机器？

**对于 Docker 加速器：**
* **不需要迁移服务端**！Cloudflare 端不用动。
* 只需要在**新 VPS** 上，重新执行一遍上面 **“项目一 -> 3. 使用步骤”** 里的那几行命令即可。

**对于 KMS 激活服务：**
1.  **在新 VPS 上**：重新执行一遍 `docker run ...` 那行命令。
2.  **在 Cloudflare 上**：修改 DNS 记录，把 IP 改成新 VPS 的 IP。

### 2. 我不想用了，怎么彻底删除？

**删除 Docker 加速器配置：**
```bash
rm /etc/docker/daemon.json
systemctl restart docker
```

**删除 KMS 激活服务：**
```bash
# 1. 停止并删除运行的容器
docker rm -f kms

# 2. 删除下载的镜像文件 (清理垃圾)
docker rmi mikolatero/vlmcsd
```



> **💡 提示：** > 本文首发于我的个人博客 **[Velo.x 的极客空间](https://222382.xyz)**。我在那里存放了更完整的 **[velox AI v7.0 终极版：自带“中译英”大脑，彻底解决 SDXL 绘图听不懂中文的痛点！ 运维系列教程](https://222382.xyz/posts/ultimate-velox-ai-v7/)**，排版更精美，更新也更及时，欢迎来踩踩！🚀

