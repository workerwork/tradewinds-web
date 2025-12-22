<template>
  <div class="sidebar-header" :class="{ 'is-collapsed': isCollapsed }">
    <div class="logo-section" v-if="!isCollapsed">
      <div class="logo-container">
        <div class="logo-icon">
          <el-icon><OfficeBuilding /></el-icon>
        </div>
        <div class="logo-info">
          <div class="welcome-text">欢迎回来</div>
          <div class="user-name-display">{{ userDisplayName }}</div>
        </div>
      </div>
    </div>
    <div class="collapse-section">
      <el-icon 
        class="collapse-trigger"
        @click="$emit('toggle')"
      >
        <component :is="isCollapsed ? Expand : Fold" />
      </el-icon>
    </div>
  </div>
</template>

<script setup lang="ts">
import { OfficeBuilding, Expand, Fold } from '@element-plus/icons-vue'
import { useUserDisplayName } from '@/composables'

defineProps<{
  isCollapsed: boolean
}>()

defineEmits<{
  toggle: []
}>()

const { userDisplayName } = useUserDisplayName()
</script>

<style scoped lang="scss">
@import '@/styles/variables.scss';

.sidebar-header {
  padding: $spacing-md $spacing-lg;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  background: rgba(var(--theme-sidebar-rgb), 0.92);
  min-height: 64px;
  flex-shrink: 0;
}

.logo-section {
  flex: 1;
  min-width: 0;
  display: flex;
  align-items: center;
}

.logo-container {
  display: flex;
  align-items: center;
  justify-content: flex-start;
  gap: $spacing-md;
  width: 100%;
}

.logo-info {
  flex: 1;
  min-width: 0;
}

.welcome-text {
  color: rgba(255, 255, 255, 0.7);
  font-size: 12px;
  line-height: 1.2;
  margin-bottom: 2px;
}

.user-name-display {
  color: rgba(255, 255, 255, 0.95);
  font-size: 15px;
  font-weight: 600;
  line-height: 1.2;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.logo-icon {
  width: 40px;
  height: 40px;
  border-radius: $border-radius-lg;
  background: linear-gradient(135deg, rgba(var(--theme-sidebar-rgb), 1), rgba(var(--theme-sidebar-rgb), 0.7));
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 12px rgba(64, 158, 255, 0.4);
  flex-shrink: 0;
  transition: $transition-base;

  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 16px rgba(64, 158, 255, 0.5);
  }

  :deep(.el-icon) {
    font-size: 20px;
    color: white;
    transition: $transition-base;
  }
}

.collapse-section {
  display: flex;
  align-items: center;
}

.collapse-trigger {
  cursor: pointer;
  font-size: 18px;
  color: rgba(255, 255, 255, 0.7);
  transition: $transition-base;
  padding: $spacing-sm;
  border-radius: $border-radius-sm;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover {
    color: #ffffff;
    background: rgba(255, 255, 255, 0.1);
  }

  :deep(.el-icon) {
    transition: $transition-base;
  }
}

// 折叠状态样式 - 直接使用组件内的类
.sidebar-header.is-collapsed {
  min-height: 64px;
  padding: $spacing-xs 0 !important;
  justify-content: center !important;
  align-items: center !important;
}

.sidebar-header.is-collapsed .collapse-section {
  width: 100% !important;
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
  margin: 0 !important;
  padding: 0 !important;
}

.sidebar-header.is-collapsed .collapse-trigger {
  background: rgba(255, 255, 255, 0.1) !important;
  border-radius: $border-radius-lg !important;
  padding: 0 !important;
  font-size: 18px !important;
  width: 40px !important;
  height: 40px !important;
  min-width: 40px !important;
  max-width: 40px !important;
  min-height: 40px !important;
  max-height: 40px !important;
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
  margin: 2px 0 !important;
  position: relative !important;
  box-sizing: border-box !important;
}

.sidebar-header.is-collapsed .collapse-trigger .el-icon {
  position: absolute !important;
  top: 50% !important;
  left: 50% !important;
  transform: translate(-50%, -50%) !important;
  font-size: 18px !important;
  width: 18px !important;
  height: 18px !important;
  margin: 0 !important;
}
</style>

