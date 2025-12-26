import Mock from 'mockjs';
import type { Customer } from '@/types';

// 生成模拟数据
const customerList: Customer[] = Mock.mock({
  'list|30': [
    {
      'id|+1': 1,
      name: '@ctitle(3,10)科技有限公司',
      contact: '@cname',
      phone: /^1[3-9]\d{9}$/,
      email: '@email',
      address: '@province@city@county@ctitle(3,10)路@natural(1,100)号',
      'status|1': [0, 1],
      'type|1': ['潜在客户', '意向客户', '成交客户', '流失客户'],
      'source|1': ['网络推广', '朋友推荐', '电话营销', '展会获取'],
      'industry|1': ['互联网', '金融', '教育', '医疗', '制造业', '房地产'],
      remark: '@cparagraph(1,3)',
      createTime: '@datetime',
      updateTime: '@datetime',
      lastContactTime: '@datetime',
      nextContactTime: '@datetime',
    },
  ],
}).list;

// 配置Mock拦截
Mock.mock(/\/customer\/list/, 'get', (options: any) => {
  const url = new URL(options.url, window.location.origin);
  const params = Object.fromEntries(url.searchParams.entries());
  return getCustomerList(params);
});

Mock.mock(/\/customer\/detail\/\d+/, 'get', (options: any) => {
  const id = parseInt(options.url.match(/\/detail\/(\d+)/)[1]);
  return getCustomerInfo(id);
});

Mock.mock('/customer/add', 'post', (options: any) => {
  const body = JSON.parse(options.body);
  return addCustomer(body);
});

Mock.mock(/\/customer\/update\/\d+/, 'put', (options: any) => {
  const id = parseInt(options.url.match(/\/update\/(\d+)/)[1]);
  const body = JSON.parse(options.body);
  return updateCustomer({ ...body, id });
});

Mock.mock(/\/customer\/delete\/\d+/, 'delete', (options: any) => {
  const id = parseInt(options.url.match(/\/delete\/(\d+)/)[1]);
  return deleteCustomer(id);
});

Mock.mock(/\/customer\/status\/\d+/, 'put', (options: any) => {
  const id = parseInt(options.url.match(/\/status\/(\d+)/)[1]);
  const body = JSON.parse(options.body);
  return updateCustomer({ id, status: body.status });
});

// 模拟获取客户列表的接口
export function getCustomerList(params: any) {
  const { page = 1, pageSize = 10, name, contact, status } = params;

  let result = [...customerList];

  // 根据查询条件过滤
  if (name) {
    result = result.filter(item => item.name.includes(name));
  }
  if (contact) {
    result = result.filter(item => item.contact.includes(contact));
  }
  if (status !== undefined) {
    result = result.filter(item => item.status === Number(status));
  }

  // 计算分页
  const total = result.length;
  const start = (page - 1) * pageSize;
  const end = start + pageSize;
  result = result.slice(start, end);

  return {
    code: 0,
    message: 'success',
    data: {
      list: result,
      total,
      page: Number(page),
      pageSize: Number(pageSize),
    },
  };
}

// 模拟获取单个客户详情的接口
export function getCustomerInfo(id: number) {
  const customer = customerList.find(item => item.id === id);
  return {
    code: 200,
    message: 'success',
    data: customer,
  };
}

// 模拟添加客户的接口
export function addCustomer(data: Partial<Customer>) {
  const customer = {
    ...data,
    id: customerList.length + 1,
    createTime: Mock.Random.datetime(),
    updateTime: Mock.Random.datetime(),
  };
  customerList.push(customer as Customer);
  return {
    code: 200,
    message: 'success',
    data: customer,
  };
}

// 模拟更新客户的接口
export function updateCustomer(data: Partial<Customer>) {
  const index = customerList.findIndex(item => item.id === data.id);
  if (index > -1) {
    customerList[index] = {
      ...customerList[index],
      ...data,
      updateTime: Mock.Random.datetime(),
    };
    return {
      code: 200,
      message: 'success',
      data: customerList[index],
    };
  }
  return {
    code: 400,
    message: '客户不存在',
    data: null,
  };
}

// 模拟删除客户的接口
export function deleteCustomer(id: number) {
  const index = customerList.findIndex(item => item.id === id);
  if (index > -1) {
    customerList.splice(index, 1);
    return {
      code: 200,
      message: 'success',
    };
  }
  return {
    code: 400,
    message: '客户不存在',
  };
}
