import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type { Role } from '@/types';
import { request } from '@/utils';

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
            console.log('角色Store - 开始获取角色数据...');
            console.log('角色Store - 请求URL: /system/roles');
            const response = await request.get('/system/roles');
            console.log('角色Store - 收到完整响应:', JSON.stringify(response, null, 2));

            // 真实后端响应处理
            let rawRoles: any[] = [];

            console.log('角色Store - 响应分析:', {
                响应类型: typeof response,
                是否为数组: Array.isArray(response),
                响应键: response && typeof response === 'object' ? Object.keys(response) : [],
                响应内容: response
            });

            // 后端不含 code，直接返回数据
            if (Array.isArray(response)) {
                // 直接返回角色数组
                rawRoles = response;
                console.log('角色Store - 数据格式: 直接数组，长度:', rawRoles.length);
            } else if (response && typeof response === 'object') {
                // 检查各种可能的字段名
                if (response.success && response.data) {
                    // 格式: {success: true, data: {...}}
                    if (Array.isArray(response.data)) {
                        rawRoles = response.data;
                        console.log('角色Store - 数据格式: success.data数组，长度:', rawRoles.length);
                    } else if (response.data.roles) {
                        rawRoles = response.data.roles;
                        console.log('角色Store - 数据格式: success.data.roles，长度:', rawRoles.length);
                    } else {
                        console.log('角色Store - 数据格式: success.data未知，内容:', response.data);
                        rawRoles = [];
                    }
                } else if (response.roles) {
                    // 格式: {roles: [...]}
                    rawRoles = response.roles;
                    console.log('角色Store - 数据格式: 直接roles字段，长度:', rawRoles.length);
                } else if (response.data) {
                    // 格式: {data: [...]}
                    if (Array.isArray(response.data)) {
                        rawRoles = response.data;
                        console.log('角色Store - 数据格式: data数组，长度:', rawRoles.length);
                    } else if (response.data.roles) {
                        rawRoles = response.data.roles;
                        console.log('角色Store - 数据格式: data.roles，长度:', rawRoles.length);
                    } else {
                        console.log('角色Store - 数据格式: data未知，内容:', response.data);
                        rawRoles = [];
                    }
                } else {
                    console.log('角色Store - 数据格式: 未知对象，所有键:', Object.keys(response));
                    rawRoles = [];
                }
            } else {
                console.warn('角色Store - 响应格式不正确:', response);
                roles.value = [];
                return roles.value;
            }

            console.log('角色Store - 解析出的原始角色数据:', rawRoles);

            // 数据字段适配和标准化
            roles.value = rawRoles.map((role: any) => {
                const adaptedRole = {
                    id: role.id,
                    name: role.name,
                    code: role.code,
                    description: role.description || '',
                    // 适配不同的时间字段名
                    createTime: role.createTime || role.created_at || role.createdAt || role.create_time || '',
                    updateTime: role.updateTime || role.updated_at || role.updatedAt || role.update_time || '',
                    // 确保权限数据是数组
                    permissions: Array.isArray(role.permissions) ? role.permissions : [],
                    // 确保状态字段正确处理（数字类型）
                    status: typeof role.status === 'number' ? role.status : parseInt(role.status) || 0
                };

                console.log('角色Store - 数据适配:', {
                    原始角色: { id: role.id, name: role.name, status: role.status, statusType: typeof role.status },
                    适配后角色: { id: adaptedRole.id, name: adaptedRole.name, status: adaptedRole.status, statusType: typeof adaptedRole.status, 状态文本: adaptedRole.status === 0 ? '启用' : '禁用' }
                });

                return adaptedRole;
            });

            loaded.value = true;
            console.log('角色Store - 加载角色数据成功:', {
                原始数据: rawRoles.length,
                处理后数据: roles.value.length,
                启用角色数量: roles.value.filter(r => r.status === 0).length,
                禁用角色数量: roles.value.filter(r => r.status === 1).length,
                角色详情: roles.value.map(r => ({
                    id: r.id,
                    name: r.name,
                    code: r.code,
                    status: r.status,
                    状态文本: r.status === 0 ? '启用' : '禁用'
                }))
            });
        } catch (error) {
            console.error('获取角色列表失败:', error);
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