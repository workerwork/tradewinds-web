import type { App, Directive, DirectiveBinding } from 'vue';
import { useUserStore } from '@/stores/user';

export const permission: Directive = {
    mounted(el: HTMLElement, binding: DirectiveBinding) {
        const { value } = binding;
        const userStore = useUserStore();

        if (value && value.length > 0) {
            const hasPermission = userStore.hasPermission(value);

            if (!hasPermission) {
                el.parentNode?.removeChild(el);
            }
        } else {
            throw new Error('需要指定权限值');
        }
    }
};

export const role: Directive = {
    mounted(el: HTMLElement, binding: DirectiveBinding) {
        const { value } = binding;
        const userStore = useUserStore();

        if (value && value.length > 0) {
            const hasRole = userStore.hasRole(value);

            if (!hasRole) {
                el.parentNode?.removeChild(el);
            }
        } else {
            throw new Error('需要指定角色值');
        }
    }
};

export function setupPermission(app: App) {
    app.directive('permission', permission);
    app.directive('role', role);
} 