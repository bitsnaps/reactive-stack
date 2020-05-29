import Vue from 'vue'
import VueRx from 'vue-rx'
import VueResource from 'vue-resource'
import App from './App.vue'

Vue.use(VueResource)
Vue.use(VueRx/*, {
  Observable
}*/)

Vue.config.productionTip = false

new Vue({
  render: function (h) {
    return h(App)
  },
}).$mount('#app')
