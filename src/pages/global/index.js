import {Aria2} from './aria2'
import _ from 'lodash'
let config = {
  defaultRpcIndex: 0
};
let isCommandPressed, isShiftPressd, isOptionPressd;
let fileTypes = [];
let rpcList = [];
let aria2Connects = {};
let socketReconnectTimer;
let messageAction = {
  updateSafari2Aria: function (msg) {
    localStorage.setItem("safari2aria", JSON.stringify(msg));
    restoreOptions()
  },
  keyPress: function (msg) {
    keyPressAction(msg)
  },
  getConfig: function () {
    sendMsg('receiveConfig', config);
  },
  downloadFromIframe: function (msg, e) {
    if (downladAble(msg.url)) {
      let t = [
        rpcList[config.defaultRpcIndex],
        msg.url,
        e.target.url,
        msg.cookie
      ];
      sendToAria2(t);
    }
  }
};
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
window.s2a={
  aria2Connects,
  config,
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
  openOptions,
  getConfig(){
    window.s2a.aria2Connects = aria2Connects;
    window.s2a.config = config;
  }
};
function downladAble (url) {
  if (url && config.enableTypefiles ? !isCommandPressed : isCommandPressed) {
    let a = url.substr(url.lastIndexOf(".") + 1);
    a = a.toLowerCase();
    for (let n = 0; n < fileTypes.length; n++) {
      if (a === fileTypes[n] || isShiftPressd) {
        return true
      }
    }
  }
}
function initAria2 () {
  for (let key in aria2Connects) {
    //如果开启推送则需要关闭ws连接
    let aria = aria2Connects[key].aria2;
    if (aria && aria.socket && aria.socket.readyState === 1) {
      aria2Connects[key].aria2.close()
    }
  }
  aria2Connects = {};
  config.rpcList.forEach(function(rpc, index) {
    let optionMatch = rpc.url.match(/^(http|ws)(s)?(?:\:\/\/)(token\:[^@]*)?@?([^\:\/]*)\:?(\d*)(\/[^\/]*)/);
    let options = {
      host: optionMatch[4],
      port: optionMatch[5] || 6800,
      secure: !!(optionMatch && optionMatch[2]),
      secret: optionMatch[3] ? optionMatch[3].split(':')[1] : '',
      path: optionMatch[6] || '/jsonrpc'
    };
    let aria = new Aria2(options);
    aria2Connects[rpc.url] = {
      aria2: aria,
      rpc:rpc,
      push: rpc.push
    };
    if (rpc.push) {
      if(socketReconnectTimer){
        clearTimeout(socketReconnectTimer)
      }
      initPush(aria2Connects[rpc.url], rpc.name)
    }
  });
  window.s2a.aria2Connects = aria2Connects
  window.s2a.config = config;
}
function initPush (connect, name) {
  let aria = connect.aria2;
  aria.open()
    .then(() => {
      initEvent(connect, name);
      if(connect.reconnect){
        delete connect.reconnect;
        toast.success(['成功链接', name])
      }
    }).catch((err) => {
    connect.reconnect&&toast.error(['请确认aria2已经运行,每隔10秒将会自动重试'], [ name, '链接失败']);
    connect.reconnect=true;
    socketReconnectTimer = setTimeout(() => {
      initPush(connect, name)
    }, 10000)
  })
}
function refreshToolbarItem () {
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
      toast.show(err ? 'error' : 'success', [name, '下载', err ? '失败' : '成功'])
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
      toast.error(['获取任务信息失败'])
    })
}

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
      toast.success(['成功添加至', connect.rpc.name, config.enableCookie ? "" : '(关闭cookie)'])
    }).catch(err=>{
      toast.error(['添加至', connect.rpc.name, '失败', config.enableCookie ? "" : '(关闭cookie)'])
      console.log(err);
    })
  }
}

function openPreferences (e) {
  "showOptions" === e.key && openOptions()
}
function openOptions () {
  safari.application.activeBrowserWindow.openTab().url = safari.extension.baseURI + "options.html"
}
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
  sendMsg('receiveConfig', config);
  initAria2();
  if(_.get(safari,'extension.popovers[0].contentWindow.tlwin.refreshServerList')){
    safari.extension.popovers[0].contentWindow.tlwin.refreshServerList();
  }
}
function messageHandler (e) {
  if (messageAction[e.name]) {
    messageAction[e.name](e.message, e);
  }
}
function sendMsg (type, msg, cb) {
  if (msg instanceof Function) {
    cb = msg;
    msg = {};
  }
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
function keyPressAction (keys) {
  let keyPressed = keys.keyPressed || {};
  isCommandPressed = keyPressed[91];
  isShiftPressd = keyPressed[16];
  isOptionPressd = keyPressed[18];
  if (isShiftPressd && isOptionPressd) {
    for (let i = 49; i <= 57 && i - 49 < rpcList.length; i++) {
      if (keyPressed[i]) {
        config.defaultRpcIndex = i - 49;
        messageHandler({
          name: 'updateSafari2Aria',
          message: config
        });
        sendMsg("changeRpc", rpcList[config.defaultRpcIndex].name);
        break;
      }
    }
    if (keyPressed[192]) {
      sendMsg("currentRpc", rpcList[config.defaultRpcIndex].name);
    }
    if (keyPressed[188]) {
      openOptions();
    }
    if (keyPressed[76] && safari && safari.extension) {
      safari.extension.toolbarItems[0].showPopover()
    }
  }

}
function handleCommand (e) {
  if (e.command === "showOptions") {
    openOptions();
  } else {
    let index = e.command.split('.')[1];
    let rpc = index && rpcList[index] ? rpcList[index] : rpcList[0];
    let n = [rpc].concat(e.userInfo);
    sendToAria2(n)
  }
}
function validateCommand (e) {
  let match = e.command && e.command.match(/^DownloadWithAria2/);
  if (match && match.length >= 0) {
    let a = e.userInfo;
    (a && a.length && a[0]) || (e.target.disabled = !0)
  }
}
function handleNavigation (e) {
  if (downladAble(e.url)) {
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

function handleContextMenu (event) {
  rpcList.forEach(function (rpc, index) {
    event.contextMenu.appendContextMenuItem(["DownloadWithAria2", index].join("."), ['下载至', rpc.name].join(''));
  });
}

document.addEventListener("DOMContentLoaded", restoreOptions);
safari.application.addEventListener("message", messageHandler, !1);
safari.extension.settings.addEventListener("change", openPreferences, !1);
safari.application.addEventListener("command", handleCommand, !1);
safari.application.addEventListener("validate", validateCommand, !1);
safari.application.addEventListener("beforeNavigate", handleNavigation, !1);
safari.application.addEventListener("contextmenu", handleContextMenu, false);
