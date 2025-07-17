import type { AxiosResponse } from 'axios';
import type { ApiResponse } from '@/types';
import { ElMessage } from 'element-plus';
import router from '@/router';
import { useUserStore } from '@/stores/user';

/**
 * 响应数据转换
 * @param response Axios响应对象
 */
export const transformResponse = <T>(response: AxiosResponse<ApiResponse<T>>): T => {
    const { data: res } = response;

    if (res.code !== 0) {
        throw new Error(res.message || '请求失败');
    }

    return res.data;
};

/**
 * 错误处理
 * @param error 错误对象
 */
export const handleError = (error: any): never => {
    if (!error.response) {
        ElMessage.error('网络错误，请检查您的网络连接');
        throw error;
    }

    const status = error.response.status;
    const userStore = useUserStore();

    switch (status) {
        case 401:
            ElMessage.error('未授权，请重新登录');
            userStore.logout();
            router.push('/login');
            break;
        case 403:
            ElMessage.error('拒绝访问');
            break;
        case 404:
            ElMessage.error('请求的资源不存在');
            break;
        case 405:
            ElMessage.error('请求方法不允许');
            break;
        case 500:
            ElMessage.error('服务器错误');
            break;
        default:
            ElMessage.error(error.response.data?.message || '请求失败');
    }

    throw error;
};

/**
 * 业务错误
 */
export class BusinessError extends Error {
    constructor(
        public code: number,
        message: string
    ) {
        super(message);
        this.name = 'BusinessError';
    }
}

/**
 * 网络错误
 */
export class NetworkError extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'NetworkError';
    }
}

/**
 * 认证错误
 */
export class AuthError extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'AuthError';
    }
} 