import Vue from 'vue';
import io from 'socket.io-client';
import app from '@/app.vue';

Vue.config.productionTip = false;

Vue.prototype.socket = io();

new Vue({
  render: h => h(app),
}).$mount('#app');
