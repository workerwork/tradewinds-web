// API 模式类型
export type ApiMode = 'mock' | 'direct' | 'invoke';

// 调试模式
export const DEBUG = import.meta.env.DEV;

// API 配置 - 强制使用相对路径通过代理访问
export const API_BASE_URL = '/api';  // 固定使用相对路径
export const API_MODE: ApiMode = 'direct';

// 调试信息
console.log('配置信息:', {
    VITE_API_BASE_URL: import.meta.env.VITE_API_BASE_URL,
    API_BASE_URL,
    VITE_API_MODE: import.meta.env.VITE_API_MODE,
    API_MODE,
    NODE_ENV: import.meta.env.NODE_ENV,
    DEV: import.meta.env.DEV
});

// 其他配置
export const CONFIG = {
    // Token 相关
    tokenKey: 'Admin-Token',
    refreshTokenKey: 'Admin-Refresh-Token',

    // 请求配置
    requestTimeout: 30000,

    // 路由配置
    routerMode: 'history',
    routerBase: '/',

    // 主题配置
    theme: {
        primary: '#409EFF',
        success: '#67C23A',
        warning: '#E6A23C',
        danger: '#F56C6C',
        info: '#909399'
    }
}; 