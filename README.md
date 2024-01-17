# 更好的斗鱼web播放器
![GitHub](https://img.shields.io/github/license/LiebeV/disable-DY-blur?color=blue)
![Greasy Fork](https://img.shields.io/greasyfork/v/461630?label=Greasy%20Fork&color=green)
![GitHub release (with filter)](https://img.shields.io/github/v/release/LiebeV/disable-DY-blur?logo=github&color=green)

## 请通过Greasy Fork（自动更新） 或 Releases（手动更新） 向油猴添加user.js以使用此脚本


关闭***斗鱼***web端全屏虚化背景 ,去除直播间文字水印，添加了一些实用的快捷键

其他项目：
</a> <a href="https://github.com/LiebeV/douyu-all-level-ban" target="_blank"><img src="https://img.shields.io/badge/弹幕屏蔽-1.1-red?logo=github"></a>

##### 鱼吧项目在考虑是否merge



# 脚本功能

### 1. 关闭虚化屏幕（默认开启，请自行修改代码关闭，请遵守MIT）
### 2. 自动屏蔽弹幕（全量的屏蔽右侧弹幕区以及飘屏弹幕，需通过设置添加房间号以使此功能生效）
全量弹幕屏蔽是从<a href="https://greasyfork.org/zh-CN/scripts/463327-%E6%96%97%E9%B1%BC%E5%85%A8%E7%AD%89%E7%BA%A7%E5%BC%B9%E5%B9%95%E5%B1%8F%E8%94%BD" target="_blank">**全等级弹幕屏蔽**</a>中为了简化其代码逻辑而拆分得来的功能。该功能默认不开启，且不在初始化过程被中调用，不需要可以直接无视，并不会刷存在感
#### #**NOTE**:之于页面上其他不想要看到的东西，请搭配其他例如AdBlock之类的专业广告屏蔽器使用，本脚本不提供长久的css更新维护
### 3.添加了一些快捷键，请查看下方“快捷键列表”
### 4.可以定时清屏右侧弹幕区弹幕DOM节点，以缓解卡顿
（请尽可能使用全量屏蔽功能，可以更彻底的解决由于频繁更新DOM而造成的卡顿）

### (请通过tampermonkey -> 优化斗鱼web播放器 -> 房间号设置 添加/移除房间号)


<img src='https://github.com/LiebeV/disable-DY-blur/blob/main/assets/image.png?raw=true' />

# 更新日志

v0.1，[WIP]关闭屏幕虚化

v0.2，[WIP]添加了移除文字水印的功能

v0.3.0 - v0.3.1，[WIP]修复了当页面加载过慢时无法生效的bug

v1.0，正式版发布，添加了全量移除弹幕的功能，允许用户自定义需要屏蔽的房间

v1.1，修复了message显示无效的bug

v1.2，修复了getValue初始化异常的bug

v1.3，现在添加（移除）房间号时不需要刷新网页就可以生效了

v1.4，应反馈要求，添加了移除topFloater弹幕的功能

v1.5，添加了快捷键 "ALT + L"，用于快速开关全量屏幕弹幕的功能（状态不会保存到存储中）

~~v1.5.1，添加了快捷键 "F"，用于快速切换全屏播放~~

v1.6，修改了全屏快捷键 "F" >>> "ALT + U"（避免触发浏览器级快捷键）； 添加了快捷键"ALF + W", 用于切换宽屏模式； 添加了屏蔽鱼吧热议飘屏的功能（默认永久开启）

v1.7，添加了快捷键“ALT + 1/2/3/4/5”，用于切换直播间画质（1-->直播间最高画质，2-->直播间可选次高画质...以此类推）

~~v1.8，添加了定时清屏弹幕区的功能~~

~~v1.8.1，现在定时清屏的功能可以从插件设置中开启/关闭了~~

v2.0，修改了全部屏幕模式快捷键触发方式（不再点击原播放器控件）

### v2.0.1，添加了快捷键“ALT + 6/7/8/9”，用于切换直播间线路

### v2.1，移除了定时清屏功能，添加了暴力隐藏的功能（ALT+ K）,这会隐藏全部除了播放器意外的东西

# 快捷键列表

|按键（均不区分左右以及大小写）|功能|操作|
|:---:|:---:|:---:|
|“ALT+L”|全量弹幕屏蔽|开/关|
|“ALT+U”|全屏|开/关|
|“ALT+W”|宽屏|开/关|
|“ALT+K”|暴力隐藏|开|
|“ALT+1/2/3/4/5”|切换画质|从1至5对应画质从高到低|
|“ALT+6/7/8/9”|切换线路| |
