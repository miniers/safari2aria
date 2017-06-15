if (window.top === window){(function () {

  var mObserver;
  var config;
  var keyPressed = {};

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
    if (e.name === "receiveConfig") {
      config = e.message || {};
      catchIframe();
    }
    if(e.message && e.message.hasCb){
      safari.self.tab.dispatchMessage([e.name,'cb'].join('_'), {
        cookie: document.cookie
      });
    }
  }

  function handleContextMenu (e) {
    var n = [
      linkForTarget(e.target),
      document.location.href,
      document.cookie
    ];
    safari.self.tab.setContextMenuEventUserInfo(e, n)
  }

  function catchIframe () {
    if (mObserver) {
      if(!config.catchIframe){
        mObserver.disconnect();
      }
      return
    }
    if (config.catchIframe) {
      mObserver = new MutationObserver(function (mutations) {
        mutations.some(function (mutation) {
          if (mutation.target.tagName === "IFRAME" && mutation.type === 'attributes' && mutation.attributeName === 'src') {
            if (mutation.target.src.match(/^https:\/\/127\.0\.0\.1\//)) {
              return false
            } else {
              safari.self.tab.dispatchMessage("downloadFromIframe", {
                url: mutation.target.src,
                cookie: document.cookie
              });
              mutation.target.src = "https://127.0.0.1/";
            }
            return false;
          }
          return false;
        });
      });
      mObserver.observe(document.body, {
        attributes: true,
        attributeFilter: ['src'],
        attributeOldValue: true,
        characterData: false,
        characterDataOldValue: false,
        childList: false,
        subtree: true
      });
    }
  }

  document.onkeydown = function (event) {
    var unicode = event.charCode ? event.charCode : event.keyCode;
    keyPressed[unicode] = true;
    //console.log('onkeydown:',keyPressed);
    sendKeyPressEvent()
  };

  document.onkeyup = function (event) {
    var unicode = event.charCode ? event.charCode : event.keyCode;
    delete keyPressed[unicode];
    sendKeyPressEvent()
  };
  window.onblur = function (event) {
    keyPressed={};
    sendKeyPressEvent()
  };

  function sendKeyPressEvent () {
    safari.self.tab.dispatchMessage("keyPress", {
      keyPressed: keyPressed
    });
  }



  function init () {
    miniToastr.init({
      appendTarget: document.body,
      timeout: 5000
    });
    safari.self.tab.dispatchMessage("getConfig");

    document.addEventListener("contextmenu", handleContextMenu, !1);


    safari.self.addEventListener("message", handleMessage, !1);

    sendKeyPressEvent();
  }

  init()

})()}