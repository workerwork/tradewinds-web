<template>
  <aside
    class="sidebar"
    :class="{ 
      'is-collapsed': isCollapsed,
      'is-collapsing': isCollapsing
    }"
    role="complementary"
    :aria-label="isCollapsed ? '折叠的侧边栏' : '侧边栏导航'"
  >
    <!-- 侧边栏头部 -->
    <SidebarHeader :is-collapsed="isCollapsed" @toggle="toggleCollapse" />

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
        ref="menuRef"
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
          :is-collapse="isCollapsed"
          @show-workspace="handleShowWorkspace"
        />

        <!-- 加载状态 -->
        <MenuLoading v-else-if="loading" :is-collapsed="isCollapsed" />

        <!-- 无菜单状态 -->
        <MenuEmpty v-else :is-collapsed="isCollapsed" />
      </el-menu>
    </nav>

    <!-- 系统信息 -->
    <SystemInfo :is-collapsed="isCollapsed" :info="systemInfo" />

    <!-- 通知抽屉 -->
    <NotificationDrawer v-model="notificationDrawerVisible" />

    <!-- 待办抽屉 -->
    <TodoDrawer v-model="todoDrawerVisible" />
  </aside>
</template>

<script setup lang="ts">
import { computed, ref, watch, type ComponentPublicInstance } from 'vue';
import { useRoute } from 'vue-router';
import type { ElMenu } from 'element-plus';
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
  useMenuState,
} from '@/composables';
import { MENU_CONFIG } from '@/constants/sidebar';

const props = defineProps<{
  isCollapse: boolean;
}>();

const emit = defineEmits<{
  (e: 'update:isCollapse', value: boolean): void;
}>();

const route = useRoute();

// 菜单引用
const menuRef = ref<ComponentPublicInstance<typeof ElMenu>>();

// 使用 Composables
const { isCollapsed, toggleCollapse } = useSidebarCollapse(props, emit);
const { systemInfo } = useSystemInfo();
const { unreadCount: unreadNotifications } = useNotifications();
const { todoCount } = useTodo();
const { notificationDrawerVisible, todoDrawerVisible, showNotificationDrawer, showTodoDrawer } =
  useSidebarDrawers();
const { menus, loading, hasMenus } = useMenuState();

const currentPath = computed(() => route.path);

// 菜单处理逻辑
const { handleShowWorkspace, handleMenuSelect } = useMenuHandler();

// 折叠状态过渡管理
const isCollapsing = ref(false);

// 监听折叠状态变化，优化折叠动画
watch(() => isCollapsed.value, (newValue, oldValue) => {
  // 当从展开状态变为折叠状态时
  if (!oldValue && newValue) {
    // 标记开始折叠
    isCollapsing.value = true;
    
    // 使用 requestAnimationFrame 确保在下一帧执行，性能更好
    requestAnimationFrame(() => {
      // 通过 DOM 操作关闭所有展开的子菜单
      const menuEl = document.querySelector('.sidebar .el-menu');
      if (menuEl) {
        // 查找所有展开的子菜单并关闭它们
        const openedSubMenus = menuEl.querySelectorAll('.el-sub-menu.is-opened');
        openedSubMenus.forEach((subMenu: Element) => {
          const title = subMenu.querySelector('.el-sub-menu__title');
          if (title) {
            // 触发点击事件来关闭子菜单
            (title as HTMLElement).click();
          }
        });
      }
      
      // 折叠动画完成后重置状态
      setTimeout(() => {
        isCollapsing.value = false;
      }, 300); // 与 CSS transition 时间一致
    });
  } else if (oldValue && !newValue) {
    // 展开时重置状态
    isCollapsing.value = false;
  }
});
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
  transition: width 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  -webkit-app-region: no-drag; /* 防止 Tauri 中的拖拽影响 */
  overflow: hidden; /* 隐藏溢出，但允许弹出菜单显示 */
  z-index: 1; /* 确保侧边栏在内容之上 */
  /* 优化性能：只在折叠/展开时提示浏览器优化 */
  contain: layout style paint;
  /* 使用 transform 提示 GPU 加速 */
  transform: translateZ(0);
  backface-visibility: hidden;
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
  /* 优化滚动性能 */
  scroll-behavior: smooth;
  -webkit-overflow-scrolling: touch;
  /* 移除 contain 属性，避免影响组件复用 */
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
