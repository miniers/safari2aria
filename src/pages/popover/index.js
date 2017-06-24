// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import App from './App'
import router from './router'
import store from './store'
import VueHotkey from '@/public/v-hotkey'
import  { ToastPlugin } from 'vux'
import VueI18n from 'vue-i18n'

Vue.use(VueI18n);
let i18n = new VueI18n({
  locale: navigator.language, // set locale
});
Vue.use(ToastPlugin)
Vue.use(VueHotkey)

new Vue({
  router,
  store,
  i18n,
  render: h => h(App)
}).$mount('#app-box');
window.tlwin={
  refreshServerList(){
    store.commit('refreshServerList');
  },
  refreshTaskList(config={}){
    store.dispatch('getTaskList',{loadOptions:true,all:config.all})
  }
}
