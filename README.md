# safari2aria

[点击下载](https://github.com/miniers/safari2aria/releases)

safari extension for use aria2 to replace safari default download

用 aria2c 来替代你的 safari 默认下载

请搭配mac下的safari进行食用

### 已有功能：
1. 拦截指定后缀文件下载
2. 多aria2c服务支持
3. 右键菜单指定aria2c服务
4. 支持百度云和迅雷离线导出
5. 全局拦截模式
6. 可配置下载成功后是否推送通知提醒
7. **下载队列列表**
8. **下载状态控制：开始、暂停、删除**
9. **aria2全局速度配置**
10. 扩展按钮展示正在下载任务数量
11. 一键导入下载链接至迅雷或百度离线
12. English interface
13. 多User-Agent支持
14. 在 Finder 中显示

### 全局捷键：
功能 | 快捷键
---- | ---
切换默认rpc服务 | option+shift+[123456789]
展示当前默认rpc服务 |  option+shift+`
临时禁用或启用拦截 |  长按cmd并点击链接
全局拦截 |  长按shift并点击链接
设置 |  option+shift+,

### 任务列表：
功能 | 快捷键
---- | ---
全选任务 | cmd+a
多选任务 | shift + 鼠标点击
切换当前选中任务状态（启动；暂停） |  space`
开始选中任务 |  alt+s
暂停选中任务 |  alt+p
删除选中任务 |  alt+d

### 注意事项
1. aria2已经无需配置SSL证书了
2. 请在aria2c的配置文件中加入如下配置,用以开启百度云和迅雷离线导出时自动更改下载文件名
```
content-disposition-default-utf8=true

```
3. 如需使用"在 Finder 中显示",请将safari2aria.app放置于**应用程序**目录中，并手动执行程序一次来注册url schemes。插件将自动识别rpc地址为127.0.0.1或者localhost的服务器，如需手动指定其他地址的aria2为本地，请在rpc名称中添加** _local **来辅助识别


下载列表：

![下载列表](https://user-images.githubusercontent.com/2039910/27525446-7d831888-5a70-11e7-9e2a-12d89f98cd1b.png)


切换UA：

![切换UA](https://user-images.githubusercontent.com/2039910/27525463-ad48c45a-5a70-11e7-842c-f23cc53ae0cd.png)


设置：

![设置](https://user-images.githubusercontent.com/2039910/27525469-bf00a3ac-5a70-11e7-891a-d382b12b7587.png)


下载：

![image](https://user-images.githubusercontent.com/2039910/27039821-b4518ce6-4fc1-11e7-8dc2-a9b9c1621ae0.png)

#### 迅雷离线导出：
- 开启cookie传递选项
- 选择需要导出的文件
- 如当前为自动拦截模式，长按**shift**并点击**取回本地**按钮即可导出下载至默认rpc服务器
- 如当前关闭了自动拦截默认，需长按**shift+cmd**并点击**取回本地**按钮即可导出下载至默认rpc服务器

#### 百度云分享页导出：
- 开启cookie传递选项
- 点击下载，打开文件下载窗口
- 如当前为自动拦截模式，长按**shift**并点击**普通下载**按钮即可导出下载至默认rpc服务器
- 如当前关闭了自动拦截默认，需长按**shift+cmd**并点击**普通下载**按钮即可导出下载至默认rpc服务器

### 本项目参考或引用了以下项目
- https://github.com/NemoAlex/glutton
- https://github.com/sonnyp/aria2.js
- https://github.com/se-panfilov/mini-toastr
- https://github.com/airyland/vux

