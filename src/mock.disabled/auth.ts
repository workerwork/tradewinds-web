import Mock from 'mockjs';
import type { MockjsRequestOptions } from 'mockjs';
import type { User } from '@/types';

// 模拟用户数据
const users: (User & { password: string })[] = [
  {
    id: 1,
    username: 'admin',
    password: 'admin123',
    realName: '管理员',
    avatar: 'https://avatars.githubusercontent.com/u/1?v=4',
    email: 'admin@example.com',
    phone: '13800138000',
    roles: [
      {
        id: 1,
        name: '超级管理员',
        code: 'super_admin',
        description: '系统超级管理员',
        permissions: [
          {
            id: 1,
            name: '系统管理',
            code: 'system',
            type: 'menu',
            path: '/system',
            component: 'Layout',
            icon: 'setting',
            sort: 1,
            status: 1,
            children: [
              {
                id: 2,
                name: '用户管理',
                code: 'system:user',
                type: 'menu',
                parentId: 1,
                path: 'user',
                component: 'system/user/index',
                icon: 'user',
                sort: 1,
                status: 1,
              },
            ],
          },
        ],
        status: 1,
        createTime: '2024-03-20 10:00:00',
      },
    ],
    permissions: ['*:*:*'],
    status: 1,
    createTime: '2024-03-20 10:00:00',
    lastLoginTime: '2024-03-21 15:30:00',
  },
  {
    id: 2,
    username: 'user',
    password: '123456',
    realName: '普通管理员',
    avatar: 'https://avatars.githubusercontent.com/u/2?v=4',
    email: 'user@example.com',
    phone: '13800138001',
    roles: [
      {
        id: 2,
        name: '普通管理员',
        code: 'admin',
        description: '普通管理员权限',
        permissions: [
          {
            id: 1,
            name: '系统管理',
            code: 'system',
            type: 'menu',
            path: '/system',
            component: 'Layout',
            icon: 'setting',
            sort: 1,
            status: 1,
            children: [
              {
                id: 2,
                name: '用户管理',
                code: 'system:user',
                type: 'menu',
                parentId: 1,
                path: 'user',
                component: 'system/user/index',
                icon: 'user',
                sort: 1,
                status: 1,
              },
            ],
          },
        ],
        status: 1,
        createTime: '2024-03-20 10:00:00',
      },
    ],
    permissions: ['system:*:*'],
    status: 1,
    createTime: '2024-03-20 10:00:00',
    lastLoginTime: '2024-03-21 15:30:00',
  },
];

// 模拟token
let currentToken: string | null = null;

// 登录接口
Mock.mock(new RegExp('/auth/login$'), 'post', (options: MockjsRequestOptions) => {
  console.log('Mock - 处理登录请求');

  let requestData;
  try {
    requestData = JSON.parse(options.body);
  } catch (e) {
    return {
      code: 400,
      message: '无效的请求数据格式',
      data: null,
    };
  }

  const { username, password } = requestData;
  console.log('Mock - 登录信息:', { username, password: '***' });

  const user = users.find(u => u.username === username && u.password === password);

  if (!user) {
    console.log('Mock - 用户认证失败');
    return {
      code: 401,
      message: '用户名或密码错误',
      data: null,
    };
  }

  // 生成token
  currentToken = `mock_token_${user.id}_${Date.now()}`;
  console.log('Mock - 生成新token:', '***' + currentToken.slice(-10));

  // 更新最后登录时间
  user.lastLoginTime = new Date().toISOString().replace('T', ' ').split('.')[0];

  const { password: _, ...userWithoutPassword } = user;

  const responseData = {
    code: 0,
    message: 'success',
    data: {
      token: currentToken,
      user: userWithoutPassword,
    },
  };

  console.log('Mock - 登录成功，返回数据');
  return responseData;
});

// 登出接口
Mock.mock(new RegExp('/auth/logout$'), 'post', () => {
  currentToken = null;
  return {
    success: true,
  };
});

// 获取用户信息 - 支持多个端点
Mock.mock(new RegExp('/auth/(me|user-info)$'), 'get', (options: MockjsRequestOptions) => {
  console.log('Mock - 处理用户信息请求:', {
    url: options.url,
    headers: options.headers,
    currentToken: currentToken ? '存在' : '不存在',
  });

  // 检查Authorization header中的token
  const authHeader = options.headers?.['Authorization'] || options.headers?.['authorization'];
  let token = null;

  if (authHeader) {
    // 提取Bearer token
    const matches = authHeader.match(/Bearer\s+(.+)/);
    if (matches) {
      token = matches[1];
    }
  }

  console.log('Mock - Token验证:', {
    请求的token: token ? '***' + token.slice(-10) : '无',
    当前token: currentToken ? '***' + currentToken.slice(-10) : '无',
    匹配: token === currentToken,
  });

  if (!token || token !== currentToken) {
    console.log('Mock - 认证失败，返回401');
    return Mock.mock({
      code: 401,
      message: 'Unauthorized',
      data: null,
    });
  }

  const user = users[0];
  const { password: _, ...userWithoutPassword } = user;

  console.log('Mock - 返回用户信息:', {
    用户名: userWithoutPassword.username,
    角色数量: userWithoutPassword.roles.length,
  });

  return {
    code: 0,
    message: 'success',
    data: userWithoutPassword,
  };
});

// 刷新token
Mock.mock(new RegExp('/auth/refresh-token$'), 'post', () => {
  if (!currentToken) {
    return {
      token: null,
    };
  }

  currentToken = Mock.Random.guid();
  return {
    token: currentToken,
  };
});
