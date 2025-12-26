// @ts-ignore - Tauri v2 types
import { invoke } from '@tauri-apps/api/core';
import { DEBUG } from '@/config';
import { logger } from '@/utils';

interface InvokeOptions {
    url: string;
    method: string;
    data?: unknown;
    params?: unknown;
    invokeCommand: string;
    invokeParams?: Record<string, unknown>;
}

// invoke 请求方法
export async function request_invoke(options: InvokeOptions) {
    const { invokeCommand, invokeParams, data, params } = options;

    // 合并参数
    const finalParams = {
        ...invokeParams,
        ...(data && { data }),
        ...(params && { params })
    };

    if (DEBUG) {
        logger.info('Invoke Request', {
            command: invokeCommand,
            params: finalParams
        }, 'RequestInvoke');
    }

    try {
        const result = await invoke(invokeCommand, finalParams);

        if (DEBUG) {
            logger.info('Invoke Response', result, 'RequestInvoke');
        }

        return result;
    } catch (error: unknown) {
        logger.error('Invoke error', error, 'RequestInvoke');
        throw error;
    }
} 