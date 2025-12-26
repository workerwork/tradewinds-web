<template>
  <div class="user-info">
    <el-dropdown
      trigger="click"
      popper-class="user-dropdown-popper"
      @command="$emit('command', $event)"
    >
      <div class="user-profile">
        <el-avatar :size="36" :src="userInfo?.avatar" class="user-avatar">
          <span class="avatar-initials">{{ getUserInitials }}</span>
        </el-avatar>
        <div class="user-text">
          <div class="username">{{ userDisplayName }}</div>
          <div class="user-role">{{ getCurrentRoleName() }}</div>
        </div>
        <el-icon class="dropdown-icon"><CaretBottom /></el-icon>
      </div>
      <template #dropdown>
        <el-dropdown-menu class="user-dropdown-menu">
          <el-dropdown-item command="profile">
            <el-icon><UserFilled /></el-icon>
            <span>{{ t('system.profile') }}</span>
          </el-dropdown-item>
          <el-dropdown-item command="settings">
            <el-icon><Setting /></el-icon>
            <span>{{ t('system.settings') }}</span>
          </el-dropdown-item>
          <el-dropdown-item command="password">
            <el-icon><Lock /></el-icon>
            <span>修改密码</span>
          </el-dropdown-item>
          <el-dropdown-item divided command="logout">
            <el-icon><SwitchButton /></el-icon>
            <span>{{ t('system.logout') }}</span>
          </el-dropdown-item>
        </el-dropdown-menu>
      </template>
    </el-dropdown>
  </div>
</template>

<script setup lang="ts">
import { UserFilled, Setting, SwitchButton, Lock, CaretBottom } from '@element-plus/icons-vue';
import { useI18n } from 'vue-i18n';
import { useTopbarUser } from '@/composables';

defineEmits<{
  command: [command: string];
}>();

const { t } = useI18n();
const { userInfo, userDisplayName, getCurrentRoleName, getUserInitials } = useTopbarUser();
</script>

<style scoped lang="scss">
@import '@/styles/variables.scss';

// ==================== 用户信息容器 ====================
.user-info {
  display: flex;
  align-items: center;
  margin-right: -12px;
  position: relative;
}

// ==================== 用户资料卡片 ====================
.user-profile {
  display: flex;
  align-items: center;
  cursor: pointer;
  padding: 4px 10px;
  border-radius: $border-radius-lg;
  transition: $transition-base;
  border: 1px solid rgba(255, 255, 255, 0.1);
  background: rgba(255, 255, 255, 0.05);
  width: 110px;
  box-sizing: border-box;

  &:hover {
    background: rgba(255, 255, 255, 0.15);
    border-color: rgba(255, 255, 255, 0.2);
    transform: translateY(-1px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);

    .dropdown-icon {
      transform: rotate(180deg);
    }
  }
}

// ==================== 用户头像 ====================
.user-avatar {
  background: linear-gradient(135deg, #409eff, #36a3f7);
  color: white;
  box-shadow: 0 2px 8px rgba(64, 158, 255, 0.3);
  border: 2px solid rgba(255, 255, 255, 0.2);
  overflow: hidden;
  width: 32px;
  height: 32px;
  transition: $transition-base;
  flex-shrink: 0;

  :deep(.el-icon) {
    font-size: 18px;
    color: rgba(255, 255, 255, 0.9);
    transition: $transition-base;
  }

  .avatar-initials {
    font-size: 12px;
    font-weight: 600;
    color: rgba(255, 255, 255, 0.95);
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
}

// ==================== 用户文本信息 ====================
.user-text {
  display: flex;
  flex-direction: column;
  margin: 0 6px;
  flex: 1;
  min-width: 60px;
  text-align: left;
}

.username {
  font-size: 14px;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.95);
  line-height: 1.2;
  margin-bottom: 2px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.user-role {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.7);
  line-height: 1;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

// ==================== 下拉箭头图标 ====================
.dropdown-icon {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.7);
  transition: $transition-base;
  flex-shrink: 0;
}

// ==================== 下拉菜单 Popper 容器 ====================
// 使用 popper-class 更精确地控制样式，避免影响其他下拉菜单
:deep(.user-dropdown-popper),
:deep(.el-popper.is-light.user-dropdown-popper) {
  border: none !important;
  box-shadow:
    0 8px 24px rgba(0, 0, 0, 0.12),
    0 4px 12px rgba(0, 0, 0, 0.08) !important;
  backdrop-filter: blur(12px) !important;
  -webkit-backdrop-filter: blur(12px) !important;
  padding: 0 !important;
  width: auto !important;
  min-width: auto !important;
  max-width: none !important;
}

// ==================== 下拉菜单 ====================
:deep(.user-dropdown-menu),
:deep(.user-dropdown-popper .el-dropdown-menu) {
  padding: 6px 0 !important;
  border: none !important;
  box-shadow: none !important;
  width: auto !important;
  min-width: auto !important;
  max-width: none !important;
  border-radius: $border-radius-lg !important;
  background: rgba(255, 255, 255, 0.95) !important;
  border: 1px solid rgba(255, 255, 255, 0.9) !important;
  backdrop-filter: blur(12px) !important;
  -webkit-backdrop-filter: blur(12px) !important;
  overflow: visible !important;
  margin: 0 !important;
  display: inline-block !important;
}

// ==================== 菜单列表 ====================
:deep(.user-dropdown-menu .el-dropdown-menu__list),
:deep(.user-dropdown-popper .el-dropdown-menu__list) {
  padding: 0 !important;
  margin: 0 !important;
  width: auto !important;
  display: inline-block !important;
}

// ==================== 菜单项基础样式 ====================
:deep(.user-dropdown-menu .el-dropdown-menu__item),
:deep(.user-dropdown-popper .el-dropdown-menu__item) {
  display: flex !important;
  flex-direction: row !important;
  align-items: center !important;
  justify-content: flex-start !important;
  padding: 10px 12px !important;
  font-size: 14px !important;
  transition: $transition-fast !important;
  white-space: nowrap !important;
  text-align: left !important;
  border-radius: 0 !important;
  margin: 0 !important;
  color: rgba(0, 0, 0, 0.85) !important;
  cursor: pointer !important;
  width: 100% !important;
  box-sizing: border-box !important;

  // 移除 Element Plus 默认的伪元素
  &::after,
  &::before {
    display: none !important;
    content: none !important;
  }

  // 图标样式
  :deep(.el-icon) {
    margin-right: 8px !important;
    margin-left: 0 !important;
    margin-bottom: 0 !important;
    font-size: 16px !important;
    color: rgba(0, 0, 0, 0.65) !important;
    transition: $transition-fast !important;
    flex-shrink: 0 !important;
    width: 16px !important;
    height: 16px !important;
  }

  // 文字样式
  span {
    display: inline-block !important;
    text-align: left !important;
    flex: 0 0 auto !important;
    color: inherit !important;
    transition: $transition-fast !important;
    white-space: nowrap !important;
    overflow: visible !important;
  }
}

// ==================== 菜单项交互状态 ====================
:deep(.user-dropdown-menu .el-dropdown-menu__item:hover),
:deep(.user-dropdown-popper .el-dropdown-menu__item:hover) {
  background: rgba(64, 158, 255, 0.08) !important;
  color: #409eff !important;

  :deep(.el-icon) {
    color: #409eff !important;
    transform: scale(1.1) !important;
  }

  span {
    color: #409eff !important;
  }
}

:deep(.user-dropdown-menu .el-dropdown-menu__item:active),
:deep(.user-dropdown-popper .el-dropdown-menu__item:active) {
  background: rgba(64, 158, 255, 0.12) !important;
}

// ==================== 退出登录项特殊样式 ====================
:deep(.user-dropdown-menu .el-dropdown-menu__item.is-divided),
:deep(.user-dropdown-popper .el-dropdown-menu__item.is-divided) {
  position: relative;
  border-top: none !important;
  margin-top: 4px !important;
  padding-top: 10px !important;

  // 分隔线
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 12px;
    right: 12px;
    height: 1px;
    background: linear-gradient(
      90deg,
      transparent,
      rgba(0, 0, 0, 0.1) 20%,
      rgba(0, 0, 0, 0.1) 80%,
      transparent
    );
  }

  // 危险操作使用红色
  &:hover {
    background: rgba(245, 108, 108, 0.1) !important;
    color: #f56c6c !important;

    :deep(.el-icon) {
      color: #f56c6c !important;
    }

    span {
      color: #f56c6c !important;
    }
  }
}
</style>
