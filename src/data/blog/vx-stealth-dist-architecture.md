---
title: 【架构】VeloX 极客分发架构：私有化部署与焦土化卸载全指南
author: Velox
pubDatetime: 2026-04-27T10:00:00+08:00
slug: velox-stealth-dist-architecture
featured: true
draft: true
tags:
  - VPS
  - 运维架构
  - Nginx
  - 安全
  - CI/CD
description: 从零构建基于 GitHub Private Repo 与 GCP Nginx 的私有化脚本分发中心，实现全自动无感热更新、防弹级隐匿与焦土化卸载，降维打击白嫖党。
---

> **架构核心**：GitHub Private Repo -> GCP Nginx Distributor -> Global Terminals
> **战术目标**：源码物理隔绝、全自动分发、防弹级隐匿。

## 🔴 零号指令：基因改造 (源码适配)

在正式部署分发中心前，必须先在我的本地或 GitHub 仓库里对 `vx.sh` 进行**物理级适配**：
1. **修改分发源**：将脚本内的 `SCRIPT_URL` 变量改为我的私有分发地址：
   `SCRIPT_URL="http://gcp02.04wen.dpdns.org:45678/stealth_8x9q2z/core.sh"`
2. **物理推送**：`git commit` 并 `push` 到我的私有仓库。
   *💡 只有改了这里，我按 `i` 键更新时，脚本才会精准回“娘家”取货，而不是去撞 GitHub 的 404 南墙。*

---

## 🟢 第一阶段：锻造核心兵符 (GitHub 设置)

**【步骤 1】获取 GitHub 永久 Token (PAT)**
1. **进入靶场**：网页登录 GitHub -> `Settings` -> `Developer settings` -> `Personal access tokens` -> `Tokens (classic)`。
2. **生成令牌**：点击 `Generate new token (classic)`。
3. **参数装配**：
   - `Note`: 填入 `VX_SYNC_ENGINE`
   - `Expiration`: 选 `No expiration` (永久有效，一劳永逸)
   - `Select scopes`: 仅勾选 `repo` (最高权限访问私有仓)
4. **物理备份**：生成后立即复制 `ghp_` 开头的密文。*(⚠️ 警告：阅后即焚，弄丢只能物理重铸！)*

---

## 🟡 第二阶段：构建防弹分发中心 (GCP 服务器操作)

**【步骤 2】一键满血装载 Nginx 引擎**
直接在终端执行以下组合拳，物理开辟防弹地堡：

```bash
# 1. 极速装载 Nginx
apt update && apt install nginx -y

# 2. 开辟隐形地堡目录
mkdir -p /var/www/stealth_8x9q2z

# 3. 物理重铸分发配置（只听 45678 奇葩端口，拒绝遍历）
cat << 'EOF' > /etc/nginx/conf.d/stealth.conf
server {
    listen 45678;
    server_name _;
    
    location /stealth_8x9q2z/ {
        alias /var/www/stealth_8x9q2z/;
        autoindex off;
    }
    
    # 瞎猜的探测流量，直接物理拔管 444
    location / {
        return 444; 
    }
}
EOF

# 4. 激活并开机自启
systemctl enable nginx && systemctl restart nginx
```

**【步骤 3】排雷：强杀 80 端口占用**
为防止后续 ACME 申请证书暴毙，必须清除 Nginx 的默认占位：

```bash
rm -f /etc/nginx/sites-enabled/default
systemctl restart nginx
```
*🕵️ **极客验尸**：敲入 `netstat -tunlp | grep :80`，没有任何输出即为绝对安全，ACME 申请将丝滑通关。*

**【步骤 4】注入幽灵同步引擎**
将 GCP 与我的 GitHub 私有仓物理打通。执行下面代码前，**记得把 `GITHUB_TOKEN` 换成我刚才申请的兵符**：

```bash
cat << 'EOF' > /root/sync_github.sh
#!/bin/bash
# === 🚨 请在此处替换我的 Token ===
GITHUB_TOKEN="我的_ghp_令牌"
# ==================================
REPO_URL="https://raw.githubusercontent.com/pwenxiang51-wq/VX-Node-Engine/main/vx.sh"
TARGET_FILE="/var/www/stealth_8x9q2z/core.sh"

# 携带兵符强行拉取
curl -s -H "Authorization: token ${GITHUB_TOKEN}" -L "${REPO_URL}" -o "${TARGET_FILE}.tmp"

# 原子级替换，防止小白下载时发生中断断层
if [ -s "${TARGET_FILE}.tmp" ]; then
    mv -f "${TARGET_FILE}.tmp" "${TARGET_FILE}"
    echo "$(date): 同步成功！" >> /var/log/vx_sync.log
else
    rm -f "${TARGET_FILE}.tmp"
    echo "$(date): 同步失败，保持防御态势！" >> /var/log/vx_sync.log
fi
EOF

# 赋予执行权限并手动点火一次，完成首次拉取
chmod +x /root/sync_github.sh
/root/sync_github.sh
```
---

极客验尸（关键）：跑完之后，立刻敲一下这行检查：
```bash
ls -lh /var/www/stealth_8x9q2z/core.sh
```
看到 `100KB+`：母舰满血复活！

**【步骤 5】挂载自动化巡逻齿轮**
让系统每 6 小时自动同步我的 GitHub 代码：

```bash
# 敲入 crontab -e 进入任务调度表，在最底部植入：
0 */6 * * * /root/sync_github.sh >/dev/null 2>&1
```
---
⚡ 极客进阶：物理级“即时更新”扳机
如果刚刚在 GitHub 修改了源码，不想等那 6 小时的定时任务，直接在 GCP 终端执行这一行，分发中心将一秒钟内完成基因重组：
```bash
/root/sync_github.sh
```
---


## 🟢 第三阶段：全网终端降维打击 (新机器装载)

**【步骤 6】终极交付指令**
我的分发弹药库已全面建成！以后在任意新节点（比如我的 RN）或小白的机器上，只需敲入这行代码即可一键满血装载引擎：

```bash
curl -sL http://your-domain.org:端口/你的地堡目录/core.sh -o /usr/local/bin/vx && chmod +x /usr/local/bin/vx && vx
```

---

## 🚨 附录：焦土化清理协议 (彻底卸载)

当我准备迁移服务器或废弃该分发中心时，严格执行以下命令，物理抹除一切痕迹：

```bash
# 1. 物理爆破暗网弹药库与同步脚本
rm -rf /var/www/stealth_8x9q2z
rm -f /root/sync_github.sh
rm -f /var/log/vx_sync.log

# 2. 拆除 Nginx 防弹装甲并重载
rm -f /etc/nginx/conf.d/stealth.conf
systemctl restart nginx

# 3. 摘除系统巡逻齿轮 (需手动执行)
# 敲入 crontab -e，删掉带有 sync_github.sh 的那一行，保存退出。

# 4. [核武级选项] 连 Nginx 本体一起物理拔管 (⚠️ 警告：仅在我不需要任何 Web 服务时执行)
apt purge nginx nginx-common nginx-core -y && apt autoremove -y
```
---
🚁 进阶：分发中心一键搬家（跃迁协议）
当你的母舰（分发服务器）需要更换或迁移时，利用 Velox 面板的 27 号星际舰队功能，可以实现物理级克隆。

第一步：母舰资产提取（旧服务器）
运行 Velox 面板，进入 `26` -> `1` (全域资产打包)。
当系统提示输入自定义路径时，必须手动注入以下地堡路径：
```bash
/var/www/stealth_8x9q2z /etc/nginx/conf.d/stealth.conf
```
💡 架构师注：同步脚本和 Cron 任务已包含在默认打包列表里，无需重复输入。
---
第二步：新机基因夺舍（新服务器）
将生成的 `Velox_Assets_Backup.tar.gz` 传到新机器的 `/root` 目录后，依次执行以下物理指令：

1. 预装 Web 引擎并清除 80 端口冲突：
```bash
apt update && apt install nginx -y && rm -f /etc/nginx/sites-enabled/default
```
2. 执行物理级覆盖恢复：
```bash
cd / && tar -xzpf /root/Velox_Assets_Backup.tar.gz && crontab /root/crontab_backup.txt 2>/dev/null
```
3. 激活引擎并点火同步：
```bash
systemctl enable nginx && systemctl restart nginx && /root/sync_github.sh
```
---
🛡️ 架构师避坑提醒：

1.域名指回：搬家完成后，新服务器 IP 已变。请立即前往 Cloudflare 或你的 DNS 服务商，将分发域名（如 `gcp02...`）解析到新服务器的 IP。

2.零感迁移：域名解析生效后，发给小白或 RN 小鸡的部署指令完全不需要改动，它们会自动从新母舰取货，这就是域名分发的魅力！

