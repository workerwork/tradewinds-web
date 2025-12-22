import { request } from '@/utils';
import type { Permission, PaginationQuery, PaginationResponse } from '@/types';

/**
 * 获取权限列表
 * @param params 查询参数
 */
export const getPermissionList = (params?: Partial<PaginationQuery & { name: string; code: string; status: number }>) => {
    return request.get<PaginationResponse<Permission>>('/system/permissions', { params });
};

/**
 * 添加权限
 * @param data 权限数据
 */
export const addPermission = (data: Partial<Permission>) => {
    return request.post<void>('/system/permissions', data);
};

/**
 * 更新权限
 * @param id 权限ID
 * @param data 权限数据
 */
export const updatePermission = (id: string, data: Partial<Permission>) => {
    return request.put<void>(`/system/permissions/${id}`, data);
};

/**
 * 删除权限
 * @param id 权限ID
 */
export const deletePermission = (id: string) => {
    return request.del<void>(`/system/permissions/${id}`);
};

/**
 * 获取权限详情
 * @param id 权限ID
 */
export const getPermissionDetail = (id: number) => {
    return request.get<Permission>(`/system/permission/detail/${id}`);
};

/**
 * 获取权限树
 */
export const getPermissionTree = () => {
    return request.get<Permission[]>('/system/permission/tree');
};

/**
 * 获取角色权限
 * @param roleId 角色ID
 */
export const getRolePermissions = (roleId: number) => {
    return request.get<Permission[]>(`/system/roles/${roleId}/permissions`);
}; 