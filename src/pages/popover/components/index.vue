<template>
  <div class="pop_wrapper" v-hotkey="keymap">
    <x-header class="pop_header" :left-options="{showBack: false}" :right-options="{showMore:true}"
              @on-click-more="openOptionsPanel">
      <popmenu ref="popmenu" placement="bottom" @on-show="popmenuShow" @on-hide="popmenuHide">
        <div slot="content" class="selectRpcServer">
          <group>
            <cell @click.native="changeList({url:rpc.url})" :class="{acitve:rpc.url === currentServerUrl}"
                  v-for="rpc in serverList"
                  :key="rpc.url" :title="rpc.name"></cell>
          </group>
        </div>
        <div class="rpcServer">
          <button>{{currenServerName}}{{!globalStat ? '('+$t('ununited')+')' : ''}}</button>
          <i class="material-icons">{{popmenuIsShow ? 'keyboard_arrow_up' : 'keyboard_arrow_down'}}</i>
        </div>
      </popmenu>
    </x-header>
    <div class="globalStatus">
      <div class="control">
        <x-button mini plain v-show="taskLists.length>0" @click.native.stop="selecteAll()">
          <i class="material-icons" v-show="selectedGids.length===0">done_all</i>
          <i class="material-icons" v-show="selectedGids.length>0">cancel</i>
        </x-button>
        <div class="inner" v-show="selectedGids.length>0">
          <x-button mini plain @click.native.stop="startSelectedDownloads()"><i class="material-icons">play_arrow</i></x-button>
          <x-button mini plain @click.native.stop="pauseSelectedDownloads()"><i class="material-icons">pause</i></x-button>
          <x-button mini plain @click.native.stop="removeSelectedDownloads()"><i class="material-icons">delete_forever</i></x-button>
        </div>
        <x-button mini plain v-show="getStoppedTaskGid.length>0 && selectedGids.length===0" @click.native.stop="removeStoppedDownloads()">{{$t('Remove stopped')}}</x-button>
      </div>
      <div class="speed" :title="$t('Click to set global speed limit')" @click.nativ.stop="openAria2Options()">
        <div class="up" v-if="getGlobalStat.uploadSpeed>0">
          <i class="material-icons">arrow_upward</i>
          {{getGlobalStat.uploadSpeedText}}
        </div>
        <div class="down">
          <i class="material-icons">arrow_downward</i>
          {{getGlobalStat.downloadSpeedText}}
        </div>
      </div>
    </div>
    <task-list class="pop_list" :list="taskLists" @click.native.stop="setSelected({selected:[]})">

    </task-list>

    <x-dialog v-model="showOptions" hide-on-blur :scroll="false" class="dialog-options">
      <group>
        <x-input :title="$t('max-overall-download-limit')" type="number" :show-clear="false"
                 :min="0"
                 v-model="change2GlobalOptions['max-overall-download-limit']">
          <span slot="right">KB</span>
        </x-input>
        <x-input :title="$t('max-overall-upload-limit')" type="number" :show-clear="false"
                 :min="0"
                 v-model="change2GlobalOptions['max-overall-upload-limit']">
          <span slot="right">KB</span>
        </x-input>
        <x-input :title="$t('max-concurrent-downloads')" type="number" :show-clear="false"
                 :min="1"
                 v-model="change2GlobalOptions['max-concurrent-downloads']">
          <span slot="right">个</span>
        </x-input>
      </group>
      <group class="buttonGroup">
        <x-button @click.native="saveAria2Options()">{{$t('Save')}}</x-button>
        <x-button @click.native="showOptions = false">{{$t('Cancel')}}</x-button>
      </group>
    </x-dialog>

  </div>
</template>

<script>
  import Radio from '@/components/Radio.vue'
  import {XHeader, Group, XDialog, XInput, XTextarea, CheckIcon, Flexbox, FlexboxItem, XButton, XSwitch, Cell} from 'vux'
  import _ from 'lodash'
  import Popmenu from '@/components/popmenu.vue'
  import TaskList from './taskList.vue'
  import * as util from '@/public/util'
  import {mapGetters, mapActions, mapState, mapMutations} from 'vuex'
  import debugConfig from '../config'
  export default {
    components: {
      XHeader,
      Group,
      Popmenu,
      XInput,
      XTextarea,
      CheckIcon,
      Flexbox,
      XDialog,
      FlexboxItem,
      TaskList,
      XButton,
      XSwitch,
      Cell,
      Radio
    },
    i18n: {
      messages: {
        'zh-CN': {
          'ununited':'未连接',
          'Save':'保存',
          'Cancel':'取消',
          'max-concurrent-downloads':'同时任务数量',
          'max-overall-download-limit':'全局最大下载速度',
          'max-overall-upload-limit':'全局最大上传速度',
          'Remove stopped':'清除已停止',
          'Click to set global speed limit':'点击设置全局限速',
        }
      }
    },
    computed: {
      currenServerName(){
        if (this.serverList && this.currentServerUrl && this.serverList[this.currentServerUrl]) {
          return this.serverList[this.currentServerUrl].name
        } else {
          return '请添加aria2服务地址'
        }
      },
      keymap () {

        return {
          // 'esc+ctrl' is OK.
          'meta+a': (e) => {
            e.preventDefault();
            this.selecteAll()
          },
          'alt+p': (e) => {
            e.preventDefault();
            this.pauseSelectedDownloads()
          },
          'alt+s': (e) => {
            e.preventDefault();
            this.startSelectedDownloads()
          },
          'alt+d': (e) => {
            e.preventDefault();
            this.removeSelectedDownloads()
          },
          'alt+shift+l': (e) => {
            e.preventDefault();
            if(safari.extension.toolbarItems[0].popover.visible){
              safari.extension.toolbarItems[0].popover.hide();
            }else{
              safari.extension.toolbarItems[0].showPopover()
            }
          },
          'space': (e) => {
            e.preventDefault();
            this.toggleSelectedStatus()
          }
        }
      },
      ...mapGetters([
        'isDebug',
        'taskLists',
        'selectedTasks',
        'getAllTaskGid',
        'getStoppedTaskGid',
        'getGlobalStat',
      ]),
      ...mapState([
        'serverList',
        'selectedGids',
        'currentServerUrl',
        'config',
        'globalStat',
        'globalOption',
        'taskList'
      ])
    },
    data () {
      return {
        listTimer: false,
        popmenuIsShow: false,
        showOptions: false,
        change2GlobalOptions: {}
      }
    },
    created(){
      this.init();
      window.safari&&safari.application.addEventListener("popover", ()=>{
        //console.log("popover open");
        this.init();
      }, true);
    },
    watch: {
      'config.refreshTime': function (value) {
        this.init();
      },
      'config.language': function (val) {
        this.$i18n.locale = val;
        this.getTaskList({
          loadOptions: true,
        });
      }
    },
    methods: {
      init () {
        let _this = this;
        if (this.listTimer) {
          clearInterval(this.listTimer)
        }
        this.getTaskList({
          loadOptions: true,
        });
        this.listTimer = setInterval(() => {
          if (_this.isDebug || safari.extension.popovers[0].visible) {
            //console.log('getTaskList');
            _this.getTaskList({
              loadOptions: !_this.globalOption || !_this.globalOption['max-concurrent-downloads'],
              activeList:true
            })
          }else{
            //console.log('stop getTaskList');
            clearInterval(_this.listTimer)
          }
        }, this.config.refreshTime ? this.config.refreshTime * 1000 : 5000)
      },
      saveAria2Options(){
        this.saveOptions({
          options: {
            'max-overall-download-limit':this.change2GlobalOptions['max-overall-download-limit']*1024 + '',
            'max-overall-upload-limit':this.change2GlobalOptions['max-overall-upload-limit']*1024 + '',
            'max-concurrent-downloads':this.change2GlobalOptions['max-concurrent-downloads'],
          }
        }).then(() => {
          this.showOptions = false;
          this.$vux.toast.show({
            text: '设置保存成功'
          })
        })
      },
      openAria2Options(){
        this.showOptions = true;
        this.change2GlobalOptions = {
          'max-overall-download-limit':this.globalOption['max-overall-download-limit']/1024,
          'max-overall-upload-limit':this.globalOption['max-overall-upload-limit']/1024,
          'max-concurrent-downloads':this.globalOption['max-concurrent-downloads'],
        };
      },
      popmenuHide(){
        this.popmenuIsShow = false;
      },
      popmenuShow(){
        this.popmenuIsShow = true;
      },
      changeList(payload){
        this.$refs.popmenu.toggle();
        this.setCurrentServer(payload);
        this.getTaskList();
      },
      selecteAll(){
        this.setSelected({selected: this.selectedGids.length === this.getAllTaskGid.length?[]:this.getAllTaskGid})
      },
      ...mapMutations([
        'refreshServerList',
        'setSelected'
      ]),
      ...mapMutations({
        setCurrentServer: 'changeList'
      }),
      ...mapActions([
        'startSelectedDownloads',
        'pauseSelectedDownloads',
        'removeSelectedDownloads',
        'removeStoppedDownloads',
        'toggleSelectedStatus',
        'openOptionsPanel',
        'saveOptions',
        'getTaskList' // 映射 this.getTaskList() 为 this.$store.dispatch('getTaskList')
      ]),
    }
  }
</script>

<style lang="less">
  .pop_wrapper {
    display: flex;
    flex-direction: column;
    position: absolute;
    width: 100%;
    height: 100%;
    overflow: hidden;
    .pop_header {
      flex: none;
    }
    .pop_list {
      flex: 1;
      overflow: auto;
      .weui-cells {
        margin-top: 0;
      }
    }
  }

  .dialog-options {
    .weui-dialog {
      width: 350px;
      max-width: 100%;
    }
    .weui-cell__primary {
      padding-right: 5px;
    }
    input {
      text-align: right;
    }
    .buttonGroup {
      .weui-cells {
        display: flex;
        .weui-btn {
          margin-top: 0;
          border-radius: 0;
          &::after {
            border-radius: 0;
          }
        }
      }

    }
  }

  .empty {
    text-align: center;
  }

  .globalStatus {
    display: flex;
    align-items: center;
    min-height: 32px;
    .control {
      flex: 1;
      padding: 0 10px;
      display: flex;
      .inner{
        display: flex;
      }
      .weui-btn {
        padding: 0 6px;
        line-height: 1;
        border: none;
        background: #54a1b4;
        color: #ffffff;
        margin-top: 0;
        margin-right: 10px;
        margin-left:0;
        flex:none;
        flex: none;
        height: 24px;

      }

    }
    .speed {
      flex: none;
      display: flex;
      font-size: 12px;
      cursor: pointer;
      div {
        display: flex;
        min-width: 90px;
      }
      i {
        font-size: 16px;
      }
    }
  }

  .rpcServer {
    display: flex;
    justify-content: center;
    align-items: center;
    button {
      background: transparent;
      border: none;
      outline: none;
      color: #ffffff;
      line-height: 40px;
      font-size: 18px;
      cursor: pointer;
    }
  }

  @popoverBg: #55708a;
  @popoverBgHover: #425a73;
  @popoverBgActive: #309399;
  .vux-header {
    .vux-popover {
      background-color: @popoverBg;
      .vux-popover-arrow {
        border-bottom-color: @popoverBg;
      }
      .selectRpcServer {
      }
      .weui-cells {
        overflow: hidden;
        border-radius: 5px;
        margin-top: 0;
        background-color: @popoverBg;
        cursor: pointer;
        label {
          cursor: pointer;
        }
        &:before {
          display: none;
        }
        .weui-cell {
          &.acitve {
            background-color: @popoverBgActive;
          }
          &:hover {
            background-color: @popoverBgHover;
          }
          &:before {
            left: 0;
          }
        }
      }
    }
  }

</style>
