import type { Menu, PaginationResponse } from '@/types';
import {
    getMenuList as fetchMenuList,
    getMenuTree as fetchMenuTree,
    addMenu,
    updateMenu as updateMenuApi,
    deleteMenu as deleteMenuApi,
    updateMenuStatus as changeMenuStatus
} from '@/api/system/menu';

/**
 * 获取菜单列表
 */
export async function getMenuList(params: any) {
    try {
        const response = await fetchMenuList(params);

        let menus: Menu[] = [];
        let totalCount = 0;

        // 处理标准的分页响应格式
        if (response && 'items' in response && Array.isArray(response.items)) {
            menus = response.items;
            totalCount = response.total;
        }
        // 处理其他可能的响应格式
        else if (Array.isArray(response)) {
            menus = response;
            totalCount = response.length;
        }
        else if (response && typeof response === 'object') {
            if ('data' in response && typeof response.data === 'object') {
                const data = response.data as any;
                if (Array.isArray(data)) {
                    menus = data;
                    totalCount = data.length;
                } else if (data && typeof data === 'object') {
                    if (Array.isArray(data.items)) {
                        menus = data.items;
                        totalCount = data.total || 0;
                    } else if (Array.isArray(data.list)) {
                        menus = data.list;
                        totalCount = data.total || 0;
                    } else if (Array.isArray(data.menus)) {
                        menus = data.menus;
                        totalCount = data.total || 0;
                    }
                }
            } else if ('list' in response && Array.isArray(response.list)) {
                menus = response.list;
                totalCount = response.total || 0;
            } else if ('records' in response && Array.isArray(response.records)) {
                menus = response.records;
                totalCount = response.total || 0;
            } else if ('menus' in response && Array.isArray(response.menus)) {
                menus = response.menus;
                totalCount = response.total || 0;
            }
        }

        // 确保菜单数据格式一致
        const normalizedMenus = menus.map((menu: any) => {
            return {
                ...menu,
                name: menu.name || menu.menuName || menu.menu_name || '',
                path: menu.path || menu.menuPath || menu.menu_path || '',
                component: menu.component || menu.menuComponent || menu.menu_component || '',
                type: menu.type || menu.menuType || menu.menu_type || 'menu',
                icon: menu.icon || menu.menuIcon || menu.menu_icon || '',
                permission: menu.permission || menu.menuPermission || menu.menu_permission || '',
                sort: menu.sort || menu.menuSort || menu.menu_sort || 0,
                status: typeof menu.status === 'number' ? menu.status : parseInt(menu.status) || 0
            };
        });

        return { menus: normalizedMenus, total: totalCount };
    } catch (error) {
        console.error('获取菜单列表失败:', error);
        throw error;
    }
}

/**
 * 获取菜单树
 */
export async function getMenuTree() {
    try {
        const response = await fetchMenuTree();

        if (Array.isArray(response)) {
            return response;
        } else if (response && typeof response === 'object' && 'data' in response) {
            return Array.isArray(response.data) ? response.data : [];
        }

        return [];
    } catch (error) {
        console.error('获取菜单树失败:', error);
        throw error;
    }
}

/**
 * 创建菜单
 */
export async function createMenu(menuData: any) {
    return addMenu(menuData);
}

/**
 * 更新菜单
 */
export async function updateMenu(id: string, menuData: any) {
    return updateMenuApi(Number(id), menuData);
}

/**
 * 删除菜单
 */
export async function deleteMenu(id: string) {
    return deleteMenuApi(Number(id));
}

/**
 * 更新菜单状态
 */
export async function updateMenuStatus(id: string, status: number) {
    return changeMenuStatus(Number(id), status);
} 