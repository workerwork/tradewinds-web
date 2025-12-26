<template>
  <el-config-provider :locale="elementLocale">
    <router-view v-slot="{ Component, route }">
      <!-- 
        Layout 组件使用固定 key + keep-alive 确保复用，避免顶栏和侧边栏刷新
        登录页不使用 keep-alive，其他 Layout 路由使用 keep-alive 缓存
      -->
      <keep-alive :include="['Layout']" :exclude="['Login']">
        <component 
          :is="Component" 
          :key="getRouteKey(route)" 
        />
      </keep-alive>
    </router-view>
  </el-config-provider>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import type { RouteLocationNormalized } from 'vue-router';
import zhCn from 'element-plus/dist/locale/zh-cn.mjs';
import en from 'element-plus/dist/locale/en.mjs';

const { locale } = useI18n();

// Element Plus 语言包
const elementLocale = computed(() => {
  return locale.value === 'zh-CN' ? zhCn : en;
});

// 获取路由 key：登录页使用 path，Layout 路由使用固定 key
// 使用固定 key + keep-alive 确保 Layout 组件复用，避免顶栏和侧边栏重新渲染
const getRouteKey = (route: RouteLocationNormalized): string => {
  // 登录页使用 path 作为 key，确保登录页独立渲染
  if (route.path === '/login' || route.name === 'Login') {
    return route.path;
  }
  
  // 所有其他路由（都是 Layout 路由）使用固定 key
  // 配合 keep-alive，确保 Layout 组件实例被缓存和复用
  // 这样顶栏和侧边栏不会刷新
  return 'main-layout';
};
</script>

<style>
/* 基础样式 */
* {
  box-sizing: border-box;
}

body,
html {
  margin: 0;
  padding: 0;
  width: 100%;
  height: 100%;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

#app {
  width: 100%;
  height: 100%;
  margin: 0;
  padding: 0;
  background-color: #f5f5f5;
}

/* 确保登录页面容器样式正确 */
.login-container {
  min-height: 100%;
  width: 100%;
}

/* 优化滚动性能 */
* {
  scrollbar-width: thin;
  scrollbar-color: rgba(0, 0, 0, 0.2) transparent;
}

*::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}

*::-webkit-scrollbar-track {
  background: transparent;
}

*::-webkit-scrollbar-thumb {
  background-color: rgba(0, 0, 0, 0.2);
  border-radius: 3px;
}

*::-webkit-scrollbar-thumb:hover {
  background-color: rgba(0, 0, 0, 0.3);
}
</style>
