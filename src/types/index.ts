// 通用响应类型
export interface ApiResponse<T = any> {
    code: number;
    data: T;
    message: string;
}

// 分页请求参数
export interface PaginationQuery {
    page: number;
    size: number;
    search?: string;
    sort?: string;
    order?: 'asc' | 'desc';
}

// 分页响应数据
export interface PaginationResponse<T> {
    items: T[];
    total: number;
    page: number;
    size: number;
}

// 用户信息
export interface User {
    id: string;
    username: string;
    realName: string;
    avatar?: string;
    email: string;
    phone: string;
    roles: Role[];
    permissions: string[];
    status: number;
    createTime: string;
    updateTime: string;
}

// 角色信息
export interface Role {
    id: number;
    name: string;
    code: string;
    description?: string;
    permissions: Permission[];
    status: number;
    createTime: string;
    updateTime: string;
}

// 权限信息
export interface Permission {
    id: string;
    name: string;
    code: string;
    type: string;
    parentId: string;
    path: string;
    component: string;
    icon: string;
    sort: number;
    status: number;
    description: string;
    children?: Permission[];
    createTime?: string;
    updateTime?: string;
}

// 菜单信息
export interface MenuItem extends Permission {
    type: 'menu';
    icon: string;
    path: string;
    component: string;
}

// 任务类型定义
export interface Task {
    id: number;
    name: string;
    jobClass: string;
    cronExpression: string;
    data: string;
    description: string;
    status: number;
    createTime: string;
    updateTime: string;
}

// 任务日志类型定义
export interface TaskLog {
    id: number;
    taskId: number;
    taskName: string;
    executionTime: string;
    duration: number;
    status: number;
    error: string;
    createTime: string;
}

// 菜单类型
export interface Menu extends Permission {
    type: 'menu';
    icon: string;
    path: string;
    component: string;
}

// 日志类型
export interface Log {
    id: number;
    username: string;
    operation: string;
    method: string;
    params: string;
    time: number;
    ip: string;
    location: string;
    status: number;
    error?: string;
    createTime: string;
}

// 分页响应类型
export interface PageResponse<T> {
    items: T[];
    total: number;
    page: number;
    size: number;
}

// 用户相关类型
export interface UserInfo {
    id: number;
    username: string;
    nickname: string;
    avatar: string;
    roles: string[];
    permissions: string[];
}

// 客户相关类型
export interface Customer {
    id: number;
    name: string;
    contact: string;
    phone: string;
    status: number;
    remark?: string;
    createTime: string;
    updateTime: string;
}

// 产品相关类型
export interface Product {
    id: number;
    name: string;
    type: number;
    typeName: string;
    price: number;
    stock: number;
    image: string;
    status: number;
    description?: string;
    createTime: string;
    updateTime: string;
}

// 订单相关类型
export interface Order {
    id: number;
    orderNo: string;
    customerId: number;
    customerName: string;
    totalAmount: number;
    status: number;
    remark?: string;
    createTime: string;
    updateTime: string;
    products: OrderProduct[];
}

export interface OrderProduct {
    id: number;
    productId: number;
    productName: string;
    price: number;
    quantity: number;
    amount: number;
}

// 分页查询参数
export interface QueryParams {
    page: number;
    pageSize: number;
    [key: string]: any;
}

// 分页响应数据
export interface PageResult<T> {
    list: T[];
    total: number;
}

/**
 * 联系记录
 */
export interface ContactRecord {
    id: number;
    customerId: number;
    content: string;
    type: 'info' | 'primary' | 'success' | 'warning';
    timestamp: string;
    createBy: string;
    createTime: string;
    updateTime: string;
}

// 导出菜单相关类型
export * from './menu'; 