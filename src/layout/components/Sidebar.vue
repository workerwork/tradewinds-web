<template>
  <aside 
    class="sidebar" 
    :class="{ 'is-collapsed': isCollapsed }"
    role="complementary"
    :aria-label="isCollapsed ? '折叠的侧边栏' : '侧边栏导航'"
  >
    <!-- 侧边栏头部 -->
    <SidebarHeader 
      :is-collapsed="isCollapsed" 
      @toggle="toggleCollapse" 
    />

    <!-- 快捷操作区 -->
    <QuickActions
      :is-collapsed="isCollapsed"
      :unread-count="unreadNotifications"
      :todo-count="todoCount"
      @show-notification="showNotificationDrawer"
      @show-todo="showTodoDrawer"
    />

    <nav class="menu-container" aria-label="主导航菜单">
      <el-menu
        :default-active="currentPath"
        class="el-menu-vertical"
        :router="true"
        :collapse="isCollapsed"
        :unique-opened="true"
        background-color="transparent"
        :text-color="MENU_CONFIG.TEXT_COLOR"
        :active-text-color="MENU_CONFIG.ACTIVE_TEXT_COLOR"
        @select="handleMenuSelect"
      >
        <!-- 动态菜单渲染 -->
        <DynamicMenu 
          v-if="hasMenus && Array.isArray(menus) && menus.length > 0" 
          :menu-list="menus" 
          :level="0" 
          :isCollapse="isCollapsed"
          @showWorkspace="handleShowWorkspace"
        />
        
        <!-- 加载状态 -->
        <MenuLoading v-else-if="loading" :is-collapsed="isCollapsed" />

        <!-- 无菜单状态 -->
        <MenuEmpty v-else :is-collapsed="isCollapsed" />
      </el-menu>
    </nav>

    <!-- 系统信息 -->
    <SystemInfo 
      :is-collapsed="isCollapsed"
      :info="systemInfo"
    />
    
    <!-- 通知抽屉 -->
    <NotificationDrawer v-model="notificationDrawerVisible" />
    
    <!-- 待办抽屉 -->
    <TodoDrawer v-model="todoDrawerVisible" />
  </aside>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import DynamicMenu from '@/components/DynamicMenu.vue';
import SidebarHeader from '@/components/sidebar/SidebarHeader.vue';
import QuickActions from '@/components/sidebar/QuickActions.vue';
import SystemInfo from '@/components/sidebar/SystemInfo.vue';
import NotificationDrawer from '@/components/sidebar/NotificationDrawer.vue';
import TodoDrawer from '@/components/sidebar/TodoDrawer.vue';
import MenuLoading from '@/components/sidebar/MenuLoading.vue';
import MenuEmpty from '@/components/sidebar/MenuEmpty.vue';
import { 
    useNotifications, 
    useSidebarDrawers, 
    useSystemInfo, 
    useSidebarCollapse, 
    useTodo, 
    useMenuHandler, 
    useMenuState 
} from '@/composables';
import { MENU_CONFIG } from '@/constants/sidebar';

const props = defineProps<{
  isCollapse: boolean
}>()

const emit = defineEmits<{
  (e: 'update:isCollapse', value: boolean): void
}>()

const route = useRoute()

// 使用 Composables
const { isCollapsed, toggleCollapse } = useSidebarCollapse(props, emit)
const { systemInfo } = useSystemInfo()
const { unreadCount: unreadNotifications } = useNotifications()
const { todoCount } = useTodo()
const {
  notificationDrawerVisible,
  todoDrawerVisible,
  showNotificationDrawer,
  showTodoDrawer
} = useSidebarDrawers()
const { menus, loading, hasMenus } = useMenuState()

const currentPath = computed(() => route.path)

// 菜单处理逻辑
const { handleShowWorkspace, handleMenuSelect } = useMenuHandler()
</script>


<style scoped lang="scss">
@import '@/styles/variables.scss';
@import '@/styles/scrollbar.scss';

:root {
  --theme-sidebar: #{$sidebar-bg};
  --theme-sidebar-rgb: 34, 48, 70;
}

.sidebar {
  min-width: $sidebar-width-collapsed;
  height: 100%;
  background: var(--theme-sidebar);
  display: flex;
  flex-direction: column;
  width: $sidebar-width-expanded;
  transition: $transition-sidebar;
  position: relative;
  -webkit-app-region: no-drag; /* 防止 Tauri 中的拖拽影响 */
  overflow: hidden; /* 隐藏溢出，但允许弹出菜单显示 */
  z-index: 1; /* 确保侧边栏在内容之上 */
}

.sidebar.is-collapsed {
  width: $sidebar-width-collapsed !important;
  min-width: $sidebar-width-collapsed !important;
  max-width: $sidebar-width-collapsed !important;
}

.sidebar.is-collapsed .collapse-trigger {
  transform: rotate(180deg);
}

@import '@/styles/sidebar-menu.scss';

.menu-container {
  flex: 1;
  background: var(--theme-sidebar);
  position: relative; /* 确保弹出菜单定位正确 */
  z-index: 1; /* 确保菜单容器在内容之上 */
  min-height: 0; /* 允许 flex 子元素收缩 */
  overflow-y: auto;
  overflow-x: hidden;
  display: flex;
  flex-direction: column;
}

/* 菜单徽章样式（仅限菜单区域） */
.menu-container .menu-badge {
  margin-left: $spacing-sm;
  transform: scale($scale-sm);
  transition: $transition-base;
}

.menu-container :deep(.el-badge__content) {
  transform: scale($scale-sm) translate(40%, -40%);
  transition: $transition-base;
}

</style> 