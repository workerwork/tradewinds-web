import { ref, type Ref } from 'vue';

/**
 * 自动完成建议项类型
 */
export interface AutocompleteSuggestion {
    value: string;
}

/**
 * 自动完成建议 Composable
 * 统一处理 autocomplete 建议逻辑，减少重复代码
 * 
 * @example
 * ```typescript
 * const { createSuggestionQuery, fetchAllForSuggestions } = useAutocomplete({
 *   allItemsForSuggestions,
 *   currentList,
 *   fetchAllItems: async () => {
 *     const result = await getAllItems({ page: 1, pageSize: 500 });
 *     return result.items || [];
 *   }
 * });
 * 
 * const queryNameSuggestions = createSuggestionQuery('name');
 * ```
 */
export function useAutocomplete<T = Record<string, unknown>>(
    options: {
        // 完整的建议列表（不受搜索条件影响）
        allItemsForSuggestions: Ref<T[]>;
        // 当前列表（作为后备）
        currentList: Ref<T[]>;
        // 获取完整列表的函数
        fetchAllItems: () => Promise<T[]>;
        // 最大建议数量
        maxSuggestions?: number;
    }
) {
    const {
        allItemsForSuggestions,
        currentList,
        fetchAllItems,
        maxSuggestions = 10
    } = options;

    /**
     * 创建建议查询函数
     * @param fieldName 字段名（如 'username', 'name', 'code'）
     * @param options 选项
     * @returns 建议查询函数
     */
    const createSuggestionQuery = (
        fieldName: string,
        options: {
            // 是否使用大小写不敏感匹配（默认 true）
            caseSensitive?: boolean;
            // 是否使用包含匹配（默认 true，false 则使用精确匹配）
            useContains?: boolean;
        } = {}
    ) => {
        const { caseSensitive = false, useContains = true } = options;

        return (queryString: string, cb: (suggestions: AutocompleteSuggestion[]) => void) => {
            // 优先使用 allItemsForSuggestions，确保建议始终从完整列表中获取
            const sourceList = allItemsForSuggestions.value.length > 0
                ? allItemsForSuggestions.value
                : currentList.value;

            if (!sourceList || sourceList.length === 0) {
                cb([]);
                return;
            }

            // 如果查询字符串为空，返回所有选项（最多 maxSuggestions 个），并去重
            if (!queryString || queryString.trim() === '') {
                const uniqueValues = new Set<string>();
                const suggestions: AutocompleteSuggestion[] = [];

                for (const item of sourceList) {
                    const fieldValue = item[fieldName];
                    if (fieldValue && typeof fieldValue === 'string') {
                        const value = caseSensitive ? fieldValue : fieldValue.toLowerCase();
                        if (!uniqueValues.has(value)) {
                            uniqueValues.add(value);
                            suggestions.push({ value: fieldValue });
                            if (suggestions.length >= maxSuggestions) break;
                        }
                    }
                }
                cb(suggestions);
                return;
            }

            // 过滤并去重
            const uniqueValues = new Set<string>();
            const suggestions: AutocompleteSuggestion[] = [];
            const query = caseSensitive ? queryString : queryString.toLowerCase();

            for (const item of sourceList) {
                const itemRecord = item as Record<string, unknown>;
                const fieldValue = itemRecord[fieldName];
                if (fieldValue && typeof fieldValue === 'string') {
                    const itemValue = caseSensitive ? fieldValue : fieldValue.toLowerCase();

                    // 匹配逻辑
                    const matches = useContains
                        ? itemValue.includes(query)
                        : itemValue === query;

                    if (matches && !uniqueValues.has(itemValue)) {
                        uniqueValues.add(itemValue);
                        suggestions.push({ value: fieldValue });
                        if (suggestions.length >= maxSuggestions) break;
                    }
                }
            }
            cb(suggestions);
        };
    };

    /**
     * 获取完整列表用于建议（延迟加载）
     * @param forceRefresh 是否强制刷新
     */
    const fetchAllForSuggestions = async (forceRefresh = false) => {
        // 如果已经加载过且不强制刷新，不再重复加载
        if (!forceRefresh && allItemsForSuggestions.value.length > 0) {
            return;
        }

        try {
            const items = await fetchAllItems();
            allItemsForSuggestions.value = items;
        } catch (error) {
            // 静默失败，不影响主功能
            console.warn('获取建议列表失败:', error);
        }
    };

    return {
        createSuggestionQuery,
        fetchAllForSuggestions
    };
}

