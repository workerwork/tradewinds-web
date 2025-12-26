import { createRouter, createWebHashHistory, type RouteRecordRaw } from 'vue-router';
import { useUserStore } from '@/stores';
import { useMenuStore } from '@/stores/menu';
import Login from '@/views/login/index.vue';
import Layout from '@/layout/index.vue';

let hasAddedRoutes = false;

// 静态路由：只保留登录页和根路径重定向
const router = createRouter({
    history: createWebHashHistory(),
    routes: [
        {
            path: '/login',
            name: 'Login',
            component: Login,
            meta: { title: '登录', hidden: true }
        },
        {
            path: '/',
            redirect: '/login'
        }
    ],
    scrollBehavior: () => ({ left: 0, top: 0 })
});

// 路由守卫
router.beforeEach(async (to, from, next) => {
    const userStore = useUserStore();
    const menuStore = useMenuStore();
    const token = userStore.token;

    // 如果 pinia 状态丢失或 roles 为空，强制重新注册动态路由
    if (token && (!userStore.userInfo || !userStore.roles.length)) {
        hasAddedRoutes = false;
    }

    // 登录页面处理（如后端菜单未配置登录页，可保留此逻辑）
    if (to.path === '/login') {
        if (token) {
            next('/dashboard');
            return;
        }
        next();
        return;
    }

    // 未登录状态 - 提前返回，避免不必要的检查
    if (!token) {
        next('/login');
        return;
    }

    // 已登录但未加载用户信息和路由
    if (!hasAddedRoutes) {
        try {
            // 并行加载用户信息和菜单，提高加载速度
            const promises: Promise<unknown>[] = [];

            // 如果用户信息不存在，添加获取用户信息的任务
            if (!userStore.userInfo) {
                promises.push(userStore.getUserInfo());
            }

            // 添加获取菜单的任务
            promises.push(menuStore.getUserMenus());

            // 等待所有任务完成
            const results = await Promise.allSettled(promises);

            // 检查是否有失败的任务
            const failedResult = results.find(result => result.status === 'rejected');
            if (failedResult && failedResult.status === 'rejected') {
                throw failedResult.reason;
            }

            // 获取菜单结果（最后一个 promise 是菜单）
            const menuResult = results[results.length - 1];
            if (menuResult.status === 'rejected') {
                throw menuResult.reason;
            }

            const dynamicRoutes = menuResult.value as RouteRecordRaw[];

            if (!dynamicRoutes || dynamicRoutes.length === 0) {
                // 即使没有动态路由，也标记为已加载，避免无限循环
                hasAddedRoutes = true;
                // 添加404路由作为兜底
                router.addRoute({
                    path: '/:pathMatch(.*)*',
                    name: 'NotFound',
                    component: Layout,
                    meta: { title: '页面不存在', hidden: true },
                    children: [
                        {
                            path: '',
                            name: 'NotFoundPage',
                            component: () => import('@/views/error/404.vue'),
                            meta: { title: '页面不存在', hidden: true }
                        }
                    ]
                });
                // 如果访问的是根路径，跳转到 dashboard，否则显示404
                if (to.path === '/') {
                    next('/dashboard');
                } else {
                    next();
                }
                return;
            }

            // 注册动态路由
            dynamicRoutes.forEach(route => {
                router.addRoute(route);
            });

            // 在动态路由注册完成后，添加使用Layout包装的404兜底路由
            router.addRoute({
                path: '/:pathMatch(.*)*',
                name: 'NotFound',
                component: Layout,
                meta: { title: '页面不存在', hidden: true },
                children: [
                    {
                        path: '',
                        name: 'NotFoundPage',
                        component: () => import('@/views/error/404.vue'),
                        meta: { title: '页面不存在', hidden: true }
                    }
                ]
            });

            hasAddedRoutes = true;

            // 重新匹配路由，确保动态路由已注册
            // 使用 replace: true 避免在历史记录中留下中间状态
            next({ ...to, replace: true });
            return;
        } catch (error) {
            userStore.clearUserState();
            menuStore.clearMenus();
            hasAddedRoutes = false;
            next('/login');
            return;
        }
    }

    // 兜底：访问/时自动跳转到/dashboard
    if (to.path === '/' && hasAddedRoutes) {
        next('/dashboard');
        return;
    }

    next();
});

// 路由后置守卫 - 优化性能
router.afterEach((to) => {
    // 设置页面标题
    if (to.meta?.title) {
        document.title = `${to.meta.title} - ${import.meta.env.VITE_APP_TITLE || 'TradeWinds'}`;
    } else {
        document.title = import.meta.env.VITE_APP_TITLE || 'TradeWinds';
    }

    // 仅在开发环境进行性能优化
    if (import.meta.env.DEV) {
        // 使用 requestIdleCallback 优化性能，避免阻塞主线程
        if ('requestIdleCallback' in window) {
            requestIdleCallback(() => {
                // 强制垃圾回收（如果浏览器支持）
                if ('gc' in window && typeof (window as unknown as { gc?: () => void }).gc === 'function') {
                    (window as unknown as { gc: () => void }).gc();
                }
            }, { timeout: 2000 });
        } else {
            // 降级方案：使用 setTimeout
            setTimeout(() => {
                if ('gc' in window && typeof (window as unknown as { gc?: () => void }).gc === 'function') {
                    (window as unknown as { gc: () => void }).gc();
                }
            }, 100);
        }
    }
});

export default router;
