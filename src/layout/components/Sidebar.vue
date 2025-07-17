<template>
  <div class="sidebar" :class="{ 'is-collapsed': isCollapsed }">
    <!-- 侧边栏头部 -->
    <div class="sidebar-header">
                      <div class="logo-section" v-if="!props.isCollapse">
          <div class="logo-container">
            <div class="logo-icon">
              <el-icon><OfficeBuilding /></el-icon>
        </div>
            <div class="logo-info">
              <div class="welcome-text">欢迎回来</div>
              <div class="user-name-display">{{ getUserDisplayName() }}</div>
      </div>
          </div>
        </div>
      <div class="collapse-section">
      <el-icon 
        class="collapse-trigger"
        @click="toggleCollapse"
      >
        <component :is="isCollapsed ? Expand : Fold" />
      </el-icon>
      </div>
    </div>

    <!-- 快捷操作区 -->
    <div class="quick-actions">
      <el-tooltip :content="isCollapsed ? '消息通知' : ''" placement="right" :disabled="!isCollapsed">
        <el-badge :value="unreadNotifications" :hidden="unreadNotifications === 0" class="action-badge">
          <el-button class="action-btn notification-btn" @click="showNotificationDrawer">
            <el-icon><Bell /></el-icon>
            <span v-show="!isCollapsed" class="action-text">消息</span>
          </el-button>
        </el-badge>
      </el-tooltip>
      
      <el-tooltip :content="isCollapsed ? '待办事项' : ''" placement="right" :disabled="!isCollapsed">
        <el-badge :value="todoCount" :hidden="todoCount === 0" class="action-badge">
          <el-button class="action-btn todo-btn" @click="showTodoDrawer">
            <el-icon><Calendar /></el-icon>
            <span v-show="!isCollapsed" class="action-text">待办</span>
          </el-button>
        </el-badge>
      </el-tooltip>
    </div>

    <div class="menu-container" :style="{ background: 'var(--theme-sidebar)' }">
      <el-menu
        :default-active="currentPath"
        class="el-menu-vertical"
        :router="true"
        :collapse="isCollapsed"
        :unique-opened="true"
        background-color="transparent"
        text-color="rgba(255, 255, 255, 0.7)"
        active-text-color="#ffffff"
        @select="handleMenuSelect"
      >
        <!-- 动态菜单渲染 -->
        <DynamicMenu 
          v-if="menuStore.menus.length > 0" 
          :menu-list="menuStore.menus" 
          :level="0" 
          :isCollapse="isCollapsed"
          @showWorkspace="handleShowWorkspace"
        />
        
        <!-- 加载状态 -->
        <div v-else-if="menuStore.loading" class="menu-loading">
          <el-icon class="is-loading"><Loading /></el-icon>
          <span v-show="!isCollapsed">加载菜单中...</span>
        </div>

        <!-- 无菜单状态 -->
        <div v-else class="no-menu">
          <el-icon><Warning /></el-icon>
          <span v-show="!isCollapsed">暂无菜单</span>
        </div>
      </el-menu>
    </div>

    <!-- 系统信息 -->
    <div class="system-info" v-show="!isCollapsed">
      <div class="info-section">
        <div class="info-item">
          <el-icon><User /></el-icon>
          <span>{{ t('menu.system.monitor.online') }}: 12人</span>
        </div>
        <div class="info-item">
          <el-icon><Monitor /></el-icon>
          <span>{{ t('system.runtime') }}: 3{{ t('system.days') }}12{{ t('system.hours') }}</span>
        </div>
        <div class="info-item">
          <el-icon><InfoFilled /></el-icon>
          <span>{{ t('system.version') }}: v1.0.0</span>
        </div>
      </div>
    </div>
    
    <!-- 通知抽屉 -->
    <el-drawer
      v-model="notificationDrawerVisible"
      title="消息通知"
      direction="rtl"
      size="400px"
    >
      <div class="notification-content">
        <div class="notification-header">
          <div class="notification-stats">
            <span class="total-count">共 {{ notifications.length }} 条消息</span>
            <span class="unread-count">{{ unreadNotifications }} 条未读</span>
          </div>
          <el-button type="primary" size="small" @click="markAllAsRead">
            全部标记为已读
          </el-button>
        </div>
        
        <div class="notification-list">
          <div 
            v-for="notification in notifications" 
            :key="notification.id"
            class="notification-item"
            :class="{ 'is-unread': !notification.read }"
            @click="markAsRead(notification)"
          >
            <div class="notification-icon">
              <el-icon 
                :class="`icon-${notification.type}`"
                :color="getNotificationColor(notification.type)"
              >
                <Bell v-if="notification.type === 'info'" />
                <Warning v-else-if="notification.type === 'warning'" />
                <User v-else />
              </el-icon>
            </div>
            
            <div class="notification-body">
              <div class="notification-title">{{ notification.title }}</div>
              <div class="notification-desc">{{ notification.content }}</div>
              <div class="notification-time">{{ notification.time }}</div>
            </div>
            
            <div v-if="!notification.read" class="unread-dot"></div>
          </div>
        </div>
        
        <div v-if="notifications.length === 0" class="empty-notifications">
          <el-icon><Bell /></el-icon>
          <p>暂无消息通知</p>
        </div>
      </div>
    </el-drawer>
    
    <!-- 待办抽屉 -->
    <el-drawer
      v-model="todoDrawerVisible"
      title="待办事项"
      direction="rtl"
      size="400px"
    >
      <div class="todo-content">
        <el-icon><Calendar /></el-icon>
        <p>待办事项功能开发中...</p>
        <p style="font-size: 12px; color: #c0c4cc;">敬请期待</p>
      </div>
    </el-drawer>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { ElMessage } from 'element-plus';
import { storeToRefs } from 'pinia';
import { useUserStore } from '@/stores/user';
import { useMenuStore } from '@/stores/menu';
import DynamicMenu from '@/components/DynamicMenu.vue';
import {
  House,
  ShoppingCart,
  User,
  List,
  Goods,
  Document,
  Setting,
  Lock,
  UserFilled,
  Avatar,
  Bell,
  Calendar,
  InfoFilled,
  Monitor,
  TrendCharts,
  Connection,
  Collection,
  Download,
  Folder,
  SetUp,
  Menu,
  Timer,
  Expand,
  Fold,
  Search,
  OfficeBuilding,
  DataLine,
  Warning,
  Coordinate,
  Loading
} from '@element-plus/icons-vue'

const props = defineProps<{
  isCollapse: boolean
}>()

const emit = defineEmits<{
  (e: 'update:isCollapse', value: boolean): void
}>()

const route = useRoute()
const { t } = useI18n();
const userStore = useUserStore();
const { userInfo } = storeToRefs(userStore);
const menuStore = useMenuStore();

// 获取用户显示名称
// 临时调试函数 - 可以在控制台中调用 window.debugUserInfo() 查看用户信息
if (typeof window !== 'undefined') {
  (window as any).debugUserInfo = () => {
    console.log('=== 用户信息调试 ===');
    console.log('userInfo.value:', userInfo.value);
    console.log('userStore完整状态:', {
      token: userStore.token,
      userInfo: userStore.userInfo,
      roles: userStore.roles,
      permissions: userStore.permissions
    });
    return userInfo.value;
  };
}

const getUserDisplayName = () => {
  if (!userInfo.value) return '管理员';
  
  // 将用户信息转换为any类型以访问可能的字段
  const user = userInfo.value as any;
  
  // 添加调试信息
  console.log('Sidebar - 用户显示名称调试:', {
    完整用户信息: user,
    用户字段: Object.keys(user),
    realName: user.realName,
    real_name: user.real_name,
    username: user.username,
    roles: user.roles,
    角色数量: user.roles ? user.roles.length : 0,
    第一个角色: user.roles && user.roles.length > 0 ? user.roles[0] : null
  });
  
  // 1. 优先显示真实姓名
  const realNames = [
    user.realName,
    user.real_name
  ];
  
  for (const name of realNames) {
    if (name && typeof name === 'string' && name.trim()) {
      console.log('Sidebar - 使用真实姓名:', name.trim());
      return name.trim();
    }
  }
  
  // 2. 如果真实姓名为空，优先显示用户名
  const userNames = [
    user.username,
    user.user_name,
    user.name
  ];
  
  for (const name of userNames) {
    if (name && typeof name === 'string' && name.trim()) {
      console.log('Sidebar - 使用用户名:', name.trim());
      return name.trim();
    }
  }
  
  // 3. 如果用户名也为空，显示角色名
  if (user.roles && Array.isArray(user.roles) && user.roles.length > 0) {
    const roleName = user.roles[0].name;
    if (roleName && typeof roleName === 'string' && roleName.trim()) {
      console.log('Sidebar - 使用角色名:', roleName.trim());
      return roleName.trim();
    }
  }
  
  // 4. 最后fallback到其他字段
  const fallbackNames = [
    user.nickname,
    user.displayName,
    user.display_name
  ];
  
  for (const name of fallbackNames) {
    if (name && typeof name === 'string' && name.trim()) {
      console.log('Sidebar - 使用fallback名称:', name.trim());
      return name.trim();
    }
  }
  
  console.log('Sidebar - 使用默认名称: 管理员');
  return '管理员';
};

const isCollapsed = computed({
  get: () => props.isCollapse,
  set: (value) => emit('update:isCollapse', value)
})

const currentPath = computed(() => route.path)

// 处理三级菜单的工作区显示
const handleShowWorkspace = (menu: any) => {
  console.log('显示工作区:', menu.name, menu);
  // TODO: 在主内容区域显示工作区组件
  // 这里可以通过event bus、状态管理或者直接在Layout中处理
  // 目前先显示提示
  ElMessage.success(`正在加载工作区: ${menu.title || menu.name}`);
};



// 通知和待办相关状态
const unreadNotifications = ref(3)
const todoCount = ref(5)
const notificationDrawerVisible = ref(false)
const todoDrawerVisible = ref(false)

// 模拟通知数据
const notifications = ref([
  {
    id: 1,
    title: '系统更新',
    content: '系统将于今晚12点进行维护，预计2小时',
    time: '2分钟前',
    type: 'warning',
    read: false
  },
  {
    id: 2,
    title: '订单提醒',
    content: '您有3个新订单待处理',
    time: '10分钟前',
    type: 'info',
    read: false
  },
  {
    id: 3,
    title: '客户咨询',
    content: '张三询问产品详情',
    time: '1小时前',
    type: 'success',
    read: true
  }
])

const toggleCollapse = () => {
  isCollapsed.value = !isCollapsed.value
}

// 显示通知抽屉
const showNotificationDrawer = () => {
  notificationDrawerVisible.value = true
}

// 显示待办抽屉
const showTodoDrawer = () => {
  todoDrawerVisible.value = true
}

// 标记单个通知为已读
const markAsRead = (notification: any) => {
  if (!notification.read) {
    notification.read = true
    unreadNotifications.value--
  }
}

// 标记所有通知为已读
const markAllAsRead = () => {
  notifications.value.forEach(notification => {
    notification.read = true
  })
  unreadNotifications.value = 0
}

// 获取通知图标颜色
const getNotificationColor = (type: string) => {
  const colorMap: Record<string, string> = {
    'info': '#409EFF',
    'warning': '#E6A23C',
    'success': '#67C23A',
    'error': '#F56C6C'
  }
  return colorMap[type] || '#909399'
}

// 处理菜单选择事件
const handleMenuSelect = (index: string) => {
  console.log('Sidebar - 菜单选择:', {
    选择的路径: index,
    当前路径: route.path
  });
  
  // 如果选择的路径与当前路径不同，进行路由跳转
  if (index !== route.path) {
    console.log('Sidebar - 准备跳转到:', index);
  }
}
</script>

<style>
/* 全局滚动条样式 */
::-webkit-scrollbar {
  display: none !important;
  width: 0 !important;
  height: 0 !important;
}

::-webkit-scrollbar-track {
  display: none !important;
}

::-webkit-scrollbar-thumb {
  display: none !important;
}

/* 全局样式，不使用 scoped */
.el-menu--vertical .el-menu {
  background-color: #2c3e50 !important;
}

.el-menu--vertical .el-menu-item {
  height: 36px !important;
  line-height: 36px !important;
  padding: 0 16px 0 40px !important;
  margin: 1px 8px !important;
  border-radius: 6px !important;
  color: rgba(255, 255, 255, 0.75) !important;
  background: transparent !important;
  font-size: 14px !important;
}

.el-menu--vertical .el-menu-item:hover {
  background: rgba(255, 255, 255, 0.08) !important;
  color: #ffffff !important;
}

.el-menu--vertical .el-menu-item.is-active {
  background: rgba(64, 158, 255, 0.15) !important;
  color: #409EFF !important;
}

.el-menu--vertical .el-sub-menu.is-active > .el-sub-menu__title {
  color: #409EFF !important;
}

.el-popper.is-light {
  border: none !important;
  background: #2c3e50 !important;
  padding: 4px !important;
}

.el-popper__arrow::before {
  background: #2c3e50 !important;
  border: none !important;
}

/* 贸易看板样式 */
.trade-dashboard {
  height: 42px !important;
  line-height: 42px !important;
  padding: 0 16px !important;
  margin: 3px 8px !important;
  border-radius: 8px !important;
  color: rgba(255, 255, 255, 0.9) !important;
  background: rgba(255, 255, 255, 0.05) !important;
  font-weight: 500 !important;
  font-size: 15px !important;
}

.trade-dashboard:hover {
  background: rgba(255, 255, 255, 0.1) !important;
  color: #ffffff !important;
}

.trade-dashboard.is-active {
  background: rgba(64, 158, 255, 0.15) !important;
  color: #409EFF !important;
}

.trade-dashboard .el-icon {
  margin-right: 12px !important;
  font-size: 16px !important;
  width: 16px;
  height: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
}

/* 优化弹出菜单样式 */
.el-menu--popup {
  padding: 4px !important;
  min-width: 200px !important;
  max-width: none !important;
}

.el-menu--popup .el-menu-item {
  height: 36px !important;
  line-height: 36px !important;
  margin: 1px 4px !important;
  border-radius: 4px !important;
  white-space: nowrap !important;
  overflow: hidden !important;
  text-overflow: ellipsis !important;
}

/* 减小弹出菜单的间距 */
.el-menu--popup .el-menu {
  padding: 0 !important;
}

/* 确保所有弹出菜单宽度一致 */
.el-menu--popup-container {
  min-width: 200px !important;
}

.el-menu--vertical:not(.el-menu--collapse) .el-menu {
  min-width: 200px !important;
}
</style>

<style scoped>
:root {
  --theme-sidebar: #223046;
  --theme-sidebar-rgb: 34,48,70;
}

.sidebar {
  min-width: 56px;
  height: 100%;
  background: var(--theme-sidebar);
  display: flex;
  flex-direction: column;
  width: 220px;
  transition: all 0.3s ease;
  position: relative;
  -webkit-app-region: no-drag; /* 防止 Tauri 中的拖拽影响 */
  overflow: hidden; /* 防止内容溢出 */
}

.sidebar.is-collapsed {
  width: 56px !important;
  min-width: 56px !important;
  max-width: 56px !important;
}

.sidebar.is-collapsed .collapse-trigger {
  transform: rotate(180deg);
}

.menu-container {
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
  padding: 4px 0;
  scrollbar-width: none !important;
  -ms-overflow-style: none !important;
  -webkit-overflow-scrolling: touch;
  max-height: calc(100vh - 160px); /* 减去头部、快捷操作区和系统信息的高度 */
  background: var(--theme-sidebar);
}

.menu-container::-webkit-scrollbar {
  display: none !important;
  width: 0 !important;
  height: 0 !important;
  -webkit-appearance: none;
  appearance: none;
}

.menu-container::-webkit-scrollbar-track {
  display: none !important;
}

.menu-container::-webkit-scrollbar-thumb {
  display: none !important;
}

/* 菜单样式优化 */
:deep(.el-menu) {
  border-right: none;
  background: transparent !important;
}

/* 父级菜单项样式 - 仅应用于顶级菜单 */
:deep(.menu-level-0.el-sub-menu > .el-sub-menu__title) {
  height: 42px !important;
  line-height: 42px !important;
  padding: 0 16px !important;
  margin: 3px 8px !important;
  border-radius: 8px !important;
  color: rgba(255, 255, 255, 0.9) !important;
  background: rgba(255, 255, 255, 0.05) !important;
  font-weight: 600 !important;
  font-size: 15px !important;
  letter-spacing: 0.5px;
  transition: all 0.3s ease !important;
  display: flex !important;
  align-items: center !important;
  justify-content: space-between !important;
}

:deep(.dashboard-item.el-menu-item) {
  height: 42px !important;
  line-height: 42px !important;
  padding: 0 16px !important;
  margin: 3px 8px !important;
  border-radius: 8px !important;
  color: rgba(255, 255, 255, 0.9) !important;
  background: rgba(255, 255, 255, 0.05) !important;
  font-weight: 600 !important;
  font-size: 15px !important;
  letter-spacing: 0.5px;
  transition: all 0.3s ease !important;
  display: flex !important;
  align-items: center !important;
}

:deep(.el-sub-menu__title:hover),
:deep(.dashboard-item.el-menu-item:hover) {
  background: rgba(255, 255, 255, 0.1) !important;
  color: #ffffff !important;
}

:deep(.dashboard-item.el-menu-item.is-active) {
  background: rgba(64, 158, 255, 0.15) !important;
  color: #409EFF !important;
}

:deep(.dashboard-item .el-icon) {
  font-size: 16px;
  margin-right: 12px;
  width: 16px;
  height: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
}

/* 子菜单项样式 - 支持多层级 */
:deep(.el-menu-item:not(.dashboard-item)) {
  height: 36px;
  line-height: 36px;
  padding: 0 16px 0 16px !important; /* 基础左边距，具体由组件动态设置 */
  margin: 1px 8px;
  border-radius: 6px;
  color: rgba(255, 255, 255, 0.75);
  background: transparent !important;
  font-size: 14px;
  transition: all 0.3s ease;
}

:deep(.el-menu-item:not(.dashboard-item):hover) {
  background: rgba(255, 255, 255, 0.08) !important;
  color: #ffffff !important;
}

/* 不同层级菜单项的高度和样式调整 - 与DynamicMenu保持一致 */
:deep(.menu-level-0.el-menu-item) {
  height: 42px !important;
  line-height: 42px !important;
  font-size: 15px !important;
  font-weight: 600 !important;
  padding: 0 16px !important;
  margin: 3px 8px !important;
  border-radius: 8px !important;
  color: rgba(255, 255, 255, 0.9) !important;
  background: rgba(255, 255, 255, 0.05) !important;
}

:deep(.menu-level-1.el-menu-item) {
  height: 36px !important;
  line-height: 36px !important;
  font-size: 14px !important;
  font-weight: 500 !important;
}

:deep(.menu-level-2.el-menu-item) {
  height: 34px !important;
  line-height: 34px !important;
  font-size: 13px !important;
  font-weight: 400 !important;
  opacity: 0.9 !important;
}

:deep(.menu-level-3.el-menu-item),
:deep(.menu-level-4.el-menu-item),
:deep(.menu-level-5.el-menu-item) {
  height: 32px;
  line-height: 32px;
  font-size: 12px;
  font-weight: 400;
  opacity: 0.85;
}

/* 三级及以上菜单图标和文字间距调整 */
:deep(.menu-level-2.el-menu-item .el-icon),
:deep(.menu-level-3.el-menu-item .el-icon),
:deep(.menu-level-4.el-menu-item .el-icon),
:deep(.menu-level-5.el-menu-item .el-icon) {
  margin-right: 8px;
  font-size: 14px;
  width: 14px;
  height: 14px;
}

/* 子菜单标题样式 - 支持多层级 */
:deep(.menu-level-0 > .el-sub-menu__title) {
  font-size: 15px;
  font-weight: 600;
  height: 42px;
  line-height: 42px;
}

:deep(.menu-level-1 > .el-sub-menu__title) {
  font-size: 14px;
  font-weight: 500;
  height: 38px;
  line-height: 38px;
}

:deep(.menu-level-2 > .el-sub-menu__title) {
  font-size: 13px;
  font-weight: 400;
  height: 36px;
  line-height: 36px;
  opacity: 0.9;
}

:deep(.menu-level-3 > .el-sub-menu__title),
:deep(.menu-level-4 > .el-sub-menu__title),
:deep(.menu-level-5 > .el-sub-menu__title) {
  font-size: 12px;
  font-weight: 400;
  height: 34px;
  line-height: 34px;
  opacity: 0.85;
}

/* 主菜单激活状态 */
:deep(.el-menu-item.is-active) {
  background: rgba(64, 158, 255, 0.15) !important;
  color: #409EFF !important;
  font-weight: 500;
}

/* 子菜单容器样式 */
:deep(.el-menu--popup-container) {
  background: #2c3e50 !important;
}

/* 子菜单展开时的背景 */
:deep(.el-sub-menu.is-opened) {
  background: rgba(255, 255, 255, 0.03);
  border-radius: 8px;
  margin: 2px 0;
}

/* 子菜单展开时的标题 */
:deep(.el-sub-menu.is-opened > .el-sub-menu__title) {
  margin-bottom: 2px;
}

/* 图标样式优化 */
:deep(.el-sub-menu__title .el-icon),
:deep(.el-menu-item .el-icon) {
  margin-right: 12px;
  font-size: 16px;
  transition: all 0.3s ease;
  width: 16px;
  height: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
}

:deep(.el-sub-menu__title .el-icon) {
  font-size: 16px;
}

:deep(.el-menu-item .el-icon) {
  font-size: 16px;
}

/* 折叠时的样式调整 - 简化版本 */
.sidebar.is-collapsed {
  :deep(.el-menu--collapse) {
    /* 基础菜单项和子菜单标题样式 */
    .el-sub-menu__title,
    .el-menu-item {
      width: 40px !important;
      height: 40px !important;
      padding: 0 !important;
      margin: 2px 8px !important;
      border-radius: 8px !important;
      display: flex !important;
      align-items: center !important;
      justify-content: center !important;
      position: relative !important;
    }
    
    /* 图标居中 - 使用绝对定位确保完美居中 */
    .el-menu-item .el-icon,
    .el-sub-menu__title .el-icon {
      position: absolute !important;
      top: 50% !important;
      left: 50% !important;
      transform: translate(-50%, -50%) !important;
      font-size: 18px !important;
      width: 18px !important;
      height: 18px !important;
      margin: 0 !important;
      padding: 0 !important;
    }
    

    
    /* 隐藏所有文字内容和箭头 */
    .el-menu-item span,
    .el-sub-menu__title span,
    .el-sub-menu__icon-arrow,
    .menu-badge,
    .el-badge {
      display: none !important;
    }
    
    /* 隐藏子菜单展开的小点 */
    .el-sub-menu__title::before,
    .el-sub-menu__title::after,
    .el-menu-item::before,
    .el-menu-item::after {
      display: none !important;
    }
    
    /* 重置Element Plus的内置样式 */
    .el-menu--collapse {
      width: 56px !important;
    }
    
    /* 折叠状态下的悬停效果优化 */
    .el-sub-menu__title:hover,
    .el-menu-item:hover,
    .trade-dashboard:hover {
      transform: scale(1.05);
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
    }
    
    .el-menu-item.is-active,
    .trade-dashboard.is-active {
      transform: scale(1.05);
      box-shadow: 0 2px 12px rgba(64, 158, 255, 0.3);
    }
    
    /* 确保图标垂直居中 */
    .el-sub-menu__title,
    .el-menu-item {
      position: relative;
      overflow: visible;
    }
    
    .el-sub-menu__title .el-icon,
    .el-menu-item .el-icon {
      position: static;
    }
  }
}

/* 确保所有文本在折叠时不会溢出 */
:deep(.el-menu-item span),
:deep(.el-sub-menu__title span) {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* 子菜单箭头图标样式 */
:deep(.el-sub-menu__title .el-sub-menu__icon-arrow) {
  font-size: 12px;
  margin-right: 0;
  color: rgba(255, 255, 255, 0.6);
}

:deep(.el-sub-menu:hover .el-sub-menu__icon-arrow) {
  color: rgba(255, 255, 255, 0.9);
}

/* 快捷操作区 */
.quick-actions {
  padding: 8px;
  display: flex;
  gap: 6px;
  justify-content: flex-start;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  background: rgba(var(--theme-sidebar-rgb),0.85);
  flex-wrap: wrap;
  align-items: center;
}

.sidebar.is-collapsed .quick-actions {
  flex-direction: column;
  align-items: center;
  gap: 4px;
  padding: 8px;
}

.action-btn {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: rgba(255, 255, 255, 0.8);
  padding: 8px 12px;
  border-radius: 6px;
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
  display: flex;
  align-items: center;
  gap: 6px;
  min-height: 32px;
  width: auto;
  font-size: 12px;
  position: relative;
  overflow: visible;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
  will-change: transform, background-color, box-shadow;
  text-shadow: none !important;
  font-weight: 500;
  text-rendering: optimizeLegibility;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

.action-btn .el-icon {
  transition: transform 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
}

/* 强制移除所有可能的文字阴影和滤镜效果 */
.action-btn,
.action-btn *,
.action-btn:hover,
.action-btn:hover *,
.action-btn:active,
.action-btn:active *,
.action-btn .action-text,
.action-btn span {
  text-shadow: none !important;
  filter: none !important;
  backdrop-filter: none !important;
}

/* Element Plus Button 样式覆盖 */
.action-btn.el-button,
.action-btn.el-button:hover,
.action-btn.el-button:focus,
.action-btn.el-button:active {
  text-shadow: none !important;
  filter: none !important;
  backdrop-filter: none !important;
  box-shadow: 
    0 4px 16px rgba(0, 0, 0, 0.3), 
    0 2px 8px rgba(255, 255, 255, 0.05) !important;
}

.sidebar.is-collapsed .action-btn {
  width: 36px;
  height: 36px;
  padding: 8px;
  justify-content: center;
  gap: 0;
  border-radius: 8px;
  min-height: auto;
  position: relative;
}

.sidebar.is-collapsed .action-btn:hover {
  transform: translateY(-2px) scale(1.1);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.3), 0 2px 8px rgba(255, 255, 255, 0.05);
  text-shadow: none !important;
  filter: none !important;
  backdrop-filter: none !important;
}

.sidebar.is-collapsed .action-btn:active {
  transform: translateY(-1px) scale(1.05);
}

.action-btn:hover {
  background: rgba(255, 255, 255, 0.15);
  border-color: rgba(255, 255, 255, 0.3);
  color: #ffffff;
  transform: translateY(-2px) scale(1.02);
  box-shadow: 
    0 4px 16px rgba(0, 0, 0, 0.3), 
    0 2px 8px rgba(255, 255, 255, 0.05);
  text-shadow: none !important;
  filter: none !important;
}

.action-btn:hover .el-icon {
  transform: scale(1.1);
  transition: transform 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
}

/* 展开状态下悬浮时隐藏文字 */
.action-btn:hover .action-text {
  opacity: 0;
  transform: scale(0.8);
  transition: all 0.2s ease-out;
}

.action-btn:active {
  transform: translateY(-1px) scale(0.98);
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.25);
  background: rgba(255, 255, 255, 0.2);
  transition: all 0.15s cubic-bezier(0.25, 0.8, 0.25, 1);
}

.action-text {
  font-size: 12px;
  font-weight: 500;
  white-space: nowrap;
  text-shadow: none !important;
  letter-spacing: 0.2px;
  text-rendering: optimizeLegibility;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  filter: none !important;
}

.action-badge {
  line-height: 1;
}

.action-badge :deep(.el-badge__content) {
  background-color: #f56c6c !important;
  border: 1px solid rgba(255, 255, 255, 0.2) !important;
  font-size: 10px !important;
  height: 16px !important;
  line-height: 14px !important;
  min-width: 16px !important;
  padding: 0 4px !important;
  color: white !important;
  font-weight: 500 !important;
  border-radius: 8px !important;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3) !important;
  /* 展开状态下的位置调整 */
  right: -8px !important;
  top: -8px !important;
  transform: none !important;
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1) !important;
}

.action-badge:hover :deep(.el-badge__content) {
  transform: scale(1.1) !important;
  box-shadow: 0 3px 6px rgba(0, 0, 0, 0.4) !important;
  background-color: #ff5722 !important;
}

/* 侧边栏折叠时的徽章位置调整 */
.sidebar.is-collapsed .action-badge :deep(.el-badge__content) {
  right: -6px !important;
  top: -6px !important;
}

/* 系统信息样式调整 */
.system-info {
  padding: 12px;
  background: rgba(var(--theme-sidebar-rgb),0.98);
  margin-top: auto; /* 将系统信息推到底部 */
}

.info-section {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.info-item {
  display: flex;
  align-items: center;
  gap: 8px;
  color: rgba(255, 255, 255, 0.6);
  font-size: 12px;
}

.info-item .el-icon {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.4);
}

/* 侧边栏头部区域 */
.sidebar-header {
  padding: 10px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  background: rgba(var(--theme-sidebar-rgb),0.92);
  min-height: 60px;
}

.logo-section {
  flex: 1;
  min-width: 0;
  display: flex;
  align-items: center;
}

.logo-container {
  display: flex;
  align-items: center;
  justify-content: flex-start;
  gap: 12px;
}

.logo-info {
  flex: 1;
  min-width: 0;
}

.welcome-text {
  color: rgba(255, 255, 255, 0.7);
  font-size: 12px;
  line-height: 1.2;
  margin-bottom: 2px;
}

.user-name-display {
  color: rgba(255, 255, 255, 0.95);
  font-size: 15px;
  font-weight: 600;
  line-height: 1.2;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.logo-icon {
  width: 40px;
  height: 40px;
  border-radius: 8px;
  background: linear-gradient(135deg, rgba(var(--theme-sidebar-rgb),1), rgba(var(--theme-sidebar-rgb),0.7));
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 12px rgba(64, 158, 255, 0.4);
  flex-shrink: 0;
  transition: all 0.3s ease;
}

.logo-icon:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 16px rgba(64, 158, 255, 0.5);
}

.logo-icon .el-icon {
  font-size: 20px;
  color: white;
}

.collapse-section {
  display: flex;
  align-items: center;
}

/* 折叠状态样式 */
.sidebar.is-collapsed .sidebar-header {
  min-height: 42px;
  padding: 6px;
  justify-content: center;
  align-items: center;
}

.sidebar.is-collapsed .collapse-section {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
}

.sidebar.is-collapsed .collapse-trigger {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 6px;
  padding: 6px;
  font-size: 16px;
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* 折叠状态下的其他优化 */

/* 折叠状态下的整体布局优化 */
.sidebar.is-collapsed {
  overflow: hidden;
}

/* 添加一些微动画 */
.logo-icon {
  transition: all 0.3s ease;
}

.collapse-trigger {
  cursor: pointer;
  font-size: 18px;
  color: rgba(255, 255, 255, 0.7);
  transition: all 0.3s ease;
  padding: 8px;
  border-radius: 4px;
  flex-shrink: 0;
}

.collapse-trigger:hover {
  color: #ffffff;
  background: rgba(255, 255, 255, 0.1);
}

/* 菜单徽章样式（仅限菜单区域） */
.menu-container .menu-badge {
  margin-left: 8px;
  transform: scale(0.8);
}

.menu-container :deep(.el-badge__content) {
  transform: scale(0.8) translate(40%, -40%);
}

/* 菜单加载状态 */
.menu-loading,
.no-menu {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  color: rgba(255, 255, 255, 0.6);
  font-size: 14px;
  gap: 8px;
}

.menu-loading .el-icon {
  font-size: 18px;
}

.no-menu .el-icon {
  font-size: 18px;
  color: rgba(255, 255, 255, 0.4);
}

/* 通知抽屉样式 */
.notification-content {
  padding: 0;
}

.notification-header {
  padding: 16px 20px;
  border-bottom: 1px solid #ebeef5;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #f8f9fa;
}

.notification-stats {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.total-count {
  font-size: 14px;
  color: #606266;
  font-weight: 500;
}

.unread-count {
  font-size: 12px;
  color: #f56c6c;
}

.notification-list {
  max-height: calc(100vh - 200px);
  overflow-y: auto;
}

.notification-item {
  padding: 16px 20px;
  border-bottom: 1px solid #f0f0f0;
  display: flex;
  align-items: flex-start;
  gap: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
}

.notification-item:hover {
  background: #f8f9fa;
}

.notification-item.is-unread {
  background: rgba(64, 158, 255, 0.02);
  border-left: 3px solid #409EFF;
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
  color: #303133;
  margin-bottom: 4px;
  line-height: 1.4;
}

.notification-desc {
  font-size: 12px;
  color: #606266;
  line-height: 1.5;
  margin-bottom: 8px;
}

.notification-time {
  font-size: 11px;
  color: #909399;
}

.unread-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #f56c6c;
  position: absolute;
  top: 16px;
  right: 20px;
}

.empty-notifications {
  text-align: center;
  padding: 60px 20px;
  color: #909399;
}

.empty-notifications .el-icon {
  font-size: 48px;
  margin-bottom: 16px;
  color: #dcdfe6;
}

.empty-notifications p {
  font-size: 14px;
  margin: 0;
}

/* 待办抽屉样式 */
.todo-content {
  padding: 40px 20px;
  text-align: center;
  color: #909399;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
}

.todo-content .el-icon {
  font-size: 48px;
  color: #dcdfe6;
}

.todo-content p {
  font-size: 14px;
  margin: 0;
  color: #909399;
}

/* 抽屉标题样式优化 */
:deep(.el-drawer__header) {
  padding: 20px;
  border-bottom: 1px solid #ebeef5;
  margin-bottom: 0;
}

:deep(.el-drawer__title) {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
}

:deep(.el-drawer__body) {
  padding: 0;
}
</style> 