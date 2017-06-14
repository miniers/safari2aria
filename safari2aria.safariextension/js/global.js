var config = {
  defaultRpcIndex: 0
};
var cookie;
var isCommandPressed, isShiftPressd, isOptionPressd;
var fileTypes = [];
var rpcList = [];

var ARIA2 = (function () {
  var jsonrpc_version = '2.0';

  function get_auth (url) {
    return url.match(/^(?:(?![^:@]+:[^:@\/]*@)[^:\/?#.]+:)?(?:\/\/)?(?:([^:@]*(?::[^:@]*)?)?@)?/)[1];
  }

  function request (jsonrpc_path, method, params, cb) {
    var xhr = new XMLHttpRequest();
    var auth = get_auth(jsonrpc_path);
    jsonrpc_path = jsonrpc_path.replace(/^((?![^:@]+:[^:@\/]*@)[^:\/?#.]+:)?(\/\/)?(?:(?:[^:@]*(?::[^:@]*)?)?@)?(.*)/, '$1$2$3'); // auth string not allowed in url for firefox

    var request_obj = {
      jsonrpc: jsonrpc_version,
      method: method,
      id: (new Date()).getTime().toString(),
    };
    if (params) request_obj['params'] = params;
    if (auth && auth.indexOf('token:') == 0) params.unshift(auth);

    xhr.open("POST", jsonrpc_path + "?tm=" + (new Date()).getTime().toString(), true);
    xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded; charset=UTF-8");
    if (auth && auth.indexOf('token:') != 0) {
      xhr.setRequestHeader("Authorization", "Basic " + btoa(auth));
    }
    xhr.send(JSON.stringify(request_obj));
    xhr.onreadystatechange = function () {
      if (xhr.readyState === 4) {
        if (xhr.status === 200) {
          cb && cb()
        } else {
          console.log('failed');
          cb & cb("err");
        }
      }
    }
  }

  return function (jsonrpc_path) {
    this.jsonrpc_path = jsonrpc_path;
    this.addUri = function (uri, options, cb) {
      request(this.jsonrpc_path, 'aria2.addUri', [[uri,], options], cb);
    };
    return this;
  }
})();

function sendToAria2 (e) {
  var aria = ARIA2(e[0].url);
  if (e[1]) {
    aria.addUri(e[1], {
      header: config.enableCookie?'Cookie: ' + e[3]:'',
      "user-agent":config.userAgent
    }, function (err) {
      if (err) {
        showToast("showMassage", {
          action: 'error',
          text: ['添加到', e[0].name, '失败'].join('')
        });
      } else {
        showToast("showMassage", {
          action: 'success',
          text: ['添加到', e[0].name, '成功'].join('')
        });
      }
    });
  }
}

function openPreferences (e) {
  "showOptions" === e.key && (openOptions(), optionsEvent = e)
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
  for (var a = 0; a < fileTypes.length; a++)fileTypes[a] = fileTypes[a].toLowerCase()
  rpcList = config.rpcList;
  safari.application.activeBrowserWindow.activeTab.page.dispatchMessage('receiveConfig', config);
}
function messageHandler (e) {
  if (e.name === "updateSafari2Aria") {
    localStorage.setItem("safari2aria", JSON.stringify(e.message));
    restoreOptions()
  }
  if (e.name === "keyPress") {
    keyPressAction(e.message)
  }
  if (e.name === "setCookie") {
    cookie = e.message.cookie;
  }
  if (e.name === "getConfig") {
    safari.application.activeBrowserWindow.activeTab.page.dispatchMessage('receiveConfig', config);
  }
  if (e.name === "downloadFromIframe" && !isCommandPressed) {
    var t = [
      rpcList[config.defaultRpcIndex],
      e.message.url,
      e.target.url,
      e.message.cookie
    ];
    sendToAria2(t);
  }
}
function showToast (type, msg) {
  safari.application.activeBrowserWindow.activeTab.page.dispatchMessage(type, msg);
}
function keyPressAction (keys) {
  var keyPressed = keys.keyPressed || {};
  isCommandPressed = keyPressed[91];
  isShiftPressd = keyPressed[16];
  isOptionPressd = keyPressed[18];
  if (isShiftPressd && isOptionPressd) {
    for (var i = 49; i <= 57 && i - 49 < rpcList.length; i++) {
      if (keyPressed[i]) {
        config.defaultRpcIndex = i - 49;
        messageHandler({
          name: 'updateSafari2Aria',
          message: config
        });
        showToast("changeRpc", rpcList[config.defaultRpcIndex].name);
        break;
      }
    }
    if (keyPressed[192]) {
      showToast("currentRpc", rpcList[config.defaultRpcIndex].name);
    }
    if (keyPressed[188]) {
      openOptions();
    }
  }

}
function handleCommand (e) {
  if(e.command === "showOptions"){
    openOptions();
  }else{
    var index = e.command.split('.')[1];
    var rpc = index && rpcList[index] ? rpcList[index] : rpcList[0];
    var n = [rpc].concat(e.userInfo);
    sendToAria2(n)
  }
}
function validateCommand (e) {
  var match = e.command && e.command.match(/^DownloadWithAria2/);
  if (match && match.length >= 0) {
    var a = e.userInfo;
    (a && a.length && a[0]) || (e.target.disabled = !0)
  }
}
function handleNavigation (e) {
  if (null !== e.url && config.enableTypefiles ? !isCommandPressed : isCommandPressed) {
    var a = e.url.substr(e.url.lastIndexOf(".") + 1);
    a = a.toLowerCase();
    for (var n = 0; n < fileTypes.length; n++) {
      if (a === fileTypes[n] || isShiftPressd) {
        e.preventDefault();
        var t = [
          rpcList[config.defaultRpcIndex],
          e.url,
          e.target.url,
          cookie
        ];
        sendToAria2(t);
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
