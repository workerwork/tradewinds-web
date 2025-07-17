import type { PaginationResponse } from '@/types';
import {
    getParamList as fetchParamList,
    addParam,
    updateParam as updateParamApi,
    deleteParam as deleteParamApi,
    batchDeleteParams as batchDeleteParamsApi,
    getParamValue as getParamValueApi,
    getDictTypeList as fetchDictTypeList,
    addDictType,
    updateDictType as updateDictTypeApi,
    deleteDictType as deleteDictTypeApi,
    getDictDataList as fetchDictDataList,
    addDictData,
    updateDictData as updateDictDataApi,
    deleteDictData as deleteDictDataApi
} from '@/api/system/config';

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
 */
export async function getParamList(params: any) {
    try {
        const response = await fetchParamList(params);

        let params: ConfigParam[] = [];
        let totalCount = 0;

        // 处理标准的分页响应格式
        if (response && 'items' in response && Array.isArray(response.items)) {
            params = response.items;
            totalCount = response.total;
        }
        // 处理其他可能的响应格式
        else if (Array.isArray(response)) {
            params = response;
            totalCount = response.length;
        }
        else if (response && typeof response === 'object') {
            if ('data' in response && typeof response.data === 'object') {
                const data = response.data as any;
                if (Array.isArray(data)) {
                    params = data;
                    totalCount = data.length;
                } else if (data && typeof data === 'object') {
                    if (Array.isArray(data.items)) {
                        params = data.items;
                        totalCount = data.total || 0;
                    } else if (Array.isArray(data.list)) {
                        params = data.list;
                        totalCount = data.total || 0;
                    } else if (Array.isArray(data.params)) {
                        params = data.params;
                        totalCount = data.total || 0;
                    }
                }
            } else if ('list' in response && Array.isArray(response.list)) {
                params = response.list;
                totalCount = response.total || 0;
            } else if ('records' in response && Array.isArray(response.records)) {
                params = response.records;
                totalCount = response.total || 0;
            } else if ('params' in response && Array.isArray(response.params)) {
                params = response.params;
                totalCount = response.total || 0;
            }
        }

        return { params, total: totalCount };
    } catch (error) {
        console.error('获取参数列表失败:', error);
        throw error;
    }
}

/**
 * 创建参数
 */
export async function createParam(paramData: Partial<ConfigParam>) {
    return addParam(paramData);
}

/**
 * 更新参数
 */
export async function updateParam(id: string, paramData: Partial<ConfigParam>) {
    return updateParamApi(Number(id), paramData);
}

/**
 * 删除参数
 */
export async function deleteParam(id: string) {
    return deleteParamApi(Number(id));
}

/**
 * 批量删除参数
 */
export async function batchDeleteParams(ids: string[]) {
    const numericIds = ids.map(id => Number(id));
    return batchDeleteParamsApi(numericIds);
}

/**
 * 获取参数值
 */
export async function getParamValue(key: string) {
    return getParamValueApi(key);
}

/**
 * 获取字典类型列表
 */
export async function getDictTypeList(params: any) {
    try {
        const response = await fetchDictTypeList(params);

        let dictTypes: DictType[] = [];
        let totalCount = 0;

        // 处理标准的分页响应格式
        if (response && 'items' in response && Array.isArray(response.items)) {
            dictTypes = response.items;
            totalCount = response.total;
        }
        // 处理其他可能的响应格式
        else if (Array.isArray(response)) {
            dictTypes = response;
            totalCount = response.length;
        }
        else if (response && typeof response === 'object') {
            if ('data' in response && typeof response.data === 'object') {
                const data = response.data as any;
                if (Array.isArray(data)) {
                    dictTypes = data;
                    totalCount = data.length;
                } else if (data && typeof data === 'object') {
                    if (Array.isArray(data.items)) {
                        dictTypes = data.items;
                        totalCount = data.total || 0;
                    } else if (Array.isArray(data.list)) {
                        dictTypes = data.list;
                        totalCount = data.total || 0;
                    } else if (Array.isArray(data.dictTypes)) {
                        dictTypes = data.dictTypes;
                        totalCount = data.total || 0;
                    }
                }
            } else if ('list' in response && Array.isArray(response.list)) {
                dictTypes = response.list;
                totalCount = response.total || 0;
            } else if ('records' in response && Array.isArray(response.records)) {
                dictTypes = response.records;
                totalCount = response.total || 0;
            } else if ('dictTypes' in response && Array.isArray(response.dictTypes)) {
                dictTypes = response.dictTypes;
                totalCount = response.total || 0;
            }
        }

        return { dictTypes, total: totalCount };
    } catch (error) {
        console.error('获取字典类型列表失败:', error);
        throw error;
    }
}

/**
 * 创建字典类型
 */
export async function createDictType(dictTypeData: Partial<DictType>) {
    return addDictType(dictTypeData);
}

/**
 * 更新字典类型
 */
export async function updateDictType(id: string, dictTypeData: Partial<DictType>) {
    return updateDictTypeApi(Number(id), dictTypeData);
}

/**
 * 删除字典类型
 */
export async function deleteDictType(id: string) {
    return deleteDictTypeApi(Number(id));
}

/**
 * 获取字典数据列表
 */
export async function getDictDataList(dictType: string) {
    try {
        const response = await fetchDictDataList(dictType);

        if (Array.isArray(response)) {
            return response;
        } else if (response && typeof response === 'object' && 'data' in response) {
            return Array.isArray(response.data) ? response.data : [];
        }

        return [];
    } catch (error) {
        console.error('获取字典数据列表失败:', error);
        throw error;
    }
}

/**
 * 创建字典数据
 */
export async function createDictData(dictDataData: Partial<DictData>) {
    return addDictData(dictDataData);
}

/**
 * 更新字典数据
 */
export async function updateDictData(id: string, dictDataData: Partial<DictData>) {
    return updateDictDataApi(Number(id), dictDataData);
}

/**
 * 删除字典数据
 */
export async function deleteDictData(id: string) {
    return deleteDictDataApi(Number(id));
} 