import { ref } from 'vue';
import { defineStore } from 'pinia';
import type { RouteRecordRaw } from 'vue-router';
import { getUserMenus as getMenusAPI } from '@/api/auth';
import { MenuItem, MenuType } from '@/types/menu';
import Layout from '@/layout/index.vue';
// @ts-ignore
import {
    debugMenuStructure,
    checkMultiLevelMenus,
    normalizeMenuData,
    checkMenuStyleConsistency,
    findStyleDifferences
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

    const normalizeMenu = (menu: any): MenuItem => {
        return {
            id: menu.id,
            parentId: menu.parent_id || menu.parentId,
            name: menu.name,
            title: menu.title || menu.name,
            path: menu.path || '',
            component: menu.component,
            redirect: menu.redirect,
            icon: menu.icon,
            type: menu.type || MenuType.MENU,
            sort: menu.sort || 0,
            visible: menu.visible !== false,
            status: menu.status || 1,
            perms: menu.perms,
            roles: menu.roles || [],
            meta: {
                title: menu.title || menu.name,
                icon: menu.icon,
                hidden: menu.hidden || false,
                breadcrumb: menu.title || menu.name,
                roles: menu.roles || [],
                ...menu.meta
            },
            children: Array.isArray(menu.children)
                ? menu.children.map(normalizeMenu)
                : [],
            createTime: menu.createTime || menu.create_time || new Date().toISOString(),
            updateTime: menu.updateTime || menu.update_time
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

    const menuToRoute = (menu: MenuItem, isTopLevel = true): any => {
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
                };
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
                    children: menu.children.map(child => menuToRoute(child, false)).flat().filter(Boolean)
                };
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
            };
        }
        // 其它分组节点：只递归 children，不生成自身
        return menu.children.map(child => menuToRoute(child, false)).flat().filter(Boolean);
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
    function deepObjectToArray(obj: any): any[] {
        if (Array.isArray(obj)) {
            return obj.map(deepObjectToArray).flat();
        } else if (typeof obj === 'object' && obj !== null) {
            const newObj = { ...obj };
            if (newObj.children) {
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
            console.log('MenuStore - 开始获取用户菜单');

            const response = await getMenusAPI();
            console.log('MenuStore - 后端返回的菜单数据:', {
                数据类型: typeof response,
                数据结构: response,
                是否数组: Array.isArray(response),
                数据长度: Array.isArray(response) ? response.length : '不是数组',
                原始数据: JSON.stringify(response).substring(0, 200) + '...'
            });

            // 由于axios拦截器已经处理了错误状态，如果能执行到这里说明请求成功
            // 拦截器会直接返回data.data部分，即MenuItem[]数组
            let menuData: any[];

            if (Array.isArray(response)) {
                // 直接是数组格式
                menuData = response;
                console.log('MenuStore - 识别为数组格式');
            } else if (response && typeof response === 'object' && 'code' in response) {
                // 完整响应格式（可能是某些情况下拦截器没有处理）
                console.log('MenuStore - 识别为完整响应格式，code:', response.code);
                if ((response.code === 200 || response.code === 0) && response.data) {
                    menuData = response.data;
                } else {
                    throw new Error(response.message || '菜单数据获取失败');
                }
            } else if (response && typeof response === 'object' && response.data && Array.isArray(response.data)) {
                // 嵌套在data字段中
                console.log('MenuStore - 识别为嵌套data格式');
                menuData = response.data;
            } else if (response && typeof response === 'object' && response.data && Array.isArray(response.data.menus)) {
                // 嵌套在data.menus字段中
                console.log('MenuStore - 识别为data.menus格式');
                menuData = response.data.menus;
            } else if (response && typeof response === 'object' && response.menus && Array.isArray(response.menus)) {
                // 嵌套在menus字段中
                console.log('MenuStore - 识别为menus字段格式');
                menuData = response.menus;
            } else if (response && typeof response === 'object' && response.menu && Array.isArray(response.menu)) {
                // 嵌套在menu字段中
                console.log('MenuStore - 识别为menu字段格式');
                menuData = response.menu;
            } else if (response && typeof response === 'object' && response.items && Array.isArray(response.items)) {
                // 嵌套在items字段中
                console.log('MenuStore - 识别为items字段格式');
                menuData = response.items;
            } else if (response && typeof response === 'object') {
                // 尝试寻找任何数组类型的字段
                console.log('MenuStore - 尝试在对象中寻找数组字段');
                let foundArray = false;
                for (const key in response) {
                    if (Array.isArray(response[key])) {
                        console.log('MenuStore - 找到数组字段:', key);
                        menuData = response[key];
                        foundArray = true;
                        break;
                    }
                }

                if (!foundArray) {
                    // 如果没有找到数组，尝试将整个对象转换为数组
                    console.log('MenuStore - 尝试将对象转换为数组');
                    const objKeys = Object.keys(response);
                    if (objKeys.length > 0) {
                        const tempArray = [];
                        for (const key of objKeys) {
                            if (typeof response[key] === 'object' && response[key] !== null) {
                                tempArray.push({
                                    id: key,
                                    ...response[key]
                                });
                            }
                        }
                        if (tempArray.length > 0) {
                            menuData = tempArray;
                            console.log('MenuStore - 成功将对象转换为数组');
                        } else {
                            throw new Error('菜单数据格式错误: 无法将对象转换为数组');
                        }
                    } else {
                        throw new Error('菜单数据格式错误: 空对象');
                    }
                }
            } else {
                console.error('MenuStore - 未知的菜单数据格式:', response);
                throw new Error('菜单数据格式错误');
            }

            console.log('MenuStore - 提取的菜单数据:', {
                数据条数: menuData.length,
                第一条数据示例: menuData[0] || null
            });

            // menuData 赋值后，递归转为数组格式，兼容对象格式
            if (!Array.isArray(menuData)) {
                menuData = deepObjectToArray(menuData);
            }

            if (!Array.isArray(menuData) || menuData.length === 0) {
                console.warn('MenuStore - 菜单数据为空或格式错误');
                menus.value = [];
                routes.value = [];
                return [];
            }

            // 先进行数据规范化
            const normalizedData = normalizeMenuData(menuData);
            const normalizedMenus = normalizedData.map(normalizeMenu);
            console.log('MenuStore - 标准化后的菜单:', normalizedMenus);

            const menuTree = buildMenuTree(normalizedMenus);
            console.log('MenuStore - 构建的菜单树:', menuTree);

            // 检查菜单样式一致性
            console.log('=== 菜单样式一致性检查 ===');
            checkMenuStyleConsistency(menuTree);
            findStyleDifferences(menuTree);

            // 只保留一级菜单为顶层路由，不再包裹 / Layout
            const topLevelRoutes: any[] = menuTree.map(menu => menuToRoute(menu)).flat().filter(Boolean);

            console.log('MenuStore - 生成的路由:', topLevelRoutes);

            menus.value = menuTree;
            routes.value = topLevelRoutes;

            debugMenuStructure(menuTree);
            checkMultiLevelMenus(menuTree);

            // 自动打印所有动态路由结构，便于分析嵌套问题
            console.log('【动态路由结构】', JSON.stringify(topLevelRoutes, null, 2));

            // 打印最终 menus.value 结构，便于调试
            console.log('最终 menus.value:', JSON.stringify(menus.value, null, 2));

            return topLevelRoutes;
        } catch (error) {
            console.error('MenuStore - 获取用户菜单错误:', error);
            // 确保错误信息包含中文字符能正确显示
            if (error instanceof Error) {
                const message = error.message;
                // 检查是否包含乱码或编码问题
                console.error('MenuStore - 错误信息编码检查:', {
                    原始消息: message,
                    消息长度: message.length,
                    字符编码: [...message].map(c => c.charCodeAt(0)),
                });
            }
            throw error;
        } finally {
            loading.value = false;
        }
    };

    const clearMenus = () => {
        menus.value = [];
        routes.value = [];
    };

    const findMenuByPath = (targetPath: string): MenuItem | null => {
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

        return findInMenus(menus.value);
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
