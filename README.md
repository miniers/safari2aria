# safari2aria

[点击下载](https://github.com/miniers/safari2aria/releases)

用 aria2c 来替代你的 safari 默认下载

请搭配mac下的safari进行食用

### 已有功能：
1. 拦截指定后缀文件下载
2. 多aria2c服务支持
3. 右键菜单指定aria2c服务
4. 支持百度云([wap](https://pan.baidu.com/wap/home))和迅雷离线导出
5. 全局拦截模式
6. 可配置下载成功后是否推送通知提醒
7. **下载队列列表**
8. **下载状态控制：开始、暂停、删除**
9. **aria2全局速度配置**
10. 扩展按钮展示正在下载任务数量


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
下载列表：

![下载列表](https://user-images.githubusercontent.com/2039910/27314971-8d8f2a3a-55a9-11e7-90ad-a5751d30f38a.png)


设置：

![设置](https://user-images.githubusercontent.com/2039910/27327247-91090c1c-55e0-11e7-944f-5678760849ee.png)


下载：

![image](https://user-images.githubusercontent.com/2039910/27039821-b4518ce6-4fc1-11e7-8dc2-a9b9c1621ae0.png)

#### 迅雷离线导出：
- 开启cookie传递选项
- 选择需要导出的文件
- 如当前为自动拦截模式，长按**shift**并点击**取回本地**按钮即可导出下载至默认rpc服务器
- 如当前关闭了自动拦截默认，需长按**shift+cmd**并点击**取回本地**按钮即可导出下载至默认rpc服务器

#### 百度云分享页导出：
- 关闭cookie传递选项
- 点击下载，打开文件下载窗口
- 如当前为自动拦截模式，长按**shift**并点击**普通下载**按钮即可导出下载至默认rpc服务器
- 如当前关闭了自动拦截默认，需长按**shift+cmd**并点击**普通下载**按钮即可导出下载至默认rpc服务器

### 本项目参考或引用了以下项目
- https://github.com/NemoAlex/glutton
- https://github.com/sonnyp/aria2.js
- https://github.com/se-panfilov/mini-toastr
- https://github.com/airyland/vux

