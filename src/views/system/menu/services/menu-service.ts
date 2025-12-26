import type { Menu, PaginationResponse, PaginationQuery } from '@/types';
import {
    getMenuList as fetchMenuList,
    getMenuTree as fetchMenuTree,
    addMenu,
    updateMenu as updateMenuApi,
    deleteMenu as deleteMenuApi,
    updateMenuStatus as changeMenuStatus
} from '@/api/system/menu';
import { logger, extractPaginationData } from '@/utils';

/**
 * 获取菜单列表
 */
export async function getMenuList(params: Partial<PaginationQuery & { name?: string; status?: number }>) {
    try {
        const response = await fetchMenuList(params);

        // 使用统一的分页数据提取工具
        const { items: menus, total: totalCount } = extractPaginationData<Menu>(response, {
            category: 'MenuService',
            logPrefix: 'MenuService - 提取菜单列表',
            arrayFieldNames: ['menus']
        });

        // 确保菜单数据格式一致
        const normalizedMenus = menus.map((menu: unknown) => {
            const menuObj = menu as Record<string, unknown>;
            return {
                ...menuObj,
                name: (menuObj.name || menuObj.menuName || menuObj.menu_name || '') as string,
                path: (menuObj.path || menuObj.menuPath || menuObj.menu_path || '') as string,
                component: (menuObj.component || menuObj.menuComponent || menuObj.menu_component || '') as string,
                type: (menuObj.type || menuObj.menuType || menuObj.menu_type || 'menu') as string,
                icon: (menuObj.icon || menuObj.menuIcon || menuObj.menu_icon || '') as string,
                permission: (menuObj.permission || menuObj.menuPermission || menuObj.menu_permission || '') as string,
                sort: (typeof menuObj.sort === 'number' ? menuObj.sort : Number(menuObj.sort) || 0) as number,
                status: typeof menuObj.status === 'number' ? menuObj.status : Number(menuObj.status) || 0
            };
        });

        return { menus: normalizedMenus, total: totalCount };
    } catch (error: unknown) {
        logger.error('获取菜单列表失败', error, 'MenuService');
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
            const responseObj = response as { data?: unknown };
            return Array.isArray(responseObj.data) ? responseObj.data : [];
        }

        return [];
    } catch (error: unknown) {
        logger.error('获取菜单树失败', error, 'MenuService');
        throw error;
    }
}

/**
 * 创建菜单
 */
export async function createMenu(menuData: Partial<Menu>) {
    return addMenu(menuData);
}

/**
 * 更新菜单
 */
export async function updateMenu(id: string, menuData: Partial<Menu>) {
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