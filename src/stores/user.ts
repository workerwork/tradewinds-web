import { defineStore } from 'pinia';
import { ref } from 'vue';
import type { User, Role, Permission } from '@/types';
import { authAPI } from '@/api/auth';
import { useStorage } from '@vueuse/core';
import { useMenuStore } from '@/stores/menu';
import router from '@/router';
import { logger, extractObjectData } from '@/utils';
import { DEBUG } from '@/config';

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
        if (DEBUG) {
            logger.info('UserStore - 设置 token', { hasToken: !!newToken }, 'UserStore');
        }
        token.value = newToken;
    };

    // 设置用户信息
    const setUserInfo = (user: User) => {
        if (DEBUG) {
            logger.info('UserStore - 设置用户信息', {
                用户ID: user.id,
                用户名: user.username,
                角色数量: user.roles?.length || 0
            }, 'UserStore');
        }

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
        delete (processedUser as any).real_name;
        delete (processedUser as any).display_name;

        // 处理用户名字段映射
        if (!processedUser.username || processedUser.username.trim() === '') {
            const user_any = user as any;
            processedUser.username =
                user_any.user_name ||
                user_any.name ||
                loginUsername.value ||
                'user';
        }

        if (DEBUG) {
            logger.info('UserStore - 用户信息字段处理', {
                realName变化: {
                    原始: user.realName,
                    处理后: processedUser.realName
                },
                username变化: {
                    原始: user.username,
                    处理后: processedUser.username
                }
            }, 'UserStore');
        }

        // 创建新的对象引用以确保响应式更新
        userInfo.value = processedUser;
        permissions.value = [...(user.permissions || [])];

        // 处理角色
        const processedRoles = Array.isArray(user.roles)
            ? user.roles.map((role: Role | string) => {
                // 优先使用角色代码，如果没有则使用角色名称
                const roleName = typeof role === 'string' ? role : (role.code || role.name);
                if (DEBUG) {
                    logger.info('UserStore - 处理角色', { roleName }, 'UserStore');
                }
                return roleName.toLowerCase();
            })
            : ['user'];

        roles.value = processedRoles;

        if (DEBUG) {
            logger.info('UserStore - 更新后的状态', {
                用户信息: !!userInfo.value,
                权限列表: permissions.value,
                原始角色: user.roles,
                处理后角色: processedRoles,
                最终角色: roles.value
            }, 'UserStore');
        }
    };

    // 获取用户信息
    const getUserInfo = async () => {
        try {
            if (DEBUG) {
                logger.info('开始获取用户信息', undefined, 'UserStore');
            }
            const response = await authAPI.getUserInfo();
            if (DEBUG) {
                logger.info('后台返回的原始用户信息', {
                    是否有data字段: 'data' in response,
                    顶层字段: Object.keys(response as unknown as Record<string, unknown>),
                    数据类型: typeof response
                }, 'UserStore');
            }

            // 处理不同的响应格式
            const userDataRaw = 'data' in response ? response.data : response;
            // 适配后端返回结构
            let userData: User;

            // 尝试使用数据适配工具提取用户数据
            try {
                const extractedData = extractObjectData<Record<string, unknown>>(userDataRaw, {
                    category: 'UserStore',
                    logPrefix: 'UserStore - 提取用户数据'
                });

                // 只有 userDataRaw 是对象且含有 user/roles/permissions 字段时才做适配
                if (extractedData && typeof extractedData === 'object' && (
                    'user' in extractedData || 'roles' in extractedData || 'permissions' in extractedData
                )) {
                    const userDataRawAny = extractedData as Record<string, unknown>;
                    if (DEBUG) {
                        logger.info('UserStore - 检测到复合数据结构', {
                            '有user字段': 'user' in extractedData,
                            '有roles字段': 'roles' in extractedData,
                            '有permissions字段': 'permissions' in extractedData
                        }, 'UserStore');
                    }

                    // 兼容后端返回 { user, roles, permissions }
                    let raw: Record<string, unknown>;
                    if ('user' in userDataRawAny) {
                        const userContainer = userDataRawAny.user as Record<string, unknown>;
                        // 检查是否存在嵌套的user对象
                        if (userContainer && typeof userContainer === 'object' && 'user' in userContainer) {
                            // 嵌套结构：data.user.user 才是真正的用户数据
                            raw = userContainer.user as Record<string, unknown>;
                            if (DEBUG) {
                                logger.info('UserStore - 检测到嵌套用户结构，从 data.user.user 提取用户数据', undefined, 'UserStore');
                            }
                        } else {
                            // 正常结构：data.user 就是用户数据
                            raw = userContainer;
                            if (DEBUG) {
                                logger.info('UserStore - 正常用户结构，从 data.user 提取用户数据', undefined, 'UserStore');
                            }
                        }
                    } else {
                        raw = userDataRawAny;
                        if (DEBUG) {
                            logger.info('UserStore - 直接从 data 提取用户数据', undefined, 'UserStore');
                        }
                    }

                    // 提取字段值
                    const mappedId = typeof raw?.id === 'string' ? raw.id : Number(raw?.id || 0);
                    const mappedUsername = (raw?.username || raw?.user_name || raw?.name || loginUsername.value || '') as string;
                    const mappedRealName = (raw?.real_name || raw?.realName || raw?.name || raw?.nickname || raw?.displayName || raw?.display_name || loginUsername.value || '') as string;
                    const mappedAvatar = (raw?.avatar || '') as string;
                    const mappedEmail = (raw?.email || '') as string;
                    const mappedPhone = (raw?.phone || '') as string;
                    const mappedStatus = Number(raw?.status || 0);
                    const mappedCreateTime = (raw?.created_at || raw?.createTime || '') as string;
                    const mappedUpdateTime = (raw?.updated_at || raw?.updateTime || '') as string;

                    if (DEBUG) {
                        logger.info('UserStore - 字段映射结果', {
                            mappedId,
                            mappedUsername,
                            mappedRealName
                        }, 'UserStore');
                    }

                    // 提取角色和权限数据（可能在嵌套结构中）
                    let rolesData: unknown[], permissionsData: unknown[];
                    if ('user' in userDataRawAny) {
                        const userContainer = userDataRawAny.user as Record<string, unknown>;
                        if (userContainer && typeof userContainer === 'object' && 'user' in userContainer) {
                            // 嵌套结构：角色和权限在 data.user.roles 和 data.user.permissions
                            rolesData = (userContainer.roles as unknown[]) || [];
                            permissionsData = (userContainer.permissions as unknown[]) || [];
                            if (DEBUG) {
                                logger.info('UserStore - 从嵌套结构提取角色权限数据', undefined, 'UserStore');
                            }
                        } else {
                            // 正常结构：角色和权限在顶层
                            rolesData = (userDataRawAny.roles as unknown[]) || [];
                            permissionsData = (userDataRawAny.permissions as unknown[]) || [];
                            if (DEBUG) {
                                logger.info('UserStore - 从顶层提取角色权限数据', undefined, 'UserStore');
                            }
                        }
                    } else {
                        rolesData = (userDataRawAny.roles as unknown[]) || [];
                        permissionsData = (userDataRawAny.permissions as unknown[]) || [];
                        if (DEBUG) {
                            logger.info('UserStore - 从直接结构提取角色权限数据', undefined, 'UserStore');
                        }
                    }

                    if (DEBUG) {
                        logger.info('UserStore - 角色权限提取结果', {
                            rolesCount: rolesData.length,
                            permissionsCount: permissionsData.length
                        }, 'UserStore');
                    }

                    userData = {
                        id: String(mappedId),
                        username: mappedUsername,
                        realName: mappedRealName,
                        avatar: mappedAvatar,
                        email: mappedEmail,
                        phone: mappedPhone,
                        roles: rolesData.map((role: unknown) => {
                            const roleObj = role as Record<string, unknown>;
                            return {
                                id: Number(roleObj.id || 0),
                                name: (roleObj.name || '') as string,
                                code: (roleObj.code || '') as string,
                                description: (roleObj.description || '') as string,
                                permissions: (Array.isArray(roleObj.permissions) ? roleObj.permissions : []) as Permission[],
                                status: Number(roleObj.status || 0),
                                createTime: (roleObj.created_at || roleObj.createTime || '') as string,
                                updateTime: (roleObj.updated_at || roleObj.updateTime || '') as string
                            } as Role;
                        }),
                        permissions: permissionsData.map((p: unknown) => {
                            const pObj = p as Record<string, unknown>;
                            return (pObj.name || pObj.code || p) as string;
                        }),
                        status: mappedStatus,
                        createTime: mappedCreateTime,
                        updateTime: mappedUpdateTime
                    };
                } else {
                    // 如果 extractObjectData 返回的数据不符合预期，使用原始数据
                    userData = userDataRaw as unknown as User;
                }
            } catch (error: unknown) {
                // 如果数据适配失败，回退到原始逻辑
                if (DEBUG) {
                    logger.warn('UserStore - 数据适配失败，使用原始逻辑', error, 'UserStore');
                }
                const userDataRawAny = userDataRaw as unknown as Record<string, unknown>;

                // 兼容后端返回 { user, roles, permissions }
                let raw: Record<string, unknown>;
                if ('user' in userDataRawAny) {
                    const userContainer = userDataRawAny.user as Record<string, unknown>;
                    if (userContainer && typeof userContainer === 'object' && 'user' in userContainer) {
                        raw = userContainer.user as Record<string, unknown>;
                    } else {
                        raw = userContainer;
                    }
                } else {
                    raw = userDataRawAny;
                }

                // 提取字段值
                const mappedId = typeof raw?.id === 'string' ? raw.id : Number(raw?.id || 0);
                const mappedUsername = (raw?.username || raw?.user_name || raw?.name || loginUsername.value || '') as string;
                const mappedRealName = (raw?.real_name || raw?.realName || raw?.name || raw?.nickname || raw?.displayName || raw?.display_name || loginUsername.value || '') as string;
                const mappedAvatar = (raw?.avatar || '') as string;
                const mappedEmail = (raw?.email || '') as string;
                const mappedPhone = (raw?.phone || '') as string;
                const mappedStatus = Number(raw?.status || 0);
                const mappedCreateTime = (raw?.created_at || raw?.createTime || '') as string;
                const mappedUpdateTime = (raw?.updated_at || raw?.updateTime || '') as string;

                // 提取角色和权限数据
                let rolesData: unknown[] = (userDataRawAny.roles as unknown[]) || [];
                let permissionsData: unknown[] = (userDataRawAny.permissions as unknown[]) || [];

                userData = {
                    id: String(mappedId),
                    username: mappedUsername,
                    realName: mappedRealName,
                    avatar: mappedAvatar,
                    email: mappedEmail,
                    phone: mappedPhone,
                    roles: rolesData.map((role: unknown) => {
                        const roleObj = role as Record<string, unknown>;
                        return {
                            id: Number(roleObj.id || 0),
                            name: (roleObj.name || '') as string,
                            code: (roleObj.code || '') as string,
                            description: (roleObj.description || '') as string,
                            permissions: (Array.isArray(roleObj.permissions) ? roleObj.permissions : []) as Permission[],
                            status: Number(roleObj.status || 0),
                            createTime: (roleObj.created_at || roleObj.createTime || '') as string,
                            updateTime: (roleObj.updated_at || roleObj.updateTime || '') as string
                        } as Role;
                    }),
                    permissions: permissionsData.map((p: unknown) => {
                        const pObj = p as Record<string, unknown>;
                        return (pObj.name || pObj.code || p) as string;
                    }),
                    status: mappedStatus,
                    createTime: mappedCreateTime,
                    updateTime: mappedUpdateTime
                };
            }

            // 如果 try 块中没有设置 userData，使用原始数据
            if (!userData) {
                // 直接的用户对象格式，也需要字段映射
                const rawData = userDataRaw as unknown as Record<string, unknown>;
                if (DEBUG) {
                    logger.info('UserStore - 直接用户对象字段映射', {
                        'real_name': rawData.real_name,
                        'created_at': rawData.created_at,
                        'id类型': typeof rawData.id
                    }, 'UserStore');
                }

                // 确保直接格式也进行字段映射
                userData = {
                    ...(rawData as any),
                    id: typeof rawData.id === 'string' ? rawData.id : String(rawData.id || ''),
                    realName: (rawData.real_name || rawData.realName || rawData.name || loginUsername.value || '') as string,
                    createTime: (rawData.created_at || rawData.createTime || '') as string,
                    updateTime: (rawData.updated_at || rawData.updateTime || '') as string,
                    roles: (Array.isArray(rawData.roles) ? rawData.roles : []) as Role[],
                    permissions: (Array.isArray(rawData.permissions) ? rawData.permissions : []) as string[]
                };
            }
            if (DEBUG) {
                logger.info('提取的用户数据', {
                    字段列表: Object.keys(userData),
                    角色数量: userData.roles?.length || 0
                }, 'UserStore');
            }

            if (!userData || !userData.roles) {
                logger.error('用户数据格式错误', {
                    有用户数据: !!userData,
                    用户数据类型: typeof userData,
                    有角色数据: !!userData?.roles,
                    角色数据类型: typeof userData?.roles
                }, 'UserStore');
                throw new Error('用户数据格式错误：缺少必要的角色信息');
            }

            // 设置用户信息
            setUserInfo(userData);

            return response;
        } catch (error: unknown) {
            logger.error('获取用户信息失败', error, 'UserStore');
            throw error;
        }
    };

    // 登录
    const login = async (username: string, password: string) => {
        try {
            if (DEBUG) {
                logger.info('UserStore - 开始登录', { username }, 'UserStore');
            }

            // 先清除之前的状态，避免缓存冲突
            clearUserState();
            // 清空菜单缓存
            menuStore.clearMenus();

            // 保存登录的用户名作为fallback
            loginUsername.value = username;

            const response = await authAPI.login({ username, password });
            if (DEBUG) {
                logger.info('UserStore - 登录成功，获取到响应', undefined, 'UserStore');
            }

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
                if (DEBUG) {
                    logger.info('UserStore - 开始获取完整用户信息', undefined, 'UserStore');
                }
                await getUserInfo();
                if (DEBUG) {
                    logger.info('UserStore - 完整用户信息获取成功', undefined, 'UserStore');
                }
            } catch (getUserInfoError: unknown) {
                logger.warn('UserStore - 获取完整用户信息失败，使用登录响应中的用户信息', getUserInfoError, 'UserStore');
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

            if (DEBUG) {
                logger.info('UserStore - 登录状态设置完成', {
                    token有效: !!token.value,
                    用户信息: !!userInfo.value,
                    用户名: userInfo.value?.username,
                    真实姓名: userInfo.value?.realName,
                    角色数量: roles.value.length,
                    权限数量: permissions.value.length
                }, 'UserStore');
            }

            return userInfo.value;
        } catch (error: unknown) {
            logger.error('UserStore - 登录失败', error, 'UserStore');
            // 登录失败时确保清除状态
            clearUserState();
            menuStore.clearMenus();
            throw error;
        }
    };

    // 清除所有用户状态（本地方法，不调用API）
    const clearUserState = () => {
        if (DEBUG) {
            logger.info('UserStore - 清除所有用户状态', undefined, 'UserStore');
        }
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
        } catch (error: unknown) {
            logger.warn('清除localStorage失败', error, 'UserStore');
        }

        if (DEBUG) {
            logger.info('UserStore - 用户状态清除完成', undefined, 'UserStore');
        }
    };

    // 登出
    const logout = async () => {
        if (DEBUG) {
            logger.info('UserStore - 开始登出', undefined, 'UserStore');
        }
        try {
            // 先调用登出接口
            await authAPI.logout();
            if (DEBUG) {
                logger.info('UserStore - 登出API调用成功', undefined, 'UserStore');
            }
        } catch (error: unknown) {
            logger.error('UserStore - 登出请求失败', error, 'UserStore');
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