<template>
  <cell-box class="download"
            @mouseenter.native="showAction = true"
            @mouseleave.native="showAction = false"
            :class="{selected: selected}">
    <chart class="chart" v-if="globalConfig.enableChart" :autoResize="true" :options="char"></chart>
    <div class="progress"
         :style="{width:progress}"></div>
    <div class="info">
      <div class="left">
        <div class="name" :title="name">
          {{name}}
        </div>
        <div class="status">
          <div v-if="download.errorMessage">{{download.errorMessage}}</div>
          <div v-if="!download.errorMessage">
            <span v-if="download.status !='active'">{{getStatus}}</span>
            <span class="size" v-if="download.totalLength !== '0'">{{isDownloading?completedSize+'/':''}}{{size}}</span>
            <span class="speed" v-if="isDownloading">{{downloadSpeed}}</span>
            <span class="speed upload" v-if="isUploading">{{uploadSpeed}}</span>
            <span class="eta" v-if="isDownloading">剩余:{{eta}}</span>
          </div>
        </div>
      </div>
      <div class="right">
        <div class="action" v-show="showAction">
          <i class="material-icons" title="暂停" v-show="download.status === 'active'" @click.stop="pauseSelectedDownloads({gids:[download.gid]})">pause_circle_outline</i>
          <i class="material-icons" title="开始" v-show="download.status === 'paused'" @click.stop="startSelectedDownloads({gids:[download.gid]})">play_circle_outline</i>
          <i class="material-icons" title="删除" @click.stop="removeSelectedDownloads({gids:[download.gid]})">delete_forever</i>
        </div>
      </div>

    </div>

  </cell-box>
</template>

<script>
  import {XHeader, Group, XInput, XTextarea, CellBox, CheckIcon, Flexbox, FlexboxItem, XButton, XSwitch, Cell} from 'vux'
  import * as util from '@/public/util'
  import {mapActions,mapState} from 'vuex'
  import ECharts from 'vue-echarts/components/ECharts.vue'
  import graphic from 'echarts/lib/util/graphic'
  import 'echarts/lib/chart/bar'
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
      CellBox,
      chart: ECharts
    },
    data:function(){
      return {
        showAction:false
      }
    },
    props: ['download', 'selected'],
    computed: {
      eta: function () {
        var seconds = (this.download.totalLength - this.download.completedLength) / (this.download.downloadSpeed||1)
        return util.duration(seconds*1000,'d[天] h[:]m[:]s')
        //return moment.duration(seconds, 'seconds').format("d[天] h[:]mm[:]ss")
      },
      char(){
        if(!this.globalConfig.enableChart){
          return {};
        }
        let dataAxis = this.download.bitfield.split('');
        let yMax=16;
        dataAxis.pop();
        let data =dataAxis.map(v=>{
          return parseInt(v,16)
        });
        dataAxis = dataAxis.map((v,i)=>{
          return i
        });
        if(dataAxis.length>50){
          let result=[];
          for(let i=0,ratio=parseInt(data.length/50)+1;i<data.length;i++){
            let val=0,orgRatio=ratio;
            if(i+ratio >=data.length){
              ratio = data.length - i -1;
            }
            for(let ni=i;ni<=i+ratio;ni++){
              val+=data[ni];
            }
            val = parseInt(val*(orgRatio/ratio));
            result.push(val);
            i+=ratio;
          }
          yMax=16*(parseInt(data.length/50)+1);
          data = result;
          dataAxis.length = data.length;
        }
        return {
          grid: {
            left: '0%',
            right: '0%',
            containLabel: false
          },
          xAxis: {
            show:false,
            data: dataAxis,
          },
          yAxis: {
            show:false,
            max:yMax
          },
          series: [
            {
              type: 'bar',
              barGap:'0%',
              silent:true,
              barCategoryGap:'0',
              itemStyle: {
                normal: {
                  color: '#eeeeee',
                }
              },
              data: data
            }
          ]
        };

      },
      getStatus(){
        let status={
          active:'下载中',
          waiting:'等待中',
          paused:'已暂停',
          error:'错误',
          complete:'已完成',
          removed:'已删除',
        };
        return status[this.download.status] || '';
      },
      name: function () {
        return util.getEntryFileName(this.download)
      },
      progress: function () {
        let progress=this.download.totalLength === '0' ? 0 : this.download.completedLength / this.download.totalLength;
        return [progress*100,'%'].join('')
      },
      completedSize: function () {
        return util.bytesToSize(this.download.completedLength,-1)
      },
      size: function () {
        return util.bytesToSize(this.download.totalLength,-1)
      },
      isDownloading: function () {
        return this.download.status === 'active' && this.download.downloadSpeed !== '0'
      },
      isUploading: function () {
        return this.download.status === 'active' && this.download.uploadSpeed !== '0'
      },
      downloadSpeed: function () {
        return util.bytesToSize(this.download.downloadSpeed || 0,-1) + '/s(' +this.download.connections+')'
      },
      uploadSpeed: function () {
        return util.bytesToSize(this.download.uploadSpeed || 0) + '/s'
      },
      ...mapState({
        'globalConfig':'config'
      })
    },
    methods: {
      showAction(){
        this.showAction = true;
      },
      hideAction(){
        this.showAction = true;
      },
      ...mapActions([
        'startSelectedDownloads',
        'pauseSelectedDownloads',
        'removeSelectedDownloads',
      ]),
    }
  }
</script>

<style lang="less">
.download{
  position: relative;
  &.selected{
    background: #95bbe2;
  }
  .progress{
    position: absolute;
    z-index:0;
    height: 2px;
    background: #55708a;
    left: 0;
    bottom: 0;
  }
  .chart{
    position: absolute;
    z-index: 0;
    width: 100%;
    height: 100%;
    left: 0;
    top: 0;
  }
  &.vux-cell-box{
    padding:5px 8px;
    div{
      width: 100%;
      padding-right:0;
    }
  }

  .info{
    position: relative;
    z-index: 1;
    display: flex;
    div{
      width:auto;
    }
    .left{
      flex:1;
    }
    .right{
      flex:none;
      display: flex;
      flex-direction: column;
      .action{
        flex:1;
        display: flex;
        align-items: center;
        justify-content: center;
        i{
          display: block;
          cursor: pointer;
          margin-left: 10px;
        }
      }
    }
    .name{
      flex:none;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      max-width: 300px;
    }
    .status{
      flex: 1;
      font-size: 12px;
      div{
        display: flex;
      }
      span{
        min-width:60px;
        flex:none;
        padding-right:10px;
      }
    }
  }
}
</style>
