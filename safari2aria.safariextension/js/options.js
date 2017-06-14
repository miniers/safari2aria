var app;

function restoreOptions () {
  var config = localStorage.getItem("safari2aria");
  try{
    config = JSON.parse(config || "{}");
  }catch (err){
    config={};
  }
  app = new Vue({
    el: '#app',
    data: Object.assign({
      enableCookie:true,
      userAgent:"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_5) AppleWebKit/603.2.4 (KHTML, like Gecko) Version/10.1.1 Safari/603.2.4",
      catchIframe:true,
      enableTypefiles:true,
      defaultRpcIndex: 0,
      filetypes:"mp4 flv m4v asf mpeg mkv mpg divx div 3gp wmv avi mov vob ogg ogv webm flac m4a mp3 aac wma wav ape exe app pkg zip rar dmg iso 7z jpg png jpeg tiff gif bmp pdf epub pages pptx keynote rtf doc docx",
      rpcList:[{
        name:'localhost',
        url:'http://127.0.0.1:6800/jsonrpc'
      }]
    },config),
    methods:{
      addRpc:function () {
        this.rpcList.push({
          name:'',
          url:''
        })
      },
      delRpc:function (index) {
        this.rpcList.splice(index,1)
      },
      save:function () {
        var config = JSON.parse(JSON.stringify(this.$data));
        safari.self.tab.dispatchMessage("updateSafari2Aria", config);
        window.close()
      }
    }
  });
}


document.addEventListener("DOMContentLoaded", restoreOptions);
