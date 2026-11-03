---
title: 🚀[实战] HyperOS 2.0 / 3.0 终极脱敏：免 Root 物理封杀小米内置反诈与遥测
author: Velox
pubDatetime: 2026-10-20T18:00:00+08:00
slug: hyperos-telemetry-kill-switch
featured: true
draft: false
tags:
  - 极客防御
  - 脱敏
  - HyperOS
  - ADB实战
description: 针对 MTK 平台设备（如 Redmi K50）防刷机变砖的防弹装甲级优化。无需 Root，全面兼容 HyperOS 2.0 / 3.0，利用 ADB 绕过 HyperOS 底层白名单，物理卸载系统级安全守护与遥测组件。
---

> ⚠️ **极客免责声明**：本方案仅为个人实战记录与网络架构防侧漏技术探讨。系统级“脱敏”存在一定未知风险（如导致依赖该组件的部分系统自带功能闪退）。操作不当导致的数据丢失、系统死机或变砖，本人概不负责。动手前请确保你清楚自己在敲什么代码！

在当前的环境下，各大国产定制 UI 都内置了极深的“安全中心”与“行为分析”探针。当我们使用 NekoBox 等工具进行科学代理时，如果系统底层依然在默默上报我们的应用列表、安装特征码和系统埋点，代理做得再好也是掩耳盗铃。

本文交付一套**免 Root、免解 BL 锁**的实战方案：通过 UI 物理断网 + NekoBox 路由黑洞 + Windows ADB 底层指令，绕过 HyperOS 2.0 的硬编码拦截，对系统内鬼组件进行彻底的**脱敏**。

---

## 🎯 方案边界与疗效说明

在动手前，先确认以下几个核心边界条件：

1. **适用机型**：理论兼容所有运行 MIUI 14 / HyperOS 2.0 及最新 HyperOS 3.0 的小米与 Redmi 全系机型。本文之所以特别强调 **MTK（联发科）平台（如 Redmi K50）**，是因为联发科机型刷机变砖后极难自救（通常需售后 9008 深度授权），所以这套“不刷机”的方案对其最具实战保命价值。高通骁龙机型同样完全适用。
2. **OTA 系统更新的影响**：**系统 OTA 升级（特别是跨大版本更新）极大概率会把这些被卸载的系统组件“复活”**。每次系统更新完，请重新拿数据线或连上无线调试，把本文的 ADB 拔管指令再跑一次。
3. **实际效果**：本方案能显著降低小米后台主动上报与特征扫描，但并非 100% 绝对隔离（系统可能缓存数据、存在极少数硬编码通道）。结合高质量代理节点使用时效果最佳。

---

## 第一阶段：掐断前端 UI 级别的上报闸门

在动用终端命令行之前，必须先把系统表面能关的门窗全部锁死。

### 1. 关闭“手机管家”核心探针
进入系统自带的 **「手机管家」** → 右上角设置 → **「病毒扫描」**，彻底关闭以下选项：
- **使用云端杀毒**
- **安装监控**
- **自动更新引擎**
- **检测 WLAN 安全 / 检测 ROOT 安全**

### 2. 关闭“安全守护”与“应用安全验证”
小米将安装拦截开关藏得比较深，提供两种关闭途径：

- **常规路径（推荐，无需准备 APK）**：进入系统 **「设置」** → **「隐私与安全」** → **「安全」**，向下滑动找到 **「安全守护」**，将其直接关闭。
- **快捷路径（安装界面）**：点击任意 `.apk` 安装包唤起白色系统安装界面时，点击右上角极不起眼的 **⚙️（齿轮图标）**，关闭里面的 **「应用安全验证」** 与 **「安全守护」**。

> ⚠️ **警告**：关闭后系统不再拦截任何风险，**绝不等于可以随意安装来源不明的 APK**！务必只从官网、GitHub 或 Google Play 下载应用，切勿安装任何破解版或修改版。

### 3. NekoBox 完整加固配置（核心）

这是整套方案中最重要的流量层防护，必须认真配置。

#### 3.1 基础设置推荐
- **运行模式**：VPN
- **TUN 实现**：gVisor（推荐）
- **绕过局域网地址**：开启
- **允许来自局域网的连接**：关闭
- **IPv6 路由**：禁用
- **当网络发生变化时重连出站连接**：开启
- **当设备从睡眠状态唤醒时重连出站连接**：开启
- **MTU**：建议 1500（过高可能导致分片问题）

#### 3.2 DNS 设置（防泄漏关键）
- **远程 DNS**：`https://dns.google/dns-query`（可额外添加 `https://1.1.1.1/dns-query`）
- **直连 DNS**：`https://223.5.5.5/dns-query`（阿里）
- **启用 DNS 路由**：**必须开启**（关闭会导致 DNS 泄漏风险）
- **启用 FakeDNS**：可先开启，若出现代理关闭后部分 App 无法上网再关闭

> 说明：开启「DNS 路由」后，国内域名会使用直连 DNS，国外域名使用远程 DNS。国内 App **不会**因此走代理。

#### 3.3 路由规则（小米及反诈遥测黑洞）
在「路由」页面添加自定义规则，动作选择 **屏蔽**，并**拖到规则列表最顶部**：

```text
sec.miui.com
flash.sec.miui.com
tracking.miui.com
data.mistat.xiaomi.com
cloudservice.miui.com
mistat.xiaomi.com
abtest.mistat.xiaomi.com
api.ad.xiaomi.com
sdkconfig.ad.xiaomi.com
tracking.intl.miui.com
data.mistat.intl.xiaomi.com
fraud-detection.engine.miui.com
detection-aigc.engine.miui.com
virus-engine.sec.miui.com
notify.sec.miui.com
dm.wo.com.cn
loc.map.baidu.com
```

这 17 条按作用分 5 组，免得以后翻回来懵。先说清一点：这 17 条在 NekoBox 里会出现两次，一次是 DNS 黑洞，一次是路由拦截，同一批，双保险，不是 34 条不同的规则。

**1. 系统遥测和统计，6 条**
- `tracking.miui.com`：小米追踪上报
- `tracking.intl.miui.com`：国际版追踪上报
- `data.mistat.xiaomi.com`：统计数据上报
- `mistat.xiaomi.com`：统计总后缀，上面没列出的 mistat 子域名也归它管
- `abtest.mistat.xiaomi.com`：A/B 测试统计
- `data.mistat.intl.xiaomi.com`：国际版统计数据上报

**2. 安全扫描和反诈，6 条**
- `sec.miui.com`：安全中心总入口
- `flash.sec.miui.com`：安全中心鉴权接口
- `fraud-detection.engine.miui.com`：反诈检测引擎
- `detection-aigc.engine.miui.com`：AIGC 内容检测引擎
- `virus-engine.sec.miui.com`：病毒扫描引擎
- `notify.sec.miui.com`：安全通知推送

**3. 广告，2 条**
- `api.ad.xiaomi.com`：广告接口
- `sdkconfig.ad.xiaomi.com`：广告 SDK 配置下发

**4. 云服务，1 条**
- `cloudservice.miui.com`：小米云服务，详见下面注，拦了会断云同步。

**5. 运营商和第三方定位，2 条，不是小米的**
- `dm.wo.com.cn`：联通设备管理探针，详见下面注，拦了不影响联通卡上网、短信、通话。
- `loc.map.baidu.com`：百度定位接口，拦了百度系应用的定位可能受影响，按需保留。

> “以上域名均为小米系统遥测、安全扫描、广告、统计分析以及近期逆向曝光的反诈与运营商（联通 DM）上报接口。加入屏蔽后，即使系统组件尝试上报，数据包也会在 NekoBox 虚拟网卡层被直接丢弃。

> （注：`cloudservice.miui.com` 会连带拦截小米云同步如相册/便签，需保留云服务者请剔除此行；`dm.wo.com.cn` 纯属设备管理与信息采集探针，将其列入黑洞绝不影响联通 SIM 卡或宽带的正常上网、短信及通话功能。）”
同时建议保留以下规则：
- **屏蔽 WebRTC（stun / turn / rtc）**
- **屏蔽 QUIC**
- **中国域名规则 → 绕过**
- **中国 IP 规则 → 绕过**
- **中国 Play 商店规则 → 代理**

> ⚠️ **重要提示**：*(注：配置完成后重新连接节点即可，先不要在此处调试日志，待第二阶段底层组件剔除并重启后再做统一验收。)*

---

## 第二阶段：Windows 环境下的 ADB 脱敏

HyperOS 2.0 底层对部分核心包做了保护，常规的 `pm disable-user` 会触发 `SecurityException: Cannot disable system packages`。

**正确战术**：对受保护的包改用 `pm uninstall -k --user 0`，从当前用户空间彻底移除（系统分区未动，可逆）。

### 1. 建立调试通信通道
1. 电脑端下载并解压 Google 官方的 **SDK Platform-Tools**（[点击直达官方下载](https://dl.google.com/android/repository/platform-tools-latest-windows.zip)）。

> 💡 **极客底牌：ADB 的血统**：ADB 是 Google 写进 Android 底层的官方调试桥，HyperOS 包装得再花哨，底层还是 Linux 内核 + AOSP。只要底子是 Android，这根桥就还在，这就是我们能用它对系统组件动手的原因——但它不是万能的，受保护的包还是得按博客里那套办法来。

![ADB工具目录](https://pub-65eb3861e8d64d24a3280e55bd221735.r2.dev/blog-img-1792591943884.jpg)

2. 手机端开启「开发者选项」→「无线调试」，点击「使用配对码配对设备」。
   > 💡 **防坑提示**：进行无线调试前，**请务必暂时关闭 NekoBox 等代理**，否则会导致局域网穿透失败。

3. 在 `platform-tools` 文件夹地址栏输入 `cmd` 呼出命令提示符，执行：
   ```cmd
   :: 【首次无线调试】先执行配对（按提示输入 6 位配对码），再执行连接
   adb pair 192.168.x.x:配对端口
   adb connect 192.168.x.x:连接端口
   ```

### 2. 降维打击指令集
> ⚠️ **重要提示**：通道打通后，请**务必逐行复制指令、逐条回车执行**（切勿整段复制中文一起粘贴）！

> ⚠️ **高危提示（预期的副作用）**：垃圾清理组件被冷冻后，系统垃圾清理按钮会彻底断链，**点它没反应是正常的，不是手机坏了**。单个 App 的清除缓存、清除数据都还在；想批量清缓存，别恢复组件，电脑上在 ADB 里跑：

```
adb shell pm trim-caches 1000G
```


**冷冻垃圾清理（允许 disable）：**
```cmd
:: 1.停用猎豹内核垃圾清理组件（带广告与云端扫描）
adb shell pm disable-user --user 0 com.miui.cleanmaster
```

**物理卸载核心监控与遥测组件：**

```cmd
:: 2. 物理卸载：安装扫描与云端特征反诈引擎（防 3 秒录屏回传）
adb shell pm uninstall -k --user 0 com.miui.guardprovider

:: 3. 物理卸载：系统行为埋点与大数据统计分析
adb shell pm uninstall -k --user 0 com.miui.analytics

:: 4. 物理卸载：底层常驻遥测守护引擎
adb shell pm uninstall -k --user 0 com.miui.daemon

:: 5. 物理卸载：运营商/渠道设备管理与应用列表采集探针（内鬼组件）
adb shell pm uninstall -k --user 0 com.mobiletools.systemhelper

:: 6. 物理卸载：高通/底层系统辅助进程（天玑机型通常没有，若提示 Failure，直接跳过即可）
adb shell pm uninstall -k --user 0 com.qualcomm.qti.services.systemhelper
```

⚠️ **回显说明**：当控制台回显 **`new state: disabled-user`** 或 **`Success`** 时代表操作成功；若回显 **`Failure [not installed for 0]`**，说明该组件此前已被移除或当前机型原生未内置，同样代表无需处理，直接跳过即可。

![脱敏成功回显](https://pub-65eb3861e8d64d24a3280e55bd221735.r2.dev/blog-img-1792658622097.jpg)
![脱敏成功回显](https://pub-65eb3861e8d64d24a3280e55bd221735.r2.dev/blog-img-1792591718909.jpg)
![脱敏成功回显](https://pub-65eb3861e8d64d24a3280e55bd221735.r2.dev/blog-img-1793643550131.jpg)
![脱敏成功回显](https://pub-65eb3861e8d64d24a3280e55bd221735.r2.dev/blog-img-1793643656606.jpg)

---

## 第三阶段：重启固化、分流验证与现场清理（关键闭环）

指令执行完毕后，必须完成进程刷新与接口封堵，杜绝残留进程与物理接口暴露风险：

### 1. 重启设备彻底销毁脏进程
虽然组件在用户空间已被卸载，但内存中可能残留着先前的运行上下文。直接在终端执行指令重启设备：
```cmd
adb reboot
```

### 2. 最终脱敏与底层断根验收（关键）

手机重启进入系统并重新开启 NekoBox 代理后，执行终极效果验收：

1. **开启内核审计追踪**：
   进入 NekoBox **「设置」** -> **「日志级别」**，临时将其从 `Info` 改为 `Debug`，并重启代理核心[cite: 12]。
2. **前后端双向验证闭环**：
   * **主动强攻校验**：在 Termux 终端中执行 `curl -Iv http://dm.wo.com.cn` 与 `curl -Iv http://tracking.miui.com`，系统底层因 DNS 被黑洞劫持直接抛出 `Could not resolve host`，请求在网卡阶段被斩断[cite: 16]。
   * **分流与黑洞协同**：观察 NekoBox 实时内核日志，联通反诈探针与安全中心鉴权接口（`flash.sec.miui.com`）精准命中黑洞规则下发 `predefined(NOERROR)` 假空响应；在此期间，Google 核心服务走 TUIC 节点出海，MIUI 屏幕时间等系统正常服务命中 `geosite:cn` 走本地 Direct 直连，互不干扰[cite: 13, 14]。
3. **关键性能复原**：
   验证无误后，**务必返回设置将「日志级别」改回 `none`（或 `Warn`）并清空日志**！避免内核持续进行高频闪存 I/O 读写与 CPU 唤醒，引起不必要的发热、耗电和内存损耗[cite: 17]。

<div style="display: flex; gap: 8px; justify-content: space-between; align-items: flex-start; margin: 16px 0;">
  <figure style="width: 32%; margin: 0;">
    <img src="https://pub-65eb3861e8d64d24a3280e55bd221735.r2.dev/blog-img-1793697458652.jpg" alt="Termux 原生探测阻断" style="width: 100%; border-radius: 4px;" />
    <figcaption style="margin-top: 6px; text-align: center; font-size: 14px;">Termux 原生探测阻断</figcaption>
    <p style="margin: 6px 0 0; font-size: 13px; line-height: 1.6; color: #555; text-align: left;">在 Termux 里直接 curl 联通探针和小米追踪域名，两个都报无法解析，说明请求在 DNS 那一步就被掐断了，根本没出手机。</p>
  </figure>
  <figure style="width: 32%; margin: 0;">
    <img src="https://pub-65eb3861e8d64d24a3280e55bd221735.r2.dev/blog-img-1793696495272.jpg" alt="联通探针丢弃与海外分流" style="width: 100%; border-radius: 4px;" />
    <figcaption style="margin-top: 6px; text-align: center; font-size: 14px;">联通探针丢弃与海外分流</figcaption>
    <p style="margin: 6px 0 0; font-size: 13px; line-height: 1.6; color: #555; text-align: left;">一张图见分晓，上方联通探针刚抬头就被 DNS 黑洞静默丢弃，下方 Google 核心流量依然走 TUIC 节点出海，拦截和代理互不冲突。</p>
  </figure>
  <figure style="width: 32%; margin: 0;">
    <img src="https://pub-65eb3861e8d64d24a3280e55bd221735.r2.dev/blog-img-1793696546178.jpg" alt="MIUI 反诈处决与常规直连" style="width: 100%; border-radius: 4px;" />
    <figcaption style="margin-top: 6px; text-align: center; font-size: 14px;">MIUI 反诈处决与常规直连</figcaption>
    <p style="margin: 6px 0 0; font-size: 13px; line-height: 1.6; color: #555; text-align: left;">这张图证明的是后半句，屏幕时间这类常规进程命中国内规则走直连，正常服务没被黑洞误杀。</p>
  </figure>
</div>

> **这三张图能证明什么，不能证明什么：** 分流是实的，195 秒日志里 proxy 37 条、bypass 24 条，Google Play、Telegram 走代理，国内 IP 走直连。17 条规则配置全对，但实弹命中的是 tracking 18 次、dm.wo 2 次、flash 1 次、api.ad 1 次、sdkconfig 1 次，外加 sec.miui.com 后缀下的几个子域名，其余那些在窗口里根本没来查询，是源头已死、规则待命，不是 17 条都当场拦住了。六条卸载也不能单凭日志逐条证明，日志里没有包名，整体效果对得上，逐条证据在第二阶段的 ADB 回显里。另外 flash 那两行不在上面三张截图里，在新日志 0066 行，图 3 只能证明直连那部分。

### 3. 彻底封堵调试通道
前往手机 **「设置」->「更多设置」->「开发者选项」**：
- 彻底关闭 **无线调试** 、与 **开发者选项** 总开关。
> **运维安全准则**：日常使用切勿常驻开放调试通道，关闭后不仅能封堵来自物理接口的意外渗透，还能规避各类银行、政企金融类 App 的运行环境安全报警。

---

## 终极战略与避坑指南

防住了系统的底层探针只是第一步。对于长期需要科学上网、对匿名性有较高要求的玩家，真正的防御是体系化的。

### 1. 硬件底座：尽头是外版设备
国产 UI 的底层监控是一场永无止境的猫鼠游戏。如果有长期的跨境、匿名或高隐私需求，**最一劳永逸的方案是物理隔离**。  
强烈建议备用机选择：**美版/日版/港版 iPhone**、**港版/美版/台版三星（Samsung Galaxy）**，或纯正的 **Google Pixel**。出厂自带相对纯净的底层架构，从根本上减少 OEM 厂商的系统级干预。

### 2. 输入法侧漏：键盘上的探针
手机管家卸得再干净，如果还在使用系统自带定制输入法，或搜狗、百度等国内输入法，你输入的内容仍可能通过云输入接口被记录。  
**解法**：全面换用 **Gboard（Google 键盘）**，或在防火墙层直接切断输入法的联网权限。

### 3. 警惕“蜜罐”节点：免费的最致命
网络上充斥着大量所谓的“免费翻墙 VPN”、“一键加速器”（如老王 VPN、蚂蚁 VPN、免费梯子、快喵加速器、佛跳墙 VPN 等）。  
这些工具大概率会记录访问日志，甚至主动上报。记住铁律：**网络代理领域，来路不明的“免费”往往标好了暗中的代价**。务必使用自己搭建的节点（VLESS-Reality / Hysteria2 / TUIC 等现代代理协议），或背景干净、口碑可靠的付费专线，绝对不要碰来路不明的一键客户端。

### 4. 蜂窝链路脱敏：海外流量卡 / 漫游卡
只要插上国内三大运营商的实体 SIM 卡，基站就会强制将你的 **IMEI（设备串号）与身份证实名绑定的 IMSI** 深度关联，甚至能通过基站漫游和短信下发定位你的物理轨迹。
**极客方案**：彻底拔掉国内实体 SIM 卡，或改用**海外流量卡（如香港大湾区漫游卡、Club Sim、各主流海外 eSIM 等）**。这类卡流量走海外核心网漫游出口，既不会在本地基站留下实名关联记录，也能从物理基站层面切断身份锚定。
> ⚠️ **补充提醒**：即使使用海外流量卡，如果设备上同时常驻登录了微信、支付宝等国内主流实名 App，账号与应用层之间仍会产生数据映射。“外版设备 + 海外流量卡 + 高质量自建代理”在防守端已经做到了民用天花板，日常使用做到这一步完全足够，心里有数即可，无需过度焦虑。

---

## 附录：系统出厂状态回滚

上述操作属于用户层面的深度卸载，未破坏系统底层只读分区（ROM）。未来如果手机需要出二手、转给家人使用或恢复原厂完整逻辑，只需连上电脑开启调试，在 CMD 中**逐行复制指令并回车执行**（切勿整段一起粘贴）！以下指令即可全量恢复：

```bash
# 1. 恢复垃圾清理
adb shell pm enable com.miui.cleanmaster

# 2. 恢复安装扫描与特征安全守护
adb shell cmd package install-existing com.miui.guardprovider

# 3. 恢复系统埋点与数据统计
adb shell cmd package install-existing com.miui.analytics

# 4. 恢复系统底层常驻遥测引擎
adb shell cmd package install-existing com.miui.daemon

# 5. 恢复运营商/渠道残留监控探针
adb shell cmd package install-existing com.mobiletools.systemhelper

# 6. 恢复高通系统辅助进程
adb shell cmd package install-existing com.qualcomm.qti.services.systemhelper
```

---

> 本文首发于 [Velox 的极客空间](https://222382.xyz)。
