import type { Role, PaginationQuery } from '@/types';
import {
    getRoleList as fetchRoleList,
    addRole,
    updateRole as updateRoleApi,
    updateRoleStatus as changeRoleStatus,
    assignRolePermissions as assignPermissionsApi
} from '@/api/system/role';
import { request } from '@/utils/request';
import { getPermissionList as fetchPermissionList } from '@/api/system/permission';

/**
 * 获取角色列表
 */
export async function getRoleList(params: Partial<PaginationQuery & { name?: string; code?: string; status?: number }> = {}) {
    // 过滤掉无效的 status
    const query = { ...params };
    if (typeof query.status !== 'number' || isNaN(query.status)) {
        delete query.status;
    }
    try {
        const response = await fetchRoleList(query);
        // 现在 response 就是 data 字段内容
        const r = response as any;
        const roles: any[] =
            Array.isArray(r.items) ? r.items :
                Array.isArray(r.list) ? r.list :
                    Array.isArray(r.roles) ? r.roles :
                        Array.isArray(r) ? r : [];
        const totalCount = r.total || roles.length || 0;
        // 确保角色数据格式一致，时间和权限字段兼容多种命名
        const normalizedRoles = roles.map((role: any) => ({
            ...role,
            name: role.name || '',
            code: role.code || '',
            createTime: role.createTime || role.created_at || role.createdAt || role.create_time || '',
            updateTime: role.updateTime || role.updated_at || role.updatedAt || role.update_time || '',
            permissions: Array.isArray(role.permissions) ? role.permissions
                : Array.isArray(role.rolePermissions) ? role.rolePermissions
                    : Array.isArray(role.perms) ? role.perms
                        : [],
            status: typeof role.status === 'number' ? role.status : parseInt(role.status) || 0
        }));
        return { roles: normalizedRoles, total: totalCount };
    } catch (error) {
        console.error('获取角色列表失败:', error);
        throw error;
    }
}

/**
 * 创建角色
 */
export async function createRole(roleData: any) {
    return addRole(roleData);
}

/**
 * 更新角色
 */
export async function updateRole(id: string, roleData: any) {
    return updateRoleApi(id, roleData);
}

/**
 * 删除角色
 */
export async function deleteRole(id: string) {
    return request.delete(`/system/roles/${id}`);
}

/**
 * 更新角色状态
 */
export async function updateRoleStatus(id: string, status: number) {
    // 使用 PATCH 方法，仅更新 id 和 status 字段
    return request.patch(`/system/roles/${id}`, { id, status });
}

/**
 * 获取角色权限
 */
export async function getRolePermissions(id: string) {
    return request.get(`/system/roles/${id}/permissions`);
}

/**
 * 更新角色权限
 */
export async function updateRolePermissions(id: string, permissionIds: string[]) {
    return request.put(`/system/roles/${id}/permissions`, { permissionIds });
}

/**
 * 获取权限树
 */
export async function getPermissionTree() {
    return request.get('/system/permissions/tree');
}

/**
 * 分配角色权限
 */
export async function assignRolePermissions(roleId: string, permissionIds: (string | number)[]) {
    return request.put(`/system/roles/${roleId}/permissions`, { permissionIds });
} 