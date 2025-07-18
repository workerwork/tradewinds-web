<template>
  <div v-if="visible" class="search-suggestions">
    <div class="suggestions-header">
      <span class="suggestions-title">搜索建议</span>
      <el-button 
        type="text" 
        size="small" 
        @click="$emit('clear-history')"
        v-if="recentSearches.length > 0"
      >
        清除历史
      </el-button>
    </div>
    
    <!-- 最近搜索 -->
    <div v-if="recentSearches.length > 0" class="suggestions-section">
      <div class="section-title">最近搜索</div>
      <div class="suggestions-list">
        <div
          v-for="item in recentSearches"
          :key="item.keyword"
          class="suggestion-item"
          @click="handleSuggestionClick(item.keyword)"
        >
          <el-icon class="suggestion-icon"><Clock /></el-icon>
          <span class="suggestion-text">{{ item.keyword }}</span>
          <span class="suggestion-count">({{ item.count }})</span>
          <el-button
            type="text"
            size="small"
            class="remove-btn"
            @click.stop="$emit('remove-history', item.keyword)"
          >
            <el-icon><Close /></el-icon>
          </el-button>
        </div>
      </div>
    </div>
    
    <!-- 热门搜索 -->
    <div v-if="popularSearches.length > 0" class="suggestions-section">
      <div class="section-title">热门搜索</div>
      <div class="suggestions-list">
        <div
          v-for="item in popularSearches"
          :key="item.keyword"
          class="suggestion-item"
          @click="handleSuggestionClick(item.keyword)"
        >
          <el-icon class="suggestion-icon"><Star /></el-icon>
          <span class="suggestion-text">{{ item.keyword }}</span>
          <span class="suggestion-count">({{ item.count }})</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Clock, Star, Close } from '@element-plus/icons-vue'

interface SearchHistoryItem {
  keyword: string
  timestamp: number
  count: number
}

interface Props {
  visible: boolean
  recentSearches: SearchHistoryItem[]
  popularSearches: SearchHistoryItem[]
}

defineProps<Props>()

const emit = defineEmits<{
  'suggestion-click': [keyword: string]
  'clear-history': []
  'remove-history': [keyword: string]
}>()

const handleSuggestionClick = (keyword: string) => {
  emit('suggestion-click', keyword)
}
</script>

<style scoped>
.search-suggestions {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: white;
  border: 1px solid #e4e7ed;
  border-radius: 4px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  z-index: 1000;
  max-height: 300px;
  overflow-y: auto;
}

.suggestions-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 12px;
  border-bottom: 1px solid #f0f0f0;
}

.suggestions-title {
  font-size: 14px;
  font-weight: 500;
  color: #606266;
}

.suggestions-section {
  padding: 8px 0;
}

.section-title {
  padding: 4px 12px;
  font-size: 12px;
  color: #909399;
  background: #fafafa;
}

.suggestions-list {
  padding: 4px 0;
}

.suggestion-item {
  display: flex;
  align-items: center;
  padding: 8px 12px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.suggestion-item:hover {
  background-color: #f5f7fa;
}

.suggestion-icon {
  margin-right: 8px;
  font-size: 14px;
  color: #c0c4cc;
}

.suggestion-text {
  flex: 1;
  font-size: 14px;
  color: #606266;
}

.suggestion-count {
  font-size: 12px;
  color: #909399;
  margin-left: 8px;
}

.remove-btn {
  opacity: 0;
  transition: opacity 0.2s;
}

.suggestion-item:hover .remove-btn {
  opacity: 1;
}
</style> 