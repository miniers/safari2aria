/**
 * Created by liukai on 2017/6/23.
 */
export default function downloadAble(url, config = {}, keypress = {}) {

  let _url;
  try {
    _url = new URL(url);
  } catch (e) {
    return false;
  }

  const { pathname, protocol } = _url;

  //通过cmd来切换自动拦截状态
  if (!keypress[82] && config.enableTypefiles ? !keypress.isCommandPressed : keypress.isCommandPressed) {
    if (protocol === "magnet:") {
      return true;
    }

    //如果按着shift则会强行拦截下载
    if(keypress.isShiftPressd){
      return true
    }
    
    // 如果 pathname 没有"."，提前返回false
    if(!pathname.includes(".")){
      return false;
    }

    //判断 pathname 中文件后缀是否在配置内
    const pathname_lowercase = pathname.toLowerCase();
    return config.filetypes
      ? config.filetypes
          .toLowerCase()
          .split(/\s+/)
          .map(filetype => "." + filetype)
          .some(ext => pathname_lowercase.endsWith(ext))
      : false;
  }

  return false;
}
