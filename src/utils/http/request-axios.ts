import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';
import { ElMessage } from 'element-plus';
import { useUserStore } from '@/stores';
import { API_BASE_URL, DEBUG } from '@/config';
import router from '@/router';
import { logger } from '@/utils/system/logger';

// 创建请求实例
const service: AxiosInstance = axios.create({
    baseURL: API_BASE_URL,
    timeout: 30000,
    headers: {
        'Accept': 'application/json',
        'X-Requested-With': 'XMLHttpRequest'
    },
    withCredentials: true
});

// 请求队列和取消令牌存储
const pendingRequests = new Map();

// 生成请求标识（优化：避免不必要的 JSON.stringify）
const generateRequestKey = (config: AxiosRequestConfig): string => {
    const { url, method, params, data } = config;
    // 优化：只在需要时进行序列化，避免不必要的 JSON.stringify 开销
    const paramsStr = params ? JSON.stringify(params) : '';
    const dataStr = data ? JSON.stringify(data) : '';
    return `${url}&${method}&${paramsStr}&${dataStr}`;
};

// 需要排除重复请求检测的 URL 列表（通常是只读数据，可以并发请求）
const EXCLUDE_DUPLICATE_CHECK_URLS = [
    '/system/permissions/tree' // 权限树可以并发请求，不需要取消之前的请求
];

// 添加请求拦截器
service.interceptors.request.use(
    (config) => {
        // 确保 paramsSerializer 被正确应用（axios 会自动调用全局的 paramsSerializer）
        // 这里不需要手动处理，让 paramsSerializer 统一处理所有参数编码

        if (DEBUG) {
            logger.info('发送请求', {
                URL: config.baseURL + config.url,
                方法: config.method,
                请求头: config.headers,
                参数: config.params,
                数据: config.data
            }, 'HTTP');
        }

        const userStore = useUserStore();
        const token = userStore.token;

        // 添加 token
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }

        // 确保 Content-Type 正确设置（优化：使用 Set 进行更高效的查找）
        const method = config.method?.toLowerCase();
        const methodsWithBody = new Set(['post', 'put', 'patch']);

        if (method && methodsWithBody.has(method)) {
            config.headers['Content-Type'] = 'application/json';
        } else {
            delete config.headers['Content-Type']; // 避免 GET/DELETE 等请求携带无效头
        }

        // 防止重复请求（排除某些只读数据接口，允许并发请求）
        const requestKey = generateRequestKey(config);
        const shouldCheckDuplicate = !EXCLUDE_DUPLICATE_CHECK_URLS.some(excludedUrl =>
            config.url?.includes(excludedUrl)
        );

        if (shouldCheckDuplicate && pendingRequests.has(requestKey)) {
            const controller = pendingRequests.get(requestKey);
            controller?.abort();
            pendingRequests.delete(requestKey);
        }

        const controller = new AbortController();
        config.signal = controller.signal;
        if (shouldCheckDuplicate) {
            pendingRequests.set(requestKey, controller);
        }

        return config;
    },
    (error) => {
        logger.error('请求错误', error, 'HTTP');
        return Promise.reject(error);
    }
);

// 添加响应拦截器
service.interceptors.response.use(
    (response: AxiosResponse) => {
        if (DEBUG) {
            logger.info('收到响应', {
                URL: response.config.url,
                状态码: response.status,
                响应头: response.headers,
                数据: response.data,
                数据类型: typeof response.data,
                数据结构: response.data ? Object.keys(response.data) : null
            }, 'HTTP');
        }

        const requestKey = generateRequestKey(response.config);
        pendingRequests.delete(requestKey);

        // 处理不同的响应格式
        const data = response.data;

        if (DEBUG) {
            logger.info('响应拦截器 - 开始处理响应数据', {
                原始数据: data,
                数据类型: typeof data,
                包含字段: data && typeof data === 'object' ? Object.keys(data) : null,
                是否包含code: data && typeof data === 'object' && 'code' in data,
                code值: (data as { code?: unknown })?.code,
                status状态码: response.status
            }, 'HTTP');
        }

        // 如果响应是标准格式（包含 code、data、message）
        if (data && typeof data === 'object' && 'code' in data) {
            const responseData = data as { code: unknown; data?: unknown; message?: string };
            if (DEBUG) {
                logger.info('响应拦截器 - 检测到标准格式', { code: responseData.code }, 'HTTP');
            }

            // 更宽松的成功状态码判断（优化：使用 Set 进行更高效的状态码检查）
            const successCodes = new Set([0, 200, '0', '200']);
            const code = responseData.code;
            if (successCodes.has(code as string | number) ||
                (response.status >= 200 && response.status < 300)) {
                if (DEBUG) {
                    logger.info('响应拦截器 - 判定为成功响应，返回data字段', responseData.data, 'HTTP');
                }
                return responseData.data || data; // 如果没有data字段，返回整个响应
            } else {
                logger.error('响应拦截器 - 判定为失败响应', {
                    code: responseData.code,
                    message: responseData.message,
                    responseStatus: response.status
                }, 'HTTP');
                const error = new Error(responseData.message || '请求失败') as Error & { code?: unknown; data?: unknown };
                error.code = responseData.code;
                error.data = responseData.data;
                throw error;
            }
        }

        // 新增：如果响应是 { success, message, data } 结构，直接返回 data
        if (data && typeof data === 'object' && 'success' in data && 'data' in data) {
            const successData = data as { success: unknown; data: unknown };
            if (DEBUG) {
                logger.info('响应拦截器 - 检测到 success/data 结构，直接返回 data 字段', successData.data, 'HTTP');
            }
            return successData.data;
        }

        // 如果响应不是标准格式，直接返回数据
        if (DEBUG) {
            logger.info('响应拦截器 - 非标准格式，直接返回原始数据', undefined, 'HTTP');
        }
        return data;
    },
    (error: AxiosError) => {
        logger.error('响应错误', {
            URL: error.config?.url,
            状态码: error.response?.status,
            错误信息: error.message,
            响应数据: error.response?.data,
            错误详情: error
        }, 'HTTP');

        if (error.config) {
            const requestKey = generateRequestKey(error.config);
            pendingRequests.delete(requestKey);
        }

        if (error.response) {
            const status = error.response.status;
            const data = error.response.data as { message?: string } | undefined;

            switch (status) {
                case 401:
                    // 未授权，完整清除用户状态并跳转到登录页
                    logger.warn('收到401错误，清除用户状态', undefined, 'HTTP');
                    const userStore = useUserStore();

                    // 清除所有用户状态（不调用API，避免循环请求）
                    userStore.clearUserState();

                    ElMessage.error(data?.message || '登录已过期，请重新登录');
                    router.push('/login');
                    return Promise.reject(new Error(data?.message || '未登录或登录已过期'));

                case 403:
                    return Promise.reject(new Error(data?.message || '没有权限执行此操作'));

                case 404:
                    return Promise.reject(new Error(data?.message || '请求的资源不存在'));

                case 500:
                    return Promise.reject(new Error(data?.message || '服务器内部错误'));

                default:
                    return Promise.reject(new Error(data?.message || `请求失败: ${status}`));
            }
        }

        return Promise.reject(new Error(error.message || '网络错误'));
    }
);

// 请求方法封装
export const request = {
    get: <T = unknown>(url: string, config?: AxiosRequestConfig): Promise<T> =>
        service.get(url, config),
    post: <T = unknown>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> =>
        service.post(url, data, config),
    put: <T = unknown>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> =>
        service.put(url, data, config),
    delete: <T = unknown>(url: string, config?: AxiosRequestConfig): Promise<T> =>
        service.delete(url, config),
    del: <T = unknown>(url: string, params?: unknown, config: AxiosRequestConfig = {}): Promise<T> =>
        service.delete(url, { ...config, params }),
    patch: <T = unknown>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> =>
        service.patch(url, data, config)
};

export default service; 