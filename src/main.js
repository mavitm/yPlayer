import Vue from 'vue'
import App from './App.vue'
//import router from './router'
import store from './store'
import {AppWindow} from "./mixins/AppWindow";
import {Common} from "./mixins/Common";
import {DataProcess} from "./mixins/DataProcess";
import {PlayerAction} from "./mixins/PlayerAction";
import { BootstrapVue, IconsPlugin } from 'bootstrap-vue';


Vue.config.productionTip = false;

Vue.use(BootstrapVue);
Vue.use(IconsPlugin);

window.App = new Vue({
  //router,
  store,
  mixins:[AppWindow, Common, DataProcess, PlayerAction],
  render: h => h(App)
}).$mount('#app')
