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
    data: {
      enableTypefiles:true,
      filetypes:config.filetypes?config.filetypes:"mp4 flv m4v asf mpeg mkv mpg divx div 3gp wmv avi mov vob ogg ogv webm flac m4a mp3 aac wma wav ape exe app pkg zip rar dmg iso 7z jpg png jpeg tiff gif bmp pdf epub pages pptx keynote rtf doc docx",
      rpcList:config.rpcList?config.rpcList:[{
        name:'localhost',
        url:'http://127.0.0.1:6800/jsonrpc'
      }]
    },
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
        safari.self.tab.dispatchMessage("updateSafari2Aria", {
          enableTypefiles:this.enableTypefiles,
          filetypes:this.filetypes,
          rpcList:this.rpcList
        });
        window.close()
      }
    }
  });
}


document.addEventListener("DOMContentLoaded", restoreOptions);
