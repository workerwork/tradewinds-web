/**
 * API 模块类型定义
 * 统一导出 API 相关的类型定义
 */

// 从系统参数 API 导出类型
export type { ParamQuery, ParamData } from './system';

// 从认证 API 导出类型（SuperAdminDashboard 在 auth/index.ts 中已导出，这里不再重复导出）

// 联系记录查询参数类型
export interface ContactRecordQuery {
  customerId?: number;
  contactType?: string;
  dateRange?: [string, string];
  page?: number;
  size?: number;
}

// 导出日志查询参数类型
export interface ExportLogParams {
  operator?: string;
  type?: string;
  status?: number;
  dateRange?: [string, string];
  page?: number;
  size?: number;
}
