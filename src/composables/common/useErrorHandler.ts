/**
 * 统一的错误处理 Composable
 * 提供统一的错误处理和用户提示
 */

import { ElMessage } from 'element-plus';
import { logger } from '@/utils';

/**
 * 错误处理选项
 */
interface ErrorHandlerOptions {
    /** 是否显示错误提示（默认 true） */
    showMessage?: boolean;
    /** 自定义错误消息 */
    customMessage?: string;
    /** 错误分类（用于日志） */
    category?: string;
    /** 是否记录错误日志（默认 true） */
    logError?: boolean;
}

/**
 * 统一的错误处理 Composable
 */
export function useErrorHandler() {
    /**
     * 处理错误并显示用户友好的提示
     */
    const handleError = (error: unknown, options: ErrorHandlerOptions = {}) => {
        const {
            showMessage = true,
            customMessage,
            category = 'ErrorHandler',
            logError = true
        } = options;

        // 提取错误信息
        let errorMessage = '操作失败，请稍后重试';
        let errorCode: string | number | undefined;

        if (error instanceof Error) {
            errorMessage = error.message || errorMessage;
            errorCode = (error as { code?: string | number }).code;
        } else if (error && typeof error === 'object') {
            const err = error as { message?: string; code?: string | number; response?: { data?: { message?: string } } };
            errorMessage = err.response?.data?.message || err.message || errorMessage;
            errorCode = err.code;
        }

        // 记录错误日志
        if (logError) {
            logger.error(
                customMessage || errorMessage,
                {
                    error,
                    errorCode,
                    errorMessage
                },
                category
            );
        }

        // 显示用户提示
        if (showMessage) {
            const message = customMessage || errorMessage;

            // 根据错误代码显示不同的提示
            if (errorCode === 401) {
                ElMessage.error('登录已过期，请重新登录');
            } else if (errorCode === 403) {
                ElMessage.error('没有权限执行此操作');
            } else if (errorCode === 404) {
                ElMessage.error('请求的资源不存在');
            } else if (errorCode === 500) {
                ElMessage.error('服务器内部错误，请稍后重试');
            } else {
                ElMessage.error(message);
            }
        }

        return {
            message: errorMessage,
            code: errorCode,
            error
        };
    };

    /**
     * 处理 API 错误（带默认消息）
     */
    const handleApiError = (error: unknown, defaultMessage: string, category?: string) => {
        return handleError(error, {
            customMessage: defaultMessage,
            category: category || 'API'
        });
    };

    /**
     * 静默处理错误（只记录日志，不显示提示）
     */
    const handleSilentError = (error: unknown, category?: string) => {
        return handleError(error, {
            showMessage: false,
            category: category || 'Silent'
        });
    };

    return {
        handleError,
        handleApiError,
        handleSilentError
    };
}

