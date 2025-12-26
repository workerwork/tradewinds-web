import { request, request_invoke } from '@/utils';
import type { User, ApiResponse } from '@/types';
import type { MenuItem } from '@/types/menu';
import { API_MODE } from '@/config';

/**
 * 超级管理员仪表盘数据类型
 */
export interface SuperAdminDashboard {
  systemStats: {
    totalUsers: number;
    onlineUsers: number;
    totalOrders: number;
    totalRevenue: number;
  };
  recentActivities: Array<{
    id: string;
    action: string;
    user: string;
    timestamp: string;
  }>;
  systemHealth: {
    cpu: number;
    memory: number;
    disk: number;
    network: number;
  };
}

/**
 * 认证 API 接口定义
 */
interface AuthAPI {
  login(data: {
    username: string;
    password: string;
  }): Promise<ApiResponse<{ token: string; user: User }>> | Promise<{ token: string; user: User }>;
  register(data: {
    username: string;
    password: string;
    email: string;
    phone?: string;
  }): Promise<ApiResponse<{ user: User }>> | Promise<{ user: User }>;
  logout(): Promise<ApiResponse<void>> | Promise<void>;
  changePassword(data: {
    oldPassword: string;
    newPassword: string;
  }): Promise<ApiResponse<void>> | Promise<void>;
  refreshToken(): Promise<ApiResponse<{ token: string }>> | Promise<{ token: string }>;
  getUserInfo(): Promise<ApiResponse<User>> | Promise<User>;
  getUserMenus(): Promise<ApiResponse<MenuItem[]>> | Promise<MenuItem[]>;
  getSuperAdminDashboard():
    | Promise<ApiResponse<SuperAdminDashboard>>
    | Promise<SuperAdminDashboard>;
}

// 实现 API 接口
export const authAPI: AuthAPI = {
  async login(data) {
    return request.post<{ token: string; user: User }>('/auth/login', data);
  },

  async register(data) {
    return request.post<ApiResponse<{ user: User }>>('/auth/register', data);
  },

  async logout() {
    return request.post<ApiResponse<void>>('/auth/logout');
  },

  async changePassword(data) {
    return request.post<ApiResponse<void>>('/auth/change-password', data);
  },

  async refreshToken() {
    return request.post<ApiResponse<{ token: string }>>('/auth/refresh');
  },

  async getUserInfo() {
    return request.get<ApiResponse<User>>('/auth/me');
  },

  async getUserMenus() {
    return request.get<ApiResponse<MenuItem[]>>('/auth/menus');
  },

  async getSuperAdminDashboard() {
    return request.get<ApiResponse<SuperAdminDashboard>>('/auth/super-admin/dashboard');
  },
};

// Invoke API 实现
const invokeAPI: AuthAPI = {
  async login(data) {
    return request_invoke({
      url: '/auth/login',
      method: 'POST',
      data,
      invokeCommand: 'auth_login',
    }) as Promise<{ token: string; user: User }>;
  },
  async register(data) {
    return request_invoke({
      url: '/auth/register',
      method: 'POST',
      data,
      invokeCommand: 'auth_register',
    }) as Promise<{ user: User }>;
  },
  async logout() {
    await request_invoke({
      url: '/auth/logout',
      method: 'POST',
      invokeCommand: 'auth_logout',
    });
  },
  async changePassword(data) {
    await request_invoke({
      url: '/auth/change-password',
      method: 'POST',
      data,
      invokeCommand: 'auth_change_password',
    });
  },
  async refreshToken() {
    return request_invoke({
      url: '/auth/refresh-token',
      method: 'POST',
      invokeCommand: 'auth_refresh_token',
    }) as Promise<{ token: string }>;
  },
  async getUserInfo() {
    return request_invoke({
      url: '/auth/user',
      method: 'GET',
      invokeCommand: 'auth_get_user_info',
    }) as Promise<User>;
  },
  async getUserMenus() {
    return request_invoke({
      url: '/auth/menus',
      method: 'GET',
      invokeCommand: 'auth_get_menus',
    }) as Promise<MenuItem[]>;
  },
  async getSuperAdminDashboard() {
    return request_invoke({
      url: '/auth/super-admin/dashboard',
      method: 'GET',
      invokeCommand: 'auth_super_admin_dashboard',
    }) as Promise<SuperAdminDashboard>;
  },
};

// API 工厂函数
const createAuthAPI = (): AuthAPI => {
  switch (API_MODE) {
    case 'direct':
      return authAPI;
    case 'invoke':
      return invokeAPI;
    case 'mock':
    default:
      return authAPI;
  }
};

// 导出统一的 API 实例
export const authAPIInstance = createAuthAPI();

// 为了向后兼容，也导出单独的方法
export const login = authAPIInstance.login.bind(authAPIInstance);
export const register = authAPIInstance.register.bind(authAPIInstance);
export const logout = authAPIInstance.logout.bind(authAPIInstance);
export const changePassword = authAPIInstance.changePassword.bind(authAPIInstance);
export const refreshToken = authAPIInstance.refreshToken.bind(authAPIInstance);
export const getUserInfo = authAPIInstance.getUserInfo.bind(authAPIInstance);
export const getUserMenus = authAPIInstance.getUserMenus.bind(authAPIInstance);
export const getSuperAdminDashboard = authAPIInstance.getSuperAdminDashboard.bind(authAPIInstance);
