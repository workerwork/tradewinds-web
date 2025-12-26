import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type { Role } from '@/types';
import { request, logger, extractArrayData } from '@/utils';
import { DEBUG } from '@/config';

export const useRoleStore = defineStore('role', () => {
    const roles = ref<Role[]>([]);
    const loading = ref(false);
    const loaded = ref(false);

    // 计算属性：启用状态的角色（0=启用，1=禁用）
    const enabledRoles = computed(() => roles.value.filter(role => role.status === 0));

    // 获取所有角色
    const fetchRoles = async (force = false) => {
        // 如果已加载且不强制刷新，直接返回
        if (loaded.value && !force) {
            return roles.value;
        }

        try {
            loading.value = true;
            if (DEBUG) {
                logger.info('角色Store - 开始获取角色数据', undefined, 'RoleStore');
            }
            const response = await request.get('/system/roles');

            // 使用数据适配工具提取角色数据
            let rawRoles: unknown[];
            try {
                rawRoles = extractArrayData<unknown>(response, {
                    category: 'RoleStore',
                    logPrefix: '角色Store - 提取角色数据'
                });
            } catch (error) {
                logger.warn('角色Store - 响应格式不正确', response, 'RoleStore');
                roles.value = [];
                return roles.value;
            }

            // 数据字段适配和标准化
            roles.value = rawRoles.map((role: unknown) => {
                const roleObj = role as Record<string, unknown>;
                const adaptedRole: Role = {
                    id: roleObj.id as string | number,
                    name: roleObj.name as string,
                    code: roleObj.code as string,
                    description: (roleObj.description || '') as string,
                    // 适配不同的时间字段名
                    createTime: (roleObj.createTime || roleObj.created_at || roleObj.createdAt || roleObj.create_time || '') as string,
                    updateTime: (roleObj.updateTime || roleObj.updated_at || roleObj.updatedAt || roleObj.update_time || '') as string,
                    // 确保权限数据是数组
                    permissions: (Array.isArray(roleObj.permissions) ? roleObj.permissions : []) as string[],
                    // 确保状态字段正确处理（数字类型）
                    status: typeof roleObj.status === 'number' ? roleObj.status : parseInt(String(roleObj.status || 0)) || 0
                };

                return adaptedRole;
            });

            loaded.value = true;
            if (DEBUG) {
                logger.info('角色Store - 加载角色数据成功', {
                    原始数据: rawRoles.length,
                    处理后数据: roles.value.length,
                    启用角色数量: roles.value.filter(r => r.status === 0).length,
                    禁用角色数量: roles.value.filter(r => r.status === 1).length
                }, 'RoleStore');
            }
        } catch (error: unknown) {
            logger.error('获取角色列表失败', error, 'RoleStore');
            roles.value = [];
            loaded.value = false;
        } finally {
            loading.value = false;
        }

        return roles.value;
    };

    // 根据 ID 获取角色名称
    const getRoleNameById = (id: number) => {
        const role = roles.value.find(r => r.id === id);
        return role?.name || '';
    };

    // 根据 ID 数组获取角色名称数组
    const getRoleNamesByIds = (ids: number[]) => {
        return ids.map(id => getRoleNameById(id)).filter(Boolean);
    };

    // 清空角色数据
    const clearRoles = () => {
        roles.value = [];
        loaded.value = false;
    };

    return {
        roles,
        enabledRoles,
        loading,
        loaded,
        fetchRoles,
        getRoleNameById,
        getRoleNamesByIds,
        clearRoles
    };
}); 