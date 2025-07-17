import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type { Order, PaginationQuery } from '@/types';
import { orderApi } from '@/api';
import { useAppStore } from './app';

export const useOrderStore = defineStore('order', () => {
    const appStore = useAppStore();

    // 状态
    const orders = ref<Order[]>([]);
    const total = ref(0);
    const currentOrder = ref<Order | null>(null);
    const loading = ref(false);
    const stats = ref<{
        total: number;
        pending: number;
        processing: number;
        completed: number;
        cancelled: number;
    }>({
        total: 0,
        pending: 0,
        processing: 0,
        completed: 0,
        cancelled: 0
    });
    const queryParams = ref<Partial<PaginationQuery & {
        orderNo?: string;
        customerName?: string;
        status?: number;
        dateRange?: [string, string];
    }>>({
        page: 1,
        pageSize: 10
    });

    // 计算属性
    const pendingOrdersCount = computed(() => stats.value.pending);
    const processingOrdersCount = computed(() => stats.value.processing);
    const completedOrdersCount = computed(() => stats.value.completed);
    const cancelledOrdersCount = computed(() => stats.value.cancelled);
    const totalAmount = computed(() => {
        return orders.value.reduce((sum, order) => sum + (order.amount || 0), 0);
    });

    // 获取订单列表
    const getOrders = async () => {
        try {
            loading.value = true;
            const response = await orderApi.getOrderList(queryParams.value);
            orders.value = response.list;
            total.value = response.total;
        } catch (error) {
            appStore.addNotification({
                type: 'error',
                message: '获取订单列表失败'
            });
            throw error;
        } finally {
            loading.value = false;
        }
    };

    // 获取订单详情
    const getOrderDetail = async (id: number) => {
        try {
            loading.value = true;
            const order = await orderApi.getOrderDetail(id);
            currentOrder.value = order;
            return order;
        } catch (error) {
            appStore.addNotification({
                type: 'error',
                message: '获取订单详情失败'
            });
            throw error;
        } finally {
            loading.value = false;
        }
    };

    // 添加订单
    const addOrder = async (data: Partial<Order>) => {
        try {
            loading.value = true;
            await orderApi.addOrder(data);
            appStore.addNotification({
                type: 'success',
                message: '添加订单成功'
            });
            await getOrders();
            await getOrderStats();
        } catch (error) {
            appStore.addNotification({
                type: 'error',
                message: '添加订单失败'
            });
            throw error;
        } finally {
            loading.value = false;
        }
    };

    // 更新订单
    const updateOrder = async (id: number, data: Partial<Order>) => {
        try {
            loading.value = true;
            await orderApi.updateOrder(id, data);
            appStore.addNotification({
                type: 'success',
                message: '更新订单成功'
            });
            await getOrders();
            await getOrderStats();
        } catch (error) {
            appStore.addNotification({
                type: 'error',
                message: '更新订单失败'
            });
            throw error;
        } finally {
            loading.value = false;
        }
    };

    // 删除订单
    const deleteOrder = async (id: number) => {
        try {
            loading.value = true;
            await orderApi.deleteOrder(id);
            appStore.addNotification({
                type: 'success',
                message: '删除订单成功'
            });
            await getOrders();
            await getOrderStats();
        } catch (error) {
            appStore.addNotification({
                type: 'error',
                message: '删除订单失败'
            });
            throw error;
        } finally {
            loading.value = false;
        }
    };

    // 更新订单状态
    const updateOrderStatus = async (id: number, status: number) => {
        try {
            loading.value = true;
            await orderApi.updateOrderStatus(id, status);
            appStore.addNotification({
                type: 'success',
                message: '更新订单状态成功'
            });
            await getOrders();
            await getOrderStats();
        } catch (error) {
            appStore.addNotification({
                type: 'error',
                message: '更新订单状态失败'
            });
            throw error;
        } finally {
            loading.value = false;
        }
    };

    // 批量更新订单状态
    const batchUpdateOrderStatus = async (ids: number[], status: number) => {
        try {
            loading.value = true;
            await orderApi.batchUpdateOrderStatus(ids, status);
            appStore.addNotification({
                type: 'success',
                message: '批量更新订单状态成功'
            });
            await getOrders();
            await getOrderStats();
        } catch (error) {
            appStore.addNotification({
                type: 'error',
                message: '批量更新订单状态失败'
            });
            throw error;
        } finally {
            loading.value = false;
        }
    };

    // 获取订单统计数据
    const getOrderStats = async () => {
        try {
            const response = await orderApi.getOrderStats();
            stats.value = response;
        } catch (error) {
            appStore.addNotification({
                type: 'error',
                message: '获取订单统计数据失败'
            });
            throw error;
        }
    };

    // 更新查询参数
    const updateQueryParams = (params: Partial<typeof queryParams.value>) => {
        queryParams.value = {
            ...queryParams.value,
            ...params
        };
    };

    // 重置查询参数
    const resetQueryParams = () => {
        queryParams.value = {
            page: 1,
            pageSize: 10
        };
    };

    return {
        // 状态
        orders,
        total,
        currentOrder,
        loading,
        stats,
        queryParams,
        // 计算属性
        pendingOrdersCount,
        processingOrdersCount,
        completedOrdersCount,
        cancelledOrdersCount,
        totalAmount,
        // 方法
        getOrders,
        getOrderDetail,
        addOrder,
        updateOrder,
        deleteOrder,
        updateOrderStatus,
        batchUpdateOrderStatus,
        getOrderStats,
        updateQueryParams,
        resetQueryParams
    };
}); 