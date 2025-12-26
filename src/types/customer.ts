export interface Customer {
  id: number;
  name: string;
  contact: string;
  phone: string;
  email: string;
  address: string;
  status: number; // 0: 禁用, 1: 启用
  type: string; // 潜在客户、意向客户、成交客户、流失客户
  source: string; // 客户来源
  industry: string; // 所属行业
  remark: string;
  createTime: string;
  updateTime: string;
  lastContactTime: string;
  nextContactTime: string;
}
