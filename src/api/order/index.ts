import { request } from '@/utils';
import type { Order, PaginationQuery, PaginationResponse } from '@/types';

/**
 * 获取订单列表
 * @param params 查询参数
 */
export const getOrderList = (params?: Partial<PaginationQuery & {
    orderNo?: string;
    customerName?: string;
    status?: number;
    dateRange?: [string, string];
}>) => {
    return request.get<PaginationResponse<Order>>('/order/list', { params });
};

/**
 * 添加订单
 * @param data 订单数据
 */
export const addOrder = (data: Partial<Order>) => {
    return request.post<void>('/order/add', data);
};

/**
 * 更新订单
 * @param id 订单ID
 * @param data 订单数据
 */
export const updateOrder = (id: number, data: Partial<Order>) => {
    return request.put<void>(`/order/update/${id}`, data);
};

/**
 * 删除订单
 * @param id 订单ID
 */
export const deleteOrder = (id: number) => {
    return request.del<void>(`/order/delete/${id}`);
};

/**
 * 获取订单详情
 * @param id 订单ID
 */
export const getOrderDetail = (id: number) => {
    return request.get<Order>(`/order/detail/${id}`);
};

/**
 * 更新订单状态
 * @param id 订单ID
 * @param status 状态
 */
export const updateOrderStatus = (id: number, status: number) => {
    return request.put<void>(`/order/status/${id}`, { status });
};

/**
 * 导出订单数据
 * @param params 查询参数
 */
export const exportOrders = (params?: Partial<PaginationQuery & {
    orderNo?: string;
    customerName?: string;
    status?: number;
    dateRange?: [string, string];
}>) => {
    return request.post('/order/export', params, {
        responseType: 'blob'
    });
};

/**
 * 获取订单统计数据
 */
export const getOrderStats = () => {
    return request.get<{
        total: number;
        pending: number;
        processing: number;
        completed: number;
        cancelled: number;
    }>('/order/stats');
};

/**
 * 批量更新订单状态
 * @param ids 订单ID列表
 * @param status 状态
 */
export const batchUpdateOrderStatus = (ids: number[], status: number) => {
    return request.put<void>('/order/batch-status', { ids, status });
}; 