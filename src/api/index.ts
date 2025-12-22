/**
 * API 模块统一导出
 * 提供系统管理、认证和业务模块的 API 接口
 */

// 导出 API 类型定义（不包含已单独导出的类型）
export type { ParamQuery, ParamData } from './system';
export type { ContactRecordQuery, ExportLogParams } from './types';

// 系统管理模块
export * as menuApi from './system/menu';
export * as roleApi from './system/role';
export * as userApi from './system/user';
export * as logApi from './system/log';
export * as configApi from './system/config';

// 系统参数 API (支持 invoke 模式)
export {
    getParamList,
    addParam,
    updateParam,
    deleteParam,
    batchDeleteParams,
    getParamValue
} from './system';

// 认证相关模块
export * as authApi from './auth';

// 业务模块
import * as customerApi from './customer';
import * as contactRecordApi from './contact-record';
import * as productApi from './product';
import * as orderApi from './order';

export {
    customerApi,
    contactRecordApi,
    productApi,
    orderApi
}; 