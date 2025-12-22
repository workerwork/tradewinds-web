import { request, request_invoke } from '@/utils';
import { API_MODE } from '@/config';

/**
 * 参数查询类型
 */
export interface ParamQuery {
    param_name?: string;
    param_key?: string;
    page?: number;
    pageSize?: number;
}

/**
 * 参数数据类型
 */
export interface ParamData {
    paramName?: string;
    paramKey?: string;
    paramValue?: string;
    type?: string;
    status?: string;
    remark?: string;
}

/**
 * 获取参数列表
 * @param params 查询参数
 */
export function getParamList(params?: ParamQuery) {
    return API_MODE === 'direct'
        ? request.get('/system/params', { params })
        : request_invoke({
            url: '/system/params',
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

/**
 * 新增参数
 * @param data 参数数据
 */
export function addParam(data: ParamData) {
    return API_MODE === 'direct'
        ? request.post('/system/params', data)
        : request_invoke({
            url: '/system/params',
            method: 'post',
            data,
            invokeCommand: 'add_config',
            invokeParams: { config: data }
        });
}

/**
 * 更新参数
 * @param id 参数ID
 * @param data 参数数据
 */
export function updateParam(id: number, data: ParamData) {
    return API_MODE === 'direct'
        ? request.put(`/system/params/${id}`, data)
        : request_invoke({
            url: `/system/params/${id}`,
            method: 'put',
            data,
            invokeCommand: 'update_config',
            invokeParams: { config: { ...data, id } }
        });
}

/**
 * 删除参数
 * @param id 参数ID
 */
export function deleteParam(id: number) {
    return API_MODE === 'direct'
        ? request.del<void>(`/system/params/${id}`)
        : request_invoke({
            url: `/system/params/${id}`,
            method: 'delete',
            invokeCommand: 'delete_config',
            invokeParams: { id }
        });
}

/**
 * 批量删除参数
 * @param ids 参数ID列表
 */
export function batchDeleteParams(ids: number[]) {
    return API_MODE === 'direct'
        ? request.del<void>('/system/params/batch', { data: { ids } })
        : request_invoke({
            url: '/system/params/batch',
            method: 'delete',
            data: { ids },
            invokeCommand: 'batch_delete_config',
            invokeParams: { ids }
        });
}

/**
 * 获取参数值
 * @param key 参数键名
 */
export function getParamValue(key: string) {
    return API_MODE === 'direct'
        ? request.get(`/system/params/value/${key}`)
        : request_invoke({
            url: `/system/params/value/${key}`,
            method: 'get',
            invokeCommand: 'get_config_value',
            invokeParams: { key }
        });
} 