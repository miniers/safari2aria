<template>
  <div class="vux-check-icon" @click="updateValue">
    <icon type="success" v-show="type === 'default' && value === val"></icon>
    <icon type="success_circle" v-show="type === 'plain' && value === val"></icon>
    <icon type="circle" v-show="value !== val"></icon>
    <input class="radio" type="radio" :value="val" v-model="value">
    <span><slot></slot></span>
  </div>
</template>

<script>
  import {Icon} from 'vux'

  export default {
    components: {
      Icon
    },
    methods: {
      updateValue () {
        this.$emit('update:value', this.val)
      }
    },
    props: {
      value: [String, Number],
      val: [String, Number],
      type: {
        type: String,
        default: 'default'
      }
    }
  }
</script>

<style lang="less">
  @import '~vux/src/styles/variable.less';
  .radio {
    display: none;
  }
  .vux-check-icon {
    display: inline-block;
  }
  .vux-check-icon > span {
    line-height: 23px;
    color: #222;
    vertical-align: middle;
  }
  .vux-check-icon > .weui-icon-success:before, .vux-check-icon > .weui-icon-success-circle:before {
    color: @check-icon-color-checked;
  }
</style>
