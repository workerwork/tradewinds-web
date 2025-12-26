import { request, createFormData, FILE_UPLOAD_CONFIG } from '@/utils';
import type { Customer, PaginationQuery, PaginationResponse } from '@/types';

/**
 * 获取客户列表
 * @param params 查询参数
 */
export const getCustomerList = (
  params?: Partial<
    PaginationQuery & {
      name?: string;
      contact?: string;
      phone?: string;
      status?: number;
    }
  >
) => {
  return request.get<PaginationResponse<Customer>>('/customer/list', { params });
};

/**
 * 添加客户
 * @param data 客户数据
 */
export const addCustomer = (data: Partial<Customer>) => {
  return request.post<void>('/customer/add', data);
};

/**
 * 更新客户
 * @param id 客户ID
 * @param data 客户数据
 */
export const updateCustomer = (id: number, data: Partial<Customer>) => {
  return request.put<void>(`/customer/update/${id}`, data);
};

/**
 * 删除客户
 * @param id 客户ID
 */
export const deleteCustomer = (id: number) => {
  return request.del<void>(`/customer/delete/${id}`);
};

/**
 * 获取客户详情
 * @param id 客户ID
 */
export const getCustomerDetail = (id: number) => {
  return request.get<Customer>(`/customer/detail/${id}`);
};

/**
 * 更新客户状态
 * @param id 客户ID
 * @param status 状态
 */
export const updateCustomerStatus = (id: number, status: number) => {
  return request.put<void>(`/customer/status/${id}`, { status });
};

/**
 * 导入客户数据
 * @param file Excel文件
 */
export const importCustomers = (file: File) => {
  const formData = createFormData(file);
  return request.post<void>('/customer/import', formData, FILE_UPLOAD_CONFIG);
};

/**
 * 导出客户数据
 * @param params 查询参数
 */
export const exportCustomers = (
  params?: Partial<
    PaginationQuery & {
      name?: string;
      contact?: string;
      phone?: string;
      status?: number;
    }
  >
) => {
  return request.post('/customer/export', params, {
    responseType: 'blob',
  });
};
