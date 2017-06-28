/**
 * Created by liukai on 2017/6/23.
 */
export default function downloadAble (url, config = {}, keypress = {}) {
  //通过cmd来切换自动拦截状态
  if (url && !keypress[82] && config.enableTypefiles ? !keypress.isCommandPressed : keypress.isCommandPressed) {
    if (url.match(/magnet:[^\\"]+/)) {
      return true
    }
    let a = url.substr(url.lastIndexOf(".") + 1);
    a = a.toLowerCase();
    let fileTypes = config.filetypes ? config.filetypes.split(" ") : [];
    //如果按着shift则会强行拦截下载
    if(keypress.isShiftPressd){
      return true
    }
    //判断url中文件后缀是否在配置内
    for (let n = 0; n < fileTypes.length; n++) {
      if (a === fileTypes[n].toLowerCase()) {
        return true
      }
    }
  }
}
