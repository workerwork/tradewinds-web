<template>
  <div class="menu-empty">
    <el-icon><Warning /></el-icon>
    <span v-show="!isCollapsed">暂无菜单</span>
  </div>
</template>

<script setup lang="ts">
import { Warning } from '@element-plus/icons-vue';

defineProps<{
  isCollapsed: boolean;
}>();
</script>

<style scoped lang="scss">
@import '@/styles/variables.scss';

.menu-empty {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: $spacing-xl;
  color: rgba(255, 255, 255, 0.6);
  font-size: 14px;
  gap: $spacing-sm;
}

.menu-empty .el-icon {
  font-size: 18px;
  color: rgba(255, 255, 255, 0.4);
}
</style>
