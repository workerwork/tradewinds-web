import Mock from 'mockjs';
import type { MockjsRequestOptions } from 'mockjs';
import type { User, Role } from '@/types';

// 模拟角色数据
const roleData: Role[] = [
  {
    id: 1,
    name: '管理员',
    code: 'admin',
    description: '系统管理员，拥有所有权限',
    permissions: [],
    status: 1,
    createTime: '2024-03-20 10:00:00',
    updateTime: '2024-03-20 10:00:00',
  },
  {
    id: 2,
    name: '普通用户',
    code: 'user',
    description: '普通用户，拥有基本权限',
    permissions: [],
    status: 1,
    createTime: '2024-03-20 10:00:00',
    updateTime: '2024-03-20 10:00:00',
  },
];

// 模拟用户数据
const users: (User & { password: string })[] = [
  {
    id: 1,
    username: 'admin',
    password: '123456',
    realName: '管理员',
    avatar: 'https://avatars.githubusercontent.com/u/1?v=4',
    email: 'admin@example.com',
    phone: '13800138000',
    roles: [roleData[0]],
    permissions: ['*'],
    status: 1,
    createTime: '2024-03-20 10:00:00',
    updateTime: '2024-03-20 10:00:00',
  },
  {
    id: 2,
    username: 'user',
    password: '123456',
    realName: '普通用户',
    avatar: 'https://avatars.githubusercontent.com/u/2?v=4',
    email: 'user@example.com',
    phone: '13800138001',
    roles: [roleData[1]],
    permissions: ['view', 'edit'],
    status: 1,
    createTime: '2024-03-20 10:00:00',
    updateTime: '2024-03-20 10:00:00',
  },
];

// 登录接口
Mock.mock('/api/auth/login', 'post', (options: MockjsRequestOptions) => {
  console.log('Mock: 处理登录请求', options);

  try {
    const { username, password } = JSON.parse(options.body);
    const user = users.find(u => u.username === username && u.password === password);

    if (user) {
      const { password: _, ...userInfo } = user;
      const result = {
        code: 0,
        message: '登录成功',
        data: {
          token: `mock_token_${user.id}_${Date.now()}`,
          user: userInfo,
        },
      };
      console.log('Mock: 登录成功响应', result);
      return result;
    }

    const error = {
      code: 401,
      message: '用户名或密码错误',
      data: null,
    };
    console.log('Mock: 登录失败响应', error);
    return error;
  } catch (err) {
    console.error('Mock: 登录请求处理错误', err);
    return {
      code: 500,
      message: '服务器错误',
      data: null,
    };
  }
});

// 获取用户信息接口
Mock.mock(new RegExp('/api/auth/user-info.*'), 'get', (options: MockjsRequestOptions) => {
  console.log('Mock: 处理获取用户信息请求', options);

  try {
    // 从 URL 中提取 token
    const token = decodeURIComponent(
      options.url.split('?')[1]?.split('=')[1] ||
        (options as any).headers?.['Authorization']?.replace('Bearer ', '') ||
        (options as any).headers?.authorization?.replace('Bearer ', '') ||
        ''
    );

    console.log('Mock: 获取到的 token:', token);

    if (!token) {
      console.warn('Mock: 未找到 token');
      return {
        code: 401,
        message: '未登录或 token 已过期',
        data: null,
      };
    }

    // 从 token 中提取用户 ID
    const match = token.match(/mock_token_(\d+)_\d+/);
    if (!match) {
      console.warn('Mock: token 格式不正确');
      return {
        code: 401,
        message: 'token 格式不正确',
        data: null,
      };
    }

    const userId = parseInt(match[1], 10);
    console.log('Mock: 解析出的用户 ID:', userId);

    const user = users.find(u => u.id === userId);

    if (user) {
      const { password: _, ...userInfo } = user;
      console.log('Mock: 找到用户信息:', userInfo);
      return {
        code: 0,
        message: '获取用户信息成功',
        data: userInfo,
      };
    }

    console.warn('Mock: 未找到对应用户');
    return {
      code: 401,
      message: '用户不存在',
      data: null,
    };
  } catch (err) {
    console.error('Mock: 获取用户信息请求处理错误', err);
    return {
      code: 500,
      message: '服务器错误',
      data: null,
    };
  }
});

// 登出接口
Mock.mock('/api/auth/logout', 'post', () => {
  console.log('Mock: 处理登出请求');
  return {
    code: 0,
    message: '登出成功',
    data: null,
  };
});

// 获取用户列表接口
Mock.mock('/api/system/user/list', 'get', () => {
  console.log('Mock: 处理获取用户列表请求');
  const userList = users.map(({ password: _, ...user }) => user);
  return {
    code: 0,
    message: '获取用户列表成功',
    data: {
      list: userList,
      total: userList.length,
    },
  };
});

// 获取角色列表接口
Mock.mock('/api/system/roles', 'get', () => {
  console.log('Mock: 处理获取角色列表请求');
  return {
    code: 0,
    message: '获取角色列表成功',
    data: {
      list: roleData,
      total: roleData.length,
    },
  };
});
