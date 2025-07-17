import type { User, PaginationResponse } from '@/types';
import {
    getUserList as fetchUserList,
    addUser,
    updateUser,
    resetUserPassword as resetPassword,
    patchUserStatus as patchUserStatusApi
} from '@/api/system/user';

interface ApiResponse<T> {
    code?: number;
    success?: boolean;
    message?: string | null;
    data?: T;
    users?: any[];
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
export async function getUserList(params: any) {
    try {
        const response = await fetchUserList(params);
        // 现在 response 就是 data 字段内容
        const r = response as any;
        const users: any[] =
            Array.isArray(r.items) ? r.items :
                Array.isArray(r.list) ? r.list :
                    Array.isArray(r.users) ? r.users :
                        Array.isArray(r) ? r : [];
        const totalCount = r.total || users.length || 0;
        // 确保用户数据格式一致，时间字段兼容多种命名
        const normalizedUsers = users.map((user: any) => ({
            ...user,
            id: String(user.id || ''),
            realName: user.realName || user.real_name || user.name || user.nickname || user.display_name || user.displayName || '',
            username: user.username || user.user_name || user.name || '',
            createTime: user.createTime || user.created_at || user.createdAt || user.create_time || '',
            updateTime: user.updateTime || user.updated_at || user.updatedAt || user.update_time || '',
            roles: Array.isArray(user.roles) ? user.roles : [],
            permissions: Array.isArray(user.permissions) ? user.permissions : [],
            status: typeof user.status === 'number' ? user.status : parseInt(user.status) || 0
        }));
        // 移除snake_case冗余字段
        normalizedUsers.forEach(u => { delete u.real_name; delete u.user_name; delete u.display_name; });
        return { users: normalizedUsers, total: totalCount };
    } catch (error) {
        console.error('获取用户列表失败:', error);
        throw error;
    }
}

/**
 * 创建用户
 */
export async function createUser(userData: any) {
    return addUser(userData);
}

/**
 * 更新用户
 */
export async function updateUserInfo(id: string, userData: any) {
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