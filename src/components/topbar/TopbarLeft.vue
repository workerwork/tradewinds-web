<template>
  <div class="topbar-left">
    <el-icon class="collapse-btn" @click="$emit('toggle')">
      <component :is="isCollapse ? 'Expand' : 'Fold'" />
    </el-icon>
    <h1 class="system-title">{{ title }}</h1>
  </div>
</template>

<script setup lang="ts">
import { Expand, Fold } from '@element-plus/icons-vue'
import { useI18n } from 'vue-i18n'

defineProps<{
  isCollapse: boolean
}>()

defineEmits<{
  toggle: []
}>()

const { t } = useI18n()
const title = t('system.title')
</script>

<style scoped lang="scss">
@import '@/styles/variables.scss';

.topbar-left {
  display: flex;
  align-items: center;
  gap: $spacing-md;
  min-width: fit-content;
}

.collapse-btn {
  font-size: 20px;
  cursor: pointer;
  color: rgba(255, 255, 255, 0.7);
  transition: $transition-base;
  display: flex;
  align-items: center;
  justify-content: center;
  
  &:hover {
    color: #fff;
    transform: scale(1.1);
  }

  :deep(.el-icon) {
    transition: $transition-base;
  }
}

.system-title {
  font-size: 20px;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.95);
  margin: 0;
  letter-spacing: 1px;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
  white-space: nowrap;
}
</style>

