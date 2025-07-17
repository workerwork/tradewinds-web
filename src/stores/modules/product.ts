import { defineStore } from 'pinia';
import type { Product, QueryParams, PageResult } from '@/types';
import { request } from '@/utils/request';

interface ProductState {
    products: Product[];
    total: number;
    queryParams: QueryParams;
    loading: boolean;
}

export const useProductStore = defineStore('product', {
    state: (): ProductState => ({
        products: [],
        total: 0,
        queryParams: {
            page: 1,
            pageSize: 10
        },
        loading: false
    }),

    actions: {
        // 更新查询参数
        updateQueryParams(params: Partial<QueryParams>) {
            this.queryParams = { ...this.queryParams, ...params };
        },

        // 获取产品列表
        async getProducts() {
            this.loading = true;
            try {
                const { list, total } = await request.get<PageResult<Product>>('/api/products', {
                    params: this.queryParams
                });
                this.products = list;
                this.total = total;
            } catch (error) {
                // 错误处理
                console.error('获取产品列表失败:', error);
                throw error;
            } finally {
                this.loading = false;
            }
        },

        // 添加产品
        async addProduct(data: Partial<Product>) {
            try {
                await request.post('/api/products', data);
                await this.getProducts();
            } catch (error) {
                console.error('添加产品失败:', error);
                throw error;
            }
        },

        // 更新产品
        async updateProduct(id: number, data: Partial<Product>) {
            try {
                await request.put(`/api/products/${id}`, data);
                await this.getProducts();
            } catch (error) {
                console.error('更新产品失败:', error);
                throw error;
            }
        },

        // 删除产品
        async deleteProduct(id: number) {
            try {
                await request.delete(`/api/products/${id}`);
                await this.getProducts();
            } catch (error) {
                console.error('删除产品失败:', error);
                throw error;
            }
        },

        // 上传产品图片
        async uploadImage(file: File) {
            try {
                const formData = new FormData();
                formData.append('file', file);
                const result = await request.post<{ url: string }>('/api/upload', formData);
                return result;
            } catch (error) {
                console.error('上传图片失败:', error);
                throw error;
            }
        },

        // 导入产品
        async importProducts(file: FormData) {
            try {
                await request.post('/api/products/import', file);
                await this.getProducts();
            } catch (error) {
                console.error('导入产品失败:', error);
                throw error;
            }
        },

        // 导出产品
        async exportProducts(params?: QueryParams) {
            try {
                const response = await request.get('/api/products/export', {
                    params,
                    responseType: 'blob'
                });
                const url = window.URL.createObjectURL(new Blob([response]));
                const link = document.createElement('a');
                link.href = url;
                link.setAttribute('download', '产品列表.xlsx');
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
            } catch (error) {
                console.error('导出产品失败:', error);
                throw error;
            }
        }
    }
}); 