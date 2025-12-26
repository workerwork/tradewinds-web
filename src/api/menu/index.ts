import { request } from '@/utils';
import type { MenuItem } from '@/types/menu';
import type { ApiResponse } from '@/types';

/**
 * 菜单 API（旧版实现，保留用于向后兼容）
 * 注意：新代码请使用 @/api/system/menu 中的函数式 API
 * @deprecated 建议使用 menuApi from '@/api'
 */
export const menuAPI = {
  /**
   * 获取用户菜单
   */
  getUserMenus(): Promise<ApiResponse<MenuItem[]>> {
    return request.get('/system/menu/user-menus');
  },

  /**
   * 获取所有菜单（管理员用）
   */
  getAllMenus(): Promise<ApiResponse<MenuItem[]>> {
    return request.get('/system/menu/list');
  },

  /**
   * 获取菜单详情
   * @param id 菜单ID
   */
  getMenuDetail(id: number): Promise<{ code: number; message: string; data: MenuItem }> {
    return request.get(`/system/menu/${id}`);
  },

  /**
   * 创建菜单
   * @param data 菜单数据
   */
  createMenu(data: Partial<MenuItem>): Promise<{ code: number; message: string; data: MenuItem }> {
    return request.post('/system/menu', data);
  },

  /**
   * 更新菜单
   * @param id 菜单ID
   * @param data 菜单数据
   */
  updateMenu(
    id: number,
    data: Partial<MenuItem>
  ): Promise<{ code: number; message: string; data: MenuItem }> {
    return request.put(`/system/menu/${id}`, data);
  },

  /**
   * 删除菜单
   * @param id 菜单ID
   */
  deleteMenu(id: number): Promise<{ code: number; message: string }> {
    return request.del(`/system/menu/${id}`);
  },

  /**
   * 获取菜单树结构
   */
  getMenuTree(): Promise<ApiResponse<MenuItem[]>> {
    return request.get('/system/menu/tree');
  },
};
