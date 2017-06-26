/**
 * Created by liukai on 2017/6/21.
 */
import messagesAction from '@/public/pageScriptMessage'

import run from '@/public/runInPage'

function disableBaiduLimit () {
  var tmpConfig = window.mDisableBaiduLimit;
  window.mDisableBaiduLimit = true;
  var errmsg_1 = '浏览器window.navigator属性修改失败，自动尝试方案2。';
  var errmsg_2 = '无法修改浏览器window.navigator，这将影响屏蔽功能。';
  var platform = window.navigator.platform;
  var userAgent = window.navigator.userAgent;

  try {
    Object.defineProperty(window.navigator, 'platform', {
      get: function () {
        return window.mDisableBaiduLimit?'Android':platform;
      }
    });
    Object.defineProperty(window.navigator, 'userAgent', {
      get: function () {
        return window.mDisableBaiduLimit?'Android':userAgent;
      }
    });
  } catch (e) {
  }
  checkNav();
  function checkNav () {
    if (window.navigator.platform !== 'Android') {//
      console.log(errmsg_1);
      try {
        window.navigator.__defineGetter__('platform', function () {
          return window.mDisableBaiduLimit?'Android':platform;
        });
        window.navigator.__defineGetter__('userAgent', function () {
          return window.mDisableBaiduLimit?'Android':userAgent;
        });
      } catch (e) {
      }
      if (window.navigator.platform !== 'Android') {
        console.log(errmsg_2);
      }
    }
    window.mDisableBaiduLimit = tmpConfig;
  }
}

function getExtConfig (config) {
  console.log('disableBaiduLimit:',config.disableBaiduLimit);
  window.mDisableBaiduLimit = config.disableBaiduLimit;
}


if (window.top === window && location.href.match(/baidu/)) {
  run(disableBaiduLimit);
  messagesAction({
    send:[{
      name:'getConfig',
      params:''
    }],
    listeners:[
      {
        name:'sendToEndScript',
        cb:function (config) {
          //console.log('getConfig:',config);
          run(getExtConfig,{
            disableBaiduLimit:config.disableBaiduLimit
          });
        }
      }
    ]
  })
}

