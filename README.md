# # safari2aria

请搭配mac下的safari进行食用

### 暂时实现了一些基础功能：
1. 自动拦截指定后缀文件的下载事件并通过aria2c来下载该文件
2. 可配置多个aria2c地址
3. 右键链接后可选择指定aria2c服务进行下载

[下载链接](https://github.com/miniers/safari2aria/releases)

设置：

![image](https://user-images.githubusercontent.com/2039910/27039832-bee11dc0-4fc1-11e7-9ab3-46264992baa6.png)

下载：

![image](https://user-images.githubusercontent.com/2039910/27039821-b4518ce6-4fc1-11e7-8dc2-a9b9c1621ae0.png)


### 已知问题：
1. 自动拦截功能暂时只能下载至第一个aria2c服务器（正在考虑如何优化）
2. 如果aria2c端没有配置ssl证书，则https网站的下载请求无法发送至aria2c

该问题为safari的安全策略，暂时没有思路修复

请在 aria2c 的配置文件中添加如下配置引入证书
```
rpc-secure=true
rpc-certificate=path/to/you/cert
rpc-private-key=path/to/you/key
```

如果你的aria2c运行于macos下，

则需要通过**钥匙串访问**程序将证书先行导入

并在证书简介页面的最低部找到SHA-1 指纹，填写入aria2c的配置文件
```
rpc-secure=true
rpc-certificate=01 01 01 01 01 01 01
```

