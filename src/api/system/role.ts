import { request } from '@/utils/request';
import type { Role, PaginationQuery, PaginationResponse } from '@/types';

/**
 * 获取角色列表
 * @param params 查询参数
 */
export const getRoleList = (params?: Partial<PaginationQuery & { name: string; code: string; status: number }>) => {
    return request.get<PaginationResponse<Role>>('/system/roles', { params });
};

/**
 * 添加角色
 * @param data 角色数据
 */
export const addRole = (data: Partial<Role>) => {
    return request.post<void>('/system/roles', data);
};

/**
 * 更新角色
 * @param id 角色ID
 * @param data 角色数据
 */
export const updateRole = (id: number | string, data: Partial<Role>) => {
    return request.put<void>(`/system/roles/${id}`, data);
};

/**
 * 删除角色
 * @param id 角色ID
 */
export const deleteRole = (id: number) => {
    return request.del<void>(`/system/role/delete/${id}`);
};

/**
 * 获取角色详情
 * @param id 角色ID
 */
export const getRoleDetail = (id: number) => {
    return request.get<Role>(`/system/role/detail/${id}`);
};

/**
 * 更新角色状态
 * @param id 角色ID
 * @param status 状态
 */
export const updateRoleStatus = (id: number, status: number) => {
    return request.put<void>(`/system/role/status/${id}`, { status });
};

/**
 * 分配角色权限
 * @param id 角色ID
 * @param permissionIds 权限ID列表
 */
export const assignRolePermissions = (id: number, permissionIds: number[]) => {
    return request.post<void>(`/system/role/permissions/${id}`, { permissionIds });
}; 