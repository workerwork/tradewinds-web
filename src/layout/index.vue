<template>
  <el-container class="layout-container">
    <!-- 顶部导航栏 -->
    <el-header height="64px" class="header">
      <topbar v-model:isCollapse="isCollapse" />
    </el-header>

    <!-- 主体部分 -->
    <el-container class="main-container">
      <!-- 侧边栏 -->
      <el-aside :width="isCollapse ? '56px' : '220px'" class="aside">
        <sidebar v-model:isCollapse="isCollapse" />
      </el-aside>

      <!-- 主要内容区 -->
      <el-main class="main">
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
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import Topbar from './components/Topbar.vue'
import Sidebar from './components/Sidebar.vue'
import Breadcrumb from './components/Breadcrumb.vue'

const isCollapse = ref(false)
const $route = useRoute()

// 在组件挂载时加载保存的侧边栏状态
onMounted(() => {
  const savedSidebarCollapsed = localStorage.getItem('sidebarCollapsed')
  if (savedSidebarCollapsed === null) {
    isCollapse.value = false // 首次进入展开
    localStorage.setItem('sidebarCollapsed', 'false')
  } else {
    isCollapse.value = savedSidebarCollapsed === 'true'
  }
})
</script>

<style>
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
  transition: width 0.3s;
  overflow: hidden;
  background-color: var(--theme-sidebar, #1f2937);
  border-right: 1px solid rgba(0, 0, 0, 0.08);
  height: 100%;
  display: flex;
  flex-direction: column;
}

.main {
  padding: 16px 24px;
  height: 100%;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  background: #f5f7fa;
}

.main-content {
  flex: 1;
  position: relative;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  overflow: hidden;
}

.page-component {
  padding: 20px;
  height: 100%;
}

.breadcrumb {
  margin-bottom: 16px;
  padding: 8px 0;
  position: relative;
  z-index: 1;
}

/* 页面过渡动画 */
.page-enter-active,
.page-leave-active {
  transition: opacity 0.15s ease-in-out, transform 0.15s ease-in-out;
}

.page-enter-from {
  opacity: 0;
  transform: translate(10px, 0);
}

.page-leave-to {
  opacity: 0;
  transform: translate(-10px, 0);
}
</style> 