/**
 * Created by liukai on 2017/6/26.
 */

export default function (config={}) {

  return new Promise((resolve, reject)=>{
    setTimeout(()=>{
      reject('timeout to get config')
    },10*1000);
    if(!window.extensionMessageListener){
      safari.self.addEventListener("message", (e)=>{
        let count=0;
        window.extensionMessageListener.forEach(function (listener) {
          if(e.name === listener.name){
            if(!document.hidden || listener.background){
              listener.cb&&listener.cb(e.message || {});
              resolve(e.message || {});
              count++;
            }
          }
        });
        if(!count){
          reject(document.hidden?'in background':'no listener')
        }
        if (e.message && e.message.hasCb) {
          safari.self.tab.dispatchMessage([e.name, 'cb'].join('_'), {
            cookie: document.cookie
          });
        }
      }, !1);
    }
    window.extensionMessageListener = [].concat(window.extensionMessageListener||[]).concat(config.listeners||[]);
    if(config.send){
      config.send.forEach(function (action) {
        safari.self.tab.dispatchMessage(action.name,action.params);
      })
    }
  })
}
