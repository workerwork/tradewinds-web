import { request } from '@/utils/request';
import type { Product, PaginationQuery, PaginationResponse } from '@/types';

/**
 * 获取产品列表
 * @param params 查询参数
 */
export const getProductList = (params?: Partial<PaginationQuery & {
    name?: string;
    code?: string;
    category?: string;
    status?: number;
}>) => {
    return request.get<PaginationResponse<Product>>('/product/list', { params });
};

/**
 * 添加产品
 * @param data 产品数据
 */
export const addProduct = (data: Partial<Product>) => {
    return request.post<void>('/product/add', data);
};

/**
 * 更新产品
 * @param id 产品ID
 * @param data 产品数据
 */
export const updateProduct = (id: number, data: Partial<Product>) => {
    return request.put<void>(`/product/update/${id}`, data);
};

/**
 * 删除产品
 * @param id 产品ID
 */
export const deleteProduct = (id: number) => {
    return request.del<void>(`/product/delete/${id}`);
};

/**
 * 获取产品详情
 * @param id 产品ID
 */
export const getProductDetail = (id: number) => {
    return request.get<Product>(`/product/detail/${id}`);
};

/**
 * 更新产品状态
 * @param id 产品ID
 * @param status 状态
 */
export const updateProductStatus = (id: number, status: number) => {
    return request.put<void>(`/product/status/${id}`, { status });
};

/**
 * 上传产品图片
 * @param file 图片文件
 */
export const uploadProductImage = (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    return request.post<{ url: string }>('/product/upload-image', formData, {
        headers: {
            'Content-Type': 'multipart/form-data'
        }
    });
};

/**
 * 导入产品数据
 * @param file Excel文件
 */
export const importProducts = (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    return request.post<void>('/product/import', formData, {
        headers: {
            'Content-Type': 'multipart/form-data'
        }
    });
};

/**
 * 导出产品数据
 * @param params 查询参数
 */
export const exportProducts = (params?: any) => {
    return request.post('/product/export', params, {
        responseType: 'blob'
    });
}; 