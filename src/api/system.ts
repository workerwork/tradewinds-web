import { request, request_invoke } from '@/utils/request';
import { API_MODE } from '@/config';

// 获取参数列表
export function getParamList(params: any) {
    return API_MODE === 'direct'
        ? request.get('/api/system/params', { params })
        : request_invoke({
            url: '/api/system/params',
            method: 'get',
            params,
            invokeCommand: 'get_config_list',
            invokeParams: {
                paramName: params.param_name,
                paramKey: params.param_key,
                currentPage: params.page,
                pageSize: params.pageSize
            }
        });
}

// 新增参数
export function addParam(data: any) {
    return API_MODE === 'direct'
        ? request.post('/api/system/params', data)
        : request_invoke({
            url: '/api/system/params',
            method: 'post',
            data,
            invokeCommand: 'add_config',
            invokeParams: { config: data }
        });
}

// 更新参数
export function updateParam(id: number, data: any) {
    return API_MODE === 'direct'
        ? request.put(`/api/system/params/${id}`, data)
        : request_invoke({
            url: `/api/system/params/${id}`,
            method: 'put',
            data,
            invokeCommand: 'update_config',
            invokeParams: { config: { ...data, id } }
        });
}

// 删除参数
export function deleteParam(id: number) {
    return API_MODE === 'direct'
        ? request.delete(`/api/system/params/${id}`)
        : request_invoke({
            url: `/api/system/params/${id}`,
            method: 'delete',
            invokeCommand: 'delete_config',
            invokeParams: { id }
        });
}

// 批量删除参数
export function batchDeleteParams(ids: number[]) {
    return API_MODE === 'direct'
        ? request.delete('/api/system/params/batch', { data: { ids } })
        : request_invoke({
            url: '/api/system/params/batch',
            method: 'delete',
            data: { ids },
            invokeCommand: 'batch_delete_config',
            invokeParams: { ids }
        });
}

// 获取参数值
export function getParamValue(key: string) {
    return API_MODE === 'direct'
        ? request.get(`/api/system/params/value/${key}`)
        : request_invoke({
            url: `/api/system/params/value/${key}`,
            method: 'get',
            invokeCommand: 'get_config_value',
            invokeParams: { key }
        });
} 