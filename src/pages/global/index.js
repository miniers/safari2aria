import {Aria2} from './aria2'
import downloadAble from '@/public/downloadAble'
import _ from 'lodash'
let config = {
  defaultRpcIndex: 0
};
let i18n={
  'zh-CN':{
    'Successful links to':'成功链接',
    'Connection fail':'连接失败',
    'Download':'下载',
    'error':'失败',
    'Import to thunder lixian':'导入至迅雷离线',
    'Import to baidu lixian':'导入至百度离线',
    'Downloaded to':'下载至',
    'success':'成功',
    'Successfully added to the':'成功添加至',
    'Added to the':'添加至',
    'failure':'失败',
    'Failed to get task information':'获取任务信息失败',
    'Make sure the aria2 is running, every 10 seconds will automatically retry':'请确认aria2已经运行,每隔10秒将会自动重试',
  }
};
let keyPressed;
let fileTypes = [];
let rpcList = [];
let aria2Connects = {};
let endPageReadyAction={};
//socket重连定时器
let socketReconnectTimer;
//消息处理函数
let messageAction = {
  //配置变更后保存并重启服务
  updateSafari2Aria: function (msg) {
    localStorage.setItem("safari2aria", JSON.stringify(msg));
    restoreOptions()
  },
  //快捷键
  keyPress: function (msg) {
    keyPressAction(msg)
  },
  //配置更新后推送至页面脚本（主要用于开关iframe拦截）
  getConfig: function () {
    sendMsg('sendToEndScript', config);
  },
  //配置更新后推送至页面脚本（主要用于开关iframe拦截）
  documentReady: function () {
    _.forEach(endPageReadyAction,function (obj) {
      obj.action();
    })
  },
  //下载iframe拦截到的url
  downloadFromIframe: function (msg, e) {
    let t = [
      rpcList[config.defaultRpcIndex],
      msg.url,
      e.target.url,
      msg.cookie
    ];
    sendToAria2(t);
  }
};
//页面提醒
let toast = {
  success: (msg, title) => {
    toast.show('success', msg, title)
  },
  error: (msg, title) => {
    toast.show('error', msg, title)
  },
  show: (type, msg, title) => {
    if (msg instanceof Array) {
      msg = msg.join('');
    }
    if (title instanceof Array) {
      title = title.join('');
    }
    sendMsg("showMassage", {
      action: type || 'success',
      text: msg,
      title: title
    });
  }
}
//和列表页的胡同变量
window.s2a={
  //切换默认服务（列表页切换后同步用）
  changeServer(url){
    let serverIndex;
    _.forEach(rpcList,(rpc,index)=>{
      if(rpc.url === url){
        serverIndex = index;
      }
    });
    config.defaultRpcIndex = serverIndex;
    //config.hideConnectErrorToast=true;
    messageHandler({
      name: 'updateSafari2Aria',
      message: config
    });
    //sendMsg("changeRpc", rpcList[config.defaultRpcIndex].name);
  },
  //打开配置面板
  openOptions,
  //重新获取配置
  getConfig(){
    return {
      config,
      aria2Connects
    }
  }
};

function getText (text,options={}) {
  let lang = config.language || navigator.language;
  return _.get(i18n,[lang,text],options.notfailback?'':[text,' '].join(''))
}
//初始化aria2服务
function initAria2 () {

  let newConnect={}
  //从配置中处理服务器地址
  config.rpcList.forEach(function(rpc, index) {
    let optionMatch = rpc.url.match(/^(http|ws)(s)?(?:\:\/\/)(token\:[^@]*)?@?([^\:\/]*)\:?(\d*)(\/[^\/]*)/);
    let options = {
      host: optionMatch[4],//主机地址
      port: optionMatch[5] || 6800,//rpc端口
      secure: !!(optionMatch && optionMatch[2]),//是否ssl
      secret: optionMatch[3] ? optionMatch[3].split(':')[1] : '',//token
      path: optionMatch[6] || '/jsonrpc'//rpc路径
    };
    if(aria2Connects[rpc.url]){
      newConnect[rpc.url] = aria2Connects[rpc.url];
      delete aria2Connects[rpc.url];
    }else{
      let aria = new Aria2(options);
      newConnect[rpc.url] = {
        aria2: aria,
        rpc:rpc,
        push: rpc.push//是否用websocket连接
      };
    }

/*
    //清除旧的定时器
    if(socketReconnectTimer){
      clearTimeout(socketReconnectTimer)
    }*/
    //如果开启推送，则开启websocket连接
    if (rpc.push) {
      initPush(newConnect[rpc.url], rpc.name)
    }
  });
  //关闭已有旧连接
  for (let key in aria2Connects) {
    //如果开启推送则需要关闭ws连接
    let aria = aria2Connects[key].aria2;
    if (aria && aria.socket && aria.socket.readyState === 1) {
      aria2Connects[key].aria2.close()
    }
  }
  aria2Connects = newConnect;
}
//初始化推送服务
function initPush (connect, name) {
  let aria = connect.aria2;
  if(connect.aria2&&connect.aria2.socket&&aria.socket.readyState === 1){
      return true
  }else{
    aria.open()
      .then(() => {
        //初始化推送接受事件
        initEvent(connect, name);
        //如果当前为重连，则弹出连接成功提示
        if(connect.reconnect){
          delete connect.reconnect;
          toast.success([getText('Successful links to'), name])
        }
      }).catch((err) => {
      //只在第一次未连接成功时提示用户
      if(_.get(safari,'application.activeBrowserWindow.activeTab.url')){
        !connect.reconnect&&toast.error([getText('Make sure the aria2 is running, every 10 seconds will automatically retry')], [ name, getText('Connection fail')]);
        connect.reconnect=true;
      }
      //开启定时器定时重连
      socketReconnectTimer = socketReconnectTimer || setInterval(() => {
        let count=0;
        _.forEach(aria2Connects,(conn)=>{
          count+=initPush(conn)?0:1;
        });
        if(!count){
          clearInterval(socketReconnectTimer);
        }
      }, 10000)
    });
    return false
  }

}
//拉取最新任务状态并刷新扩展按钮小红点
function refreshToolbarItem () {
  //判断是否在
  if(_.get(safari,'extension.popovers[0].contentWindow.tlwin.refreshTaskList')){
    safari.extension.popovers[0].contentWindow.tlwin.refreshTaskList();
  }
}
function initEvent (connect, rpcName) {
  let aria = connect.aria2;
  let downloadStart = function (e) {
    /*  if(!connect.started){
     toast.success(['添加到', rpcName, '成功', config.enableCookie ? "" : '(关闭cookie)'])
     connect.started=true;
     }*/
    refreshToolbarItem()
  }; let downloadStop = function (e) {
    refreshToolbarItem()
  };
  let downloadComplete = function (e, err) {
    refreshToolbarItem()
    getTaskName(aria, e.gid).then(function (name) {
      toast.show(err ? 'error' : 'success', [name, getText('Download'), err ? getText('error') : getText('success')])
    })
  };
  aria.onDownloadStart = downloadStart;
  aria.onDownloadPause = downloadStop;
  aria.onDownloadStop = downloadStop;
  aria.onDownloadComplete = downloadComplete;
  aria.onBtDownloadComplete = downloadComplete;
  aria.onDownloadError = function (e) {
    downloadComplete(e, true)
  }
}
//获取任务名称
function getTaskName (aria, gid) {
  return aria.tellStatus(gid, ['bittorrent'])
    .then((bt) => {
      return aria.getFiles(gid)
        .then((files) => {
          return {
            files,
            bt
          }
        });
    }).then((datas) => {
      let path = datas.files[0].path;
      let name = path.split('/').pop();
      return datas.bt && datas.bt.info ? bt['bittorrent']['info']['name'] : name
    }).catch(err => {
      toast.error([getText('Failed to get task information')])
    })
}
//发送任务至aria2
function sendToAria2 (e) {
  let connect = aria2Connects[e[0].url];
  let aria = connect ? connect.aria2 : false;
  let header = config.enableCookie ? 'Cookie: ' + e[3] : '';
  if (aria && e[1]) {
    aria.addUri([e[1]], {
      header: header,
      timeout:10,
      'content-disposition-default-utf8':true,
      "user-agent": config.userAgent
    }).then(()=>{
      toast.success([getText('Successfully added to the'), connect.rpc.name, config.enableCookie ? "" : '(with cookie)'])
    }).catch(err=>{
      toast.error([getText('Fail to Added to the'), connect.rpc.name, getText('failure',{notfailback:true}), config.enableCookie ? "" : '(without cookie)'])
      console.log(err);
    })
  }else{
    toast.error(['添加任务失败：没有url或者没有连接aria2'])

  }
}
//打开设置面板
function openPreferences (e) {
  "showOptions" === e.key && openOptions()
}
//打开设置面板
function openOptions () {
  safari.application.activeBrowserWindow.openTab().url = safari.extension.baseURI + "options.html"
}
//还原配置
function restoreOptions () {
  config = localStorage.getItem("safari2aria");
  try {
    config = JSON.parse(config || "{}");
  } catch (err) {
    config = {
      defaultRpcIndex: 0
    };
  }
  fileTypes = config.filetypes ? config.filetypes.split(" ") : [];
  for (let a = 0; a < fileTypes.length; a++)fileTypes[a] = fileTypes[a].toLowerCase()
  rpcList = config.rpcList;
  //更新配置后需要同步至页面脚本
  sendMsg('sendToEndScript', config);
  initAria2();
  if(_.get(safari,'extension.popovers[0].contentWindow.tlwin.refreshServerList')){
    safari.extension.popovers[0].contentWindow.tlwin.refreshServerList();
  }
}
//向页面注入脚本发送通知消息
function sendMsg (type, msg, cb) {
  if (msg instanceof Function) {
    cb = msg;
    msg = {};
  }
  //如果有回调自动生成回调事件接受函数
  if (cb) {
    msg = Object.assign(msg || {}, {
      hasCb: true
    });
    messageAction[type + '_cb'] = cb;
  }
  if(window.safari && safari.application.activeBrowserWindow.activeTab.page){
    safari.application.activeBrowserWindow.activeTab.page.dispatchMessage(type, msg);

  }
}
//快捷键处理
function keyPressAction (keys) {
  keyPressed = keys.keyPressed || {};
  if (keyPressed.isShiftPressd && keyPressed.isOptionPressd) {
    //alt+shift +[1-9]切换aria服务
    for (let i = 49; i <= 57 && i - 49 < rpcList.length; i++) {
      if (keyPressed[i]) {
        config.defaultRpcIndex = i - 49;
        messageHandler({
          name: 'updateSafari2Aria',
          message: config
        });
        //页面内toast提醒
        sendMsg("changeRpc", rpcList[config.defaultRpcIndex].name);
        break;
      }
    }
    // ` 展示当前已连接服务器
    if (keyPressed[192]) {
      sendMsg("currentRpc", rpcList[config.defaultRpcIndex].name);
    }
    // shift+alt+, 打开设置面板
    if (keyPressed[188]) {
      openOptions();
    }
    // 打开下载列表浮层
    if (keyPressed[76] && safari && safari.extension) {
      safari.extension.toolbarItems[0].showPopover()
    }
  }

}
function handleCommand (e) {
  let command = e.command.split('.');
  let commandAction={
    "showOptions":function () {
      openOptions();
    },
    "DownloadWithXunleilixian":()=>{
      safari.application.activeBrowserWindow.openTab().url = ['http://lixian.vip.xunlei.com/?furl=',e.userInfo[0]].join('')
    },
    "DownloadWithBaidulixian":()=>{
      safari.application.activeBrowserWindow.openTab().url = "https://pan.baidu.com/disk/home";
      endPageReadyAction['baiduLixian']={
        action:function () {
          sendMsg("baiduLixian", this.param);
          delete endPageReadyAction['baiduLixian'];
        },
        param:{
          url:e.userInfo[0]
        }
      }

    },
    "DownloadWithAria2":()=>{
      let index = command[1];
      let rpc = index && rpcList[index] ? rpcList[index] : rpcList[0];
      let n = [rpc].concat(e.userInfo);
      sendToAria2(n)
    }
  };
  if (commandAction[command[0]]) {
    commandAction[command[0]]()
  }
}
function validateCommand (e) {
  let match = e.command && e.command.match(/^DownloadWith/);
  if (match && match.length >= 0) {
    let a = e.userInfo;
    (a && a.length && a[0]) || (e.target.disabled = !0)
  }
}
//拦截导航跳转事件
function handleNavigation (e) {
  if (downloadAble(e.url,config,keyPressed)) {
    e.preventDefault();
    sendMsg('getCookie', function (msg) {
      let t = [
        rpcList[config.defaultRpcIndex],
        e.url,
        e.target.url,
        msg.cookie
      ];
      sendToAria2(t);
    });
  }
}
//根据配置生成右键菜单
function handleContextMenu (event) {
  rpcList.forEach(function (rpc, index) {
    event.contextMenu.appendContextMenuItem(["DownloadWithAria2", index].join("."), [getText('Downloaded to'), rpc.name].join(''));
  });
  if(config.enableXunleiLixian){
    event.contextMenu.appendContextMenuItem('DownloadWithXunleilixian', [getText('Import to thunder lixian')].join(''));
  }
  if(config.enableBaiduLixian){
    event.contextMenu.appendContextMenuItem('DownloadWithBaidulixian', [getText('Import to baidu lixian')].join(''));
  }
}
//拦截注入脚本发来的消息
function messageHandler (e) {
  if (messageAction[e.name]) {
    messageAction[e.name](e.message, e);
  }
}
//页面加载成功后初始化配置
document.addEventListener("DOMContentLoaded", restoreOptions);
safari.application.addEventListener("message", messageHandler, !1);
safari.extension.settings.addEventListener("change", openPreferences, !1);
safari.application.addEventListener("command", handleCommand, !1);
safari.application.addEventListener("validate", validateCommand, !1);
safari.application.addEventListener("beforeNavigate", handleNavigation, !1);
safari.application.addEventListener("contextmenu", handleContextMenu, false);
