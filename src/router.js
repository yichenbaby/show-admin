import Vue from "vue";
import Router from "vue-router";
import login from "./views/login.vue"

Vue.use(Router);

export default new Router({
  routes: [{
    path: '/login',
    component: login
  }]
});