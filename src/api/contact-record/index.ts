import { request, request_invoke } from '@/utils';
import type { ContactRecord } from '@/types';
import type { ContactRecordQuery } from '@/api/types';
import { API_MODE } from '@/config';

/**
 * 获取客户联系记录列表
 * @param params 查询参数
 */
export const getContactRecords = (params?: ContactRecordQuery) => {
  return API_MODE === 'direct'
    ? request.get('/contact-records', { params })
    : request_invoke({
        url: '/contact-records',
        method: 'GET',
        params,
        invokeCommand: 'contact_record_list',
      });
};

/**
 * 添加联系记录
 * @param data 联系记录数据
 */
export const createContactRecord = (data: Partial<ContactRecord>) => {
  return API_MODE === 'direct'
    ? request.post('/contact-records', data)
    : request_invoke({
        url: '/contact-records',
        method: 'POST',
        data,
        invokeCommand: 'contact_record_create',
      });
};
