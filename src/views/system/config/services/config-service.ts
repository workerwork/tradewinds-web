import type { PaginationResponse, PaginationQuery } from '@/types';
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
import { logger, extractPaginationData } from '@/utils';

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
export async function getParamList(params: Partial<PaginationQuery & { paramName?: string; paramKey?: string; status?: string }>) {
    try {
        const response = await fetchParamList(params);

        // 使用统一的分页数据提取工具
        const { items: paramsList, total: totalCount } = extractPaginationData<ConfigParam>(response, {
            category: 'ConfigService',
            logPrefix: 'ConfigService - 提取参数列表',
            arrayFieldNames: ['params']
        });

        return { params: paramsList, total: totalCount };
    } catch (error: unknown) {
        logger.error('获取参数列表失败', error, 'ConfigService');
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
export async function getDictTypeList(params: Partial<PaginationQuery & { dictName?: string; dictType?: string; status?: string }>) {
    try {
        const response = await fetchDictTypeList(params);

        // 使用统一的分页数据提取工具
        const { items: dictTypes, total: totalCount } = extractPaginationData<DictType>(response, {
            category: 'ConfigService',
            logPrefix: 'ConfigService - 提取字典类型列表',
            arrayFieldNames: ['dictTypes']
        });

        return { dictTypes, total: totalCount };
    } catch (error: unknown) {
        logger.error('获取字典类型列表失败', error, 'ConfigService');
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
            const responseObj = response as { data?: unknown };
            return Array.isArray(responseObj.data) ? responseObj.data : [];
        }

        return [];
    } catch (error: unknown) {
        logger.error('获取字典数据列表失败', error, 'ConfigService');
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