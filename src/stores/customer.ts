import { defineStore } from 'pinia';
import { ref } from 'vue';
import type { Customer, PaginationQuery } from '@/types';
import { customerApi } from '@/api';
import { useAppStore } from './app';

export const useCustomerStore = defineStore('customer', () => {
  const appStore = useAppStore();

  // 状态
  const customers = ref<Customer[]>([]);
  const total = ref(0);
  const currentCustomer = ref<Customer | null>(null);
  const loading = ref(false);
  const queryParams = ref<
    Partial<
      PaginationQuery & {
        name?: string;
        contact?: string;
        phone?: string;
        status?: number;
      }
    >
  >({
    page: 1,
    pageSize: 10,
  });

  // 获取客户列表
  const getCustomers = async () => {
    try {
      loading.value = true;
      const response = await customerApi.getCustomerList(queryParams.value);
      customers.value = response.list;
      total.value = response.total;
    } catch (error) {
      appStore.addNotification({
        type: 'error',
        message: '获取客户列表失败',
      });
      throw error;
    } finally {
      loading.value = false;
    }
  };

  // 获取客户详情
  const getCustomerDetail = async (id: number) => {
    try {
      loading.value = true;
      const customer = await customerApi.getCustomerDetail(id);
      currentCustomer.value = customer;
      return customer;
    } catch (error) {
      appStore.addNotification({
        type: 'error',
        message: '获取客户详情失败',
      });
      throw error;
    } finally {
      loading.value = false;
    }
  };

  // 添加客户
  const addCustomer = async (data: Partial<Customer>) => {
    try {
      loading.value = true;
      await customerApi.addCustomer(data);
      appStore.addNotification({
        type: 'success',
        message: '添加客户成功',
      });
      await getCustomers();
    } catch (error) {
      appStore.addNotification({
        type: 'error',
        message: '添加客户失败',
      });
      throw error;
    } finally {
      loading.value = false;
    }
  };

  // 更新客户
  const updateCustomer = async (id: number, data: Partial<Customer>) => {
    try {
      loading.value = true;
      await customerApi.updateCustomer(id, data);
      appStore.addNotification({
        type: 'success',
        message: '更新客户成功',
      });
      await getCustomers();
    } catch (error) {
      appStore.addNotification({
        type: 'error',
        message: '更新客户失败',
      });
      throw error;
    } finally {
      loading.value = false;
    }
  };

  // 删除客户
  const deleteCustomer = async (id: number) => {
    try {
      loading.value = true;
      await customerApi.deleteCustomer(id);
      appStore.addNotification({
        type: 'success',
        message: '删除客户成功',
      });
      await getCustomers();
    } catch (error) {
      appStore.addNotification({
        type: 'error',
        message: '删除客户失败',
      });
      throw error;
    } finally {
      loading.value = false;
    }
  };

  // 更新查询参数
  const updateQueryParams = (params: Partial<typeof queryParams.value>) => {
    queryParams.value = {
      ...queryParams.value,
      ...params,
    };
  };

  // 重置查询参数
  const resetQueryParams = () => {
    queryParams.value = {
      page: 1,
      pageSize: 10,
    };
  };

  return {
    // 状态
    customers,
    total,
    currentCustomer,
    loading,
    queryParams,
    // 方法
    getCustomers,
    getCustomerDetail,
    addCustomer,
    updateCustomer,
    deleteCustomer,
    updateQueryParams,
    resetQueryParams,
  };
});
