// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import App from './App'
import router from './router'
import store from './store'
import VueHotkey from '@/public/v-hotkey'
import  { ToastPlugin } from 'vux'

Vue.use(ToastPlugin)
Vue.use(VueHotkey)

new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app-box');
window.tlwin={
  refreshServerList(){
    store.commit('refreshServerList');
  }
}
