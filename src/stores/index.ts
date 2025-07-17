import { createPinia } from 'pinia';
import { createPersistedState } from 'pinia-plugin-persistedstate';

// 创建 store
const store = createPinia();

// 配置持久化插件
store.use(createPersistedState({
    storage: localStorage,
    key: prefix => `aiman_${prefix}`
}));

// 导出 store 实例
export default store;

// 导出所有 store
export * from './user';
export * from './app';
export * from './customer';
export * from './product';
export * from './order';
export * from './role'; 