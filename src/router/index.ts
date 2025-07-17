import { createRouter, createWebHashHistory } from 'vue-router';
import { useUserStore } from '@/stores';
import { useMenuStore } from '@/stores/menu';
import Login from '@/views/login/index.vue';
import Layout from '@/layout/index.vue';

let hasAddedRoutes = false;

// 静态路由：只保留登录页
const router = createRouter({
    history: createWebHashHistory(),
    routes: [
        {
            path: '/login',
            name: 'Login',
            component: Login,
            meta: { title: '登录', hidden: true }
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
            next('/');
            return;
        }
        next();
        return;
    }

    // 未登录状态
    if (!token) {
        next('/login');
        return;
    }

    // 已登录但未加载用户信息和路由
    if (!hasAddedRoutes) {
        try {
            await userStore.getUserInfo();
            hasAddedRoutes = true;
            // 获取动态菜单并转换为路由
            const dynamicRoutes = await menuStore.getUserMenus();
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
            next({ ...to, replace: true });
            return;
        } catch (error) {
            userStore.clearUserState();
            menuStore.clearMenus();
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

// 路由后置守卫 - 处理组件卸载
router.afterEach((to, from) => {
    // 给组件一些时间来清理
    setTimeout(() => {
        // 强制垃圾回收（如果浏览器支持）
        if (window.gc) {
            window.gc();
        }
    }, 100);
});

export default router;
