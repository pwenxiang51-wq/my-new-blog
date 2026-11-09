---
title: 🚀[实战] HyperOS 终极脱敏续篇：314 个系统包全扫一遍，又卸载 6 个系统包
author: Velox
pubDatetime: 2026-11-06T19:00:00+08:00
slug: hyperos-telemetry-kill-switch-part-2
featured: true
draft: false
tags:
  - 极客防御
  - 脱敏
  - HyperOS
  - ADB实战
description: 第一篇的续篇。Redmi K50 上用一条 ADB 指令把 314 个系统包全扒出来，只写卸载 / 冷冻的，不写全表：复验第一篇 6 条（冻 1 条 + 卸 4 条，高通那条天玑机本来就没有），垃圾清理还冻着，4 条卸载的没复活，再新卸载 6 条，附每条是干什么的、卸载还是冷冻、冻不了怎么办、回显怎么看。
---

> ⚠️ **极客免责声明**：本方案仅为个人实战记录与网络架构防侧漏技术探讨。系统级“脱敏”存在一定未知风险（如导致依赖该组件的部分系统自带功能闪退）。操作不当导致的数据丢失、系统死机或变砖，本人概不负责。动手前请确保你清楚自己在敲什么代码！

**本文是第一篇的续篇，先看第一篇再看这篇。第一篇：[🚀[实战] HyperOS 2.0 / 3.0 终极脱敏：免 Root 物理封杀小米内置反诈与遥测](https://222382.xyz/posts/hyperos-telemetry-kill-switch)**

**第一篇干的是：UI 关门 + NekoBox 17 条黑洞 + ADB 卸载 4 条（高通那条天玑机本来就没有）、冷冻 1 条，一共 6 条。本文干的是：用 `adb shell pm list packages -s` 这条指令把手机里 314 个系统包全扒出来，复验第一篇有没有复活，再新卸载 6 条。**

**扒包用的就是这条指令，完整一行就是下面这样，头是 `adb shell pm list packages -s`，别只抄后半段：**

```cmd
adb shell pm list packages -s
```

**先说清一点：314 个包本文不全写，只写卸载 / 冷冻的。** 全表写出来就是一本电话簿，没人看，也没意义。**还装着 ≠ 正在上传**，很多包是装着、没卸掉，但已经被第一篇的 UI 关闭 + NekoBox 17 条黑洞压着，不等于现在就在跑。

---

## 🎯 方案边界与疗效说明

**1. 适用机型：本文实测机型是 Redmi K50，MTK mt6895，HyperOS 2.0.10，底层 Android 14。** 理论兼容所有运行 MIUI 14 / HyperOS 2.0 及最新 HyperOS 3.0 的小米与 Redmi 全系机型，**高通机型注意：第一篇第 6 条高通辅助进程在天玑机型上本来就没有，本文也不重复算。**

**2. OTA 系统更新的影响：系统 OTA 升级（特别是跨大版本更新）极大概率会把这些被卸载的系统组件“复活”。** 每次系统更新完，请重新拿数据线或连上无线调试，把第一篇 + 本文的 ADB 指令再跑一次，再用本文第一节的两条扫包指令复验一遍。

**3. 实际效果：本方案能显著降低小米后台主动上报与特征扫描，但并非 100% 绝对隔离（系统可能缓存数据、存在极少数硬编码通道）。** 结合高质量代理节点使用时效果最佳。

**4. 冻和卸的区别，一定要先分清：`disable-user` 是冷冻，可逆，系统分区里的包还在，只是当前用户用不了；`uninstall -k --user 0` 是从当前用户空间移除，可逆，系统分区未动，以后用 `install-existing` 还能装回来。** 两者都不是 Root、不是解 BL、不是动 ROM。

---

## 一、扫包方法：两条指令

**先说方法，再说结果。两条指令输出到两个文本文件，全文比对，不漏包。**

**在 `platform-tools` 文件夹地址栏输入 `cmd` 呼出命令提示符，连上 K50 后，跑下面两条：**

```cmd
adb shell pm list packages -s > k50-system-packages.txt
adb shell pm list packages -d > k50-disabled-packages.txt
```

**第一条是全部系统包，本文实测 314 个。已经卸载的不会出现，缺席本身就是证据。**

**第二条是已停用 / 冷冻的包，本文实测只有 1 条。**

**两条都不含密码、Token、节点凭证，可以直接保存、比对。**

**实测机型说清：本文实测机是 Redmi K50，型号 22041211AC，MTK mt6895，HyperOS 2.0.10，底层 Android 14。其他手机 / 其他型号，系统包清单会不一样，不要照抄本文的包名逐条卸载。先按上面两条扫出你自己手机的清单，再逐条核对，文件名里的 `k50` 就换成你自己的型号，例如 `redmi-note-13-system-packages.txt`。**

**这两个 txt 文件的位置说清：不在手机里，在电脑上，就在你跑命令的那个 `platform-tools` 文件夹里，例如 `D:\谷歌浏览器下载\platform-tools-latest-windows (1)\platform-tools\k50-system-packages.txt` 和同文件夹下的 `k50-disabled-packages.txt`。跑完命令，到这个文件夹里找这两个文件，发出来比对就行。**

> 💡 **极客底牌：为什么是 `-s` 和 `-d`？** `-s` 是系统包，内鬼都在这里；`-d` 是已停用包，冷冻的都在这里。**只跑 `-s` 不够，冷冻的包可能不在 `-s` 里；只跑 `-d` 也不够，卸掉的包不在 `-d` 里。两条一起跑，活着的、冻着的、卸掉的，三档一次分清。**

![系统包扫描结果](https://pub-65eb3861e8d64d24a3280e55bd221735.r2.dev/blog-img-1793974036827.jpg)
>系统包扫描结果：一次扫出全部系统包，卸掉的包不在里面。

![已停用包扫描结果](https://pub-65eb3861e8d64d24a3280e55bd221735.r2.dev/blog-img-1793974098239.jpg)
>已停用包扫描结果：全机只有 cleanmaster 1 条还冻着。

---

## 二、复验第一篇：6 条一共，4 条卸载的没复活，垃圾清理还冻着

**这是本文先做的事，不是直接开新清单。第一篇的包要是复活了，新清单就没意义。**

**第一篇一共 6 条：冷冻 1 条 + 卸载 4 条（高通那条天玑机本来就没有）。其中卸载的 4 条，本文 314 个包里全都不在，没复活：**

- **`com.miui.guardprovider`：安装扫描与云端特征反诈引擎，不在，卸掉了，没回来。**
- **`com.miui.analytics`：系统行为埋点与大数据统计分析，不在，卸掉了，没回来。**
- **`com.miui.daemon`：底层常驻遥测守护引擎，不在，卸掉了，没回来。**
- **`com.mobiletools.systemhelper`：运营商 / 渠道设备管理与应用列表采集探针，不在，卸掉了，没回来。**
- **`com.qualcomm.qti.services.systemhelper`：高通 / 底层系统辅助进程，不在，但天玑机型本来就没有，这条不算卸掉的证据，别重复算。**

**第一篇冻住的 1 条，第二份文件里只有它 1 条，全机唯一一个已停用的包：**

- **`com.miui.cleanmaster`：垃圾清理组件，还冻着，没被 OTA 复活、没被谁悄悄启用。** 垃圾清理按钮点没反应，还是正常的，不是手机坏了，见第一篇高危提示。

> ⚠️ **重要提示：复验这一步别省。** **OTA 或系统更新可能让已卸的包复活，这也是这次扫一遍的意义。** 以后每次大版本更新完，都按第一节那两条重跑一遍，缺席的才是真卸掉了，出现在 `-s` 里的就是复活了，出现在 `-d` 之外的就是解冻了。

---

## 三、新卸载的 6 条：每条是干什么的，为什么卸载它

**下面 6 条是本文新卸载的，只写这 6 条，不写全表。每条都按第一篇的战术来：先试冷冻 `disable-user`，受保护就换卸载 `uninstall -k --user 0`，逐行复制、逐条回车，别整段粘贴。**

### 1. `com.miui.systemAdSolution`：系统广告底子

**这是干什么的：小米系统广告的底子，系统级广告投放、广告配置下发都走它。**

**为什么卸载它：广告接口在第一篇 NekoBox 17 条里已经被黑洞拦了，但本地这个广告服务还在跑，卸载它，本地广告服务就停了。**

**能冷冻吗：不能冷冻。** 先跑 `disable-user` 回的是 `SecurityException: Cannot disable system packages`，这是 HyperOS 的保护，跟第一篇开头写的那句保护是一回事。**改用 `uninstall -k --user 0`，第一次回 `Success`，就是卸掉了；第二次再跑回 `Failure [not installed for 0]`，不是失败，是第一次已经卸掉了，第二遍当然找不到，直接跳过。**

```cmd
adb shell pm uninstall -k --user 0 com.miui.systemAdSolution
```

**卸掉会坏什么：系统广告没了，日常使用没影响。**

### 2. `com.miui.bugreport`：Bug 上报

**这是干什么的：收集、上传 Bug 报告、崩溃日志。**

**为什么卸载它：纯上报，没用户功能，卸载它不影响日常使用。**

```cmd
adb shell pm uninstall -k --user 0 com.miui.bugreport
```

**回显 `Success`，就是卸掉了。**

### 3. `com.miui.uireporter`：界面上报

**这是干什么的：界面使用情况上报。**

**为什么卸载它：纯上报，没用户功能，卸载它不影响日常使用。**

```cmd
adb shell pm uninstall -k --user 0 com.miui.uireporter
```

**回显 `Success`，就是卸掉了。**

### 4. `com.miui.yellowpage`：黄页

**这是干什么的：黄页，号码识别、企业号码查询。**

**为什么卸载它：不用黄页查号，卸载它不影响日常使用。**

```cmd
adb shell pm uninstall -k --user 0 com.miui.yellowpage
```

**回显 `Success`，就是卸掉了。**

### 5. `com.miui.personalassistant`：负一屏

**这是干什么的：负一屏，左滑出来的快捷助手。**

**为什么卸载它：不用负一屏，卸载它，左滑那页就没了，日常使用没影响。**

```cmd
adb shell pm uninstall -k --user 0 com.miui.personalassistant
```

**回显 `Success`，就是卸掉了。**

### 6. `com.sohu.inputmethod.sogou.xiaomi`：搜狗输入法小米版

**这是干什么的：搜狗输入法小米定制版，带云输入、云词库。**

**为什么卸载它：本文实测机默认输入法已经是 Gboard（Google 键盘）了，搜狗这包还装在系统里，卸掉它，系统就不会哪天又切回国内输入法。** 第一篇输入法那节已经写了，键盘上的探针不换，前面就白干。

**卸掉会坏什么：只要默认是 Gboard 就没事。** 如果以后 Gboard 出问题，需要先装回一个输入法再卸，别把自己锁在没键盘的状态。

```cmd
adb shell pm uninstall -k --user 0 com.sohu.inputmethod.sogou.xiaomi
```

**回显 `Success`，就是卸掉了。**

![脱敏回显](https://pub-65eb3861e8d64d24a3280e55bd221735.r2.dev/blog-img-1793974486521.jpg)
![脱敏回显](https://pub-65eb3861e8d64d24a3280e55bd221735.r2.dev/blog-img-1793974573046.jpg)

> ⚠️ **重要提示：上面 6 条，逐行复制、逐条回车执行（切勿整段复制中文一起粘贴）！** **先试 `disable-user`，报 `SecurityException` 再换 `uninstall -k --user 0`，别一上来就批量卸，也别跳过回显直接跑下一条。**

---

## 四、回显说明：三句话，看懂就够了

**⚠️ 回显说明：当控制台回显 `Success` 时代表操作成功；若回显 `Failure [not installed for 0]`，说明该组件此前已被移除或当前机型原生未内置，同样代表无需处理，直接跳过即可；若回显 `SecurityException: Cannot disable system packages`，说明该包受保护，`disable-user` 冻不了，换 `uninstall -k --user 0` 再跑一次。**

**这三句是本文和第一篇通用的回显规则，跑任何一条都先看回显，再跑下一条。**

---

## 五、还活着的怎么办：别全冻，别批量卸

**本文不列全表，但要把底线说清：314 个包里，除了上面复验的第一篇 6 条（冷冻 1 条 + 卸载 5 条，其中高通那条在天玑机上本来就没有，实际卸载的是 4 条）+ 本文新卸载的 6 条，剩下的还装着。**

**还装着 ≠ 正在上传，很多是被第一篇的 UI 关闭 + NekoBox 17 条黑洞压着的，真正有没有在跑，得看 NekoBox 日志里有没有命中，别靠“装着”两个字就下结论。**

**下面这几类别动：`com.miui.securitycenter`、`com.miui.securitycore` 这些安全中心本体，冻了会坏一堆功能，第一篇特意没动它；`com.miui.home`、`com.miui.system`、`com.android.systemui`、`com.android.phone`、`com.android.settings` 这些系统底座，动了手机就不好用了。**

**想再动的，先按第一节那两条扫一遍，把包名、是干什么的、冻 / 卸了会坏什么，三件事想清楚再动手，一次只动一条，跑完看回显，别批量。**

---

## 六、想彻底不升级：卸载系统更新器（可选）

**这条不算在前面 6 条里，是单独的可选项，只给真不想升级的人。**

**这是干什么的：`com.android.updater` 是系统更新器，OTA 全量包下载、静默安装都走它。**

**为什么卸载它：你 314 里它还在，卸了它，半夜 Wi-Fi 下全量包那条路就断了，从根上断 OTA。**

```cmd
adb shell pm uninstall -k --user 0 com.android.updater
```

**回显 `Success`，就是卸掉了。**

![卸载 - 装回 - 再卸载](https://pub-65eb3861e8d64d24a3280e55bd221735.r2.dev/blog-img-1794208484346.jpg)

> 卸载 - 装回 - 再卸载：三次回显，证明是可逆的卸载，不是冷冻，也不是彻底删除。

**卸掉会坏什么：设置里“我的设备 - 系统版本”会点不进去或闪退，这是预期的，不是手机坏了。以后想升级，先装回来再升：**

```cmd
adb shell cmd package install-existing com.android.updater
```

**装回回显：`Package com.android.updater installed for user: 0`，就是装回去了。**

---

## 附录：本文新卸 6 条的回滚

**上述操作属于用户层面的深度卸载，未破坏系统底层只读分区（ROM）。未来如果手机需要出二手、转给家人使用或恢复原厂完整逻辑，只需连上电脑开启调试，电脑上在 ADB 里逐行复制指令并回车执行（切勿整段一起粘贴）！以下指令即可恢复本文新卸的 6 条：**

```bash
# 1. 恢复系统广告方案
adb shell cmd package install-existing com.miui.systemAdSolution

# 2. 恢复 Bug 上报
adb shell cmd package install-existing com.miui.bugreport

# 3. 恢复界面上报
adb shell cmd package install-existing com.miui.uireporter

# 4. 恢复黄页
adb shell cmd package install-existing com.miui.yellowpage

# 5. 恢复负一屏
adb shell cmd package install-existing com.miui.personalassistant

# 6. 恢复搜狗输入法小米版
adb shell cmd package install-existing com.sohu.inputmethod.sogou.xiaomi
```

**第一篇那 6 条的回滚，见第一篇附录：[🚀[实战] HyperOS 2.0 / 3.0 终极脱敏：免 Root 物理封杀小米内置反诈与遥测](https://222382.xyz/posts/hyperos-telemetry-kill-switch)，本文不重复贴。**

**回滚回显本文没实测过，不知道会回什么，别硬编。跑完看回显，有 `Success` / 已装回就是成功了，报 `Failure` 再单独看那一条。**

---

> 本文首发于 [Velox 的极客空间](https://222382.xyz)。第一篇见：[🚀[实战] HyperOS 2.0 / 3.0 终极脱敏：免 Root 物理封杀小米内置反诈与遥测](https://222382.xyz/posts/hyperos-telemetry-kill-switch)
