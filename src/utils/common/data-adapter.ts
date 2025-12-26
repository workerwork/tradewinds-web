/**
 * 数据适配工具
 * 用于处理不同格式的 API 响应数据
 */

import { logger } from '@/utils/system/logger';
import { DEBUG } from '@/config';

/**
 * API 响应格式类型
 */
interface StandardResponse<T = unknown> {
    code?: number | string;
    data?: T;
    message?: string;
    success?: boolean;
}

/**
 * 从响应中提取数据数组
 * 支持多种常见的响应格式
 */
export function extractArrayData<T = unknown>(
    response: unknown,
    options: {
        category?: string;
        logPrefix?: string;
    } = {}
): T[] {
    const { category = 'DataAdapter', logPrefix = 'extractArrayData' } = options;

    if (DEBUG) {
        logger.info(`${logPrefix} - 开始提取数组数据`, {
            数据类型: typeof response,
            是否数组: Array.isArray(response),
            数据结构: response
        }, category);
    }

    // 1. 直接是数组
    if (Array.isArray(response)) {
        if (DEBUG) {
            logger.info(`${logPrefix} - 识别为数组格式`, { length: response.length }, category);
        }
        return response as T[];
    }

    // 2. 是对象，需要提取
    if (response && typeof response === 'object') {
        const obj = response as Record<string, unknown>;

        // 2.1 标准格式 { code, data }
        if ('code' in obj && 'data' in obj) {
            const standardResponse = obj as StandardResponse<T[]>;
            if (DEBUG) {
                logger.info(`${logPrefix} - 识别为标准格式`, { code: standardResponse.code }, category);
            }
            // 优化：使用 Set 进行更高效的状态码检查
            const successCodes = new Set([200, 0, '200', '0']);
            if (successCodes.has(standardResponse.code)) {
                if (Array.isArray(standardResponse.data)) {
                    return standardResponse.data;
                }
            }
        }

        // 2.2 { success, data }
        if ('success' in obj && 'data' in obj) {
            const successResponse = obj as { success: unknown; data: unknown };
            if (DEBUG) {
                logger.info(`${logPrefix} - 识别为 success/data 格式`, undefined, category);
            }
            if (Array.isArray(successResponse.data)) {
                return successResponse.data as T[];
            }
        }

        // 2.3 嵌套在 data 字段中
        if ('data' in obj && Array.isArray(obj.data)) {
            if (DEBUG) {
                logger.info(`${logPrefix} - 识别为嵌套 data 格式`, undefined, category);
            }
            return obj.data as T[];
        }

        // 2.4 常见的数组字段名（优化：使用 Set 进行更高效的查找）
        const arrayFields = new Set(['menus', 'menu', 'items', 'list', 'data', 'results', 'records']);
        for (const field of arrayFields) {
            if (field in obj && Array.isArray(obj[field])) {
                if (DEBUG) {
                    logger.info(`${logPrefix} - 找到数组字段: ${field}`, undefined, category);
                }
                return obj[field] as T[];
            }
        }

        // 2.5 尝试查找任何数组类型的字段
        if (DEBUG) {
            logger.info(`${logPrefix} - 尝试在对象中寻找数组字段`, undefined, category);
        }
        for (const key in obj) {
            if (Array.isArray(obj[key])) {
                if (DEBUG) {
                    logger.info(`${logPrefix} - 找到数组字段: ${key}`, undefined, category);
                }
                return obj[key] as T[];
            }
        }

        // 2.6 尝试将对象转换为数组
        if (DEBUG) {
            logger.info(`${logPrefix} - 尝试将对象转换为数组`, undefined, category);
        }
        const objKeys = Object.keys(obj);
        if (objKeys.length > 0) {
            const tempArray: T[] = [];
            for (const key of objKeys) {
                const value = obj[key];
                if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
                    // 确保 value 是对象类型，才能使用 spread 操作符
                    tempArray.push({
                        id: key,
                        ...(value as Record<string, unknown>)
                    } as T);
                }
            }
            if (tempArray.length > 0) {
                if (DEBUG) {
                    logger.info(`${logPrefix} - 成功将对象转换为数组`, { length: tempArray.length }, category);
                }
                return tempArray;
            }
        }
    }

    // 无法提取数据
    logger.error(`${logPrefix} - 无法提取数组数据`, { response }, category);
    throw new Error('数据格式错误：无法从响应中提取数组数据');
}

/**
 * 从响应中提取单个对象数据
 */
export function extractObjectData<T = unknown>(
    response: unknown,
    options: {
        category?: string;
        logPrefix?: string;
    } = {}
): T {
    const { category = 'DataAdapter', logPrefix = 'extractObjectData' } = options;

    if (DEBUG) {
        logger.info(`${logPrefix} - 开始提取对象数据`, {
            数据类型: typeof response,
            数据结构: response
        }, category);
    }

    // 1. 直接是对象（不是数组）
    if (response && typeof response === 'object' && !Array.isArray(response)) {
        const obj = response as Record<string, unknown>;

        // 1.1 标准格式 { code, data }
        if ('code' in obj && 'data' in obj) {
            const standardResponse = obj as StandardResponse<T>;
            if (DEBUG) {
                logger.info(`${logPrefix} - 识别为标准格式`, { code: standardResponse.code }, category);
            }
            // 优化：使用 Set 进行更高效的状态码检查
            const successCodes = new Set([200, 0, '200', '0']);
            if (successCodes.has(standardResponse.code)) {
                return (standardResponse.data ?? response) as T;
            }
        }

        // 1.2 { success, data }
        if ('success' in obj && 'data' in obj) {
            const successResponse = obj as { success: unknown; data: unknown };
            if (DEBUG) {
                logger.info(`${logPrefix} - 识别为 success/data 格式`, undefined, category);
            }
            return (successResponse.data ?? response) as T;
        }

        // 1.3 嵌套在 data 字段中
        if ('data' in obj) {
            if (DEBUG) {
                logger.info(`${logPrefix} - 识别为嵌套 data 格式`, undefined, category);
            }
            return (obj.data ?? response) as T;
        }

        // 1.4 常见的对象字段名（优化：使用 Set 进行更高效的查找）
        const objectFields = new Set(['user', 'data', 'result', 'item']);
        for (const field of objectFields) {
            if (field in obj && typeof obj[field] === 'object' && obj[field] !== null && !Array.isArray(obj[field])) {
                if (DEBUG) {
                    logger.info(`${logPrefix} - 找到对象字段: ${field}`, undefined, category);
                }
                return obj[field] as T;
            }
        }

        // 1.5 直接返回对象
        return response as T;
    }

    // 无法提取数据
    logger.error(`${logPrefix} - 无法提取对象数据`, { response }, category);
    throw new Error('数据格式错误：无法从响应中提取对象数据');
}

/**
 * 分页响应结果
 */
export interface PaginationResult<T> {
    items: T[];
    total: number;
}

/**
 * 从响应中提取分页数据（数组和总数）
 * 支持多种常见的分页响应格式
 */
export function extractPaginationData<T = unknown>(
    response: unknown,
    options: {
        category?: string;
        logPrefix?: string;
        arrayFieldNames?: string[]; // 自定义数组字段名，如 ['menus', 'params', 'dictTypes']
    } = {}
): PaginationResult<T> {
    const { category = 'DataAdapter', logPrefix = 'extractPaginationData', arrayFieldNames = [] } = options;

    if (DEBUG) {
        logger.info(`${logPrefix} - 开始提取分页数据`, {
            数据类型: typeof response,
            是否数组: Array.isArray(response),
            自定义字段名: arrayFieldNames
        }, category);
    }

    // 1. 直接是数组
    if (Array.isArray(response)) {
        if (DEBUG) {
            logger.info(`${logPrefix} - 识别为数组格式`, { length: response.length }, category);
        }
        return {
            items: response as T[],
            total: response.length
        };
    }

    // 2. 是对象，需要提取
    if (response && typeof response === 'object') {
        const obj = response as Record<string, unknown>;

        // 2.1 标准分页格式 { items: [], total: number }
        if ('items' in obj && Array.isArray(obj.items)) {
            const total = typeof obj.total === 'number' ? obj.total : obj.items.length;
            if (DEBUG) {
                logger.info(`${logPrefix} - 识别为标准分页格式`, { itemsCount: obj.items.length, total }, category);
            }
            return {
                items: obj.items as T[],
                total
            };
        }

        // 2.2 嵌套在 data 字段中
        if ('data' in obj && typeof obj.data === 'object') {
            const data = obj.data as Record<string, unknown>;

            // data 直接是数组
            if (Array.isArray(data)) {
                const total = typeof obj.total === 'number' ? obj.total : data.length;
                if (DEBUG) {
                    logger.info(`${logPrefix} - 识别为嵌套 data 数组格式`, { itemsCount: data.length, total }, category);
                }
                return {
                    items: data as T[],
                    total
                };
            }

            // data 是对象，包含 items/list/records 等字段
            if (data && typeof data === 'object') {
                // 检查标准字段（优化：使用 Set 进行更高效的查找）
                const standardFields = new Set(['items', 'list', 'records']);
                for (const field of standardFields) {
                    if (Array.isArray(data[field])) {
                        const total = typeof data.total === 'number' ? data.total : (data[field] as unknown[]).length;
                        if (DEBUG) {
                            logger.info(`${logPrefix} - 在 data 中找到数组字段: ${field}`, { itemsCount: (data[field] as unknown[]).length, total }, category);
                        }
                        return {
                            items: data[field] as T[],
                            total
                        };
                    }
                }

                // 检查自定义字段名
                for (const field of arrayFieldNames) {
                    if (Array.isArray(data[field])) {
                        const total = typeof data.total === 'number' ? data.total : (data[field] as unknown[]).length;
                        if (DEBUG) {
                            logger.info(`${logPrefix} - 在 data 中找到自定义数组字段: ${field}`, { itemsCount: (data[field] as unknown[]).length, total }, category);
                        }
                        return {
                            items: data[field] as T[],
                            total
                        };
                    }
                }
            }
        }

        // 2.3 顶层字段：list, records
        const topLevelFields = ['list', 'records', ...arrayFieldNames];
        for (const field of topLevelFields) {
            if (field in obj && Array.isArray(obj[field])) {
                const total = typeof obj.total === 'number' ? obj.total : (obj[field] as unknown[]).length;
                if (DEBUG) {
                    logger.info(`${logPrefix} - 在顶层找到数组字段: ${field}`, { itemsCount: (obj[field] as unknown[]).length, total }, category);
                }
                return {
                    items: obj[field] as T[],
                    total
                };
            }
        }

        // 2.4 尝试查找任何数组类型的字段
        if (DEBUG) {
            logger.info(`${logPrefix} - 尝试在对象中寻找数组字段`, undefined, category);
        }
        for (const key in obj) {
            if (Array.isArray(obj[key])) {
                const total = typeof obj.total === 'number' ? obj.total : (obj[key] as unknown[]).length;
                if (DEBUG) {
                    logger.info(`${logPrefix} - 找到数组字段: ${key}`, { itemsCount: (obj[key] as unknown[]).length, total }, category);
                }
                return {
                    items: obj[key] as T[],
                    total
                };
            }
        }
    }

    // 无法提取数据
    logger.error(`${logPrefix} - 无法提取分页数据`, { response }, category);
    throw new Error('数据格式错误：无法从响应中提取分页数据');
}

