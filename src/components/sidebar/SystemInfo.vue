<template>
  <div class="system-info" v-show="!isCollapsed">
    <div class="info-section">
      <div class="info-item">
        <el-icon><User /></el-icon>
        <span>{{ t('menu.system.monitor.online') }}: {{ info.onlineUsers }}人</span>
      </div>
      <div class="info-item">
        <el-icon><Monitor /></el-icon>
        <span>{{ t('system.runtime') }}: {{ info.runtime }}</span>
      </div>
      <div class="info-item">
        <el-icon><InfoFilled /></el-icon>
        <span>{{ t('system.version') }}: {{ info.version }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { User, Monitor, InfoFilled } from '@element-plus/icons-vue'
import { useI18n } from 'vue-i18n'
import type { SystemInfo } from '@/types/sidebar'

defineProps<{
  isCollapsed: boolean
  info: SystemInfo
}>()

const { t } = useI18n()
</script>

<style scoped lang="scss">
@import '@/styles/variables.scss';

.system-info {
  padding: $spacing-md $spacing-lg;
  background: rgba(var(--theme-sidebar-rgb), 0.98);
  margin-top: auto;
  flex-shrink: 0;
  border-top: 1px solid rgba(255, 255, 255, 0.08);
}

.info-section {
  display: flex;
  flex-direction: column;
  gap: $spacing-sm;
}

.info-item {
  display: flex;
  align-items: center;
  gap: $spacing-sm;
  color: rgba(255, 255, 255, 0.6);
  font-size: 12px;
  transition: $transition-base;

  &:hover {
    color: rgba(255, 255, 255, 0.8);
  }

  :deep(.el-icon) {
    font-size: 14px;
    color: rgba(255, 255, 255, 0.4);
    transition: $transition-base;
  }

  &:hover :deep(.el-icon) {
    color: rgba(255, 255, 255, 0.6);
  }
}
</style>

