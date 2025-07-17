// @ts-ignore - Tauri v2 types
import { invoke } from '@tauri-apps/api/core';
import { DEBUG } from '@/config';

interface InvokeOptions {
    url: string;
    method: string;
    data?: any;
    params?: any;
    invokeCommand: string;
    invokeParams?: any;
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
        console.log('Invoke Request:', {
            command: invokeCommand,
            params: finalParams
        });
    }

    try {
        const result = await invoke(invokeCommand, finalParams);

        if (DEBUG) {
            console.log('Invoke Response:', result);
        }

        return result;
    } catch (error) {
        if (DEBUG) {
            console.error('Invoke error:', error);
        }
        throw error;
    }
} 