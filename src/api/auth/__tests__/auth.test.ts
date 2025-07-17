import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import { request } from '@/utils/request-axios';
import { authAPI } from '../index';
import type { AxiosResponse } from 'axios';

// Mock request
vi.mock('@/utils/request-axios', () => ({
    request: {
        get: vi.fn(),
        post: vi.fn()
    }
}));

// Mock config
vi.mock('@/config', () => ({
    API_MODE: 'direct'
}));

describe('Auth API (Axios Mode)', () => {
    const mockUser = {
        id: 1,
        username: 'testuser',
        realName: 'Test User',
        email: 'test@example.com',
        phone: '1234567890',
        roles: [],
        permissions: [],
        status: 1,
        createTime: '2024-01-01',
        lastLoginTime: '2024-01-01'
    };

    const mockToken = 'mock-token';

    const createAxiosResponse = <T>(data: T): AxiosResponse<T> => ({
        data,
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as any
    });

    beforeEach(() => {
        // 清除所有 mock 的调用记录
        vi.clearAllMocks();
    });

    afterEach(() => {
        vi.resetAllMocks();
    });

    describe('login', () => {
        it('should call post with correct parameters and return token and user', async () => {
            const loginData = { username: 'testuser', password: 'password' };
            const mockResponse = createAxiosResponse({ token: mockToken, user: mockUser });

            vi.mocked(request.post).mockResolvedValueOnce(mockResponse);

            const result = await authAPI.login(loginData);

            expect(request.post).toHaveBeenCalledWith('/auth/login', loginData);
            expect(result).toEqual({ token: mockToken, user: mockUser });
        });
    });

    describe('logout', () => {
        it('should call post with correct path', async () => {
            vi.mocked(request.post).mockResolvedValueOnce(createAxiosResponse(null));

            await authAPI.logout();

            expect(request.post).toHaveBeenCalledWith('/auth/logout');
        });
    });

    describe('getCurrentUser', () => {
        it('should call get with correct path and return user info', async () => {
            vi.mocked(request.get).mockResolvedValueOnce(createAxiosResponse(mockUser));

            const result = await authAPI.getCurrentUser();

            expect(request.get).toHaveBeenCalledWith('/auth/user-info');
            expect(result).toEqual(mockUser);
        });
    });

    describe('refreshToken', () => {
        it('should call post with correct path and return new token', async () => {
            const mockResponse = createAxiosResponse({ token: mockToken });
            vi.mocked(request.post).mockResolvedValueOnce(mockResponse);

            const result = await authAPI.refreshToken();

            expect(request.post).toHaveBeenCalledWith('/auth/refresh-token');
            expect(result).toEqual({ token: mockToken });
        });
    });

    describe('getUserInfo', () => {
        it('should call get with correct path and return user info', async () => {
            vi.mocked(request.get).mockResolvedValueOnce(createAxiosResponse(mockUser));

            const result = await authAPI.getUserInfo();

            expect(request.get).toHaveBeenCalledWith('/auth/user-info');
            expect(result).toEqual(mockUser);
        });
    });

    describe('error handling', () => {
        it('should handle login error', async () => {
            const error = new Error('Login failed');
            vi.mocked(request.post).mockRejectedValueOnce(error);

            await expect(authAPI.login({
                username: 'testuser',
                password: 'wrong'
            })).rejects.toThrow('Login failed');
        });

        it('should handle getCurrentUser error', async () => {
            const error = new Error('Failed to get user info');
            vi.mocked(request.get).mockRejectedValueOnce(error);

            await expect(authAPI.getCurrentUser()).rejects.toThrow('Failed to get user info');
        });
    });
}); 