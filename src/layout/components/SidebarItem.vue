<template>
  <template v-if="!item.meta?.hidden">
    <template v-if="hasOneShowingChild(item.children, item)">
      <el-menu-item
        v-if="onlyOneChild.meta"
        :index="resolvePath(onlyOneChild.path)"
      >
        <el-icon v-if="onlyOneChild.meta.icon">
          <component :is="onlyOneChild.meta.icon.replace('el-icon-', '')" />
        </el-icon>
        <template #title>{{ onlyOneChild.meta.title }}</template>
      </el-menu-item>
    </template>

    <el-sub-menu v-else :index="resolvePath(item.path)">
      <template #title>
        <el-icon v-if="item.meta?.icon">
          <component :is="item.meta.icon.replace('el-icon-', '')" />
        </el-icon>
        <span>{{ item.meta?.title }}</span>
      </template>
      <sidebar-item
        v-for="child in item.children"
        :key="child.path"
        :item="child"
        :base-path="resolvePath(child.path)"
      />
    </el-sub-menu>
  </template>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { isExternal } from '@/utils/validate';
import type { RouteRecordRaw } from 'vue-router';

interface CustomMeta {
  hidden?: boolean;
  title?: string;
  icon?: string;
}

type CustomRouteRecordRaw = {
  path: string;
  redirect?: string;
  children?: CustomRouteRecordRaw[];
  meta?: CustomMeta;
  name?: string;
  component?: any;
};

const props = defineProps<{
  item: CustomRouteRecordRaw;
  basePath: string;
}>();

const onlyOneChild = ref<CustomRouteRecordRaw>();

const hasOneShowingChild = (children: CustomRouteRecordRaw[] = [], parent: CustomRouteRecordRaw) => {
  const showingChildren = children.filter(item => {
    return !item.meta?.hidden;
  });

  if (showingChildren.length === 1) {
    onlyOneChild.value = showingChildren[0];
    return true;
  }

  if (showingChildren.length === 0) {
    onlyOneChild.value = { ...parent, path: '', children: [] };
    return true;
  }

  return false;
};

const resolvePath = (routePath: string) => {
  if (isExternal(routePath)) {
    return routePath;
  }
  return props.basePath + '/' + routePath;
};
</script> 