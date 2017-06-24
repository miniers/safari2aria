<template>
  <group>
    <div class="download-list">
      <task-line v-for="download in list"
                 :key="download.gid"
                 :download="download"
                 :selected="~selectedGids.indexOf(download.gid)"
                 @click.native.stop="select(download.gid, $event)"
                 @dblclick.native.stop="startOrPause(download)">

      </task-line>

      <cell class="empty" :title="$t('No downloads')" v-if="list.length<1">
      </cell>
    </div>
  </group>
</template>

<script>
  import {XHeader, Group, XInput, XTextarea, CheckIcon, Flexbox, FlexboxItem, XButton, XSwitch, Cell} from 'vux'
  import TaskLine from './taskLine.vue'
  import { mapGetters, mapActions,mapState ,mapMutations} from 'vuex'

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
      TaskLine
    },
    props: {
      list: Array,
      selected: Array
    },
    i18n: {
      messages: {
        'zh-CN': {
          'No downloads':'暂无下载任务',
        }
      }
    },
    computed: {
      gids: function () {
        return this.list.map(download => download?download.gid:'')
      },
      ...mapState([
        'selectedGids'
      ])
    },
    methods: {
      select: function (gid, e) {
        let selected = this.selectedGids
        if (e.ctrlKey || e.metaKey || e.shiftKey) selected.push(gid)
        else selected = [ gid ]
        if (e.shiftKey && selected.length) {
          let first = selected[0]
          let last = selected[selected.length - 1]
          let args = [this.gids.indexOf(first), this.gids.indexOf(last)]
          if (args[0] > args[1]) args.reverse()
          selected = this.gids.slice(args[0], args[1] + 1)
        }
        this.setSelected({
          selected
        })
      },
      startOrPause: function (download) {
        if (download.status === 'paused') this.$store.dispatch('startSelectedDownloads')
        else if (download.status === 'active') this.$store.dispatch('pauseSelectedDownloads')
      },
      ...mapMutations([
        'setSelected'
      ])
    }
  }
</script>

<style lang="less">
.empty{
  .vux-label{
    text-align: center;
  }
}
</style>
