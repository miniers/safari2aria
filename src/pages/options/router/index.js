import Vue from 'vue'
import Router from 'vue-router'
import options from '../components/index'

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/',
      name: 'options',
      component: options
    }
  ]
})
