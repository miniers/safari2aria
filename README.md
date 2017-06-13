# safari2aria

用 aria2c 来替代你的 safari 默认下载

请搭配mac下的safari进行食用

### 已有功能：
1. 拦截指定后缀文件下载
2. 多aria2c服务支持
3. 右键菜单指定aria2c服务

### 快捷键：
1. 切换默认rpc服务 （option+shift+[123456789]）
2. 展示当前默认rpc服务（option+shift+`）
3. 临时禁用或启用拦截（按着cmd点击链接）

[下载链接](https://github.com/miniers/safari2aria/releases)

设置：

![image](https://user-images.githubusercontent.com/2039910/27039832-bee11dc0-4fc1-11e7-9ab3-46264992baa6.png)

下载：

![image](https://user-images.githubusercontent.com/2039910/27039821-b4518ce6-4fc1-11e7-8dc2-a9b9c1621ae0.png)


### 注意事项：
如果aria2c端没有配置ssl证书，则https网站的下载请求无法发送至aria2c

该问题为safari的安全策略，暂时没有思路修复

详细原因请浏览此篇博文 [https://imququ.com/post/sth-about-switch-to-https.html#toc-0-2](https://imququ.com/post/sth-about-switch-to-https.html#toc-0-2)

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

## 友情福利

鉴于有些用户没有申请域名或者证书，现提供一套自用ssl证书用以搭建本地aria2c https支持

域名： aria2.zc.ci

解析： 127.0.0.1

证书下载地址：[aria2.zc.ci.zip](https://github.com/miniers/safari2aria/files/1070942/aria2.zc.ci.zip)

请参照注意事项在aria2c的配置文件中添加证书

