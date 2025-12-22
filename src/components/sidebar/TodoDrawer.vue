<template>
  <el-drawer
    v-model="drawerVisible"
    title="待办事项"
    direction="rtl"
    :size="drawerSize"
    :z-index="zIndex"
    :modal="true"
    :modal-class="'drawer-modal-overlay'"
    :append-to-body="true"
    :close-on-click-modal="true"
  >
    <div class="todo-content">
      <el-icon><Calendar /></el-icon>
      <p>待办事项功能开发中...</p>
      <p class="todo-hint">敬请期待</p>
    </div>
  </el-drawer>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { Calendar } from '@element-plus/icons-vue'
import { DRAWER, LAYOUT } from '@/constants'

const props = defineProps<{
  modelValue: boolean
}>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
}>()

const drawerVisible = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

const drawerSize = DRAWER.TODO.SIZE
const zIndex = DRAWER.TODO.Z_INDEX
</script>

<style scoped lang="scss">
@import '@/styles/variables.scss';

.todo-content {
  padding: 40px $spacing-xl;
  text-align: center;
  color: $text-color-secondary;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: $spacing-lg;
}

.todo-content .el-icon {
  font-size: 48px;
  color: $border-color-light;
}

.todo-content p {
  font-size: 14px;
  margin: 0;
  color: $text-color-secondary;
}

.todo-hint {
  font-size: 12px;
  color: $text-color-placeholder;
}

/* 抽屉样式 */
:deep(.el-drawer__header) {
  padding: $spacing-xl;
  border-bottom: 1px solid $border-color-lighter;
  margin-bottom: 0;
}

:deep(.el-drawer__title) {
  font-size: 16px;
  font-weight: 600;
  color: $text-color-primary;
}

:deep(.el-drawer__body) {
  padding: 0;
}

</style>

