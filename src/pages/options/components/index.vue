<template>
  <div>
    <x-header :left-options="{showBack: false}">设置</x-header>
    <group>
      <x-switch title="自动拦截" v-model="enableTypefiles"></x-switch>
      <x-textarea title="文件类型" v-show="enableTypefiles" v-model="filetypes"></x-textarea>
      <!--<x-input title="自动拦截文件类型" v-model="filetypes"></x-input>-->
    </group>
    <group>
      <cell title="aria2服务器地址:">
        <x-button @click.native="addRpc" mini>增加</x-button>
      </cell>
      <div class="cell rpcList">
        <flexbox class="header">
          <flexbox-item :span="1/20">
            默认
          </flexbox-item>
          <flexbox-item :span="1/20">
            推送
          </flexbox-item>
          <flexbox-item :span="5/20">
            名称
          </flexbox-item>
          <flexbox-item>
            地址
          </flexbox-item>
          <div class="action">操作</div>
        </flexbox>
        <flexbox v-for="(rpc,index) in rpcList" :key="index">
          <flexbox-item :span="1/20">
            <Radio :val="index" :value.sync="defaultRpcIndex" />
          </flexbox-item>
          <flexbox-item :span="1/20">
            <check-icon :value.sync="rpc.push" />
          </flexbox-item>
          <flexbox-item class="name" :span="4/20">
            <x-input :show-clear="false" v-model="rpc.name"></x-input>
          </flexbox-item>
          <flexbox-item class="url">
            <x-input :show-clear="false" v-model="rpc.url"></x-input>
          </flexbox-item>
          <x-button @click.native="delRpc(index)" v-if="rpcList.length>1" mini>删除</x-button>

        </flexbox>
      </div>
    </group>
    <group title="辅助设置">
      <x-switch title="启用cookie" v-model="enableCookie"></x-switch>
      <x-switch title="启用iframe拦截" v-model="catchIframe"></x-switch>
      <x-textarea title="user-agent" :show-clear="false" v-model="userAgent"></x-textarea>
    </group>
    <group title="下载队列浮窗">
      <x-input title="列表刷新间隔" class="right_input" type="number" :show-clear="false" v-model="refreshTime">
        <span slot="right">秒</span>
      </x-input>
      <x-switch title="启用文件分块图表" v-model="enableChart"></x-switch>
    </group>
    <group title="右键离线下载菜单">
      <x-switch title="迅雷离线" v-model="enableXunleiLixian"></x-switch>
      <x-switch title="百度离线" v-model="enableBaiduLixian"></x-switch>
    </group>
    <group>
      <x-button @click.native="save(index)" >保存</x-button>
    </group>
  </div>
</template>

<script>
  import Radio from '@/components/Radio.vue'
  import {XHeader,Group,XInput,XTextarea,CheckIcon,Flexbox,FlexboxItem, XButton, XSwitch, Cell} from 'vux'

  export default {
    components: {
      XHeader,
      Group,
      XInput,
      XTextarea,
      CheckIcon,
      Flexbox,
      FlexboxItem,
      XButton,
      XSwitch,
      Cell,
      Radio
    },
    data () {
      let config = localStorage.getItem("safari2aria");
      try {
        config = JSON.parse(config || "{}");
      } catch (err) {
        config = {};
      }
      return Object.assign({
        enableCookie: true,
        userAgent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_5) AppleWebKit/603.2.4 (KHTML, like Gecko) Version/10.1.1 Safari/603.2.4",
        catchIframe: true,
        enableTypefiles: true,
        enableXunleiLixian: true,
        enableBaiduLixian: true,
        enableChart: false,
        baidupanAutoRestart: false,
        baidupanLimitSpeed: 1000,
        defaultRpcIndex: 0,
        refreshTime:5,
        filetypes: "mp4 flv m4v asf mpeg mkv mpg divx div 3gp wmv avi mov vob ogg ogv webm flac m4a mp3 aac wma wav ape exe app pkg zip rar dmg iso 7z jpg png jpeg tiff gif bmp pdf epub pages pptx keynote rtf doc docx",
        rpcList: [{
          name: 'localhost',
          push:false,
          url: 'http://127.0.0.1:6800/jsonrpc'
        }]
      }, config)
    },
    methods: {
      addRpc: function () {
        this.rpcList.push({
          name: 'localhost',
          push:false,
          url: 'http://127.0.0.1:6800/jsonrpc'
        })
      },
      delRpc: function (index) {
        this.rpcList.splice(index, 1)
      },
      save: function () {
        var config = JSON.parse(JSON.stringify(this.$data));
        safari.self.tab.dispatchMessage("updateSafari2Aria", config);
        window.close()
      }
    }
  }
</script>

<style lang="less">
  .cell{
    padding:0 15px;

  }
  .right_input{
    .weui-cell__primary{
      padding-right: 5px;
    }
    input{
      text-align: right;
    }
  }
  .rpcList{
    .header{
      text-align: center;
      .action{
        padding:0 1em;
      }
    }
    .vux-flexbox-item{
      display: flex;
      justify-content:center;
    }
    .vux-x-input{
      width: 100%;
    }
  }
</style>
