/**
 * 统一导出请求方法
 * request: 用于直接 HTTP 请求
 * request_invoke: 用于调用 Rust 函数
 */

// 导出 axios 请求方法
export { request } from '../request-axios';

// 导出 invoke 请求方法
export { request_invoke } from '../request-invoke';
