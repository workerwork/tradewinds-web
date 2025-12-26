import { defineStore } from 'pinia';
import { ref } from 'vue';
import type { Product, PaginationQuery } from '@/types';
import { productApi } from '@/api';
import { useAppStore } from './app';

export const useProductStore = defineStore('product', () => {
  const appStore = useAppStore();

  // 状态
  const products = ref<Product[]>([]);
  const total = ref(0);
  const currentProduct = ref<Product | null>(null);
  const loading = ref(false);
  const queryParams = ref<
    Partial<
      PaginationQuery & {
        name?: string;
        code?: string;
        category?: string;
        status?: number;
      }
    >
  >({
    page: 1,
    pageSize: 10,
  });

  // 获取产品列表
  const getProducts = async () => {
    try {
      loading.value = true;
      const response = await productApi.getProductList(queryParams.value);
      products.value = response.list;
      total.value = response.total;
    } catch (error) {
      appStore.addNotification({
        type: 'error',
        message: '获取产品列表失败',
      });
      throw error;
    } finally {
      loading.value = false;
    }
  };

  // 获取产品详情
  const getProductDetail = async (id: number) => {
    try {
      loading.value = true;
      const product = await productApi.getProductDetail(id);
      currentProduct.value = product;
      return product;
    } catch (error) {
      appStore.addNotification({
        type: 'error',
        message: '获取产品详情失败',
      });
      throw error;
    } finally {
      loading.value = false;
    }
  };

  // 添加产品
  const addProduct = async (data: Partial<Product>) => {
    try {
      loading.value = true;
      await productApi.addProduct(data);
      appStore.addNotification({
        type: 'success',
        message: '添加产品成功',
      });
      await getProducts();
    } catch (error) {
      appStore.addNotification({
        type: 'error',
        message: '添加产品失败',
      });
      throw error;
    } finally {
      loading.value = false;
    }
  };

  // 更新产品
  const updateProduct = async (id: number, data: Partial<Product>) => {
    try {
      loading.value = true;
      await productApi.updateProduct(id, data);
      appStore.addNotification({
        type: 'success',
        message: '更新产品成功',
      });
      await getProducts();
    } catch (error) {
      appStore.addNotification({
        type: 'error',
        message: '更新产品失败',
      });
      throw error;
    } finally {
      loading.value = false;
    }
  };

  // 删除产品
  const deleteProduct = async (id: number) => {
    try {
      loading.value = true;
      await productApi.deleteProduct(id);
      appStore.addNotification({
        type: 'success',
        message: '删除产品成功',
      });
      await getProducts();
    } catch (error) {
      appStore.addNotification({
        type: 'error',
        message: '删除产品失败',
      });
      throw error;
    } finally {
      loading.value = false;
    }
  };

  // 上传产品图片
  const uploadImage = async (file: File) => {
    try {
      loading.value = true;
      const result = await productApi.uploadProductImage(file);
      appStore.addNotification({
        type: 'success',
        message: '上传图片成功',
      });
      return result.url;
    } catch (error) {
      appStore.addNotification({
        type: 'error',
        message: '上传图片失败',
      });
      throw error;
    } finally {
      loading.value = false;
    }
  };

  // 更新查询参数
  const updateQueryParams = (params: Partial<typeof queryParams.value>) => {
    queryParams.value = {
      ...queryParams.value,
      ...params,
    };
  };

  // 重置查询参数
  const resetQueryParams = () => {
    queryParams.value = {
      page: 1,
      pageSize: 10,
    };
  };

  return {
    // 状态
    products,
    total,
    currentProduct,
    loading,
    queryParams,
    // 方法
    getProducts,
    getProductDetail,
    addProduct,
    updateProduct,
    deleteProduct,
    uploadImage,
    updateQueryParams,
    resetQueryParams,
  };
});
