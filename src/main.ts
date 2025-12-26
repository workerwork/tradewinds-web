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
import { installErrorHandler, installPerformanceMonitor, installComponentCleanup, logger } from '@/utils';
import { useUserStore } from '@/stores';
import { DEBUG, API_MODE, API_BASE_URL } from '@/config';
import { setupPermission } from './directives/permission';

// Mock已禁用 - 使用真实后端API
if (DEBUG) {
    logger.info('Mock已禁用，使用真实后端API', undefined, 'App');
    logger.info('当前API配置', { API_BASE_URL: API_BASE_URL, API_MODE }, 'App');
}

const app = createApp(App);

// 1. 首先注册 Pinia（状态管理，其他插件可能依赖）
const pinia = createPinia();
pinia.use(piniaPluginPersistedstate);
app.use(pinia);

// 2. 注册路由（路由守卫可能依赖 store）
app.use(router);

// 3. 注册国际化（Element Plus 可能需要）
app.use(i18n);

// 4. 注册 Element Plus（UI 组件库）
app.use(ElementPlus);

// 5. 注册错误处理器（应该在路由之后，以便处理路由错误）
app.use(installErrorHandler, { router });

// 6. 注册组件清理插件（应该在错误处理器之后）
app.use(installComponentCleanup);

// 7. 注册权限指令
setupPermission(app);

// 8. 注册性能监控（最后注册，监控所有操作）
app.use(installPerformanceMonitor);

// 9. 注册自定义指令
app.directive('lazy', lazyLoad);

// 10. 挂载应用
app.mount('#app');
