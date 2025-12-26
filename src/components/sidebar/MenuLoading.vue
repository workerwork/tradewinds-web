<template>
  <div class="menu-loading">
    <el-icon class="is-loading"><Loading /></el-icon>
    <span v-show="!isCollapsed">加载菜单中...</span>
  </div>
</template>

<script setup lang="ts">
import { Loading } from '@element-plus/icons-vue';

defineProps<{
  isCollapsed: boolean;
}>();
</script>

<style scoped lang="scss">
@import '@/styles/variables.scss';

.menu-loading {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: $spacing-xl;
  color: rgba(255, 255, 255, 0.6);
  font-size: 14px;
  gap: $spacing-sm;
}

.menu-loading .el-icon {
  font-size: 18px;
}
</style>
