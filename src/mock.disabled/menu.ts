import Mock from 'mockjs';
import type { MockjsRequestOptions } from 'mockjs';
import type { MenuItem } from '@/types/menu';
import { MenuType } from '@/types/menu';

// 模拟菜单数据
const menuData: MenuItem[] = [
  {
    id: 1,
    name: 'Dashboard',
    title: 'menu.dashboard.title',
    path: '/dashboard',
    component: 'Layout',
    redirect: '/dashboard/overview',
    icon: 'House',
    type: MenuType.MENU,
    sort: 1,
    visible: true,
    status: 1,
    meta: {
      title: 'menu.dashboard.title',
      icon: 'House',
      breadcrumb: 'menu.dashboard.title',
    },
    children: [
      {
        id: 11,
        parentId: 1,
        name: 'DashboardOverview',
        title: 'menu.dashboard.overview',
        path: 'overview',
        component: 'dashboard/overview',
        icon: 'DataLine',
        type: MenuType.MENU,
        sort: 1,
        visible: true,
        status: 1,
        meta: {
          title: 'menu.dashboard.overview',
          icon: 'DataLine',
          breadcrumb: 'menu.dashboard.overview',
        },
        createTime: '2024-03-20 10:00:00',
      },
    ],
    createTime: '2024-03-20 10:00:00',
  },
  {
    id: 2,
    name: 'SuperAdmin',
    title: 'menu.superAdmin.title',
    path: '/super-admin',
    component: 'Layout',
    redirect: '/super-admin/dashboard',
    icon: 'Coordinate',
    type: MenuType.MENU,
    sort: 2,
    visible: true,
    status: 1,
    roles: ['super_admin'],
    meta: {
      title: 'menu.superAdmin.title',
      icon: 'Coordinate',
      breadcrumb: 'menu.superAdmin.title',
      roles: ['super_admin'],
    },
    children: [
      {
        id: 21,
        parentId: 2,
        name: 'SuperAdminDashboard',
        title: 'menu.superAdmin.dashboard',
        path: 'dashboard',
        component: 'super-admin/index',
        icon: 'Monitor',
        type: MenuType.MENU,
        sort: 1,
        visible: true,
        status: 1,
        roles: ['super_admin'],
        meta: {
          title: 'menu.superAdmin.dashboard',
          icon: 'Monitor',
          breadcrumb: 'menu.superAdmin.dashboard',
          roles: ['super_admin'],
        },
        createTime: '2024-03-20 10:00:00',
      },
    ],
    createTime: '2024-03-20 10:00:00',
  },
  {
    id: 3,
    name: 'Customer',
    title: 'menu.customer.title',
    path: '/customer',
    component: 'Layout',
    redirect: '/customer/list',
    icon: 'User',
    type: MenuType.MENU,
    sort: 3,
    visible: true,
    status: 1,
    meta: {
      title: 'menu.customer.title',
      icon: 'User',
      breadcrumb: 'menu.customer.title',
    },
    children: [
      {
        id: 31,
        parentId: 3,
        name: 'CustomerList',
        title: 'menu.customer.info',
        path: 'list',
        component: 'customer/index',
        icon: 'User',
        type: MenuType.MENU,
        sort: 1,
        visible: true,
        status: 1,
        meta: {
          title: 'menu.customer.info',
          icon: 'User',
          breadcrumb: 'menu.customer.info',
        },
        createTime: '2024-03-20 10:00:00',
      },
      {
        id: 32,
        parentId: 3,
        name: 'CustomerTrack',
        title: 'menu.customer.track',
        path: 'track',
        component: 'customer/track',
        icon: 'Bell',
        type: MenuType.MENU,
        sort: 2,
        visible: true,
        status: 1,
        meta: {
          title: 'menu.customer.track',
          icon: 'Bell',
          breadcrumb: 'menu.customer.track',
        },
        createTime: '2024-03-20 10:00:00',
      },
      {
        id: 33,
        parentId: 3,
        name: 'CustomerInfo',
        title: 'menu.customer.detail',
        path: 'info/:id',
        component: 'customer/info',
        icon: 'InfoFilled',
        type: MenuType.MENU,
        sort: 3,
        visible: false,
        status: 1,
        meta: {
          title: 'menu.customer.detail',
          icon: 'InfoFilled',
          activeMenu: '/customer/list',
          hidden: true,
          breadcrumb: 'menu.customer.detail',
        },
        createTime: '2024-03-20 10:00:00',
      },
    ],
    createTime: '2024-03-20 10:00:00',
  },
  {
    id: 4,
    name: 'Product',
    title: 'menu.product.title',
    path: '/product',
    component: 'Layout',
    icon: 'Goods',
    type: MenuType.MENU,
    sort: 4,
    visible: true,
    status: 1,
    meta: {
      title: 'menu.product.title',
      icon: 'Goods',
      breadcrumb: 'menu.product.title',
    },
    children: [
      {
        id: 41,
        parentId: 4,
        name: 'ProductIndex',
        title: 'menu.product.info',
        path: 'index',
        component: 'product/index',
        icon: 'Goods',
        type: MenuType.MENU,
        sort: 1,
        visible: true,
        status: 1,
        meta: {
          title: 'menu.product.info',
          icon: 'Goods',
          breadcrumb: 'menu.product.info',
        },
        createTime: '2024-03-20 10:00:00',
      },
    ],
    createTime: '2024-03-20 10:00:00',
  },
  {
    id: 5,
    name: 'Order',
    title: 'menu.order.title',
    path: '/order',
    component: 'Layout',
    icon: 'List',
    type: MenuType.MENU,
    sort: 5,
    visible: true,
    status: 1,
    meta: {
      title: 'menu.order.title',
      icon: 'List',
      breadcrumb: 'menu.order.title',
    },
    children: [
      {
        id: 51,
        parentId: 5,
        name: 'OrderIndex',
        title: 'menu.order.list',
        path: 'index',
        component: 'order/index',
        icon: 'List',
        type: MenuType.MENU,
        sort: 1,
        visible: true,
        status: 1,
        meta: {
          title: 'menu.order.list',
          icon: 'List',
          breadcrumb: 'menu.order.list',
        },
        createTime: '2024-03-20 10:00:00',
      },
    ],
    createTime: '2024-03-20 10:00:00',
  },
  {
    id: 6,
    name: 'System',
    title: 'menu.system.title',
    path: '/system',
    component: 'Layout',
    redirect: '/system/users',
    icon: 'Setting',
    type: MenuType.MENU,
    sort: 6,
    visible: true,
    status: 1,
    roles: ['admin', 'super_admin'],
    meta: {
      title: 'menu.system.title',
      icon: 'Setting',
      breadcrumb: 'menu.system.title',
      roles: ['admin', 'super_admin'],
    },
    children: [
      {
        id: 61,
        parentId: 6,
        name: 'SystemUserList',
        title: 'menu.user.list',
        path: 'users',
        component: 'system/user/index',
        icon: 'User',
        type: MenuType.MENU,
        sort: 1,
        visible: true,
        status: 1,
        roles: ['admin', 'super_admin'],
        meta: {
          title: 'menu.user.list',
          icon: 'User',
          breadcrumb: 'menu.user.list',
          roles: ['admin', 'super_admin'],
        },
        createTime: '2024-03-20 10:00:00',
      },
      {
        id: 62,
        parentId: 6,
        name: 'SystemRoleList',
        title: 'menu.user.roles',
        path: 'roles',
        component: 'system/role/index',
        icon: 'UserFilled',
        type: MenuType.MENU,
        sort: 2,
        visible: true,
        status: 1,
        roles: ['admin', 'super_admin'],
        meta: {
          title: 'menu.user.roles',
          icon: 'UserFilled',
          breadcrumb: 'menu.user.roles',
          roles: ['admin', 'super_admin'],
        },
        createTime: '2024-03-20 10:00:00',
      },
      {
        id: 63,
        parentId: 6,
        name: 'SystemPermissionList',
        title: 'menu.user.permissions',
        path: 'permission/list',
        component: 'system/permission/index',
        icon: 'Lock',
        type: MenuType.MENU,
        sort: 3,
        visible: true,
        status: 1,
        roles: ['admin', 'super_admin'],
        meta: {
          title: 'menu.user.permissions',
          icon: 'Lock',
          breadcrumb: 'menu.user.permissions',
          roles: ['admin', 'super_admin'],
        },
        createTime: '2024-03-20 10:00:00',
      },
    ],
    createTime: '2024-03-20 10:00:00',
  },
];

// 根据用户角色过滤菜单
function filterMenusByRoles(menus: MenuItem[], userRoles: string[]): MenuItem[] {
  return menus
    .filter(menu => {
      // 如果菜单没有roles限制，或者用户角色匹配，则显示
      if (!menu.roles || menu.roles.length === 0) {
        return true;
      }
      return menu.roles.some(role => userRoles.includes(role));
    })
    .map(menu => ({
      ...menu,
      children: menu.children ? filterMenusByRoles(menu.children, userRoles) : undefined,
    }))
    .filter(menu => !menu.children || menu.children.length > 0); // 移除没有子菜单的父菜单
}

// 获取用户菜单
Mock.mock(new RegExp('/api/system/menu/user-menus$'), 'get', () => {
  // 这里应该从用户信息中获取角色，简化处理，直接返回所有菜单
  // 实际应用中需要从token中解析用户角色
  const userRoles = ['super_admin', 'admin']; // 模拟当前用户角色
  const filteredMenus = filterMenusByRoles(menuData, userRoles);

  console.log('Mock - 返回菜单数据:', {
    用户角色: userRoles,
    过滤后菜单: filteredMenus,
    菜单数量: filteredMenus.length,
  });

  return {
    code: 200,
    message: '获取成功',
    data: filteredMenus,
  };
});

// 获取所有菜单
Mock.mock(new RegExp('/system/menu/list$'), 'get', () => {
  return {
    code: 200,
    message: '获取成功',
    data: menuData,
  };
});

// 获取菜单树
Mock.mock(new RegExp('/system/menu/tree$'), 'get', () => {
  return {
    code: 200,
    message: '获取成功',
    data: menuData,
  };
});
