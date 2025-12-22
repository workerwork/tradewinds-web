<template>
  <div
    class="notification-item"
    :class="{ 'is-unread': !notification.read }"
    @click="$emit('click', notification)"
  >
    <div class="notification-icon">
      <el-icon 
        :class="`icon-${notification.type}`"
        :color="getNotificationColor(notification.type)"
      >
        <component :is="getNotificationIcon(notification.type)" />
      </el-icon>
    </div>
    
    <div class="notification-body">
      <div class="notification-title">{{ notification.title }}</div>
      <div class="notification-desc">{{ notification.content }}</div>
      <div class="notification-time">{{ notification.time }}</div>
    </div>
    
    <div v-if="!notification.read" class="unread-dot"></div>
  </div>
</template>

<script setup lang="ts">
import { Bell, Warning, User, SuccessFilled } from '@element-plus/icons-vue'
import { useNotifications, type Notification } from '@/composables'

defineProps<{
  notification: Notification
}>()

defineEmits<{
  click: [notification: Notification]
}>()

const { getNotificationColor } = useNotifications()

const getNotificationIcon = (type: Notification['type']) => {
  const iconMap = {
    'info': Bell,
    'warning': Warning,
    'success': SuccessFilled,
    'error': Warning
  }
  return iconMap[type] || User
}
</script>

<style scoped lang="scss">
@import '@/styles/variables.scss';

.notification-item {
  padding: $spacing-lg $spacing-xl;
  border-bottom: 1px solid #f0f0f0;
  display: flex;
  align-items: flex-start;
  gap: $spacing-md;
  cursor: pointer;
  transition: $transition-base;
  position: relative;
}

.notification-item:hover {
  background: #f8f9fa;
}

.notification-item.is-unread {
  background: rgba(64, 158, 255, 0.02);
  border-left: 3px solid $color-primary;
}

.notification-icon {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: #f0f0f0;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.notification-body {
  flex: 1;
}

.notification-title {
  font-size: 14px;
  font-weight: 500;
  color: $text-color-primary;
  margin-bottom: $spacing-xs;
  line-height: 1.4;
}

.notification-desc {
  font-size: 12px;
  color: $text-color-regular;
  line-height: 1.5;
  margin-bottom: $spacing-sm;
}

.notification-time {
  font-size: 11px;
  color: $text-color-secondary;
}

.unread-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: $color-danger;
  position: absolute;
  top: $spacing-lg;
  right: $spacing-xl;
}
</style>

