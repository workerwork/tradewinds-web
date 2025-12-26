/**
 * Utils 统一导出
 * 按功能模块分类导出
 */

// HTTP 相关
export { request, request_invoke } from './http/request';
export { transformResponse, handleError, BusinessError, NetworkError, AuthError } from './http/request/transform';

// 存储相关
export { CacheService } from './storage/cache';

// 格式化相关
export * from './format/format';

// 图片处理相关
export * from './image/image';

// 调试工具
export * from './debug/menu-debug';

// 系统工具
export { installErrorHandler } from './system/error-handler';
export { installPerformanceMonitor } from './system/performance';
export { installComponentCleanup } from './system/component-cleanup';
export { Logger, logger } from './system/logger';

// 验证相关
export * from './validation/validate';

// 通用工具
export { emitter } from './common/emitter';
export { createFormData, FILE_UPLOAD_CONFIG } from './common/file-upload';
export { extractArrayData, extractObjectData, extractPaginationData } from './common/data-adapter';
export type { PaginationResult } from './common/data-adapter';
export { buildSearchParams, addStatusParam } from './common/search-params';

