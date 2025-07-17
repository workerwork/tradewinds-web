import { defineStore } from 'pinia';
import { ref } from 'vue';
import type { User, Role } from '@/types';
import { authAPI } from '@/api/auth';
import { useStorage } from '@vueuse/core';
import { useMenuStore } from '@/stores/menu';
import router from '@/router';

export const useUserStore = defineStore('user', () => {
    // 状态
    const token = useStorage('token', '');
    const userInfo = ref<User | null>(null);
    const permissions = ref<string[]>([]);
    const roles = ref<string[]>([]);
    const loginUsername = ref<string>(''); // 保存登录时的用户名

    const menuStore = useMenuStore();

    // 设置 token
    const setToken = (newToken: string) => {
        console.log('UserStore - 设置 token:', newToken ? '已设置' : '已清除');
        token.value = newToken;
    };

    // 设置用户信息
    const setUserInfo = (user: User) => {
        console.log('UserStore - 设置用户信息 - 完整数据:', {
            原始用户信息: user,
            角色信息: user.roles,
            角色类型: typeof user.roles,
            是否数组: Array.isArray(user.roles),
            数据结构: {
                用户字段: Object.keys(user),
                角色字段: user.roles ? (Array.isArray(user.roles) ? '数组' : Object.keys(user.roles)) : '无角色'
            }
        });

        // 确保字段有值，使用loginUsername作为fallback
        const processedUser = { ...user };

        // 处理真实姓名字段映射
        if (!processedUser.realName || processedUser.realName.trim() === '') {
            const user_any = user as any;
            processedUser.realName =
                user_any.realName ||
                user_any.real_name ||
                user_any.name ||
                user_any.nickname ||
                user_any.displayName ||
                user_any.display_name ||
                loginUsername.value ||
                '';
        }
        // 移除snake_case冗余字段
        delete processedUser.real_name;
        delete processedUser.display_name;

        // 处理用户名字段映射
        if (!processedUser.username || processedUser.username.trim() === '') {
            const user_any = user as any;
            processedUser.username =
                user_any.user_name ||
                user_any.name ||
                loginUsername.value ||
                'user';
        }

        console.log('UserStore - 用户信息字段处理:', {
            原始用户信息: user,
            处理后用户信息: processedUser,
            realName变化: {
                原始: user.realName,
                处理后: processedUser.realName
            },
            username变化: {
                原始: user.username,
                处理后: processedUser.username
            }
        });

        // 创建新的对象引用以确保响应式更新
        userInfo.value = processedUser;
        permissions.value = [...(user.permissions || [])];

        // 处理角色
        const processedRoles = Array.isArray(user.roles)
            ? user.roles.map((role: Role | string) => {
                console.log('UserStore - 处理角色:', {
                    角色数据: role,
                    数据类型: typeof role,
                    是字符串: typeof role === 'string',
                    字段列表: typeof role === 'object' ? Object.keys(role) : [],
                    代码: typeof role === 'object' ? role.code : null,
                    名称: typeof role === 'object' ? role.name : role
                });
                // 优先使用角色代码，如果没有则使用角色名称
                const roleName = typeof role === 'string' ? role : (role.code || role.name);
                console.log('UserStore - 提取的角色标识:', roleName);
                return roleName.toLowerCase();
            })
            : ['user'];

        roles.value = processedRoles;

        console.log('UserStore - 更新后的状态:', {
            用户信息: !!userInfo.value,
            权限列表: permissions.value,
            原始角色: user.roles,
            处理后角色: processedRoles,
            最终角色: roles.value,
            角色检查测试: {
                'super_admin检查': hasRole('super_admin'),
                'admin检查': hasRole('admin'),
                '包含超级管理员': roles.value.includes('超级管理员'),
                '包含super_admin': roles.value.includes('super_admin')
            }
        });
    };

    // 获取用户信息
    const getUserInfo = async () => {
        try {
            console.log('开始获取用户信息');
            const response = await authAPI.getUserInfo();
            console.log('后台返回的原始用户信息:', {
                完整响应: response,
                数据结构: {
                    是否有data字段: 'data' in response,
                    顶层字段: Object.keys(response),
                    数据类型: typeof response
                }
            });

            // 处理不同的响应格式
            const userDataRaw = 'data' in response ? response.data : response;
            // 适配后端返回结构
            let userData: User;
            // 只有 userDataRaw 是对象且含有 user/roles/permissions 字段时才做适配
            if (userDataRaw && typeof userDataRaw === 'object' && (
                'user' in userDataRaw || 'roles' in userDataRaw || 'permissions' in userDataRaw
            )) {
                const userDataRawAny = userDataRaw as any;
                console.log('UserStore - 检测到复合数据结构:', {
                    userDataRaw: userDataRaw,
                    '有user字段': 'user' in userDataRaw,
                    '有roles字段': 'roles' in userDataRaw,
                    '有permissions字段': 'permissions' in userDataRaw,
                    'user字段内容': userDataRawAny.user,
                    'userDataRaw所有字段': Object.keys(userDataRaw)
                });

                // 兼容后端返回 { user, roles, permissions }
                let raw: any;
                if ('user' in userDataRaw) {
                    const userContainer = userDataRawAny.user;
                    // 检查是否存在嵌套的user对象
                    if (userContainer && typeof userContainer === 'object' && 'user' in userContainer) {
                        // 嵌套结构：data.user.user 才是真正的用户数据
                        raw = userContainer.user;
                        console.log('UserStore - 检测到嵌套用户结构，从 data.user.user 提取用户数据');
                    } else {
                        // 正常结构：data.user 就是用户数据
                        raw = userContainer;
                        console.log('UserStore - 正常用户结构，从 data.user 提取用户数据');
                    }
                } else {
                    raw = userDataRawAny;
                    console.log('UserStore - 直接从 data 提取用户数据');
                }

                console.log('UserStore - 提取的raw对象:', {
                    raw对象: raw,
                    raw是否存在: !!raw,
                    raw类型: typeof raw,
                    raw所有字段: raw ? Object.keys(raw) : 'raw为空'
                });

                console.log('UserStore - 字段映射详细日志:', {
                    原始数据: raw,
                    '字段映射过程': {
                        'id映射': {
                            '原始值': raw?.id,
                            '原始类型': typeof raw?.id,
                            '映射后': typeof raw?.id === 'string' ? raw.id : Number(raw?.id || 0)
                        },
                        'realName映射': {
                            'real_name': raw?.real_name,
                            'realName': raw?.realName,
                            'name': raw?.name,
                            '最终值': raw?.real_name || raw?.realName || raw?.name || raw?.nickname || raw?.displayName || raw?.display_name || loginUsername.value || ''
                        },
                        'username映射': {
                            'username': raw?.username,
                            'user_name': raw?.user_name,
                            '最终值': raw?.username || raw?.user_name || raw?.name || loginUsername.value || ''
                        },
                        'createTime映射': {
                            'created_at': raw?.created_at,
                            'createTime': raw?.createTime,
                            '最终值': raw?.created_at || raw?.createTime || ''
                        }
                    }
                });

                // 提取字段值
                const mappedId = typeof raw?.id === 'string' ? raw.id : Number(raw?.id || 0);
                const mappedUsername = raw?.username || raw?.user_name || raw?.name || loginUsername.value || '';
                const mappedRealName = raw?.real_name || raw?.realName || raw?.name || raw?.nickname || raw?.displayName || raw?.display_name || loginUsername.value || '';
                const mappedAvatar = raw?.avatar || '';
                const mappedEmail = raw?.email || '';
                const mappedPhone = raw?.phone || '';
                const mappedStatus = Number(raw?.status || 0);
                const mappedCreateTime = raw?.created_at || raw?.createTime || '';
                const mappedUpdateTime = raw?.updated_at || raw?.updateTime || '';

                console.log('UserStore - 字段映射结果:', {
                    mappedId,
                    mappedUsername,
                    mappedRealName,
                    mappedAvatar,
                    mappedEmail,
                    mappedPhone,
                    mappedStatus,
                    mappedCreateTime,
                    mappedUpdateTime
                });

                // 提取角色和权限数据（可能在嵌套结构中）
                let rolesData, permissionsData;
                if ('user' in userDataRaw) {
                    const userContainer = userDataRawAny.user;
                    if (userContainer && typeof userContainer === 'object' && 'user' in userContainer) {
                        // 嵌套结构：角色和权限在 data.user.roles 和 data.user.permissions
                        rolesData = userContainer.roles || [];
                        permissionsData = userContainer.permissions || [];
                        console.log('UserStore - 从嵌套结构提取角色权限数据');
                    } else {
                        // 正常结构：角色和权限在顶层
                        rolesData = userDataRawAny.roles || [];
                        permissionsData = userDataRawAny.permissions || [];
                        console.log('UserStore - 从顶层提取角色权限数据');
                    }
                } else {
                    rolesData = userDataRawAny.roles || [];
                    permissionsData = userDataRawAny.permissions || [];
                    console.log('UserStore - 从直接结构提取角色权限数据');
                }

                console.log('UserStore - 角色权限提取结果:', {
                    rolesData,
                    permissionsData,
                    rolesCount: rolesData.length,
                    permissionsCount: permissionsData.length
                });

                userData = {
                    id: mappedId,
                    username: mappedUsername,
                    realName: mappedRealName,
                    avatar: mappedAvatar,
                    email: mappedEmail,
                    phone: mappedPhone,
                    roles: rolesData.map((role: any) => ({
                        id: Number(role.id),
                        name: role.name || '',
                        code: role.code || '',
                        description: role.description || '',
                        permissions: Array.isArray(role.permissions) ? role.permissions : [],
                        status: Number(role.status),
                        createTime: role.created_at || role.createTime || '',
                        updateTime: role.updated_at || role.updateTime || ''
                    })),
                    permissions: permissionsData.map((p: any) => p.name || p.code || p),
                    status: mappedStatus,
                    createTime: mappedCreateTime,
                    updateTime: mappedUpdateTime
                };
            } else {
                // 直接的用户对象格式，也需要字段映射
                const rawData = userDataRaw as any;
                console.log('UserStore - 直接用户对象字段映射:', {
                    原始数据: rawData,
                    '字段检查': {
                        'real_name': rawData.real_name,
                        'created_at': rawData.created_at,
                        'id类型': typeof rawData.id
                    }
                });

                // 确保直接格式也进行字段映射
                userData = {
                    ...rawData,
                    id: typeof rawData.id === 'string' ? rawData.id : Number(rawData.id),
                    realName: rawData.real_name || rawData.realName || rawData.name || loginUsername.value || '',
                    createTime: rawData.created_at || rawData.createTime || '',
                    updateTime: rawData.updated_at || rawData.updateTime || '',
                    roles: rawData.roles || [],
                    permissions: rawData.permissions || []
                };
            }
            console.log('提取的用户数据:', {
                完整数据: userData,
                字段列表: Object.keys(userData),
                角色数据: userData.roles,
                角色类型: userData.roles ? typeof userData.roles : 'undefined'
            });

            if (!userData || !userData.roles) {
                console.error('用户数据格式错误:', {
                    有用户数据: !!userData,
                    用户数据类型: typeof userData,
                    有角色数据: !!userData?.roles,
                    角色数据类型: typeof userData?.roles
                });
                throw new Error('用户数据格式错误：缺少必要的角色信息');
            }

            // 设置用户信息
            setUserInfo(userData);

            return response;
        } catch (error) {
            console.error('获取用户信息失败:', error);
            throw error;
        }
    };

    // 登录
    const login = async (username: string, password: string) => {
        try {
            console.log('UserStore - 开始登录:', username);

            // 先清除之前的状态，避免缓存冲突
            clearUserState();
            // 清空菜单缓存
            menuStore.clearMenus();

            // 保存登录的用户名作为fallback
            loginUsername.value = username;

            const response = await authAPI.login({ username, password });
            console.log('UserStore - 登录成功，获取到响应');

            // 处理不同的响应格式
            const { token: newToken, user } = 'data' in response ? response.data : response;

            if (!newToken) {
                throw new Error('登录响应中缺少token');
            }

            setToken(newToken);

            // 如果登录响应中有用户信息，先设置
            if (user) {
                setUserInfo(user);
            }

            // 无论登录响应是否有用户信息，都主动获取完整的用户信息
            // 这样确保用户信息是最新且完整的
            try {
                console.log('UserStore - 开始获取完整用户信息');
                await getUserInfo();
                console.log('UserStore - 完整用户信息获取成功');
            } catch (getUserInfoError) {
                console.warn('UserStore - 获取完整用户信息失败，使用登录响应中的用户信息:', getUserInfoError);
                // 如果获取用户信息失败，但登录响应中没有用户信息，抛出错误
                if (!user) {
                    throw new Error('登录成功但无法获取用户信息');
                }
            }

            // 登录后刷新菜单
            const dynamicRoutes = await menuStore.getUserMenus();
            // 动态注册路由
            dynamicRoutes.forEach(route => {
                try {
                    router.addRoute(route);
                } catch (e) { }
            });
            // 添加404兜底路由（如未添加）
            try {
                router.addRoute({
                    path: '/:pathMatch(.*)*',
                    name: 'NotFound',
                    component: () => import('@/views/error/404.vue')
                });
            } catch (e) { }

            console.log('UserStore - 登录状态设置完成:', {
                token有效: !!token.value,
                用户信息: !!userInfo.value,
                用户名: userInfo.value?.username,
                真实姓名: userInfo.value?.realName,
                角色数量: roles.value.length,
                权限数量: permissions.value.length
            });

            return userInfo.value;
        } catch (error) {
            console.error('UserStore - 登录失败:', error);
            // 登录失败时确保清除状态
            clearUserState();
            menuStore.clearMenus();
            throw error;
        }
    };

    // 清除所有用户状态（本地方法，不调用API）
    const clearUserState = () => {
        console.log('UserStore - 清除所有用户状态');
        setToken('');
        userInfo.value = null;
        permissions.value = [];
        roles.value = [];
        loginUsername.value = '';

        // 清除可能存在的其他用户相关缓存
        try {
            localStorage.removeItem('userInfo');
            localStorage.removeItem('permissions');
            localStorage.removeItem('roles');
            // 清除以用户ID为key的缓存
            Object.keys(localStorage).forEach(key => {
                if (key.includes('user_') || key.includes('menu_') || key.includes('auth_')) {
                    localStorage.removeItem(key);
                }
            });
        } catch (error) {
            console.warn('清除localStorage失败:', error);
        }

        console.log('UserStore - 用户状态清除完成');
    };

    // 登出
    const logout = async () => {
        console.log('UserStore - 开始登出');
        try {
            // 先调用登出接口
            await authAPI.logout();
            console.log('UserStore - 登出API调用成功');
        } catch (error) {
            console.error('UserStore - 登出请求失败:', error);
            // 即使请求失败也继续清除本地状态
        } finally {
            // 清除本地状态
            clearUserState();
            // 清空菜单缓存
            menuStore.clearMenus();
            // 清空动态路由
            // 这里只能重置页面，或刷新页面，或跳转到登录页
            // 推荐跳转到登录页
            router.replace('/login');
        }
    };

    // 检查权限
    const hasPermission = (permission: string) => {
        // 如果是管理员或有通配符权限，允许所有操作
        if (permissions.value.includes('*') || roles.value.includes('admin')) {
            return true;
        }
        return permissions.value.includes(permission);
    };

    // 检查角色
    const hasRole = (role: string) => {
        // 如果是管理员，允许所有角色检查
        if (roles.value.includes('admin')) {
            return true;
        }

        // 角色映射表 - 支持中英文角色匹配
        const roleMapping: Record<string, string[]> = {
            'super_admin': ['super_admin', 'superadmin', '超级管理员', '超级用户'],
            'admin': ['admin', 'administrator', '管理员', '系统管理员'],
            'user': ['user', 'member', '用户', '普通用户']
        };

        const targetRole = role.toLowerCase();

        // 直接匹配
        if (roles.value.includes(targetRole)) {
            return true;
        }

        // 通过映射表匹配
        for (const [key, aliases] of Object.entries(roleMapping)) {
            if (key === targetRole) {
                // 检查用户是否拥有该角色的任意别名
                return roles.value.some(userRole =>
                    aliases.includes(userRole) || aliases.includes(userRole.toLowerCase())
                );
            }
        }

        return false;
    };

    return {
        token,
        userInfo,
        permissions,
        roles,
        loginUsername,
        setToken,
        setUserInfo,
        getUserInfo,
        login,
        logout,
        clearUserState,
        hasPermission,
        hasRole
    };
}); 