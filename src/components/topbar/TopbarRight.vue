<template>
  <div class="topbar-right">
    <slot></slot>

    <!-- 用户信息 -->
    <UserProfile @command="handleCommand" />
  </div>
</template>

<script setup lang="ts">
import UserProfile from './UserProfile.vue';

const emit = defineEmits<{
  command: [command: string];
}>();

const handleCommand = (command: string) => {
  emit('command', command);
};
</script>

<style scoped lang="scss">
@import '@/styles/variables.scss';

.topbar-right {
  display: flex;
  align-items: center;
  gap: $spacing-md;
  min-width: fit-content;
  justify-content: flex-end;
}
</style>
