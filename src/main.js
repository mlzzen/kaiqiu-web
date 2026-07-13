import { createApp } from 'vue';
import { createPinia } from 'pinia';
import ElementPlus from 'element-plus';
import zhCn from 'element-plus/dist/locale/zh-cn.mjs';
import * as ElementPlusIconsVue from '@element-plus/icons-vue';
import 'element-plus/dist/index.css';
import './styles/reset.css';
import './styles/theme.css';
import App from './App.vue';
import router from './router';

const app = createApp(App);

Object.entries(ElementPlusIconsVue).forEach(([key, component]) => {
  app.component(key, component);
});

app.use(createPinia());
app.use(router);
app.use(ElementPlus, { locale: zhCn });
app.mount('#app');
