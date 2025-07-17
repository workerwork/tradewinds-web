<template>
  <el-breadcrumb separator="/">
    <el-breadcrumb-item :to="{ path: '/' }">
      <el-icon><House /></el-icon>
      <span>{{ t('menu.dashboard.title') }}</span>
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
import { ElMessage } from 'element-plus';

const route = useRoute();
const router = useRouter();
const { t } = useI18n();
const menuStore = useMenuStore();

const breadcrumbs = computed(() => {
  return route.matched
    .filter(item => !item.meta?.hidden && item.path !== '/')
    .map(item => ({
      path: item.path,
      name: item.name,
      meta: item.meta
    }));
});

// 获取面包屑标题
const getBreadcrumbTitle = (item: any) => {
  const { meta } = item;
  if (!meta) return item.name;

  // 如果 meta.breadcrumb 是 i18n key，则翻译
  if (meta.breadcrumb && typeof meta.breadcrumb === 'string' && meta.breadcrumb.includes('.')) {
    return t(meta.breadcrumb);
  }

  // 如果 meta.title 是 i18n key，则翻译
  if (meta.title && typeof meta.title === 'string' && meta.title.includes('.')) {
    return t(meta.title);
  }

  // 否则直接返回 breadcrumb 或 title
  return meta.breadcrumb || meta.title || item.name;
};

// 查找菜单项的第一个叶子节点
const findFirstLeafMenu = (menuPath: string): string | null => {
  // 先找到对应的菜单项
  const menu = menuStore.findMenuByPath(menuPath);
  if (!menu) {
    console.warn('找不到对应的菜单项:', menuPath);
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
const handleBreadcrumbClick = (item: any) => {
  const path = item.path;
  
  // 查找该菜单项的第一个叶子节点
  const leafPath = findFirstLeafMenu(path);
  
  if (leafPath && leafPath !== path) {
    console.log(`面包屑 - 跳转到第一个叶子菜单: ${path} -> ${leafPath}`);
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
  transition: all 0.3s;
  display: flex;
  align-items: center;
  gap: 4px;
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
  transition: all 0.3s;
  display: flex;
  align-items: center;
  gap: 4px;
  opacity: 0.85;
  cursor: pointer;
  
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
</style> 