import toastr from 'mini-toastr'
import bdlx from './baiduLixian'
import downloadAble from '@/public/downloadAble'
import messageListener from '@/public/pageScriptMessage'
import runJs from '@/public/runInPage'


if (window.top === window) {
  (function () {

    var mObserver;
    var config;
    var keyPressed = {};
    let i18n={
      'zh-CN':{
        'Success switch the default download service to':'成功切换默认下载服务至',
        'The current download service is':'当前下载服务为',
     }
    };
    function getText (text,options={}) {
      let lang = config.language || navigator.language;
      if(i18n[lang]&&i18n[lang][text]){
        return [i18n[lang][text],' '].join('');
      }else{
        return options.notfailback?'':[text,' '].join('')
      }
    }
    function selectedLinks () {
      var sel = window.getSelection().toString();
      if (sel.match(/^https?/) || sel.match(/magnet:/)) {
        return sel;
      }
      return null
    }

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
    function setExtWinConfig (config) {
      console.log('disableBaiduLimit:',config.disableBaiduLimit);
      window.mDisableBaiduLimit = config.disableBaiduLimit;
    }


    function handleMessage (e) {
      messageListener({
        send:[{
          name:'getConfig'
        }],
        listeners:[
          {
            name:"changeRpc",
            cb:function (message) {
              toastr.success(getText('Success switch the default download service to') + message);
            }
          },
          {
            name:"currentRpc",
            cb:function (message) {
              toastr.success(getText('The current download service is') + message);
            }
          },
          {
            name:"showMassage",
            cb:function (message) {
              toastr[message.action || "success"](message.text, message.title);
            }
          },
          {
            name:"baiduLixian",
            cb:function (message) {
              if (location.href.match(/^https?:\/\/pan\.baidu\.com/)) {
                bdlx(message.url)
              }
            }
          },
          {
            name:"updateConfig",
            background:true,
            cb:function (message) {
              config = message;
              catchIframe();
              safari.self.tab.dispatchMessage("documentReady", {
                cookie: document.cookie
              });
              //百度网盘取消限制
              location.href.match(/baidu/) && runJs(setExtWinConfig,{
                disableBaiduLimit:config.disableBaiduLimit
              });
            }
          }
        ]
      })

    }

    function handleContextMenu (e) {
      var n = [
        linkForTarget(e.target) || selectedLinks(),
        document.location.href,
        document.cookie
      ];
      safari.self.tab.setContextMenuEventUserInfo(e, n)
    }

    function catchIframe () {
      if (mObserver) {
        if (!config.catchIframe) {
          mObserver.disconnect();
        }
        return
      }
      if (config.catchIframe) {
        mObserver = new MutationObserver(function (mutations) {
          mutations.some(function (mutation) {
            if (mutation.target.tagName === "IFRAME" && mutation.type === 'attributes' && mutation.attributeName === 'src' && downloadAble(mutation.target.src,config,keyPressed)) {
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
      keyPressed = {};
      sendKeyPressEvent()
    };

    function sendKeyPressEvent () {
      keyPressed.isCommandPressed=!!keyPressed[91];
      keyPressed.isShiftPressd=!!keyPressed[16];
      keyPressed.isOptionPressd=!!keyPressed[18];
      safari.self.tab.dispatchMessage("keyPress", {
        keyPressed
      });
    }


    function init () {
      toastr.init({
        appendTarget: document.body,
        timeout: 5000
      });

      document.addEventListener("contextmenu", handleContextMenu, !1);
      handleMessage();

      //safari.self.addEventListener("message", handleMessage, !1);
      sendKeyPressEvent();
    }

    init()

  })()
}
