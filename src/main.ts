import { createApp } from "vue";
import { createPinia } from 'pinia';
import App from "@/App.vue";
import router from '@/router';
import ElementPlus from 'element-plus';
import 'element-plus/dist/index.css';
import '@/styles/index.scss';
import i18n from './i18n';
import lazyLoad from './directives/lazy';
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate';
import { installErrorHandler, installPerformanceMonitor, installComponentCleanup } from '@/utils';
import { useUserStore } from '@/stores';
import { DEBUG, API_MODE, API_BASE_URL } from '@/config';
import { setupPermission } from './directives/permission';

// Mock已禁用 - 使用真实后端API
if (DEBUG) {
    console.log('Mock已禁用，使用真实后端API');
    console.log('当前API配置:', { API_BASE_URL: API_BASE_URL, API_MODE });
}

const app = createApp(App);
const pinia = createPinia();
pinia.use(piniaPluginPersistedstate);

app.use(pinia);
app.use(router);
app.use(ElementPlus);
app.use(i18n);

// 初始化 store
const userStore = useUserStore();

// 初始化错误处理器
app.use(installErrorHandler, { router });

// 注册组件清理插件
app.use(installComponentCleanup);

// 注册权限指令
setupPermission(app);

// 注册性能监控
app.use(installPerformanceMonitor);

app.directive('lazy', lazyLoad);

app.mount('#app');
