import { computed } from 'vue';
import { useRouter } from 'vue-router';
import { ElMessage } from 'element-plus';
import { useUserStore } from '@/stores';
import { DEBUG } from '@/config';

/**
 * 超级管理员权限检查 Composable
 * 统一管理超级管理员页面的权限检查和访问控制
 */
export function useSuperAdminAccess() {
    const userStore = useUserStore();
    const router = useRouter();

    /**
     * 检查是否为超级管理员
     */
    const isSuperAdmin = computed(() => {
        return userStore.hasRole('super_admin');
    });

    /**
     * 检查并处理访问权限
     * @param redirectPath 无权限时重定向的路径，默认为 '/dashboard'
     * @returns 是否有权限访问
     */
    const checkAccess = (redirectPath: string = '/dashboard'): boolean => {
        if (!isSuperAdmin.value) {
            if (DEBUG) {
                console.warn('SuperAdmin - 权限检查失败，用户无超级管理员权限');
            }
            ElMessage.error('您没有权限访问此页面');
            router.push(redirectPath);
            return false;
        }
        return true;
    };

    /**
     * 执行需要超级管理员权限的操作
     * @param action 要执行的操作函数
     * @param errorMessage 错误提示信息
     * @returns Promise，操作成功返回结果，失败返回 null
     */
    const executeWithPermission = async <T>(
        action: () => Promise<T>,
        errorMessage: string = '操作失败'
    ): Promise<T | null> => {
        if (!checkAccess()) {
            return null;
        }

        try {
            return await action();
        } catch (error: unknown) {
            // 处理权限相关错误
            const err = error as { response?: { status?: number }; message?: string };
            if (err.response?.status === 403) {
                ElMessage.error('权限不足，无法执行此操作');
                router.push('/dashboard');
            } else if (err.response?.status === 401) {
                ElMessage.error('身份验证失败，请重新登录');
                userStore.logout();
                router.push('/login');
            } else {
                ElMessage.error(err?.message || errorMessage);
            }
            return null;
        }
    };

    return {
        isSuperAdmin,
        checkAccess,
        executeWithPermission,
        router
    };
}

