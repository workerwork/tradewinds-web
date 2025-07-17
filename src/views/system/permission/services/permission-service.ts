import type { Permission, PaginationQuery } from '@/types';
import {
    getPermissionList as fetchPermissionList,
    addPermission,
    updatePermission as updatePermissionApi,
    deletePermission as deletePermissionApi,
    getPermissionTree as fetchPermissionTree,
    getRolePermissions as fetchRolePermissions
} from '@/api/system/permission';

interface ApiResponse<T> {
    code?: number;
    success?: boolean;
    message?: string | null;
    data?: T;
    permissions?: any[];
    total?: number;
}

interface PageData<T> {
    permissions?: T[];
    items?: T[];
    list?: T[];
    total?: number;
}

/**
 * 获取权限列表
 */
export async function getPermissionList(params: Partial<PaginationQuery & { name?: string; code?: string; status?: number }> = {}) {
    try {
        const response = await fetchPermissionList(params);
        // 直接返回 response，保留 permissions 和 total 字段
        return response;
    } catch (error) {
        console.error('获取权限列表失败:', error);
        throw error;
    }
}

/**
 * 创建权限
 */
export async function createPermission(permissionData: Partial<Permission>): Promise<void> {
    return addPermission(permissionData);
}

/**
 * 更新权限
 */
export async function updatePermission(id: string, permissionData: Partial<Permission>): Promise<void> {
    return updatePermissionApi(id, permissionData);
}

/**
 * 删除权限
 */
export async function deletePermission(id: string): Promise<void> {
    return deletePermissionApi(id);
}

/**
 * 获取权限树
 */
export async function getPermissionTree(): Promise<any> {
    return fetchPermissionTree();
}

/**
 * 获取角色权限
 */
export async function getRolePermissions(roleId: string): Promise<any> {
    return fetchRolePermissions(Number(roleId));
} 