/**
 * Created by liukai on 2017/6/23.
 */
//定时判断dom是否加载成功
function getItem (sel, display) {
  let count = 0;
  return new window.Promise((resolve, reject)=>{
    let getBySel = (sel) => {
      let item = document.querySelector(sel);
      if (item && display ? item.style.display != "none" : true) {
        resolve(item);
        return true
      }
      count++;
      if (count > 20) {
        reject(false)
        return true;
      }
      return false;
    };
    let getTimer = setInterval((() => {
      getBySel(sel) && clearInterval(getTimer);
    }), 500)
  })
}


function beginOffline (offLink,curlink) {
  offLink.value = curlink;
  let isBt = /^magnet|torrent$/.test(offLink.value);
  $("#newoffline-dialog").find("span:contains('确定')[class='text']").click();
  if (isBt) {
    getItem('#offlinebtlist-dialog', true)
      .then((btList) => {
        if ($(".content-title-name").html() == "文件名") $("a.checked-all")[0].click();
        btList.querySelectorAll('.dialog-footer>.g-button')[1].click();
      })
  }

  let ckeckEnd = function () {
    getItem("#offlinelist-dialog", true)
      .then(() => {
        beginOffline();
      })
    getItem("#dialog1", true)
      .then((tiem) => {
        let inputCode = tiem.find(".input-code"), bck;
        inputCode.focus();
        bck = setInterval(function () {
          if (inputCode.val().length == 4) {
            clearInterval(bck);
            $("#dialog1").find("span:contains('确定')[class='text']").click();
            ckeckEnd();
          }
        }, 200);
      })
  };
  ckeckEnd();
};


export default function (url) {
  document.querySelector('.g-button[data-button-id=b13]').click();
  getItem("#_disk_id_2")
    .then((newTaskBtn) => {
      newTaskBtn.click();
      return getItem('#share-offline-link')
    }).then((offLink) => {
    beginOffline(offLink,url)
  })
}
