import type { User, PaginationResponse, PaginationQuery } from '@/types';
import {
    getUserList as fetchUserList,
    addUser,
    updateUser,
    resetUserPassword as resetPassword,
    patchUserStatus as patchUserStatusApi
} from '@/api/system/user';
import { logger, extractPaginationData } from '@/utils';

interface ApiResponse<T> {
    code?: number;
    success?: boolean;
    message?: string | null;
    data?: T;
    users?: unknown[];
    total?: number;
}

interface PageData<T> {
    users?: T[];
    items?: T[];
    list?: T[];
    total?: number;
}

/**
 * 获取用户列表
 */
export async function getUserList(params: Partial<PaginationQuery & { name?: string; username?: string; status?: number }>) {
    try {
        const response = await fetchUserList(params);
        // 使用统一的分页数据提取工具
        const { items: users, total: totalCount } = extractPaginationData<unknown>(response, {
            category: 'UserService',
            logPrefix: 'UserService - 提取用户列表',
            arrayFieldNames: ['users']
        });
        // 确保用户数据格式一致，时间字段兼容多种命名
        const normalizedUsers = users.map((user: unknown) => {
            const userObj = user as Record<string, unknown>;
            return {
                ...user,
                id: String(userObj.id || ''),
                realName: (userObj.realName || userObj.real_name || userObj.name || userObj.nickname || userObj.display_name || userObj.displayName || '') as string,
                username: (userObj.username || userObj.user_name || userObj.name || '') as string,
                createTime: (userObj.createTime || userObj.created_at || userObj.createdAt || userObj.create_time || '') as string,
                updateTime: (userObj.updateTime || userObj.updated_at || userObj.updatedAt || userObj.update_time || '') as string,
                roles: Array.isArray(userObj.roles) ? userObj.roles : [],
                permissions: Array.isArray(userObj.permissions) ? userObj.permissions : [],
                status: typeof userObj.status === 'number' ? userObj.status : Number(userObj.status) || 0
            };
        });
        // 移除snake_case冗余字段
        normalizedUsers.forEach(u => {
            const uObj = u as Record<string, unknown>;
            delete uObj.real_name;
            delete uObj.user_name;
            delete uObj.display_name;
        });
        return { users: normalizedUsers, total: totalCount };
    } catch (error: unknown) {
        logger.error('获取用户列表失败', error, 'UserService');
        throw error;
    }
}

/**
 * 创建用户
 */
export async function createUser(userData: Partial<User>) {
    return addUser(userData);
}

/**
 * 更新用户
 */
export async function updateUserInfo(id: string, userData: Partial<User>) {
    return updateUser(id, { ...userData, id });
}

/**
 * 重置用户密码
 */
export async function resetUserPassword(id: string) {
    return resetPassword(id);
}

/**
 * 修改用户状态
 */
export async function patchUserStatus(id: string, status: number) {
    return patchUserStatusApi(id, status);
}

export async function deleteUser(id: string) {
    return await import('@/api/system/user').then(mod => mod.deleteUser(id));
} 