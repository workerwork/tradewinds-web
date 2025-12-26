/**
 * 搜索参数构建工具
 * 用于统一构建服务端搜索和分页参数
 */

/**
 * 构建搜索参数
 * @param baseParams 基础参数（page, pageSize, showDeleted 等）
 * @param searchFields 搜索字段映射 { 前端字段名: 后端字段名 }
 * @param searchForm 搜索表单对象
 * @returns 构建好的搜索参数
 */
export function buildSearchParams<T extends Record<string, unknown>>(
    baseParams: Record<string, unknown>,
    searchFields: Record<string, string>,
    searchForm: T
): Record<string, unknown> {
    const params = { ...baseParams };

    // 添加搜索条件（优化：直接遍历对象键，避免 Object.entries 的开销）
    for (const frontendField in searchFields) {
        if (Object.prototype.hasOwnProperty.call(searchFields, frontendField)) {
            const value = searchForm[frontendField];
            // 优化：使用更严格的空值检查
            if (value !== '' && value !== null && value !== undefined) {
                params[searchFields[frontendField]] = value;
            }
        }
    }

    return params;
}

/**
 * 检查状态参数并添加到参数对象
 * @param params 参数对象
 * @param status 状态值
 */
export function addStatusParam(
    params: Record<string, unknown>,
    status: unknown
): void {
    if (status !== '' && status !== null && status !== undefined) {
        params.status = status;
    }
}

