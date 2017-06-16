let config = {
  defaultRpcIndex: 0
};
let isCommandPressed, isShiftPressd, isOptionPressd;
let fileTypes = [];
let rpcList = [];
let aria2Connects = {};
let Aria2 = window.Aria2;
let watchInterval;
let watchIntervalTime = 1;
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
function getConnect (rpcUrl) {
  return aria2Connects[rpcUrl]
}
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
    if (aria2Connects[key].aria2 && aria2Connects[key].push) {
      aria2Connects[key].aria2.close()
    }
  }
  aria2Connects = {};
  config.rpcList.forEach((rpc, index) => {
    let optionMatch = rpc.url.match(/^(?:http|ws)(s)?(?:\:\/\/)(token\:[^@]*)?@?([^\:\/]*)\:?(\d*)(\/[^\/]*)/);
    let options = {
      host: optionMatch[3],
      port: optionMatch[4] || 6800,
      secure: !!(optionMatch && optionMatch[1]),
      secret: optionMatch[2] ? optionMatch[2].split(':')[1] : '',
      path: optionMatch[5] || '/jsonrpc'
    };
    let aria = new Aria2(options);
    aria2Connects[rpc.url] = {
      aria2: aria,
      rpc:rpc,
      push: rpc.push,
      taskLists:{
        active: {
          list: [],
          ext: {}
        },
        waiting: {
          list: [],
          ext: {}
        },
        stopped: {
          list: [],
          ext: {}
        }
      }
    };
    if (rpc.push) {
      initPush(aria2Connects[rpc.url], rpc.name)
    }
  })
}
function initPush (connect, name) {
  let aria = connect.aria2;
  aria.open()
    .then(() => {
      initEvent(connect, name);
      //initWatch();
    }).catch((err) => {
    toast.error(['websocket连接失败，有可能aria2并没有运行,10秒后自动重连'], ['连接', name, '推送服务失败'])
    setTimeout(() => {
      initPush(aria, name)
    }, 10000)
  })
}
function initEvent (connect, rpcName) {
  let aria = connect.aria2;
  let downloadStart = function (e) {
  /*  if(!connect.started){
      toast.success(['添加到', rpcName, '成功', config.enableCookie ? "" : '(关闭cookie)'])
      connect.started=true;
    }*/
  };
  let downloadComplete = function (e, err) {
    getTaskName(aria, e.gid).then(function (name) {
      toast.show(err ? 'error' : 'success', [name, '下载', err ? '失败' : '成功'])
    })
  };
  aria.onDownloadStart = downloadStart;
  aria.onDownloadComplete = downloadComplete;
  aria.onBtDownloadComplete = downloadComplete;
  aria.onDownloadError = function (e) {
    downloadComplete(e, true)
  }
}
function initWatch () {
  if (watchInterval) {
    clearInterval(watchInterval)
  }
  watchInterval = setInterval(() => {
    config.rpcList.forEach((rpc) => {
      let connect = aria2Connects[rpc.url];
      getActives(connect);
    })
  }, watchIntervalTime * 1000)
}
function getActives (connect) {
  let aria = connect.aria2;
  if (aria.socket && aria.socket.readyState === 1) {
    aria.tellActive()
      .then((tasks) => {
        optimizeBaidupan(connect, tasks);
        connect.taskLists.active.list = tasks;
      })
  }
}
function isBaiduPanTask (files) {
  let uris, isBaiduPan;
  if (files && files.length) {
    uris = files[0].uris;
  }
  if (uris && uris.length) {
    isBaiduPan = uris[0].uri.search(/baidu.*/) >= 0
  }
  return isBaiduPan;
};

function optimizeBaidupan (connect, tasks) {
  let aria = connect.aria2;
  tasks.forEach((task, index) => {
    if (!isBaiduPanTask(task.files)) {
      return;
    }
    let current, ext = connect.taskLists.active.ext;
    for (let i = 0; i < connect.taskLists.active.list.length; i++) {
      if (connect.taskLists.active.list[i].gid === task.gid) {
        current = connect.taskLists.active.list[i];
        break;
      }
    }
    if (!ext.baiduCount) {
      ext.baiduCount = {};
    }
    if (!ext.baiduCount[task.gid]) {
      ext.baiduCount[task.gid] = 1
    }
    if (current) {
      if (task.status === 'active' && task.completedLength - current.completedLength < watchIntervalTime * config.baidupanLimitSpeed * 1024) {
        if (ext.baiduCount[task.gid] >= 4) {
          ext.baiduCount[task.gid] = 1;
          console.log('restart:',task.gid);
          aria.pause(task.gid)
            .then(() => {
              aria.unpause(task.gid)
            })
        }
        ext.baiduCount[task.gid]++
      }
    }
  })
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
  if (config.baidupanAutoDisableCookie) {
    if (e[2] && e[2].match(/^https\:\/\/pan\.baidu\.com\/s/)) {
      header = '';
    }
  }
  if (aria && e[1]) {
    aria.addUri([e[1]], {
      header: header,
      "user-agent": config.userAgent
    }).then(()=>{
      toast.success(['成功添加至', connect.rpc.name, config.enableCookie ? "" : '(关闭cookie)'])
    }).catch(err=>{
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
  initAria2()
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
  safari.application.activeBrowserWindow.activeTab.page.dispatchMessage(type, msg);

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
