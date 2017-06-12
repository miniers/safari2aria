var ARIA2 = (function() {
  var jsonrpc_version = '2.0';

  function get_auth(url) {
    return url.match(/^(?:(?![^:@]+:[^:@\/]*@)[^:\/?#.]+:)?(?:\/\/)?(?:([^:@]*(?::[^:@]*)?)?@)?/)[1];
  };

  function request(jsonrpc_path, method, params,cb) {
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

    xhr.open("POST", jsonrpc_path+"?tm="+(new Date()).getTime().toString(), true);
    xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded; charset=UTF-8");
    if (auth && auth.indexOf('token:') != 0) {
      xhr.setRequestHeader("Authorization", "Basic "+btoa(auth));
    }
    xhr.send(JSON.stringify(request_obj));
    xhr.onreadystatechange = function() {
      if (xhr.readyState === 4) {
        if (xhr.status === 200) {
          cb&&cb()
        } else {
          console.log('failed');
          cb&cb("err");
        }
      }
    }
  };

  return function(jsonrpc_path) {
    this.jsonrpc_path = jsonrpc_path;
    this.addUri = function (uri, options,cb) {
      request(this.jsonrpc_path, 'aria2.addUri', [[uri, ], options],cb);
    };
    return this;
  }
})();


safe_title = function safe_title(title) {
  return title.replace(/[\\\|\:\*\"\?\<\>]/g, "_");
};
function linkForTarget (e) {
  return "BODY" === e.tagName ? null : e.href ? e.href : e.parentNode ? linkForTarget(e.parentNode) : void 0
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
function sendToAria2 (e) {
  var aria = ARIA2(e[0]);
  if (e[1]) {
    aria.addUri(e[1], {
      header: 'Cookie: ' + document.cookie
    },function (err) {
      if(err){
        miniToastr.error('添加到aria2失败')
      }else{
        miniToastr.success('添加到aria2成功')
      }
    });
  }
}

function handleMessage (e) {
  if ("sendToAria2" === e.name && e.message[2] === document.location.href){
    sendToAria2(e.message);
  }
}

function handleContextMenu (e) {

  var n = new Array;
  n[0] = linkForTarget(e.target);
  n[1] = document.location.href;
  n[2] = selectedLinks();
  safari.self.tab.setContextMenuEventUserInfo(e, n)
}
var rpcList=[];
miniToastr.init({
  appendTarget: document.body,
  timeout: 5000
});
document.addEventListener("contextmenu", handleContextMenu, !1);

safari.self.addEventListener("message", handleMessage, !1);