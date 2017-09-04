/**
 * Created by liukai on 2017/6/20.
 */
import _ from 'lodash'
import {Aria2} from '@/pages/global/aria2'

let aria2Connects={
  "https://token:880531lk@mac.lk.mk:6800/jsonrpc": {
    aria2: '',
    rpc: {
      name: 'mac',
      url: 'https://token:880531lk@mac.lk.mk:6800/jsonrpc'
    },
    push: true
  },
  "https://token:880531lk@n.lk.mk:6801/jsonrpc": {
    aria2: '',
    rpc: {
      name: 'nas',
      url: 'https://token:880531lk@n.lk.mk:6801/jsonrpc'
    },
    push: true
  }
}
function disconnect(s2a){
  let {aria2Connects} = s2a?s2a.getConfig():{aria2Connects:false};

  if (aria2Connects) {
    let aria2Connects = aria2Connects
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
    if(isDebug&&options.s2a){
      disconnect(options.s2a)
    }
    let s2a = !isDebug ? _.get(safari,'extension.globalPage.contentWindow.s2a',{}) : {
      isDebug: isDebug,
      getConfig: function () {
        return {
          config: {
            refreshTime: 1,
            userAgent:'netdisk;5.3.4.5;PC;PC-Windows;5.1.2600;WindowsBaiduYunGuanJia'
          },
          aria2Connects: aria2Connects
        }
      }
    };
    if(s2a.getConfig){
      let {aria2Connects} = s2a.getConfig();
      isDebug && !options.not_connect && _.forEach(aria2Connects, (con, url) => {
        let optionMatch = url&&url.match(/^(http|ws)(s)?(?:\:\/\/)(token\:[^@]*)?@?([^\:\/]*)\:?(\d*)(\/[^\/]*)/);
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
      });
    }
    return s2a;
  }
}
