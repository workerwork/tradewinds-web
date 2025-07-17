<template>
  <el-menu
    v-if="level === 0"
    :default-openeds="props.isCollapse ? [] : defaultOpeneds"
    :collapse="props.isCollapse"
    :router="true"
    :default-active="route.path"
    class="dynamic-menu-root"
  >
    <template v-for="menu in filteredMenuList" :key="menu.id">
      <!-- 所有有子菜单的节点都渲染为可展开/折叠的分组菜单 -->
      <el-sub-menu 
        v-if="menu.children && menu.children.length > 0 && menu.visible" 
        :index="menu.path || menu.id" 
        class="sub-menu"
        :class="`menu-level-${level}`"
      >
        <template #title>
          <MenuIcon :icon="menu.icon" />
          <span>{{ getMenuTitle(menu.title) }}</span>
        </template>
        
        <!-- 递归渲染子菜单，在折叠状态下合并显示二级和三级菜单 -->
        <template v-if="props.isCollapse">
          <!-- 折叠状态下，先显示二级菜单，再显示所有叶子节点 -->
          <template v-for="child in menu.children" :key="child.id">
            <!-- 折叠状态下所有二级菜单都显示为菜单项，有子菜单的使用弹出方式 -->
            <template v-if="child.visible && !child.meta?.hidden">
              <!-- 有子菜单的二级菜单使用 el-sub-menu 支持弹出 -->
              <el-sub-menu 
                v-if="child.children && child.children.length > 0"
                :index="child.path || child.id" 
                class="sub-menu"
                :class="`menu-level-${level+1}`"
              >
                <template #title>
                  <MenuIcon :icon="child.icon" />
                  <span>{{ getMenuTitle(child.title) }}</span>
                </template>
                <!-- 递归渲染三级菜单 -->
                <DynamicMenu :menu-list="child.children" :level="level + 2" :isCollapse="props.isCollapse" />
              </el-sub-menu>
              
              <!-- 没有子菜单的二级菜单直接显示为菜单项 -->
              <el-menu-item 
                v-else
                :index="getMenuPath(child)" 
                class="menu-item"
                :class="`menu-level-${level+1}`"
              >
                <MenuIcon :icon="child.icon" />
                <span>{{ getMenuTitle(child.title) }}</span>
                <!-- 徽章显示 -->
                <el-badge 
                  v-if="child.badge" 
                  :value="child.badge.value" 
                  :type="child.badge.type" 
                  class="menu-badge" 
                />
              </el-menu-item>
            </template>
          </template>
        </template>
        <template v-else>
          <!-- 非折叠状态下，正常递归渲染 -->
          <DynamicMenu :menu-list="menu.children" :level="level + 1" :isCollapse="props.isCollapse" />
        </template>
      </el-sub-menu>

      <!-- 没有子菜单的情况（叶子节点菜单项） -->
      <el-menu-item 
        v-else-if="menu.visible && !menu.meta?.hidden" 
        :index="getMenuPath(menu)" 
        class="menu-item"
        :class="`menu-level-${level}`"
        :style="getMenuItemStyle(level)"
      >
        <MenuIcon :icon="menu.icon" />
        <span>{{ getMenuTitle(menu.title) }}</span>
        <!-- 徽章显示 -->
        <el-badge 
          v-if="menu.badge" 
          :value="menu.badge.value" 
          :type="menu.badge.type" 
          class="menu-badge" 
        />
      </el-menu-item>
    </template>
  </el-menu>
  <template v-else>
    <template v-for="menu in filteredMenuList" :key="menu.id">
      <!-- 所有有子菜单的节点都渲染为可展开/折叠的分组菜单 -->
      <el-sub-menu 
        v-if="menu.children && menu.children.length > 0 && menu.visible" 
        :index="menu.path || menu.id" 
        class="sub-menu"
        :class="`menu-level-${level}`"
      >
        <template #title>
          <MenuIcon :icon="menu.icon" />
          <span>{{ getMenuTitle(menu.title) }}</span>
        </template>
        <!-- 递归渲染子菜单，传递层级 -->
        <DynamicMenu :menu-list="menu.children" :level="level + 1" :isCollapse="props.isCollapse" />
      </el-sub-menu>

      <!-- 没有子菜单的情况（叶子节点菜单项） -->
      <el-menu-item 
        v-else-if="menu.visible && !menu.meta?.hidden" 
        :index="getMenuPath(menu)" 
        class="menu-item"
        :class="`menu-level-${level}`"
        :style="getMenuItemStyle(level)"
      >
        <MenuIcon :icon="menu.icon" />
        <span>{{ getMenuTitle(menu.title) }}</span>
        <!-- 徽章显示 -->
        <el-badge 
          v-if="menu.badge" 
          :value="menu.badge.value" 
          :type="menu.badge.type" 
          class="menu-badge" 
        />
      </el-menu-item>
    </template>
  </template>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRoute } from 'vue-router';
import type { MenuItem } from '@/types/menu';
import { useMenuStore } from '@/stores/menu';
import MenuIcon from './MenuIcon.vue';

interface Props {
  menuList: MenuItem[];
  level?: number; // 当前菜单层级，从0开始
  isCollapse?: boolean; // 侧边栏是否折叠，由父组件传递
}

const props = withDefaults(defineProps<Props>(), {
  level: 0,
  isCollapse: false
});

const { t, te } = useI18n();

const emit = defineEmits(['showWorkspace']);

// 调试多级菜单
console.log(`DynamicMenu - Level ${props.level}:`, {
  当前层级: props.level,
  菜单数量: props.menuList.length,
  菜单详情: props.menuList.map(menu => ({
    id: menu.id,
    name: menu.name,
    title: menu.title,
    path: menu.path,
    parentId: menu.parentId,
    有子菜单: !!(menu.children && menu.children.length > 0),
    子菜单数量: menu.children ? menu.children.length : 0,
    应用的CSS类: `menu-level-${props.level}`,
    渲染类型: (menu.children && menu.children.length > 0) ? 'el-sub-menu' : 'el-menu-item',
    层级逻辑: {
      level: props.level,
      是一级菜单: props.level === 0,
      是二级菜单: props.level === 1,
      是三级菜单: props.level === 2,
      使用下拉: (props.level === 0) || (props.level >= 2)
    }
  }))
});

// 获取菜单标题（带fallback）
const getMenuTitle = (title: string): string => {
  // 如果标题是国际化key且存在翻译，则使用翻译
  if (te(title)) {
    return t(title);
  }
  // 否则直接返回原始标题
  return title;
};

// 根据层级计算菜单项样式
const getMenuItemStyle = (level: number) => {
  // 统一的基础样式配置
  const baseStyles = {
    transition: 'all 0.3s ease !important'
  };
  
  // 根据层级设置样式
  switch (level) {
    case 0:
      return {
        ...baseStyles,
        height: '42px !important',
        lineHeight: '42px !important',
        fontSize: '15px !important',
        fontWeight: '600 !important',
        padding: '0 16px !important',
        margin: '3px 8px !important',
        borderRadius: '8px !important',
        color: 'rgba(255, 255, 255, 0.9) !important',
        background: 'rgba(255, 255, 255, 0.05) !important'
      };
    case 1:
      return {
        ...baseStyles,
        height: '36px !important',
        lineHeight: '36px !important',
        fontSize: '14px !important',
        fontWeight: '500 !important',
        paddingLeft: '36px !important'
      };
    case 2:
      return {
        ...baseStyles,
        height: '34px !important',
        lineHeight: '34px !important',
        fontSize: '13px !important',
        fontWeight: '400 !important',
        opacity: '0.9 !important',
        paddingLeft: '48px !important'
      };
    default:
      return {
        ...baseStyles,
        height: '32px !important',
        lineHeight: '32px !important',
        fontSize: '12px !important',
        fontWeight: '400 !important',
        opacity: '0.85 !important',
        paddingLeft: `${48 + (level - 2) * 12}px !important`
      };
  }
};

// 获取菜单路径
const getMenuPath = (menu: MenuItem): string => {
  // 如果是完整路径（以/开头），直接返回
  if (menu.path && menu.path.startsWith('/')) {
    return menu.path;
  }
  
  // 如果有父级ID，需要构建完整路径
  if (menu.parentId) {
    // 从全局菜单中找到父菜单来构建完整路径
    const fullPath = buildFullPath(menu);
    console.log('DynamicMenu - 构建路径:', menu.name, '->', fullPath);
    return fullPath;
  }

  // 顶级菜单但不是完整路径，添加前缀
  const fullPath = `/${menu.path || ''}`;
  return fullPath;
};

// 构建完整路径 - 支持多层级路径构建
const buildFullPath = (menu: MenuItem): string => {
  // 如果已经是完整路径，直接返回
  if (menu.path && menu.path.startsWith('/')) {
    return menu.path;
  }
  
  // 构建路径片段数组
  const pathSegments: string[] = [];
  let currentMenu: MenuItem | null = menu;
  
  // 从当前菜单开始，向上查找所有父级菜单的路径
  while (currentMenu) {
    // 将当前菜单的路径片段添加到数组开头
    if (currentMenu.path) {
      pathSegments.unshift(currentMenu.path);
    }
    
    // 查找父菜单
    if (currentMenu.parentId) {
      currentMenu = findMenuById(currentMenu.parentId);
    } else {
      break;
    }
  }
  
  // 拼接完整路径
  const fullPath = '/' + pathSegments.join('/');
  
  console.log('DynamicMenu - 构建多级路径:', {
    菜单名称: menu.name,
    路径片段: pathSegments,
    完整路径: fullPath
  });
  
  return fullPath;
};

// 在所有菜单中查找指定ID的菜单（需要从store获取）
const findMenuById = (id: string | number): MenuItem | null => {
  const menuStore = useMenuStore();
  
  const findInMenus = (menuList: MenuItem[]): MenuItem | null => {
    for (const menu of menuList) {
      if (menu.id === id) {
        return menu;
      }
      if (menu.children) {
        const found = findInMenus(menu.children);
        if (found) return found;
      }
    }
    return null;
  };
  
  return findInMenus(menuStore.menus);
};

// 递归查找父菜单
const findParentMenu = (parentId: string | number, menuList: MenuItem[]): MenuItem | null => {
  for (const menu of menuList) {
    if (menu.id === parentId) {
      return menu;
    }
    if (menu.children) {
      const found = findParentMenu(parentId, menu.children);
      if (found) return found;
    }
  }
  return null;
};

// 移除 getAllLeafMenuItems 函数，现在使用弹出方式显示多级菜单

// 优化：过滤掉仅作为分组的菜单项（无path/component且有children）
const filteredMenuList = computed(() => {
  return props.menuList.flatMap(menu => {
    // 确保所有菜单项都有统一的 children 属性结构
    const normalizedMenu = {
      ...menu,
      children: menu.children || []
    };
    
    if ((!menu.path || menu.path === '') && !menu.component && menu.children && menu.children.length > 0) {
      // 只渲染children，不渲染自己，并确保children也被规范化
      return menu.children.map(child => ({
        ...child,
        children: child.children || []
      }));
    }
    return [normalizedMenu];
  });
});

// 计算所有二级菜单的 path 或 id
const getAllSecondLevelKeys = (menuList: MenuItem[]) => {
  const keys: (string|number)[] = [];
  menuList.forEach(menu => {
    if (menu.children && menu.children.length > 0) {
      menu.children.forEach(child => {
        if (child.children && child.children.length > 0) {
          // 三级及以上不处理
        }
        // 二级菜单
        keys.push(child.path || child.id);
      });
    }
  });
  return keys;
};

const route = useRoute();

// 获取当前激活的顶级菜单key
function getActiveTopLevelKey(menuList) {
  const currentPath = route.path;
  for (const menu of menuList) {
    if (menu.children && menu.children.length > 0) {
      // 如果子菜单有匹配，返回当前顶级菜单key
      if (findMenuInChildren(menu.children, currentPath)) {
        return menu.path || menu.id;
      }
    } else if (menu.path === currentPath) {
      // 顶级菜单本身就是当前路由
      return menu.path || menu.id;
    }
  }
  return null;
}
function findMenuInChildren(children, path) {
  for (const child of children) {
    if (child.path === path) return true;
    if (child.children && child.children.length > 0) {
      if (findMenuInChildren(child.children, path)) return true;
    }
  }
  return false;
}

const defaultOpeneds = computed(() => {
  if (props.level === 0 && !props.isCollapse) {
    const active = getActiveTopLevelKey(props.menuList);
    return active ? [active] : [];
  }
  return [];
});
</script>

<style scoped>
.menu-badge {
  margin-left: 8px;
  transform: scale(0.8);
}

/* 不同层级菜单的样式差异 */
:deep(.menu-level-0) {
  font-weight: 600 !important;
}
:deep(.menu-level-1) {
  font-weight: 500 !important;
  font-size: 14px !important;
}
:deep(.menu-level-2) {
  font-weight: 400 !important;
  font-size: 13px !important;
  opacity: 0.9 !important;
}

/* 确保同级菜单项样式一致 - 保守修改避免布局问题 */
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
  letter-spacing: 0.5px !important;
  transition: all 0.3s ease !important;
  display: flex !important;
  align-items: center !important;
}

/* 确保普通菜单项的图标间距 */
:deep(.menu-level-0.el-menu-item .el-icon) {
  margin-right: 12px !important;
  flex-shrink: 0 !important;
}

:deep(.menu-level-0.el-sub-menu > .el-sub-menu__title) {
  height: 42px !important;
  line-height: 42px !important;
  font-size: 15px !important;
  font-weight: 600 !important;
  padding-left: 16px !important;
  padding-right: 16px !important;
  margin: 3px 8px !important;
  border-radius: 8px !important;
  color: rgba(255, 255, 255, 0.9) !important;
  background: rgba(255, 255, 255, 0.05) !important;
  letter-spacing: 0.5px !important;
  transition: all 0.3s ease !important;
  display: flex !important;
  align-items: center !important;
  justify-content: space-between !important;
}

/* 悬停效果统一 */
:deep(.menu-level-0.el-menu-item:hover) {
  background: rgba(255, 255, 255, 0.1) !important;
  color: #ffffff !important;
}

:deep(.menu-level-0.el-sub-menu:hover > .el-sub-menu__title) {
  background: rgba(255, 255, 255, 0.1) !important;
  color: #ffffff !important;
}

/* 激活状态统一 */
:deep(.menu-level-0.el-menu-item.is-active) {
  background: rgba(64, 158, 255, 0.15) !important;
  color: #409EFF !important;
}

:deep(.menu-level-0.el-sub-menu.is-active > .el-sub-menu__title) {
  background: rgba(64, 158, 255, 0.15) !important;
  color: #409EFF !important;
}

/* 确保子菜单箭头正确对齐 */
:deep(.menu-level-0.el-sub-menu > .el-sub-menu__title .el-sub-menu__icon-arrow) {
  margin-left: auto !important;
  margin-right: 0 !important;
  flex-shrink: 0 !important;
}

/* 确保菜单内容（图标+文字）正确对齐 */
:deep(.menu-level-0.el-sub-menu > .el-sub-menu__title > span) {
  flex: 1 !important;
  display: flex !important;
  align-items: center !important;
}

/* 确保图标和文字的间距 */
:deep(.menu-level-0.el-sub-menu > .el-sub-menu__title .el-icon) {
  margin-right: 12px !important;
  flex-shrink: 0 !important;
}

/* 确保子菜单展开区域定位正确 */
:deep(.menu-level-0.el-sub-menu .el-menu) {
  position: relative !important;
  left: 0 !important;
  margin-left: 0 !important;
}

:deep(.menu-level-1.el-menu-item),
:deep(.menu-level-1.el-sub-menu > .el-sub-menu__title) {
  height: 36px !important;
  line-height: 36px !important;
  font-size: 14px !important;
  font-weight: 500 !important;
}

:deep(.menu-level-2.el-menu-item),
:deep(.menu-level-2.el-sub-menu > .el-sub-menu__title) {
  height: 34px !important;
  line-height: 34px !important;
  font-size: 13px !important;
  font-weight: 400 !important;
  opacity: 0.9 !important;
}

:deep(.menu-level-3.el-menu-item),
:deep(.menu-level-3.el-sub-menu > .el-sub-menu__title) {
  height: 32px !important;
  line-height: 32px !important;
  font-size: 12px !important;
  font-weight: 400 !important;
  opacity: 0.85 !important;
}

/* 三级菜单样式优化 */
:deep(.tertiary-menu) {
  margin-left: 16px;
}

:deep(.tertiary-menu .el-sub-menu__title) {
  font-size: 12px;
  opacity: 0.9;
}

/* 折叠状态下所有菜单项使用统一样式，三级菜单通过弹出方式显示 */

:deep(.el-menu--popup) {
  min-width: 220px !important;
  background: #2c3e50 !important;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2), 0 2px 8px rgba(0, 0, 0, 0.1);
  border-radius: 8px;
  padding: 6px 0;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

:deep(.el-menu--popup .el-menu-item) {
  height: 36px !important;
  line-height: 36px !important;
  padding: 0 16px 0 36px !important;
  margin: 2px 6px !important;
  border-radius: 6px !important;
  color: rgba(255, 255, 255, 0.8) !important;
  background: transparent !important;
  font-size: 14px !important;
  white-space: nowrap !important;
  overflow: hidden !important;
  text-overflow: ellipsis !important;
  transition: all 0.2s ease !important;
}

:deep(.el-menu--popup .el-menu-item:hover) {
  background: rgba(255, 255, 255, 0.1) !important;
  color: #ffffff !important;
  transform: translateX(2px);
}

:deep(.el-menu--popup .el-menu-item.is-active) {
  background: rgba(64, 158, 255, 0.2) !important;
  color: #409EFF !important;
  font-weight: 500;
}

:deep(.el-menu--popup .el-sub-menu.is-active > .el-sub-menu__title) {
  color: #409EFF !important;
}

/* 确保所有子菜单项文字颜色一致 */
:deep(.el-menu--popup .el-menu .el-menu-item) {
  color: rgba(255, 255, 255, 0.8) !important;
}

:deep(.el-menu--popup .el-menu .el-menu-item:hover) {
  color: #ffffff !important;
}

/* 优化菜单间距 - 但不影响0级菜单 */
:deep(.el-menu) {
  padding: 2px 0;
}

/* 只对非0级菜单应用通用间距 */
:deep(.menu-level-1.el-menu-item),
:deep(.menu-level-1.el-sub-menu__title),
:deep(.menu-level-2.el-menu-item),
:deep(.menu-level-2.el-sub-menu__title) {
  margin: 1px 6px !important;
}

/* 优化菜单高度 - 排除0级菜单 */
:deep(.menu-level-1.el-menu-item),
:deep(.menu-level-2.el-menu-item) {
  height: 32px !important;
  line-height: 32px !important;
}

:deep(.menu-level-1.el-sub-menu__title),
:deep(.menu-level-2.el-sub-menu__title) {
  height: 38px !important;
  line-height: 38px !important;
}

/* 优化折叠菜单的样式 */
:deep(.el-menu--collapse) {
  width: 56px !important;
}

/* 优化动态菜单根容器 */
.dynamic-menu-root {
  padding: 0 !important;
}

/* 折叠状态下的简化样式 */
:deep(.el-menu--collapse .el-menu-item),
:deep(.el-menu--collapse .el-sub-menu > .el-sub-menu__title) {
  width: 40px !important;
  height: 40px !important;
  margin: 2px 8px !important;
  padding: 0 !important;
  border-radius: 8px !important;
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
  position: relative !important;
}

/* 折叠状态下图标绝对居中 */
:deep(.el-menu--collapse .el-icon) {
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

/* 隐藏所有文字和装饰元素 */
:deep(.el-menu--collapse span),
:deep(.el-menu--collapse .el-sub-menu__icon-arrow),
:deep(.el-menu--collapse .menu-badge),
:deep(.el-menu--collapse .el-badge) {
  display: none !important;
}

/* 隐藏伪元素（可能的小点） */
:deep(.el-menu--collapse .el-menu-item::before),
:deep(.el-menu--collapse .el-menu-item::after),
:deep(.el-menu--collapse .el-sub-menu__title::before),
:deep(.el-menu--collapse .el-sub-menu__title::after) {
  display: none !important;
}

/* 折叠弹出菜单下，二级菜单项（有无子菜单）样式完全一致 */
:deep(.el-menu--popup .el-menu-item),
:deep(.el-menu--popup .el-sub-menu__title) {
  height: 36px !important;
  line-height: 36px !important;
  padding: 0 16px 0 36px !important;
  margin: 2px 6px !important;
  border-radius: 6px !important;
  color: rgba(255, 255, 255, 0.8) !important;
  background: transparent !important;
  background-color: transparent !important;
  font-size: 14px !important;
  font-weight: 500 !important;
  white-space: nowrap !important;
  overflow: hidden !important;
  text-overflow: ellipsis !important;
  transition: all 0.2s ease !important;
  display: flex !important;
  align-items: center !important;
  border: none !important;
  box-shadow: none !important;
  outline: none !important;
}

/* 悬停和激活状态完全一致 */
:deep(.el-menu--popup .el-menu-item:hover),
:deep(.el-menu--popup .el-sub-menu__title:hover) {
  background: rgba(255,255,255,0.1) !important;
  color: #fff !important;
}

:deep(.el-menu--popup .el-menu-item.is-active),
:deep(.el-menu--popup .el-sub-menu.is-active > .el-sub-menu__title) {
  background: rgba(64, 158, 255, 0.2) !important;
  color: #409EFF !important;
  font-weight: 500 !important;
}

/* 图标和箭头样式也统一 */
:deep(.el-menu--popup .el-menu-item .el-icon),
:deep(.el-menu--popup .el-sub-menu__title .el-icon) {
  margin-right: 12px !important;
  font-size: 16px !important;
  color: rgba(255,255,255,0.8) !important;
}
:deep(.el-menu--popup .el-sub-menu__title .el-sub-menu__icon-arrow) {
  margin-left: auto !important;
  color: rgba(255,255,255,0.6) !important;
}

</style>
