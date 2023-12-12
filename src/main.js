import { createApp } from 'vue'
import App from './App.vue'
import { Ion } from 'cesium';

window.CESIUM_BASE_URL = process.env.VUE_APP_CESIUM_BASE_URL;
Ion.defaultAccessToken = process.env.VUE_APP_ION_DEFAULT_ACCESS_TOKEN;

createApp(App).mount('#app')
