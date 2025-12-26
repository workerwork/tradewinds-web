import type { Role, PaginationQuery } from '@/types';
import {
    getRoleList as fetchRoleList,
    addRole,
    updateRole as updateRoleApi,
    updateRoleStatus as changeRoleStatus,
    assignRolePermissions as assignPermissionsApi
} from '@/api/system/role';
import { request, logger, extractPaginationData } from '@/utils';
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
        // 使用统一的分页数据提取工具
        const { items: roles, total: totalCount } = extractPaginationData<unknown>(response, {
            category: 'RoleService',
            logPrefix: 'RoleService - 提取角色列表',
            arrayFieldNames: ['roles']
        });
        // 规范化角色ID：支持UUID字符串或数字
        const normalizeRoleId = (id: unknown, index: number, roleObj: Record<string, unknown>): string | number => {
            if (typeof id === 'number') {
                if (isNaN(id)) {
                    logger.warn(`角色数据第${index}条：ID为NaN`, { role: roleObj }, 'RoleService');
                }
                return id;
            }
            if (typeof id === 'string') {
                if (id.trim() === '') {
                    logger.error(`角色数据第${index}条：ID为空字符串`, { role: roleObj }, 'RoleService');
                    return '';
                }
                return id;
            }
            if (id == null) {
                logger.error(`角色数据第${index}条：ID缺失`, { role: roleObj }, 'RoleService');
                return '';
            }
            return String(id);
        };

        // 验证角色ID是否有效
        const isValidRoleId = (id: string | number): boolean => {
            if (id == null) return false;
            if (typeof id === 'number' && isNaN(id)) return false;
            if (typeof id === 'string' && id.trim() === '') return false;
            return true;
        };

        // 确保角色数据格式一致，时间和权限字段兼容多种命名
        const normalizedRoles = roles
            .map((role: unknown, index: number) => {
                const roleObj = role as Record<string, unknown>;
                const normalizedId = normalizeRoleId(roleObj.id, index, roleObj);

                return {
                    ...roleObj,
                    id: normalizedId,
                    name: (roleObj.name || '') as string,
                    code: (roleObj.code || '') as string,
                    description: (roleObj.description || '') as string,
                    createTime: (roleObj.createTime || roleObj.created_at || roleObj.createdAt || roleObj.create_time || '') as string,
                    updateTime: (roleObj.updateTime || roleObj.updated_at || roleObj.updatedAt || roleObj.update_time || '') as string,
                    permissions: Array.isArray(roleObj.permissions) ? roleObj.permissions
                        : Array.isArray(roleObj.rolePermissions) ? roleObj.rolePermissions
                            : Array.isArray(roleObj.perms) ? roleObj.perms
                                : [],
                    status: typeof roleObj.status === 'number' ? roleObj.status : Number(roleObj.status) || 0
                } as Role;
            })
            .filter((role: Role) => {
                // 过滤掉ID无效的角色数据
                if (!isValidRoleId(role.id)) {
                    logger.warn('过滤掉ID无效的角色数据', { role }, 'RoleService');
                    return false;
                }
                return true;
            });
        return { roles: normalizedRoles as Role[], total: totalCount };
    } catch (error: unknown) {
        logger.error('获取角色列表失败', error, 'RoleService');
        throw error;
    }
}

/**
 * 创建角色
 */
export async function createRole(roleData: Partial<Role>) {
    return addRole(roleData);
}

/**
 * 更新角色
 */
export async function updateRole(id: string, roleData: Partial<Role>) {
    // 参考用户管理的实现：在 body 中也包含 id
    return updateRoleApi(id, { ...roleData, id });
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

// 权限树缓存（避免重复请求）
let permissionTreeCache: { data: unknown; timestamp: number } | null = null;
const CACHE_DURATION = 5 * 60 * 1000; // 缓存 5 分钟

/**
 * 获取权限树
 * 注意：从日志看，正确的路径是 /system/permissions/tree（复数形式）
 */
export async function getPermissionTree() {
    // 检查缓存
    if (permissionTreeCache && Date.now() - permissionTreeCache.timestamp < CACHE_DURATION) {
        return permissionTreeCache.data;
    }

    // 直接使用复数形式（与 permission/index.vue 保持一致，从日志看这个路径是正确的）
    // 从日志可以看到：/system/permissions/tree 返回 200 和 Array(4) 数据
    const data = await request.get('/system/permissions/tree');

    // 更新缓存
    permissionTreeCache = {
        data,
        timestamp: Date.now()
    };

    return data;
}

/**
 * 清除权限树缓存（当权限数据更新时调用）
 */
export function clearPermissionTreeCache() {
    permissionTreeCache = null;
}

/**
 * 分配角色权限
 */
export async function assignRolePermissions(roleId: string, permissionIds: (string | number)[]) {
    return request.put(`/system/roles/${roleId}/permissions`, { permissionIds });
} 