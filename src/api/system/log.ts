import { request } from '@/utils/request';
import type { Log, PaginationQuery, PaginationResponse } from '@/types';

/**
 * 获取日志列表
 * @param params 查询参数
 */
export const getLogList = (params?: Partial<PaginationQuery & {
    operator?: string;
    type?: string;
    status?: number;
    dateRange?: [string, string];
}>) => {
    return request.get<PaginationResponse<Log>>('/system/log/list', { params });
};

/**
 * 删除日志
 * @param id 日志ID
 */
export const deleteLog = (id: number) => {
    return request.del<void>(`/system/log/delete/${id}`);
};

/**
 * 批量删除日志
 * @param ids 日志ID列表
 */
export const batchDeleteLogs = (ids: number[]) => {
    return request.post<void>('/system/log/batch-delete', { ids });
};

/**
 * 导出日志
 * @param params 查询参数
 */
export const exportLogs = (params?: any) => {
    return request.post('/system/log/export', params, {
        responseType: 'blob'
    });
};

/**
 * 清空日志
 */
export const clearLogs = () => {
    return request.post<void>('/system/log/clear');
}; 