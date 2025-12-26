import Mock from 'mockjs';
import { API_MODE, DEBUG } from '@/config';

// Mock.js 类型扩展
declare module 'mockjs' {
  interface MockXHR extends XMLHttpRequest {
    custom: {
      xhr: XMLHttpRequest;
    };
    proxy_send: (...args: any[]) => void;
  }

  interface MockStatic {
    XHR: {
      prototype: MockXHR;
    };
    setup: (settings: { timeout?: string | number }) => void;
    mock: (url: string | RegExp, type: string, template: any) => void;
  }
}

console.log('Mock initialization - DEBUG:', DEBUG, 'API_MODE:', API_MODE);

// 如果不是mock模式，直接退出，不初始化任何mock功能
if (API_MODE !== 'mock') {
  console.log('API_MODE不是mock，跳过Mock初始化');
  export {};
  // 早期返回，不执行后续代码
}

// 设置基本配置
Mock.setup({
  timeout: '200-600',
});

// 设置拦截器
(Mock as any).XHR.prototype.proxy_send = (Mock as any).XHR.prototype.send;
(Mock as any).XHR.prototype.send = function () {
  if (this.custom.xhr) {
    this.custom.xhr.withCredentials = this.withCredentials || false;
    this.custom.xhr.responseType = this.responseType;
  }
  this.proxy_send(...arguments);
};

// 导入所有mock模块
import('./auth').then(() => {
  console.log('Auth mock module loaded');
});
import('./user').then(() => {
  console.log('User mock module loaded');
});
import('./customer').then(() => {
  console.log('Customer mock module loaded');
});
import('./contact-record').then(() => {
  console.log('Contact record mock module loaded');
});
import('./menu').then(() => {
  console.log('Menu mock module loaded');
});

// 模拟用户列表数据
Mock.mock(new RegExp('/api/users'), 'get', {
  code: 0,
  message: 'success',
  data: {
    'list|10': [
      {
        'id|+1': 1,
        username: '@name',
        realName: '@cname',
        email: '@email',
        phone: /^1[3456789]\d{9}$/,
        'status|1': ['active', 'inactive'],
        createTime: '@datetime',
      },
    ],
    total: 100,
  },
});

// 模拟角色列表数据
Mock.mock(new RegExp('/api/roles'), 'get', {
  code: 0,
  message: 'success',
  data: {
    'list|5': [
      {
        'id|+1': 1,
        name: '@word(5,10)',
        code: '@word(5,10)',
        description: '@sentence(3,6)',
        createTime: '@datetime',
      },
    ],
    total: 5,
  },
});

// 模拟权限列表数据
Mock.mock(new RegExp('/api/permissions$'), 'get', {
  code: 0,
  message: 'success',
  data: {
    'list|8': [
      {
        'id|+1': 1,
        name: '@word(5,10)',
        code: '@word(5,10):@word(3,6)',
        description: '@sentence(3,6)',
        'type|1': ['菜单权限', '按钮权限', '数据权限'],
      },
    ],
    total: 8,
  },
});

// 添加权限
Mock.mock(new RegExp('/api/permissions$'), 'post', {
  code: 0,
  message: 'success',
  data: {
    id: '@id',
    name: '@word(5,10)',
    code: '@word(5,10):@word(3,6)',
    description: '@sentence(3,6)',
    type: '菜单权限',
  },
});

// 更新权限
Mock.mock(new RegExp('/api/permissions/\\d+$'), 'put', {
  code: 0,
  message: 'success',
  data: null,
});

// 删除权限
Mock.mock(new RegExp('/api/permissions/\\d+$'), 'delete', {
  code: 0,
  message: 'success',
  data: null,
});

// 模拟用户信息接口
Mock.mock(new RegExp('/api/auth/user-info'), 'get', () => {
  console.log('Mock - 返回用户信息');
  const currentLang = localStorage.getItem('language') || 'zh-CN';
  const realName = currentLang === 'zh-CN' ? '管理员' : 'Administrator';

  return {
    code: 0,
    message: 'success',
    data: {
      id: 1,
      username: 'admin',
      realName,
      avatar: 'https://avatars.githubusercontent.com/u/1?v=4',
      email: 'admin@example.com',
      phone: '13800138000',
      roles: [
        {
          id: 1,
          name: '超级管理员',
          code: 'admin',
          description: '系统管理员',
          permissions: ['*:*:*'],
          status: 1,
          createTime: new Date().toISOString(),
        },
      ],
      permissions: ['*:*:*'],
      status: 1,
      createTime: new Date().toISOString(),
      lastLoginTime: new Date().toISOString(),
    },
  };
});

// 模拟登录接口
Mock.mock(new RegExp('/api/auth/login$'), 'post', () => {
  console.log('Mock - 处理登录请求');
  return {
    code: 0,
    message: 'success',
    data: {
      token: 'mock_token_1_' + Date.now(),
      user: {
        id: 1,
        username: 'admin',
        realName: '管理员',
        avatar: 'https://avatars.githubusercontent.com/u/1?v=4',
        email: 'admin@example.com',
        phone: '13800138000',
        roles: [
          {
            id: 1,
            name: '超级管理员',
            code: 'admin',
          },
        ],
        permissions: ['*:*:*'],
      },
    },
  };
});

// 模拟登出接口
Mock.mock(new RegExp('/api/auth/logout$'), 'post', {
  code: 0,
  message: 'success',
  data: null,
});

// 模拟参数配置列表数据
Mock.mock(new RegExp('/api/system/params'), 'get', {
  code: 0,
  message: 'success',
  data: {
    'list|10': [
      {
        'id|+1': 1,
        paramName: '@ctitle(4,8)',
        paramKey: 'sys.@word(5,10)',
        paramValue: '@word(5,15)',
        'type|1': ['Y', 'N'],
        'status|1': ['0', '1'],
        remark: '@csentence(10,20)',
        createTime: '@datetime',
      },
    ],
    total: 100,
  },
});

// 新增参数配置
Mock.mock(new RegExp('/api/system/params$'), 'post', {
  code: 0,
  message: 'success',
  data: null,
});

// 更新参数配置
Mock.mock(new RegExp('/api/system/params/\\d+$'), 'put', {
  code: 0,
  message: 'success',
  data: null,
});

// 删除参数配置
Mock.mock(new RegExp('/api/system/params/\\d+$'), 'delete', {
  code: 0,
  message: 'success',
  data: null,
});

// 批量删除参数配置
Mock.mock(new RegExp('/api/system/params/batch$'), 'delete', {
  code: 0,
  message: 'success',
  data: null,
});
