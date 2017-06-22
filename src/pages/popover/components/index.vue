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
          <button>{{currenServerName}}{{!globalStat ? '(未连接)' : ''}}</button>
          <i class="material-icons">{{popmenuIsShow ? 'keyboard_arrow_up' : 'keyboard_arrow_down'}}</i>
        </div>
      </popmenu>
    </x-header>
    <div class="globalStatus">
      <div class="control">
        <div class="inner" v-show="selectedGids.length>0">
          <x-button mini plain @click.native.stop="startSelectedDownloads()">开始</x-button>
          <x-button mini plain @click.native.stop="pauseSelectedDownloads()">暂停</x-button>
          <x-button mini plain @click.native.stop="removeSelectedDownloads()">删除</x-button>
        </div>
      </div>
      <div class="speed" title="点击设置全局限速" @click.nativ.stop="openAria2Options()">
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
        <x-input title="全局最大下载速度" type="number" :show-clear="false"
                 :min="0"
                 v-model="change2GlobalOptions['max-overall-download-limit']">
          <span slot="right">KB</span>
        </x-input>
        <x-input title="全局最大上传速度" type="number" :show-clear="false"
                 :min="0"
                 v-model="change2GlobalOptions['max-overall-upload-limit']">
          <span slot="right">KB</span>
        </x-input>
        <x-input title="同时任务数量" type="number" :show-clear="false"
                 :min="1"
                 v-model="change2GlobalOptions['max-concurrent-downloads']">
          <span slot="right">个</span>
        </x-input>
      </group>
      <group class="buttonGroup">
        <x-button @click.native="saveAria2Options()">保存</x-button>
        <x-button @click.native="showOptions = false">取消</x-button>
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
            this.setSelected({selected: this.getAllTaskGid})
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
    },
    watch: {
      'config.refreshTime': function (value) {
        this.init();
      }
    },
    methods: {
      init () {
        if (this.listTimer) {
          clearInterval(this.listTimer)
        }
        this.getTaskList();
        this.listTimer = setInterval(() => {
          if (this.isDebug || safari.extension.popovers[0].visible) {
            this.getTaskList({
              loadOptions: !this.globalOption
            })
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
      .weui-btn {
        padding: 5px 10px;
        line-height: 1;
        border: none;
        background: #54a1b4;
        color: #ffffff;
        margin-top: 0;
        margin-right: 10px;
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
