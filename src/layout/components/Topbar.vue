<template>
  <div class="topbar" :style="{ background: 'var(--theme-topbar)' }">
    <!-- 左侧：折叠按钮 + 标题 -->
    <TopbarLeft :is-collapse="isCollapse" @toggle="handleToggleSidebar" />

    <!-- 中间：系统公告 -->
    <TopbarAnnouncement />

    <!-- 右侧：全屏 + 用户信息 -->
    <TopbarRight @command="handleCommand">
      <slot />
    </TopbarRight>

    <!-- 弹窗组件 -->
    <ProfileDialog v-model="profileDialogVisible" />
    <PasswordDialog v-model="passwordDialogVisible" />
    <SettingsDialog v-model="settingsDialogVisible" :is-collapse="isCollapse" @update:isCollapse="$emit('update:isCollapse', $event)" />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { ElMessageBox } from 'element-plus'
import { useUserStore } from '@/stores/user'
import TopbarLeft from '@/components/topbar/TopbarLeft.vue'
import TopbarAnnouncement from '@/components/topbar/TopbarAnnouncement.vue'
import TopbarRight from '@/components/topbar/TopbarRight.vue'
import ProfileDialog from '@/components/topbar/ProfileDialog.vue'
import PasswordDialog from '@/components/topbar/PasswordDialog.vue'
import SettingsDialog from '@/components/topbar/SettingsDialog.vue'
import { useProfileDialog, usePasswordDialog, useTopbarSettings } from '@/composables'

const props = defineProps<{
  isCollapse: boolean
}>()

const emit = defineEmits<{
  (e: 'update:isCollapse', value: boolean): void
  (e: 'toggle-sidebar'): void
}>()

const router = useRouter()
const userStore = useUserStore()
const { t } = useI18n()

// 弹窗显示状态（在主组件统一管理）
const profileDialogVisible = ref(false)
const passwordDialogVisible = ref(false)
const settingsDialogVisible = ref(false)

// 使用 composables（传递弹窗状态）
const { showProfile: showProfileInternal, ...profileDialog } = useProfileDialog()
const { showPasswordDialog: showPasswordDialogInternal, ...passwordDialog } = usePasswordDialog()
const { showSettings: showSettingsInternal } = useTopbarSettings(props, emit)

// 包装显示函数，同步状态
const showProfile = () => {
  profileDialogVisible.value = true
  showProfileInternal()
}

const showPasswordDialog = () => {
  passwordDialogVisible.value = true
  showPasswordDialogInternal()
}

const showSettings = () => {
  settingsDialogVisible.value = true
  showSettingsInternal()
}

// 切换侧边栏
const toggleSidebar = () => {
  emit('update:isCollapse', !props.isCollapse)
}

// 处理侧边栏切换（同时触发父组件事件）
const handleToggleSidebar = () => {
  toggleSidebar()
  emit('toggle-sidebar')
}

// 处理下拉菜单命令
const handleCommand = (command: string) => {
  switch (command) {
    case 'profile':
      showProfile()
      break
    case 'settings':
      showSettings()
      break
    case 'password':
      showPasswordDialog()
      break
    case 'logout':
      handleLogout()
      break
  }
}

// 处理退出登录
const handleLogout = async () => {
  try {
    await ElMessageBox.confirm(t('system.logoutConfirm'), t('system.tip'), {
      confirmButtonText: t('system.confirm'),
      cancelButtonText: t('system.cancel'),
      type: 'warning'
    })
    
    await userStore.logout()
    router.push('/login')
  } catch (error) {
    // 用户取消登出或发生错误
  }
}
</script>

<style scoped lang="scss">
@import '@/styles/variables.scss';

.topbar {
  height: 100%;
  display: grid;
  grid-template-columns: auto 1fr auto;
  align-items: center;
  gap: $spacing-lg;
  padding: 0 20px;
  background: var(--theme-topbar);
  color: #fff;
  position: relative;
}

.topbar::after {
  content: '';
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  height: 1px;
  background: linear-gradient(90deg, 
    rgba(255, 255, 255, 0.1),
    rgba(255, 255, 255, 0.05) 50%,
    rgba(255, 255, 255, 0)
  );
}

/* 响应式样式 - 父组件统一管理布局相关的响应式样式 */
@media (max-width: 1024px) {
  .topbar {
    padding: 0 16px;
    gap: $spacing-md;
  }
  
  // 公告容器响应式
  :deep(.announcement-container) {
    max-width: 400px;
  }
}

@media (max-width: 768px) {
  .topbar {
    padding: 0 12px;
    gap: $spacing-sm;
  }
  
  // 用户信息响应式
  :deep(.user-text) {
    display: none;
  }
  
  :deep(.user-profile) {
    width: auto;
    padding: 4px 6px;
  }
  
  // 右侧区域响应式
  :deep(.topbar-right) {
    gap: $spacing-sm;
  }
  
  // 公告容器响应式
  :deep(.announcement-container) {
    max-width: 300px;
    gap: $spacing-sm;
  }
  
  // 系统标题响应式
  :deep(.system-title) {
    font-size: 16px;
  }
  
  // Element Plus 下拉菜单响应式
  :deep(.el-dropdown-menu) {
    width: max-content !important;
    min-width: max-content !important;
  }
  
  :deep(.el-dropdown-menu__item) {
    padding: 8px 10px !important;
    font-size: 13px !important;
    width: max-content !important;
    
    :deep(.el-icon) {
      font-size: 15px !important;
      margin-right: 6px !important;
    }
  }
}

@media (max-width: 480px) {
  .topbar {
    padding: 0 8px;
    gap: $spacing-xs;
  }
  
  // 小屏幕隐藏公告
  :deep(.announcement-container) {
    display: none;
  }
  
  // 右侧区域响应式
  :deep(.topbar-right) {
    gap: $spacing-xs;
  }
  
  // 用户信息响应式
  :deep(.user-profile) {
    padding: 3px 5px;
  }
  
  // Element Plus 下拉菜单响应式
  :deep(.el-dropdown-menu) {
    width: max-content !important;
    min-width: max-content !important;
  }
  
  :deep(.el-dropdown-menu__item) {
    padding: 8px 10px !important;
    font-size: 12px !important;
    width: max-content !important;
    
    :deep(.el-icon) {
      font-size: 14px !important;
      margin-right: 6px !important;
    }
  }
  
  // 系统标题响应式
  :deep(.system-title) {
    font-size: 14px;
  }
}
</style>
