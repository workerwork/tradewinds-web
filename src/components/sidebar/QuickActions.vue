<template>
  <div class="quick-actions" :class="{ 'is-collapsed': isCollapsed }">
    <el-tooltip :content="isCollapsed ? '消息通知' : ''" placement="right" :disabled="!isCollapsed">
      <el-badge :value="unreadCount" :hidden="unreadCount === 0" class="action-badge">
        <el-button class="action-btn notification-btn" @click="$emit('showNotification')">
          <el-icon><Bell /></el-icon>
          <span v-show="!isCollapsed" class="action-text">消息</span>
        </el-button>
      </el-badge>
    </el-tooltip>

    <el-tooltip :content="isCollapsed ? '待办事项' : ''" placement="right" :disabled="!isCollapsed">
      <el-badge :value="todoCount" :hidden="todoCount === 0" class="action-badge">
        <el-button class="action-btn todo-btn" @click="$emit('showTodo')">
          <el-icon><Calendar /></el-icon>
          <span v-show="!isCollapsed" class="action-text">待办</span>
        </el-button>
      </el-badge>
    </el-tooltip>
  </div>
</template>

<script setup lang="ts">
import { Bell, Calendar } from '@element-plus/icons-vue';

defineProps<{
  isCollapsed: boolean;
  unreadCount: number;
  todoCount: number;
}>();

defineEmits<{
  showNotification: [];
  showTodo: [];
}>();
</script>

<style scoped lang="scss">
@import '@/styles/variables.scss';

.quick-actions {
  padding: $spacing-md $spacing-lg;
  display: flex;
  gap: $spacing-sm;
  justify-content: flex-start;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  background: rgba(var(--theme-sidebar-rgb), 0.85);
  flex-wrap: wrap;
  align-items: center;
  flex-shrink: 0;
}

.action-btn {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: rgba(255, 255, 255, 0.8);
  padding: $spacing-sm $spacing-md;
  border-radius: $border-radius-md;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 6px;
  min-height: 32px;
  width: auto;
  font-size: 12px;
  position: relative;
  overflow: visible;
  box-shadow: $shadow-sm;
  font-weight: 500;
  will-change: transform, background-color, border-color;
}

.action-btn :deep(.el-icon) {
  transition: color 0.2s ease, transform 0.2s ease;
  will-change: transform;
}

.action-btn:hover {
  background: rgba(255, 255, 255, 0.15);
  border-color: rgba(255, 255, 255, 0.3);
  color: #ffffff;
  transform: translateY(-2px) scale(1.02);
  box-shadow: $shadow-md;
}

.action-btn:hover :deep(.el-icon) {
  transform: scale(1.1);
}

.action-btn:active {
  transform: translateY(-1px) scale(0.98);
  box-shadow: $shadow-sm;
}

.action-text {
  font-size: 12px;
  font-weight: 500;
  white-space: nowrap;
  letter-spacing: 0.2px;
}

// 折叠状态样式 - 使用组件内条件类
.quick-actions.is-collapsed {
  flex-direction: column !important;
  align-items: center !important;
  gap: 0 !important;
  padding: $spacing-xs 0 !important;
  justify-content: flex-start !important;
  overflow: visible !important;
}

.quick-actions.is-collapsed :deep(.el-tooltip) {
  width: 100% !important;
  display: flex !important;
  justify-content: center !important;
  margin: 0 !important;
}

.quick-actions.is-collapsed :deep(.el-badge) {
  width: 100% !important;
  display: flex !important;
  justify-content: center !important;
  margin: 0 !important;
}

.quick-actions.is-collapsed .action-btn {
  width: 40px !important;
  height: 40px !important;
  min-width: 40px !important;
  max-width: 40px !important;
  min-height: 40px !important;
  max-height: 40px !important;
  padding: 0 !important;
  margin: 2px 0 !important;
  justify-content: center !important;
  align-items: center !important;
  gap: 0 !important;
  border-radius: $border-radius-lg !important;
  display: flex !important;
  position: relative !important;
  box-sizing: border-box !important;
  line-height: 1 !important;
  overflow: visible !important;
  will-change: transform !important;
}

.quick-actions.is-collapsed .action-btn :deep(.el-icon) {
  position: absolute !important;
  top: 50% !important;
  left: 50% !important;
  transform: translate(-50%, -50%) !important;
  font-size: 18px !important;
  width: 18px !important;
  height: 18px !important;
  margin: 0 !important;
}

.action-badge {
  line-height: 1;
  position: relative;
  display: inline-block;
}

.action-badge :deep(.el-badge__content) {
  background-color: $color-danger !important;
  border: 1px solid rgba(255, 255, 255, 0.2) !important;
  font-size: 10px !important;
  height: 18px !important;
  line-height: 18px !important;
  min-width: 18px !important;
  padding: 0 4px !important;
  color: white !important;
  font-weight: 600 !important;
  border-radius: 9px !important;
  box-shadow: $shadow-sm !important;
  position: absolute !important;
  right: -8px !important;
  top: -8px !important;
  transform: translate(0, 0) !important;
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
  z-index: 10 !important;
  pointer-events: none !important;
}

.quick-actions.is-collapsed .action-badge :deep(.el-badge__content) {
  right: -2px !important;
  top: -2px !important;
  height: 16px !important;
  line-height: 16px !important;
  min-width: 16px !important;
  font-size: 9px !important;
  border-radius: 8px !important;
  z-index: 10 !important;
  pointer-events: none !important;
}

.quick-actions.is-collapsed .action-badge {
  overflow: visible !important;
  position: relative !important;
}

.quick-actions.is-collapsed :deep(.el-badge) {
  overflow: visible !important;
}
</style>
