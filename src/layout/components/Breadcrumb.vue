<template>
  <el-breadcrumb separator="/">
    <!-- 只在非首页时显示首页图标链接 -->
    <el-breadcrumb-item v-if="showHomeLink" :to="{ path: '/dashboard' }">
      <el-icon class="home-icon"><House /></el-icon>
    </el-breadcrumb-item>
    <el-breadcrumb-item v-for="(item, index) in breadcrumbs" :key="index">
      <span v-if="index === breadcrumbs.length - 1" class="current">
        {{ getBreadcrumbTitle(item) }}
      </span>
      <a v-else class="breadcrumb-link" @click.prevent="handleBreadcrumbClick(item)">
        {{ getBreadcrumbTitle(item) }}
      </a>
    </el-breadcrumb-item>
  </el-breadcrumb>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { House } from '@element-plus/icons-vue';
import { useMenuStore } from '@/stores/menu';
import { MenuItem } from '@/types/menu';
import { logger } from '@/utils';
import { DEBUG } from '@/config';

const route = useRoute();
const router = useRouter();
const { t } = useI18n();
const menuStore = useMenuStore();

// 判断是否显示首页链接（非首页且不在首页的子路由）
const showHomeLink = computed(() => {
  const currentPath = route.path;
  // 如果当前路径是首页或首页的子路由，不显示首页链接
  return currentPath !== '/dashboard' && !currentPath.startsWith('/dashboard/');
});

const breadcrumbs = computed(() => {
  return route.matched
    .filter(item => !item.meta?.hidden && item.path !== '/' && item.path !== '/dashboard')
    .map(item => ({
      path: item.path,
      name: item.name,
      meta: item.meta
    }));
});

// 获取面包屑标题 - 使用缓存优化性能
const titleCache = new Map<string, string>();

const getBreadcrumbTitle = (item: { name?: string | symbol; meta?: { title?: string; breadcrumb?: string } }) => {
  const { meta } = item;
  if (!meta) return typeof item.name === 'string' ? item.name : '';

  // 生成缓存 key
  const cacheKey = `${meta.breadcrumb || ''}_${meta.title || ''}_${item.name?.toString() || ''}`;
  
  // 检查缓存
  if (titleCache.has(cacheKey)) {
    return titleCache.get(cacheKey)!;
  }

  let title = '';

  // 如果 meta.breadcrumb 是 i18n key，则翻译
  if (meta.breadcrumb && typeof meta.breadcrumb === 'string' && meta.breadcrumb.includes('.')) {
    title = t(meta.breadcrumb);
  }
  // 如果 meta.title 是 i18n key，则翻译
  else if (meta.title && typeof meta.title === 'string' && meta.title.includes('.')) {
    title = t(meta.title);
  }
  // 否则直接返回 breadcrumb 或 title
  else {
    title = meta.breadcrumb || meta.title || (typeof item.name === 'string' ? item.name : '');
  }

  // 缓存结果
  titleCache.set(cacheKey, title);
  return title;
};

// 查找菜单项的第一个叶子节点
const findFirstLeafMenu = (menuPath: string): string | null => {
  // 先找到对应的菜单项
  const menu = menuStore.findMenuByPath(menuPath);
  if (!menu) {
    if (DEBUG) {
      logger.warn('找不到对应的菜单项', { menuPath }, 'Breadcrumb');
    }
    return null;
  }

  // 如果是叶子节点，直接返回自身路径
  if (!menu.children || menu.children.length === 0) {
    return menu.path;
  }

  // 递归查找第一个叶子节点
  const findFirstLeaf = (menuItem: MenuItem): string | null => {
    if (!menuItem.children || menuItem.children.length === 0) {
      return menuItem.path;
    }
    
    // 找到第一个可见的子菜单
    const firstVisibleChild = menuItem.children.find(child => child.visible !== false);
    if (!firstVisibleChild) {
      return null;
    }
    
    return findFirstLeaf(firstVisibleChild);
  };

  return findFirstLeaf(menu);
};

// 处理面包屑点击事件
const handleBreadcrumbClick = (item: { path: string }) => {
  const path = item.path;
  
  // 查找该菜单项的第一个叶子节点
  const leafPath = findFirstLeafMenu(path);
  
  if (leafPath && leafPath !== path) {
    if (DEBUG) {
      logger.info('面包屑 - 跳转到第一个叶子菜单', { from: path, to: leafPath }, 'Breadcrumb');
    }
    router.push(leafPath);
  } else {
    // 如果没有找到叶子节点或者就是叶子节点本身，直接跳转
    router.push(path);
  }
};
</script>

<style scoped>
.el-breadcrumb {
  font-size: 14px;
  line-height: 1;
  color: #606266;
  display: flex;
  align-items: center;
  background: transparent;
  padding: 8px 0;
}

:deep(.el-breadcrumb__inner) {
  color: #606266;
  font-weight: normal;
  transition: color 0.2s ease;
  display: flex;
  align-items: center;
  gap: 4px;
  will-change: color;
}

:deep(.el-breadcrumb__separator) {
  color: #909399;
  margin: 0 8px;
  font-weight: normal;
  opacity: 0.6;
}

.breadcrumb-link {
  color: #606266;
  text-decoration: none;
  transition: color 0.2s ease, opacity 0.2s ease;
  display: flex;
  align-items: center;
  gap: 4px;
  opacity: 0.85;
  cursor: pointer;
  will-change: color, opacity;
  
  &:hover {
    color: var(--el-color-primary);
    text-decoration: none;
    opacity: 1;
  }
}

.current {
  color: #303133;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 4px;
  opacity: 1;
}

.el-icon {
  font-size: 14px;
  margin-right: 2px;
  opacity: 0.85;
}

.home-icon {
  font-size: 16px;
  color: #606266;
  transition: all 0.3s;
  cursor: pointer;
  
  &:hover {
    color: var(--el-color-primary);
    opacity: 1;
  }
}
</style> 