/**
 * Created by liukai on 2017/6/20.
 */
export default {
  getConfig(){
    let isDebug = process.env.NODE_ENV !== 'production';
    return !isDebug ? safari.extension.globalPage.contentWindow.s2a : {
      config: {
        refreshTime: 5,
      },
      isDebug:isDebug,
      getConfig: function () {
      },
      aria2Connects: {
        "https://token:123456@127.0.0.1:6800/jsonrpc": {
          aria2: '',
          rpc: {
            name: 'mac',
            url: 'https://token:123456@127.0.0.1:6800/jsonrpc'
          },
          push: true
        }
      }
    }
  }
}
