
function linkForTarget (e) {
  var result = null;
  if ("BODY" === e.tagName) {
    result = null
  } else if (e.tagName === "IMG" && e.src) {
    result = e.src
  } else if (e.href) {
    result = e.href
  } else if (e.parentNode) {
    result = linkForTarget(e.parentNode)
  }
  return result
}

function linksFromContainer (e) {
  var n = {};
  if (e.href) {
    var t = e.title || e.alt || e.innerText || e.textContent || "title";
    n[t] = e.href
  }
  for (var o = e.childNodes, r = 0; r < o.length; r++) {
    var a = this.linksFromContainer(o.item(r));
    if (null != a)
      for (t in a) n[t] = a[t]
  }
  return n
}

function selectedLinks () {
  var e = window.getSelection();
  if (e && e.rangeCount > 0) {
    var n = e.getRangeAt(0);
    if (n) {
      var t = n.commonAncestorContainer;
      if (t) {
        var o = linksFromContainer(t),
          r = e.toString(),
          a = [];
        for (var i in o)
          if (-1 != r.search(i)) {
            var s = o[i];
            "" != s && a.push(s)
          }
        return a
      }
    }
  }
  return null
}

function handleMessage (e) {
if (e.name === "changeRpc") {
    miniToastr.success('成功切换默认下载服务至' + e.message);
  }
  if (e.name === "currentRpc") {
    miniToastr.success('当前下载服务为' + e.message);
  }
  if (e.name === "showMassage") {
    miniToastr[e.message.action || "success"](e.message.text);
  }
}

function handleContextMenu (e) {

  var n = new Array;
  n[0] = linkForTarget(e.target);
  n[1] = document.location.href;
  n[2] = selectedLinks();
  safari.self.tab.setContextMenuEventUserInfo(e, n)
}


//handle command key
document.onkeydown = function (event) {
  var unicode = event.charCode ? event.charCode : event.keyCode;
  keyPressed[unicode] = true;
  sendKeyPressEvent()
};

document.onkeyup = function (event) {
  var unicode = event.charCode ? event.charCode : event.keyCode;
  keyPressed[unicode] = false;
  sendKeyPressEvent()
};

function sendKeyPressEvent () {
  safari.self.tab.dispatchMessage("keyPress", {
    keyPressed: keyPressed
  });
}

var keyPressed = {};
miniToastr.init({
  appendTarget: document.body,
  timeout: 5000
});
sendKeyPressEvent();
document.addEventListener("contextmenu", handleContextMenu, !1);

safari.self.addEventListener("message", handleMessage, !1);