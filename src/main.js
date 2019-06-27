import Vue from "vue";
import App from "./App.vue";
import router from "./router";
import elementUi from "element-ui"
import "../node_modules/element-ui/lib/theme-chalk/index.css"

import "./assets/css/login.css"

Vue.use(elementUi)

Vue.config.productionTip = false;

router.beforeEach((to, from, next) => {
  console.log(to)
  console.log(from)
  if (to.path === '/login') {
    next()
    return
  }
  if (localStorage.getItem('token')) {
    next()
  } else {
    router.push('/login')
  }
})

new Vue({
  router,
  render: h => h(App)
}).$mount("#app");