<template>
  <el-container class="layout-container">
    <!-- 顶部导航栏 -->
    <el-header height="64px" class="header">
      <topbar v-model:is-collapse="isCollapse" @toggle-sidebar="handleToggleSidebar" />
    </el-header>

    <!-- 主体部分 -->
    <el-container class="main-container">
      <!-- 桌面端：固定侧边栏 -->
      <el-aside
        v-show="!isMobile"
        :width="isCollapse ? '56px' : '220px'"
        class="aside desktop-sidebar"
      >
        <sidebar v-model:is-collapse="isCollapse" />
      </el-aside>

      <!-- 移动端：抽屉式侧边栏 -->
      <el-drawer
        v-if="isMobile"
        v-model="mobileSidebarVisible"
        :with-header="false"
        direction="ltr"
        size="220px"
        :modal="true"
        :close-on-click-modal="true"
        :append-to-body="true"
        :z-index="1001"
        class="mobile-sidebar-drawer"
      >
        <sidebar :is-collapse="false" />
      </el-drawer>

      <!-- 主要内容区 -->
      <el-main class="main" :class="{ 'is-mobile': isMobile }">
        <breadcrumb class="breadcrumb" />
        <div class="main-content">
          <router-view v-slot="{ Component, route }">
            <transition name="page" mode="out-in">
              <component :is="Component" :key="route.path" class="page-component" />
            </transition>
          </router-view>
        </div>
      </el-main>
    </el-container>
  </el-container>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed, watch } from 'vue';
import { useRoute } from 'vue-router';
import Topbar from './components/Topbar.vue';
import Sidebar from './components/Sidebar.vue';
import Breadcrumb from './components/Breadcrumb.vue';

// 定义组件名称，用于 keep-alive 缓存
defineOptions({
  name: 'Layout'
});

const isCollapse = ref(false);
const mobileSidebarVisible = ref(false);
const $route = useRoute();

// 安全的移动端检测（使用 matchMedia，更可靠且性能更好）
const isMobile = ref(false);
let mediaQuery: MediaQueryList | null = null;
let mediaQueryHandler: ((e: MediaQueryListEvent | MediaQueryList) => void) | null = null;

const checkMobile = () => {
  if (typeof window !== 'undefined') {
    // 使用 matchMedia 进行检测，性能更好
    if (!mediaQuery) {
      mediaQuery = window.matchMedia('(max-width: 767px)');
    }
    isMobile.value = mediaQuery.matches;
  }
};

// 节流函数 - 优化版本，使用时间戳和 requestAnimationFrame
const throttle = (func: Function, wait: number) => {
  let timeout: ReturnType<typeof setTimeout> | null = null;
  let lastCallTime = 0;
  let rafId: number | null = null;
  
  return function (this: any, ...args: any[]) {
    const now = Date.now();
    const timeSinceLastCall = now - lastCallTime;
    
    // 立即执行第一次调用
    if (timeSinceLastCall >= wait) {
      lastCallTime = now;
      func.apply(this, args);
    } else if (!timeout && !rafId) {
      // 使用 requestAnimationFrame 优化，确保在下一帧执行
      rafId = requestAnimationFrame(() => {
        rafId = null;
        timeout = setTimeout(() => {
          lastCallTime = Date.now();
          timeout = null;
          func.apply(this, args);
        }, wait - timeSinceLastCall);
      });
    }
  };
};

const handleResize = throttle(checkMobile, 150);

// 处理侧边栏切换
const handleToggleSidebar = () => {
  if (isMobile.value) {
    // 移动端：切换抽屉显示
    mobileSidebarVisible.value = !mobileSidebarVisible.value;
  } else {
    // 桌面端：切换折叠状态
    isCollapse.value = !isCollapse.value;
    localStorage.setItem('sidebarCollapsed', String(isCollapse.value));
  }
};

// 在组件挂载时加载保存的侧边栏状态
onMounted(() => {
  // 初始化移动端检测
  checkMobile();

  // 使用 matchMedia 监听媒体查询变化（性能更好）
  if (typeof window !== 'undefined') {
    if (!mediaQuery) {
      mediaQuery = window.matchMedia('(max-width: 767px)');
    }
    
    // 使用 matchMedia 的 change 事件，比 resize 更高效
    mediaQueryHandler = (e: MediaQueryListEvent | MediaQueryList) => {
      isMobile.value = e.matches;
    };
    
    // 现代浏览器支持 addEventListener
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', mediaQueryHandler);
    } else {
      // 兼容旧浏览器
      mediaQuery.addListener(mediaQueryHandler);
      window.addEventListener('resize', handleResize);
    }
  }

  // 加载侧边栏状态（仅桌面端）
  if (!isMobile.value) {
    const savedSidebarCollapsed = localStorage.getItem('sidebarCollapsed');
    if (savedSidebarCollapsed === null) {
      isCollapse.value = false;
      localStorage.setItem('sidebarCollapsed', 'false');
    } else {
      isCollapse.value = savedSidebarCollapsed === 'true';
    }
  }
});

onUnmounted(() => {
  if (typeof window !== 'undefined') {
    // 清理 matchMedia 监听器
    if (mediaQuery && mediaQueryHandler) {
      if (mediaQuery.removeEventListener) {
        mediaQuery.removeEventListener('change', mediaQueryHandler);
      } else {
        // 兼容旧浏览器
        mediaQuery.removeListener(mediaQueryHandler);
      }
    }
    // 清理 resize 监听器（如果使用了）
    window.removeEventListener('resize', handleResize);
  }
});

// 路由变化时，移动端自动关闭抽屉
watch(
  () => $route.path,
  () => {
    if (isMobile.value) {
      mobileSidebarVisible.value = false;
    }
  }
);
</script>

<style scoped lang="scss">
.layout-container {
  height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: #f5f7fa;
  overflow: hidden;
}

.header {
  padding: 0;
  z-index: 1000;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.08);
  background-color: var(--theme-topbar, #1f2937);
  width: 100vw;
  left: 0;
  top: 0;
  position: fixed;
  height: 64px;
}

.main-container {
  flex: 1;
  overflow: hidden;
  height: 100vh;
  display: flex;
  flex-direction: row;
  margin-top: 64px;
}

.aside {
  transition: width 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  overflow: visible;
  background-color: var(--theme-sidebar, #1f2937);
  border-right: 1px solid rgba(0, 0, 0, 0.08);
  height: 100%;
  display: flex;
  flex-direction: column;
  position: relative;
  z-index: 1;
  will-change: width;
}

.desktop-sidebar {
  @media (max-width: 767px) {
    display: none !important;
  }
}

.main {
  flex: 1;
  padding: 16px 24px;
  height: 100%;
  overflow-y: auto;
  overflow-x: hidden;
  display: flex;
  flex-direction: column;
  background: #f5f7fa;
  transition: padding 0.3s ease;

  &.is-mobile {
    padding: 12px 16px;
    width: 100%;
  }
}

.main-content {
  flex: 1;
  position: relative;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  overflow: hidden;
  min-height: 0;
  /* 移除 contain 属性，避免影响组件复用 */
}

.page-component {
  padding: 20px;
  height: 100%;
  overflow-y: auto;
  overflow-x: hidden;

  /* 移动端优化 */
  @media (max-width: 768px) {
    padding: 16px;
  }

  @media (max-width: 480px) {
    padding: 12px;
  }
}

.breadcrumb {
  margin-bottom: 16px;
  padding: 8px 0;
  position: relative;
  z-index: 1;
  flex-shrink: 0;

  @media (max-width: 768px) {
    margin-bottom: 12px;
    padding: 6px 0;
  }
}

/* 移动端抽屉样式 */
.mobile-sidebar-drawer {
  :deep(.el-drawer__body) {
    padding: 0;
    overflow: hidden;
  }

  :deep(.el-drawer) {
    top: 64px;
    height: calc(100vh - 64px);
  }
}

/* 页面过渡动画 - 优化为更平滑的效果，使用 GPU 加速 */
.page-enter-active {
  transition:
    opacity 0.2s ease-out,
    transform 0.2s ease-out;
  will-change: opacity, transform;
}

.page-leave-active {
  transition:
    opacity 0.15s ease-in,
    transform 0.15s ease-in;
  will-change: opacity, transform;
}

.page-enter-from {
  opacity: 0;
  transform: translateX(8px);
}

.page-leave-to {
  opacity: 0;
  transform: translateX(-8px);
}

/* 响应式优化 */
@media (max-width: 1024px) {
  .main {
    padding: 14px 20px;
  }

  .page-component {
    padding: 18px;
  }
}

@media (max-width: 768px) {
  .main-container {
    margin-top: 64px;
  }

  .main {
    padding: 12px 16px;
  }

  .main-content {
    border-radius: 6px;
  }
}

@media (max-width: 480px) {
  .main {
    padding: 8px 12px;
  }

  .page-component {
    padding: 12px;
  }

  .breadcrumb {
    margin-bottom: 10px;
  }
}
</style>
