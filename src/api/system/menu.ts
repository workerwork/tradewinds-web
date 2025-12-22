import { request } from '@/utils';
import type { Menu, PaginationQuery, PaginationResponse } from '@/types';

/**
 * 获取菜单列表
 * @param params 查询参数
 */
export const getMenuList = (params?: Partial<PaginationQuery & { name: string; status: number }>) => {
    return request.get<PaginationResponse<Menu>>('/system/menu/list', { params });
};

/**
 * 获取菜单树
 */
export const getMenuTree = () => {
    return request.get<Menu[]>('/system/menu/tree');
};

/**
 * 添加菜单
 * @param data 菜单数据
 */
export const addMenu = (data: Partial<Menu>) => {
    return request.post<void>('/system/menu/add', data);
};

/**
 * 更新菜单
 * @param id 菜单ID
 * @param data 菜单数据
 */
export const updateMenu = (id: number, data: Partial<Menu>) => {
    return request.put<void>(`/system/menu/update/${id}`, data);
};

/**
 * 删除菜单
 * @param id 菜单ID
 */
export const deleteMenu = (id: number) => {
    return request.del<void>(`/system/menu/delete/${id}`);
};

/**
 * 获取菜单详情
 * @param id 菜单ID
 */
export const getMenuDetail = (id: number) => {
    return request.get<Menu>(`/system/menu/detail/${id}`);
};

/**
 * 更新菜单状态
 * @param id 菜单ID
 * @param status 状态
 */
export const updateMenuStatus = (id: number, status: number) => {
    return request.put<void>(`/system/menu/status/${id}`, { status });
}; 