let config = {
  defaultRpcIndex: 0
};
let isCommandPressed, isShiftPressd, isOptionPressd;
let fileTypes = [];
let rpcList = [];
let timers = {};
let aria2Connects = {};
let Aria2 = window.Aria2;
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
    if (!isCommandPressed) {
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
  success: (msg,title) => {
    toast.show('success',msg,title)
  },
  error: (msg,title) => {
    toast.show('error',msg,title)
  },
  show: (type, msg,title) => {
    if(msg instanceof Array){
      msg = msg.join('');
    }
    if(title instanceof Array){
      title = title.join('');
    }
    sendMsg("showMassage", {
      action: type || 'success',
      text: msg,
      title:title
    });
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
      push: rpc.push
    };
    if (rpc.push) {
      aria.open()
        .then(() => {
          initEvent(aria, rpc.name);
        }).catch((err) => {
        toast.error(['websocket连接失败，有可能aria2并没有运行'],['连接',rpc.name,'推送服务失败'])
      })
    }
  })
}
function initEvent (aria, rpcName) {
  let downloadStart = function (e) {
    toast.success(['添加到', rpcName, '成功', config.enableCookie ? "" : '(关闭cookie)'])
  };
  let downloadComplete = function (e, err) {
    getTaskName(aria, e.gid).then(function (name) {
      toast.show(err ? 'error' : 'success',[name, '下载', err ? '失败' : '成功'])
    })
  };
  aria.onDownloadStart = downloadStart;
  aria.onDownloadComplete = downloadComplete;
  aria.onBtDownloadComplete = downloadComplete;
  aria.onDownloadError = function (e) {
    downloadComplete(e, err)
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
  if (aria && e[1]) {
    aria.addUri([e[1], {
      header: config.enableCookie ? 'Cookie: ' + e[3] : '',
      "user-agent": config.userAgent
    }])
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
  if (null !== e.url && config.enableTypefiles ? !isCommandPressed : isCommandPressed) {
    let a = e.url.substr(e.url.lastIndexOf(".") + 1);
    a = a.toLowerCase();
    for (let n = 0; n < fileTypes.length; n++) {
      if (a === fileTypes[n] || isShiftPressd) {
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

        break
      }
    }
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
