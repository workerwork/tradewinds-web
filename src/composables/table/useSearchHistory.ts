import { ref, watch } from 'vue'
import { logger } from '@/utils'

interface SearchHistoryItem {
  keyword: string
  timestamp: number
  count: number
}

export function useSearchHistory(storageKey: string, maxHistory: number = 10) {
  const searchHistory = ref<SearchHistoryItem[]>([])

  // 从 localStorage 加载搜索历史
  const loadHistory = () => {
    try {
      const saved = localStorage.getItem(storageKey)
      if (saved) {
        searchHistory.value = JSON.parse(saved)
      }
    } catch (error: unknown) {
      logger.warn('加载搜索历史失败', error, 'SearchHistory')
    }
  }

  // 保存搜索历史到 localStorage
  const saveHistory = () => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(searchHistory.value))
    } catch (error: unknown) {
      logger.warn('保存搜索历史失败', error, 'SearchHistory')
    }
  }

  // 添加搜索记录
  const addSearchRecord = (keyword: string, count: number = 0) => {
    if (!keyword.trim()) return

    const existingIndex = searchHistory.value.findIndex(item => item.keyword === keyword)

    if (existingIndex >= 0) {
      // 更新现有记录
      searchHistory.value[existingIndex].timestamp = Date.now()
      searchHistory.value[existingIndex].count = count
    } else {
      // 添加新记录
      searchHistory.value.unshift({
        keyword,
        timestamp: Date.now(),
        count
      })
    }

    // 限制历史记录数量
    if (searchHistory.value.length > maxHistory) {
      searchHistory.value = searchHistory.value.slice(0, maxHistory)
    }
  }

  // 清除搜索历史
  const clearHistory = () => {
    searchHistory.value = []
  }

  // 删除特定搜索记录
  const removeSearchRecord = (keyword: string) => {
    const index = searchHistory.value.findIndex(item => item.keyword === keyword)
    if (index >= 0) {
      searchHistory.value.splice(index, 1)
    }
  }

  // 获取热门搜索（按搜索次数排序）
  const getPopularSearches = (limit: number = 5) => {
    return [...searchHistory.value]
      .sort((a, b) => b.count - a.count)
      .slice(0, limit)
  }

  // 获取最近搜索
  const getRecentSearches = (limit: number = 5) => {
    return searchHistory.value.slice(0, limit)
  }

  // 监听搜索历史变化，自动保存
  watch(searchHistory, saveHistory, { deep: true })

  // 初始化时加载历史
  loadHistory()

  return {
    searchHistory,
    addSearchRecord,
    clearHistory,
    removeSearchRecord,
    getPopularSearches,
    getRecentSearches
  }
} 