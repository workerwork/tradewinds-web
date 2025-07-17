// API 基础配置
const baseURL = '/api'

// 模拟响应结构
const createResponse = (data: any, status = 200) => {
    return {
        data: {
            results: Array.isArray(data) ? data : [data],
            count: Array.isArray(data) ? data.length : 1
        },
        status
    }
}

// 客户相关 API
const cus = {
    getAll: async (params?: any) => {
        // TODO: 实现获取所有客户
        return createResponse([])
    },
    add: async (data: any) => {
        // TODO: 实现添加客户
        return createResponse(data, 201)
    },
    edit: async (id: string, data: any) => {
        // TODO: 实现编辑客户
        return createResponse(data, 200)
    },
    del: async (id: string) => {
        // TODO: 实现删除客户
        return createResponse(null, 204)
    },
    upload: async (data: any) => {
        // TODO: 实现上传
        return createResponse(data, 200)
    }
}

// OEM 相关 API
const oem = {
    getAll: async (params?: any) => {
        // TODO: 实现获取所有 OEM
        return createResponse([])
    },
    add: async (data: any) => {
        // TODO: 实现添加 OEM
        return createResponse(data, 201)
    },
    edit: async (id: string, data: any) => {
        // TODO: 实现编辑 OEM
        return createResponse(data, 200)
    },
    del: async (id: string) => {
        // TODO: 实现删除 OEM
        return createResponse(null, 204)
    },
    upload: async (data: any) => {
        // TODO: 实现上传
        return createResponse(data, 200)
    }
}

// 订单相关 API
const ord = {
    getAll: async (params?: any) => {
        // TODO: 实现获取所有订单
        return createResponse([])
    },
    add: async (data: any) => {
        // TODO: 实现添加订单
        return createResponse(data, 201)
    },
    edit: async (id: string, data: any) => {
        // TODO: 实现编辑订单
        return createResponse(data, 200)
    },
    del: async (id: string) => {
        // TODO: 实现删除订单
        return createResponse(null, 204)
    }
}

// 产品相关 API
const pro = {
    getAll: async (params?: any) => {
        // TODO: 实现获取所有产品
        return createResponse([])
    },
    add: async (data: any) => {
        // TODO: 实现添加产品
        return createResponse(data, 201)
    },
    edit: async (id: string, data: any) => {
        // TODO: 实现编辑产品
        return createResponse(data, 200)
    },
    del: async (id: string) => {
        // TODO: 实现删除产品
        return createResponse(null, 204)
    },
    upload: async (data: any) => {
        // TODO: 实现上传
        return createResponse(data, 200)
    }
}

// 物流相关 API
const shp = {
    getAll: async (params?: any) => {
        // TODO: 实现获取所有物流
        return createResponse([])
    },
    add: async (data: any) => {
        // TODO: 实现添加物流
        return createResponse(data, 201)
    },
    edit: async (id: string, data: any) => {
        // TODO: 实现编辑物流
        return createResponse(data, 200)
    },
    del: async (id: string) => {
        // TODO: 实现删除物流
        return createResponse(null, 204)
    }
}

// 系统管理
export * as menuApi from './system/menu';
export * as roleApi from './system/role';
export * as userApi from './system/user';
export * as logApi from './system/log';

// 认证相关
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

export default {
    baseURL,
    cus,
    oem,
    ord,
    pro,
    shp
} 