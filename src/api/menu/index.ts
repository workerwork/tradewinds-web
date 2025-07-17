import { request } from '@/utils/request';
import type { MenuItem, MenuResponse } from '@/types/menu';

export const menuAPI = {
    // 获取用户菜单
    getUserMenus(): Promise<MenuResponse> {
        return request.get('/system/menu/user-menus');
    },

    // 获取所有菜单（管理员用）
    getAllMenus(): Promise<MenuResponse> {
        return request.get('/system/menu/list');
    },

    // 获取菜单详情
    getMenuDetail(id: number): Promise<{ code: number; message: string; data: MenuItem }> {
        return request.get(`/system/menu/${id}`);
    },

    // 创建菜单
    createMenu(data: Partial<MenuItem>): Promise<{ code: number; message: string; data: MenuItem }> {
        return request.post('/system/menu', data);
    },

    // 更新菜单
    updateMenu(id: number, data: Partial<MenuItem>): Promise<{ code: number; message: string; data: MenuItem }> {
        return request.put(`/system/menu/${id}`, data);
    },

    // 删除菜单
    deleteMenu(id: number): Promise<{ code: number; message: string }> {
        return request.delete(`/system/menu/${id}`);
    },

    // 获取菜单树结构
    getMenuTree(): Promise<MenuResponse> {
        return request.get('/system/menu/tree');
    }
}; 