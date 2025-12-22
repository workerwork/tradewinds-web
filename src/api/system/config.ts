import { request } from '@/utils';
import type { PaginationQuery, PaginationResponse } from '@/types';

interface ConfigParam {
    id?: number;
    paramName: string;
    paramKey: string;
    paramValue: string;
    type: 'Y' | 'N';
    status: '0' | '1';
    remark?: string;
    createTime?: string;
    updateTime?: string;
}

interface DictType {
    id?: number;
    dictName: string;
    dictType: string;
    status: '0' | '1';
    remark?: string;
    createTime?: string;
    updateTime?: string;
}

interface DictData {
    id?: number;
    dictTypeId: number;
    dictLabel: string;
    dictValue: string;
    dictSort: number;
    status: '0' | '1';
    remark?: string;
    createTime?: string;
    updateTime?: string;
}

/**
 * 获取参数列表
 * @param params 查询参数
 */
export const getParamList = (params?: Partial<PaginationQuery & { paramName: string; paramKey: string }>) => {
    return request.get<PaginationResponse<ConfigParam>>('/system/config/params', { params });
};

/**
 * 添加参数
 * @param data 参数数据
 */
export const addParam = (data: Partial<ConfigParam>) => {
    return request.post<void>('/system/config/param/add', data);
};

/**
 * 更新参数
 * @param id 参数ID
 * @param data 参数数据
 */
export const updateParam = (id: number, data: Partial<ConfigParam>) => {
    return request.put<void>(`/system/config/param/update/${id}`, data);
};

/**
 * 删除参数
 * @param id 参数ID
 */
export const deleteParam = (id: number) => {
    return request.del<void>(`/system/config/param/delete/${id}`);
};

/**
 * 批量删除参数
 * @param ids 参数ID列表
 */
export const batchDeleteParams = (ids: number[]) => {
    return request.del<void>('/system/config/param/batch', { data: { ids } });
};

/**
 * 获取参数详情
 * @param id 参数ID
 */
export const getParamDetail = (id: number) => {
    return request.get<ConfigParam>(`/system/config/param/detail/${id}`);
};

/**
 * 获取参数值
 * @param key 参数键名
 */
export const getParamValue = (key: string) => {
    return request.get<string>(`/system/config/param/value/${key}`);
};

/**
 * 获取字典类型列表
 * @param params 查询参数
 */
export const getDictTypeList = (params?: Partial<PaginationQuery & { dictName: string; dictType: string }>) => {
    return request.get<PaginationResponse<DictType>>('/system/config/dict/types', { params });
};

/**
 * 添加字典类型
 * @param data 字典类型数据
 */
export const addDictType = (data: Partial<DictType>) => {
    return request.post<void>('/system/config/dict/type/add', data);
};

/**
 * 更新字典类型
 * @param id 字典类型ID
 * @param data 字典类型数据
 */
export const updateDictType = (id: number, data: Partial<DictType>) => {
    return request.put<void>(`/system/config/dict/type/update/${id}`, data);
};

/**
 * 删除字典类型
 * @param id 字典类型ID
 */
export const deleteDictType = (id: number) => {
    return request.del<void>(`/system/config/dict/type/delete/${id}`);
};

/**
 * 获取字典数据列表
 * @param dictType 字典类型
 */
export const getDictDataList = (dictType: string) => {
    return request.get<DictData[]>(`/system/config/dict/data/${dictType}`);
};

/**
 * 添加字典数据
 * @param data 字典数据
 */
export const addDictData = (data: Partial<DictData>) => {
    return request.post<void>('/system/config/dict/data/add', data);
};

/**
 * 更新字典数据
 * @param id 字典数据ID
 * @param data 字典数据
 */
export const updateDictData = (id: number, data: Partial<DictData>) => {
    return request.put<void>(`/system/config/dict/data/update/${id}`, data);
};

/**
 * 删除字典数据
 * @param id 字典数据ID
 */
export const deleteDictData = (id: number) => {
    return request.del<void>(`/system/config/dict/data/delete/${id}`);
}; 