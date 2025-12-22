<template>
  <el-drawer
    v-model="drawerVisible"
    title="消息通知"
    direction="rtl"
    :size="drawerSize"
    :z-index="zIndex"
    :modal="true"
    :modal-class="'drawer-modal-overlay'"
    :append-to-body="true"
    :close-on-click-modal="true"
  >
    <div class="notification-content">
      <div class="notification-header">
        <div class="notification-stats">
          <span class="total-count">共 {{ notifications.length }} 条消息</span>
          <span class="unread-count">{{ unreadCount }} 条未读</span>
        </div>
        <el-button type="primary" size="small" @click="handleMarkAllAsRead">
          全部标记为已读
        </el-button>
      </div>
      
      <div class="notification-list">
        <NotificationItem
          v-for="notification in notifications"
          :key="notification.id"
          :notification="notification"
          @click="handleMarkAsRead(notification)"
        />
      </div>
      
      <div v-if="notifications.length === 0" class="empty-notifications">
        <el-icon><Bell /></el-icon>
        <p>暂无消息通知</p>
      </div>
    </div>
  </el-drawer>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { Bell } from '@element-plus/icons-vue'
import { useNotifications } from '@/composables'
import NotificationItem from './NotificationItem.vue'
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

const {
  notifications,
  unreadCount,
  markAsRead,
  markAllAsRead
} = useNotifications()

const drawerSize = DRAWER.NOTIFICATION.SIZE
const zIndex = DRAWER.NOTIFICATION.Z_INDEX

const handleMarkAsRead = (notification: any) => {
  markAsRead(notification)
}

const handleMarkAllAsRead = () => {
  markAllAsRead()
}
</script>

<style scoped lang="scss">
@import '@/styles/variables.scss';

.notification-content {
  padding: 0;
}

.notification-header {
  padding: $spacing-lg $spacing-xl;
  border-bottom: 1px solid $border-color-lighter;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #f8f9fa;
}

.notification-stats {
  display: flex;
  flex-direction: column;
  gap: $spacing-xs;
}

.total-count {
  font-size: 14px;
  color: $text-color-regular;
  font-weight: 500;
}

.unread-count {
  font-size: 12px;
  color: $color-danger;
}

.notification-list {
  max-height: calc(100vh - 200px);
  overflow-y: auto;
}

.empty-notifications {
  text-align: center;
  padding: 60px $spacing-xl;
  color: $text-color-secondary;
}

.empty-notifications .el-icon {
  font-size: 48px;
  margin-bottom: $spacing-lg;
  color: $border-color-light;
}

.empty-notifications p {
  font-size: 14px;
  margin: 0;
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

