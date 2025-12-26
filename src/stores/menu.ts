import { ref } from 'vue';
import { defineStore } from 'pinia';
import type { RouteRecordRaw } from 'vue-router';
import { getUserMenus as getMenusAPI } from '@/api/auth';
import { MenuItem, MenuType } from '@/types/menu';
import Layout from '@/layout/index.vue';
import { DEBUG } from '@/config';
// @ts-ignore
import {
    debugMenuStructure,
    checkMultiLevelMenus,
    normalizeMenuData,
    checkMenuStyleConsistency,
    findStyleDifferences,
    extractArrayData,
    logger
} from '@/utils';

// 组件映射
const componentMap = {
    'Layout': Layout,
    'dashboard/index': () => import('@/views/dashboard/index.vue'),
    'product/index': () => import('@/views/product/index.vue'),
    'product/productList': () => import('@/views/product/ProductList.vue'),
    'product/productInfo': () => import('@/views/product/ProductInfo.vue'),
    'product/productFactory': () => import('@/views/product/ProductFactory.vue'),
    'order/index': () => import('@/views/order/index.vue'),
    'order/orderList': () => import('@/views/order/OrderList.vue'),
    'customer/index': () => import('@/views/customer/index.vue'),
    'customer/customerSearch': () => import('@/views/customer/CustomerSearch.vue'),
    'customer/customerInfo': () => import('@/views/customer/CustomerInfo.vue'),
    'customer/customerTrack': () => import('@/views/customer/CustomerTrack.vue'),
    'quotation/quotationList': () => import('@/views/quotation/QuotationList.vue'),
    // system
    'system/users': () => import('@/views/system/user/index.vue'),
    'system/roles': () => import('@/views/system/role/index.vue'),
    'system/permissions': () => import('@/views/system/permission/index.vue'),
    // super-admin
    'super-admin/index': () => import('@/views/super-admin/index.vue'),
    'super-admin/dashboard': () => import('@/views/super-admin/dashboard.vue'),
    'super-admin/monitor': () => import('@/views/super-admin/monitor.vue'),
    'super-admin/backup': () => import('@/views/super-admin/backup.vue'),
    'super-admin/config': () => import('@/views/super-admin/config.vue'),
    'super-admin/logs': () => import('@/views/super-admin/logs.vue'),
    // error
    'error/404': () => import('@/views/error/404.vue'),
    // test
    'test/TestPage': () => import('@/views/test/TestPage.vue'),
};

const getComponent = (componentPath: string | null) => {
    if (!componentPath || componentPath === 'Layout') {
        return componentMap['error/404'];
    }
    if (componentMap[componentPath as keyof typeof componentMap]) {
        return componentMap[componentPath as keyof typeof componentMap];
    }
    return componentMap['error/404'];
};

export const useMenuStore = defineStore('menu', () => {
    const menus = ref<MenuItem[]>([]);
    const routes = ref<RouteRecordRaw[]>([]);
    const loading = ref(false);

    const normalizeMenu = (menu: unknown): MenuItem => {
        const menuObj = menu as Record<string, unknown>;
        return {
            id: menuObj.id as string | number,
            parentId: (menuObj.parent_id || menuObj.parentId) as string | number | undefined,
            name: menuObj.name as string,
            title: (menuObj.title || menuObj.name) as string,
            path: (menuObj.path || '') as string,
            component: menuObj.component as string | undefined,
            redirect: menuObj.redirect as string | undefined,
            icon: menuObj.icon as string | undefined,
            type: (menuObj.type || MenuType.MENU) as MenuType,
            sort: (menuObj.sort || 0) as number,
            visible: menuObj.visible !== false,
            status: (menuObj.status || 1) as number,
            perms: menuObj.perms as string | undefined,
            roles: (Array.isArray(menuObj.roles) ? menuObj.roles : []) as string[],
            meta: {
                title: (menuObj.title || menuObj.name) as string,
                icon: menuObj.icon as string | undefined,
                hidden: (menuObj.hidden || false) as boolean,
                breadcrumb: (menuObj.title || menuObj.name) as string,
                roles: (Array.isArray(menuObj.roles) ? menuObj.roles : []) as string[],
                ...(menuObj.meta as Record<string, unknown> | undefined)
            },
            children: Array.isArray(menuObj.children)
                ? (menuObj.children as unknown[]).map(normalizeMenu)
                : [],
            createTime: (menuObj.createTime || menuObj.create_time || new Date().toISOString()) as string,
            updateTime: (menuObj.updateTime || menuObj.update_time) as string | undefined
        };
    };

    const calculateMenuLevel = (menu: MenuItem, allMenus: MenuItem[] = menus.value): number => {
        let level = 0;
        let currentMenu = menu;

        while (currentMenu.parentId) {
            level++;
            const parentMenu = findMenuInList(currentMenu.parentId, allMenus);
            if (!parentMenu) break;
            currentMenu = parentMenu;
        }

        return level;
    };

    const findMenuInList = (id: string | number, menuList: MenuItem[]): MenuItem | null => {
        for (const menu of menuList) {
            if (menu.id === id) {
                return menu;
            }
            if (menu.children) {
                const found = findMenuInList(id, menu.children);
                if (found) return found;
            }
        }
        return null;
    };

    const menuToRoute = (menu: MenuItem, isTopLevel = true): RouteRecordRaw | null => {
        const isLeaf = !menu.children || menu.children.length === 0;

        // 顶级菜单必须使用Layout布局，即使是叶子节点
        if (isTopLevel) {
            if (isLeaf) {
                // 顶级叶子节点：使用Layout包装
                return {
                    path: menu.path,
                    name: menu.name,
                    component: Layout,
                    meta: {
                        title: menu.title,
                        icon: menu.icon,
                        breadcrumb: menu.title,
                        hidden: !menu.visible,
                        roles: menu.roles
                    },
                    children: [
                        {
                            path: '',
                            name: `${menu.name}Index`,
                            redirect: menu.redirect || '',
                            component: getComponent(menu.component),
                            meta: {
                                title: menu.title,
                                icon: menu.icon,
                                breadcrumb: menu.title,
                                hidden: !menu.visible,
                                roles: menu.roles
                            }
                        }
                    ]
                } as unknown as RouteRecordRaw;
            } else {
                // 顶级分组节点：有path + Layout + children
                return {
                    path: menu.path,
                    name: menu.name,
                    component: Layout,
                    meta: {
                        title: menu.title,
                        icon: menu.icon,
                        breadcrumb: menu.title,
                        hidden: !menu.visible,
                        roles: menu.roles
                    },
                    children: menu.children.map(child => menuToRoute(child, false)).flat().filter(Boolean) as RouteRecordRaw[]
                } as unknown as RouteRecordRaw;
            }
        }

        // 非顶级菜单的处理逻辑
        if (isLeaf) {
            return {
                path: menu.path,
                name: menu.name,
                redirect: menu.redirect || '',
                component: getComponent(menu.component),
                meta: {
                    title: menu.title,
                    icon: menu.icon,
                    breadcrumb: menu.title,
                    hidden: !menu.visible,
                    roles: menu.roles
                }
            } as unknown as RouteRecordRaw;
        }
        // 其它分组节点：只递归 children，不生成自身
        // 注意：这里返回 null，因为分组节点本身不应该生成路由
        // 只有叶子节点才生成路由
        return null;
    };

    const buildMenuTree = (menuList: MenuItem[]): MenuItem[] => {
        // 修复类型错误：使用string类型，避免 parentId/id 类型不一致
        const menuMap = new Map<string, MenuItem>();
        menuList.forEach(menu => {
            menuMap.set(String(menu.id), menu);
        });

        const rootMenus: MenuItem[] = [];

        menuList.forEach(menu => {
            if (!menu.parentId || menu.parentId === 0) {
                rootMenus.push(menu);
            } else {
                const parent = menuMap.get(String(menu.parentId));
                if (parent) {
                    if (!parent.children) {
                        parent.children = [];
                    }
                    parent.children.push(menu);
                }
            }
        });

        return rootMenus.sort((a, b) => (a.sort || 0) - (b.sort || 0));
    };

    // 修正版递归将对象格式的菜单转为数组格式，children 字段始终为数组
    function deepObjectToArray(obj: unknown): unknown[] {
        if (Array.isArray(obj)) {
            return obj.map(deepObjectToArray).flat();
        } else if (typeof obj === 'object' && obj !== null) {
            const newObj = { ...(obj as Record<string, unknown>) };
            if ('children' in newObj && newObj.children) {
                newObj.children = deepObjectToArray(newObj.children);
            } else {
                newObj.children = [];
            }
            return [newObj];
        }
        return [];
    }

    const getUserMenus = async () => {
        try {
            loading.value = true;
            logger.info('MenuStore - 开始获取用户菜单', undefined, 'MenuStore');

            const response = await getMenusAPI();

            // 使用数据适配工具提取菜单数据
            let menuData: unknown[];
            try {
                menuData = extractArrayData<unknown>(response, {
                    category: 'MenuStore',
                    logPrefix: 'MenuStore - 提取菜单数据'
                });
            } catch (error) {
                // 如果提取失败，尝试递归转换对象为数组
                if (response && typeof response === 'object' && !Array.isArray(response)) {
                    menuData = deepObjectToArray(response);
                } else {
                    throw error;
                }
            }

            if (DEBUG) {
                logger.info('MenuStore - 提取的菜单数据', {
                    数据条数: menuData.length,
                    第一条数据示例: menuData[0] || null
                }, 'MenuStore');
            }

            // menuData 赋值后，递归转为数组格式，兼容对象格式
            if (!Array.isArray(menuData)) {
                menuData = deepObjectToArray(menuData);
            }

            if (!Array.isArray(menuData) || menuData.length === 0) {
                logger.warn('MenuStore - 菜单数据为空或格式错误', undefined, 'MenuStore');
                menus.value = [];
                routes.value = [];
                return [];
            }

            // 先进行数据规范化
            const normalizedData = normalizeMenuData(menuData);
            const normalizedMenus = normalizedData.map(normalizeMenu);
            if (DEBUG) {
                logger.info('MenuStore - 标准化后的菜单', normalizedMenus, 'MenuStore');
            }

            const menuTree = buildMenuTree(normalizedMenus);
            if (DEBUG) {
                logger.info('MenuStore - 构建的菜单树', menuTree, 'MenuStore');
            }

            // 检查菜单样式一致性
            if (DEBUG) {
                logger.info('=== 菜单样式一致性检查 ===', undefined, 'MenuStore');
            }
            checkMenuStyleConsistency(menuTree);
            findStyleDifferences(menuTree);

            // 只保留一级菜单为顶层路由，不再包裹 / Layout
            const topLevelRoutes: RouteRecordRaw[] = menuTree.map(menu => menuToRoute(menu)).flat().filter(Boolean) as RouteRecordRaw[];

            if (DEBUG) {
                logger.info('MenuStore - 生成的路由', topLevelRoutes, 'MenuStore');
            }

            menus.value = menuTree;
            routes.value = topLevelRoutes;
            // 清空缓存，因为菜单数据已更新
            menuPathCache.clear();

            debugMenuStructure(menuTree);
            checkMultiLevelMenus(menuTree);

            // 自动打印所有动态路由结构，便于分析嵌套问题
            if (DEBUG) {
                logger.info('【动态路由结构】', JSON.stringify(topLevelRoutes, null, 2), 'MenuStore');
                logger.info('最终 menus.value', JSON.stringify(menus.value, null, 2), 'MenuStore');
            }

            return topLevelRoutes;
        } catch (error) {
            logger.error('MenuStore - 获取用户菜单错误', error, 'MenuStore');
            // 确保错误信息包含中文字符能正确显示
            if (error instanceof Error) {
                const message = error.message;
                if (DEBUG) {
                    logger.info('MenuStore - 错误信息编码检查', {
                        原始消息: message,
                        消息长度: message.length,
                        字符编码: [...message].map(c => c.charCodeAt(0)),
                    }, 'MenuStore');
                }
            }
            throw error;
        } finally {
            loading.value = false;
        }
    };

    // 菜单路径查找缓存（提升性能）
    const menuPathCache = new Map<string, MenuItem | null>();

    const clearMenus = () => {
        menus.value = [];
        routes.value = [];
        // 清空缓存，避免使用过期的菜单数据
        menuPathCache.clear();
    };

    const findMenuByPath = (targetPath: string): MenuItem | null => {
        // 检查缓存
        if (menuPathCache.has(targetPath)) {
            return menuPathCache.get(targetPath)!;
        }

        const findInMenus = (menuList: MenuItem[]): MenuItem | null => {
            for (const menu of menuList) {
                if (menu.path === targetPath) {
                    return menu;
                }
                if (menu.children && menu.children.length > 0) {
                    const found = findInMenus(menu.children);
                    if (found) return found;
                }
            }
            return null;
        };

        const result = findInMenus(menus.value);
        // 缓存结果
        menuPathCache.set(targetPath, result);
        return result;
    };

    return {
        menus,
        routes,
        loading,
        getUserMenus,
        clearMenus,
        findMenuByPath,
        normalizeMenu,
        menuToRoute,
        buildMenuTree,
        calculateMenuLevel,
        findMenuInList
    };
});
