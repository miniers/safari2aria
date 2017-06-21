/**
 * Created by liukai on 2017/6/20.
 */
import _ from 'lodash'
import {Aria2} from '@/pages/global/aria2'
function disconnect(s2a){
  if (s2a && s2a.aria2Connects) {
    let aria2Connects = s2a.aria2Connects
    for (let key in aria2Connects) {
      //如果开启推送则需要关闭ws连接
      let aria = aria2Connects[key].aria2;
      if (aria && aria.socket) {
        if (aria.socket.readyState === 1) {
          aria.close()
        }
        if (aria.socket.readyState === 0) {
          aria.socket.onopen = () => {
            aria.close();
          }
        }
      }
    }
  }
}
export default {

  getConfig(options = {}){
    let isDebug = process.env.NODE_ENV !== 'production';
    if(isDebug){
      disconnect(options.s2a)
    }
    let s2a = !isDebug ? safari.extension.globalPage.contentWindow.s2a : {
      config: {
        refreshTime: 1,
      },
      isDebug: isDebug,
      getConfig: function () {
      },
      aria2Connects: {
        "https://token:123456@127.0.0.1:6800/jsonrpc": {
          aria2: '',
          rpc: {
            name: 'mac',
            url: 'token:123456@127.0.0.1:6800/jsonrpc'
          },
          push: true
        }
      }
    };
    isDebug && !options.not_connect && _.forEach(s2a.aria2Connects, (con, url) => {
      let optionMatch = url.match(/^(http|ws)(s)?(?:\:\/\/)(token\:[^@]*)?@?([^\:\/]*)\:?(\d*)(\/[^\/]*)/);
      let options = {
        host: optionMatch[4],
        port: optionMatch[5] || 6800,
        secure: !!(optionMatch && optionMatch[2]),
        secret: optionMatch[3] ? optionMatch[3].split(':')[1] : '',
        path: optionMatch[6] || '/jsonrpc'
      };
      con.aria2 = new Aria2(options)
      if (con.push) {
        con.aria2.open();
      }
    })
    return s2a;
  }
}
