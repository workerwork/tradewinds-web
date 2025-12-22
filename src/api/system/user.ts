import { request, createFormData, FILE_UPLOAD_CONFIG } from '@/utils';
import type { User, PaginationQuery, PaginationResponse } from '@/types';

/**
 * 获取用户列表
 * @param params 查询参数
 */
export const getUserList = (params?: Partial<PaginationQuery & {
    username: string;
    realName: string;
    phone: string;
    email: string;
    status: number;
    showDeleted: boolean;
}>) => {
    return request.get<PaginationResponse<User>>('/system/users', { params });
};

/**
 * 添加用户
 * @param data 用户数据
 */
export const addUser = (data: Partial<User>) => {
    return request.post<void>('/system/users', data);
};

/**
 * 更新用户
 * @param id 用户ID
 * @param data 用户数据
 */
export const updateUser = (id: string, data: Partial<User>) => {
    return request.put<void>(`/system/users/${id}`, data);
};

/**
 * 删除用户
 * @param id 用户ID
 */
export const deleteUser = (id: string) => {
    return request.del<void>(`/system/users/${id}`);
};

/**
 * 获取用户详情
 * @param id 用户ID
 */
export const getUserDetail = (id: string) => {
    return request.get<User>(`/system/user/detail/${id}`);
};

/**
 * 重置用户密码
 * @param id 用户ID
 */
export const resetUserPassword = (id: string) => {
    return request.post<void>(`/system/users/${id}/reset-password`);
};

/**
 * 更新用户密码
 * @param oldPassword 旧密码
 * @param newPassword 新密码
 */
export const updatePassword = (oldPassword: string, newPassword: string) => {
    return request.put<void>('/system/users/me/password', {
        oldPassword,
        newPassword
    });
};

/**
 * 更新用户个人信息
 * @param data 用户信息
 */
export const updateProfile = (data: Partial<User>) => {
    return request.put<void>('/system/users/me', data);
};

/**
 * 上传用户头像
 * @param file 头像文件
 */
export const uploadAvatar = (file: File) => {
    const formData = createFormData(file);
    return request.post<{ url: string }>('/system/users/me/avatar', formData, FILE_UPLOAD_CONFIG);
};

/**
 * 修改用户状态
 * @param id 用户ID
 * @param status 用户状态
 */
export const patchUserStatus = (id: string, status: number) => {
    return request.patch<void>(`/system/users/${id}`, { id, status });
}; 