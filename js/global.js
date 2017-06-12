function openPreferences (e) {
  "showOptions" === e.key && (safari.application.activeBrowserWindow.openTab().url = safari.extension.baseURI + "options.html", optionsEvent = e)
}
function restoreOptions () {
  config = localStorage.getItem("safari2aria");
  try{
    config = JSON.parse(config || "{}");
  }catch (err){
    config={};
  }
  fileTypes = config.filetypes? config.filetypes.split(" "):[];
  for (var a = 0; a < fileTypes.length; a++)fileTypes[a] = fileTypes[a].toLowerCase()
  rpcList = config.rpcList
}
function storageHandler (e) {
  if(e.name == "updateSafari2Aria"){
    localStorage.setItem("safari2aria", JSON.stringify(e.message));
    restoreOptions()
  }
}
function handleCommand (e) {
  var n = [e.command].concat(e.userInfo);
  safari.application.activeBrowserWindow.activeTab.page.dispatchMessage("sendToAria2", n)
}
function validateCommand (e) {
  if ("DownloadWithAria2" === e.command) {
    var a = e.userInfo;
    (a && a.length && a[0]) || (e.target.disabled = !0)
  }
}
function handleNavigation (e) {
  if (null !== e.url && config.enableTypefiles) {
    var a = e.url.substr(e.url.lastIndexOf(".") + 1);
    a = a.toLowerCase();
    for (var n = 0; n < fileTypes.length; n++)if (a === fileTypes[n]) {
      e.preventDefault();
      var t = [
        rpcList[0].url,
        e.url,
        e.target.url
      ];
      safari.application.activeBrowserWindow.activeTab.page.dispatchMessage("sendToAria2", t);
      break
    }
  }
}

function handleContextMenu(event) {
  rpcList.forEach(function (rpc,index) {
    event.contextMenu.appendContextMenuItem(rpc.url, ['发送至',rpc.name].join(''));
  });
}

var config;
var fileTypes = [];
var rpcList = [];
document.addEventListener("DOMContentLoaded", restoreOptions);
safari.application.addEventListener("message", storageHandler, !1);
safari.extension.settings.addEventListener("change", openPreferences, !1);
safari.application.addEventListener("command", handleCommand, !1);
safari.application.addEventListener("validate", validateCommand, !1);
safari.application.addEventListener("beforeNavigate", handleNavigation, !1);
safari.application.addEventListener("contextmenu", handleContextMenu, false);
