import Mock from 'mockjs';
import type { MockjsRequestOptions } from 'mockjs';
import type { ContactRecord } from '@/types';

// 模拟联系记录数据
const records: ContactRecord[] = [
  {
    id: 1,
    customerId: 1,
    content: '电话沟通产品需求',
    type: 'primary',
    timestamp: '2024-03-21 15:30:00',
    createBy: 'admin',
    createTime: '2024-03-21 15:30:00',
    updateTime: '2024-03-21 15:30:00',
  },
  {
    id: 2,
    customerId: 1,
    content: '发送产品方案',
    type: 'success',
    timestamp: '2024-03-20 14:20:00',
    createBy: 'admin',
    createTime: '2024-03-20 14:20:00',
    updateTime: '2024-03-20 14:20:00',
  },
  {
    id: 3,
    customerId: 1,
    content: '首次接洽',
    type: 'info',
    timestamp: '2024-03-19 10:00:00',
    createBy: 'admin',
    createTime: '2024-03-19 10:00:00',
    updateTime: '2024-03-19 10:00:00',
  },
];

// 获取联系记录列表
Mock.mock(/\/api\/contact-record\/list\/\d+/, 'get', (options: MockjsRequestOptions) => {
  const customerId = parseInt(options.url.split('/').pop() || '0');
  const customerRecords = records.filter(record => record.customerId === customerId);

  return {
    code: 0,
    message: '获取联系记录成功',
    data: customerRecords,
  };
});

// 添加联系记录
Mock.mock('/api/contact-record/add', 'post', (options: MockjsRequestOptions) => {
  const { customerId, content, type } = JSON.parse(options.body);
  const now = new Date().toISOString().replace('T', ' ').split('.')[0];

  const newRecord: ContactRecord = {
    id: records.length + 1,
    customerId,
    content,
    type,
    timestamp: now,
    createBy: 'admin',
    createTime: now,
    updateTime: now,
  };

  records.push(newRecord);

  return {
    code: 0,
    message: '添加联系记录成功',
    data: null,
  };
});
