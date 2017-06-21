/**
 * Created by liukai on 2017/6/21.
 */
function disableBaiduLimit () {
  if (location.href.match(/baidu/)) {
    var errmsg_1 = '浏览器window.navigator属性修改失败，自动尝试方案2。';
    var errmsg_2 = '无法修改浏览器window.navigator，这将影响屏蔽功能。';
    try {
      Object.defineProperty(window.navigator, 'platform', {
        get: function () {
          return 'Android';
        }
      });
    } catch (e) {
    }
    checkNav();

    function checkNav () {
      if (window.navigator.platform != 'Android') {//
        console.log(errmsg_1);
        try {
          window.navigator.__defineGetter__('platform', function () {
            return 'Android';
          });
        } catch (e) {
        }
        if (window.navigator.platform != 'Android') {
          console.log(errmsg_2);
        }
      }
    }
  }
}
var script = document.createElement( 'script' );
script.type = 'text/javascript';
script.innerHTML = [disableBaiduLimit.toString(),[disableBaiduLimit.name,'()'].join('')].join(';');
document.documentElement.appendChild(script)
