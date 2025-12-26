import { type Ref } from 'vue';
import { debounce } from 'lodash-es';
import { buildSearchParams, addStatusParam } from '@/utils';
import { useSearchHistory } from './useSearchHistory';

/**
 * 表格搜索过滤 Composable
 * 统一处理搜索参数构建、防抖和搜索历史记录
 * 
 * @example
 * ```typescript
 * const { buildSearchParams: buildParams, handleFieldSearch, resetSearch } = useTableSearch({
 *   searchForm,
 *   page,
 *   pageSize,
 *   searchFields: { username: 'username', realName: 'name' },
 *   searchHistoryKey: 'user-search-history',
 *   extractSearchKeywords: (form) => [form.username, form.realName].filter(Boolean),
 *   debounceTime: 200
 * });
 * ```
 */
export function useTableSearch<T extends Record<string, unknown>>(
    options: {
        // 搜索表单
        searchForm: T;
        // 分页相关
        page: Ref<number>;
        pageSize: Ref<number>;
        // 搜索字段映射 { 前端字段名: 后端字段名 }
        searchFields: Record<string, string>;
        // 错误处理函数
        handleError: (error: unknown, message: string, category?: string) => void;
        // 搜索历史键名（可选）
        searchHistoryKey?: string;
        // 搜索关键词提取函数（可选）
        extractSearchKeywords?: (searchForm: T) => string[];
        // 防抖时间（毫秒）
        debounceTime?: number;
        // 是否显示已删除项
        showDeleted?: Ref<boolean> | boolean;
        // 数据获取回调函数
        onFetch: (params: Record<string, unknown>) => Promise<void>;
    }
) {
    const {
        searchForm,
        page,
        pageSize,
        searchFields,
        handleError,
        searchHistoryKey,
        extractSearchKeywords,
        debounceTime = 200,
        showDeleted,
        onFetch
    } = options;

    // 搜索历史管理
    const { addSearchRecord } = searchHistoryKey
        ? useSearchHistory(searchHistoryKey, 10)
        : { addSearchRecord: () => { } };

    /**
     * 构建搜索参数
     */
    const buildParams = (): Record<string, unknown> => {
        const params = buildSearchParams(
            {
                page: page.value,
                pageSize: pageSize.value,
                ...(showDeleted !== undefined && {
                    showDeleted: typeof showDeleted === 'boolean' ? showDeleted : showDeleted.value
                })
            },
            searchFields,
            searchForm
        );

        // 添加状态参数（如果存在）
        if ('status' in searchForm && searchForm.status !== '' && searchForm.status !== null && searchForm.status !== undefined) {
            addStatusParam(params, searchForm.status);
        }

        return params;
    };

    /**
     * 获取数据列表（带防抖）
     */
    const fetchList = debounce(async () => {
        try {
            const params = buildParams();
            await onFetch(params);

            // 搜索历史记录在外部处理，因为需要 total 值
        } catch (error: unknown) {
            handleError(error, '获取数据列表失败，请稍后重试');
        }
    }, debounceTime);

    /**
     * 字段搜索处理（带防抖）
     */
    const handleFieldSearch = debounce(() => {
        page.value = 1; // 搜索时重置到第一页
        fetchList();
    }, debounceTime);

    /**
     * 重置搜索
     */
    const resetSearch = () => {
        Object.keys(searchForm).forEach(key => {
            if (key === 'showDeleted') return; // 不重置显示已删除项开关
            (searchForm as Record<string, unknown>)[key] = '';
        });
        page.value = 1;
        fetchList();
    };

    /**
     * 状态变化处理
     */
    const handleStatusChange = () => {
        page.value = 1;
        fetchList();
    };

    /**
     * 显示已删除项开关变化处理
     */
    const handleShowDeletedChange = () => {
        page.value = 1;
        fetchList();
    };

    return {
        buildParams,
        fetchList,
        handleFieldSearch,
        resetSearch,
        handleStatusChange,
        handleShowDeletedChange
    };
}

