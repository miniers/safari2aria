<template>
  <div>
    <x-header :left-options="{showBack: false}">{{$t('Setting')}}</x-header>
    <group >
      <selector :title="$t('Language')" :options="languageList" v-model="language"></selector>
    </group>
    <group>
      <x-switch :title="$t('Auto intercept')" v-model="enableTypefiles"></x-switch>
      <x-textarea :title="$t('File type')" v-show="enableTypefiles" v-model="filetypes"></x-textarea>
    </group>
    <group>
      <cell :title="$t('Aria2 Address')">
        <x-button @click.native="addRpc" mini>{{$t('Add')}}</x-button>
      </cell>
      <div class="cell rpcList">
        <flexbox class="header">
          <flexbox-item :span="1/20">
            {{$t('Default')}}
          </flexbox-item>
          <flexbox-item :span="1/20">
            {{$t('Push')}}
          </flexbox-item>
          <flexbox-item :span="5/20">
            {{$t('Name')}}
          </flexbox-item>
          <flexbox-item>
            {{$t('Url')}}
          </flexbox-item>
          <div class="action">{{$t('Action')}}</div>
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
          <x-button @click.native="delRpc(index)" v-if="rpcList.length>1" mini>{{$t('Delete')}}</x-button>

        </flexbox>
      </div>
    </group>
    <group :title="$t('Auxiliary Settings')">
      <x-switch :title="$t('Enable cookie')" v-model="enableCookie"></x-switch>
      <x-switch :title="$t('Catch iframe')" v-model="catchIframe"></x-switch>
      <x-textarea title="User-agent" :show-clear="false" v-model="userAgent"></x-textarea>
    </group>
    <group :title="$t('Download popover')">
      <x-input :title="$t('Refresh interval')" class="right_input" type="number" :show-clear="false" v-model="refreshTime">
        <span slot="right">{{$t('s')}}</span>
      </x-input>
      <x-switch :title="$t('Enable bitfield chart')" v-model="enableChart"></x-switch>
    </group>
    <group :title="$t('Offline download')">
      <x-switch :title="$t('xunlei')" v-model="enableXunleiLixian"></x-switch>
      <x-switch :title="$t('baidu')" v-model="enableBaiduLixian"></x-switch>
    </group>
    <group>
      <x-button @click.native="save(index)" >{{$t('Save')}}</x-button>
    </group>
  </div>
</template>

<script>
  import Radio from '@/components/Radio.vue'
  import {XHeader,Selector,Group,XInput,XTextarea,CheckIcon,Flexbox,FlexboxItem, XButton, XSwitch, Cell} from 'vux'

  export default {
    components: {
      XHeader,
      Group,
      Selector,
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
    i18n: { // `i18n` option
      messages: {
        'zh-CN': {
          Setting:'设置',
          'Auto intercept': '自动拦截',
          'File type':'文件类型',
          'Aria2 Address':'aria2服务器地址',
          'Add':'新增',
          'Default':'默认',
          'Push':'推送',
          'Name':'名称',
          'Url':'地址',
          'Action':'操作',
          'Delete':'删除',
          'Auxiliary Settings':'辅助设置',
          'Enable cookie':'启用cookie',
          'Catch iframe':'启用iframe拦截',
          'Download popover':'下载队列浮窗',
          'Refresh interval':'列表刷新间隔',
          's':'秒',
          'Save':'保存',
          'xunlei':'迅雷离线',
          'baidu':'百度离线',
          'Offline download':'右键离线下载菜单',
          'Enable bitfield chart':'启用文件分块图表',
        }
      }
    },
    data () {
      let config = localStorage.getItem("safari2aria");
      try {
        config = JSON.parse(config || "{}");
      } catch (err) {
        config = {};
      }
      if(config.language){
        this.$i18n.locale = config.language
      }
      return Object.assign({
        enableCookie: true,
        userAgent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_5) AppleWebKit/603.2.4 (KHTML, like Gecko) Version/10.1.1 Safari/603.2.4",
        catchIframe: true,
        enableTypefiles: true,
        enableXunleiLixian: true,
        languageList: [
          {key: 'en', value: 'English'},
          {key: 'zh-CN', value: '中文'}
        ],
        language: navigator.language,
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
    watch: {
      language (val) {
        this.$i18n.locale = val
      }
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
