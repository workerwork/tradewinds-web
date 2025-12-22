<!-- 产品管理页面 -->
<template>
  <div class="product-container">
    <!-- 搜索表单 -->
    <el-form :model="queryParams" inline>
      <el-form-item label="产品名称">
        <el-input
          v-model="queryParams.name"
          placeholder="请输入产品名称"
          clearable
          @keyup.enter="handleSearch"
        />
      </el-form-item>
      <el-form-item label="产品类型">
        <el-select v-model="queryParams.type" placeholder="请选择产品类型" clearable>
          <el-option
            v-for="item in productTypes"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="状态">
        <el-select v-model="queryParams.status" placeholder="请选择状态" clearable>
          <el-option label="在售" :value="1" />
          <el-option label="下架" :value="0" />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="handleSearch">搜索</el-button>
        <el-button @click="handleReset">重置</el-button>
      </el-form-item>
    </el-form>

    <!-- 工具栏 -->
    <div class="toolbar">
      <el-button type="primary" @click="handleAdd">新增产品</el-button>
      <el-upload
        class="upload-btn"
        action=""
        :auto-upload="false"
        :show-file-list="false"
        accept=".xlsx,.xls"
        @change="handleImport"
      >
        <el-button type="success">导入</el-button>
      </el-upload>
      <el-button type="warning" @click="handleExport">导出</el-button>
    </div>

    <!-- 使用虚拟滚动的产品列表 -->
    <div class="product-list">
      <virtual-list
        :data="productStore.products"
        :item-height="80"
        :buffer-size="10"
        class="list-container"
      >
        <template #default="{ item }">
          <div class="product-item">
            <div class="product-image">
              <el-image
                :src="item.image"
                :preview-src-list="[item.image]"
                fit="cover"
                class="image"
              >
                <template #error>
                  <div class="image-placeholder">
                    <el-icon><Picture /></el-icon>
                  </div>
                </template>
              </el-image>
            </div>
            <div class="product-info">
              <h3>{{ item.name }}</h3>
              <p>类型：{{ item.typeName }} | 价格：¥{{ item.price }}</p>
              <p>库存：{{ item.stock }} | 状态：{{ item.status === 1 ? '在售' : '下架' }}</p>
            </div>
            <div class="product-actions">
              <el-button type="primary" link @click="handleEdit(item)">编辑</el-button>
              <el-button type="danger" link @click="handleDelete(item)">删除</el-button>
            </div>
          </div>
        </template>
      </virtual-list>

      <!-- 分页 -->
      <div class="pagination">
        <el-pagination
          v-model:current-page="queryParams.page"
          v-model:page-size="queryParams.pageSize"
          :total="productStore.total"
          :page-sizes="[10, 20, 50, 100]"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </div>

    <!-- 编辑对话框 -->
    <el-dialog
      :title="dialogTitle"
      v-model="dialogVisible"
      width="600px"
      append-to-body
    >
      <el-form
        ref="formRef"
        :model="formData"
        :rules="formRules"
        label-width="80px"
      >
        <el-form-item label="产品名称" prop="name">
          <el-input v-model="formData.name" placeholder="请输入产品名称" />
        </el-form-item>
        <el-form-item label="产品类型" prop="type">
          <el-select v-model="formData.type" placeholder="请选择产品类型">
            <el-option
              v-for="item in productTypes"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="产品价格" prop="price">
          <el-input-number
            v-model="formData.price"
            :precision="2"
            :step="0.1"
            :min="0"
          />
        </el-form-item>
        <el-form-item label="库存数量" prop="stock">
          <el-input-number
            v-model="formData.stock"
            :precision="0"
            :step="1"
            :min="0"
          />
        </el-form-item>
        <el-form-item label="产品图片" prop="image">
          <el-upload
            class="product-upload"
            action=""
            :auto-upload="false"
            :show-file-list="false"
            accept="image/*"
            @change="handleImageUpload"
          >
            <el-image
              v-if="formData.image"
              :src="formData.image"
              fit="cover"
              class="upload-image"
            />
            <div v-else class="upload-placeholder">
              <el-icon><Plus /></el-icon>
              <span>点击上传</span>
            </div>
          </el-upload>
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-radio-group v-model="formData.status">
            <el-radio :label="1">在售</el-radio>
            <el-radio :label="0">下架</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="描述" prop="description">
          <el-input
            v-model="formData.description"
            type="textarea"
            :rows="3"
            placeholder="请输入产品描述"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmit">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue';
import { useProductStore } from '@/stores';
import { CacheService } from '@/utils';

const cache = new CacheService();
import VirtualList from '@/components/VirtualList.vue';
import type { FormInstance } from 'element-plus';
import type { Product } from '@/types';
import { Picture, Plus } from '@element-plus/icons-vue';

const productStore = useProductStore();
const formRef = ref<FormInstance>();

// 产品类型选项
const productTypes = [
  { label: '电子产品', value: 1 },
  { label: '服装', value: 2 },
  { label: '食品', value: 3 },
  { label: '家具', value: 4 },
  { label: '其他', value: 99 }
];

// 查询参数
const queryParams = reactive({
  page: 1,
  pageSize: 10,
  name: '',
  type: undefined as number | undefined,
  status: undefined as number | undefined
});

// 表单数据
const formData = reactive<Partial<Product>>({
  name: '',
  type: undefined,
  price: 0,
  stock: 0,
  image: '',
  status: 1,
  description: ''
});

// 表单校验规则
const formRules = {
  name: [{ required: true, message: '请输入产品名称', trigger: 'blur' }],
  type: [{ required: true, message: '请选择产品类型', trigger: 'change' }],
  price: [{ required: true, message: '请输入产品价格', trigger: 'blur' }],
  stock: [{ required: true, message: '请输入库存数量', trigger: 'blur' }]
};

// 对话框相关
const dialogVisible = ref(false);
const dialogType = ref<'add' | 'edit'>('add');
const dialogTitle = computed(() => dialogType.value === 'add' ? '新增产品' : '编辑产品');

// 初始化
onMounted(async () => {
  // 使用缓存服务获取产品列表
  await cache.getOrSet(
    'product_list',
    () => productStore.getProducts(),
    5 * 60 * 1000 // 5分钟缓存
  );
});

// 搜索
const handleSearch = () => {
  queryParams.page = 1;
  productStore.updateQueryParams(queryParams);
  productStore.getProducts();
};

// 重置
const handleReset = () => {
  queryParams.name = '';
  queryParams.type = undefined;
  queryParams.status = undefined;
  handleSearch();
};

// 新增
const handleAdd = () => {
  dialogType.value = 'add';
  dialogVisible.value = true;
  Object.assign(formData, {
    name: '',
    type: undefined,
    price: 0,
    stock: 0,
    image: '',
    status: 1,
    description: ''
  });
};

// 编辑
const handleEdit = (row: Product) => {
  dialogType.value = 'edit';
  dialogVisible.value = true;
  Object.assign(formData, row);
};

// 删除
const handleDelete = async (row: Product) => {
  try {
    await ElMessageBox.confirm('确认删除该产品吗？', '提示', {
      type: 'warning'
    });
    await productStore.deleteProduct(row.id);
    ElMessage.success('删除成功');
  } catch (error) {
    // 取消删除
  }
};

// 提交表单
const handleSubmit = async () => {
  if (!formRef.value) return;
  
  await formRef.value.validate();
  
  if (dialogType.value === 'add') {
    await productStore.addProduct(formData);
  } else {
    await productStore.updateProduct(formData.id!, formData);
  }
  
  dialogVisible.value = false;
  ElMessage.success(dialogType.value === 'add' ? '添加成功' : '更新成功');
};

// 图片上传
const handleImageUpload = async (file: any) => {
  try {
    const result = await productStore.uploadImage(file.raw);
    formData.image = result.url;
  } catch (error) {
    ElMessage.error('图片上传失败');
  }
};

// 导入
const handleImport = async (file: any) => {
  const formData = new FormData();
  formData.append('file', file.raw);
  try {
    await productStore.importProducts(formData);
    ElMessage.success('导入成功');
  } catch (error) {
    // 错误处理
  }
};

// 导出
const handleExport = async () => {
  try {
    await productStore.exportProducts(queryParams);
    ElMessage.success('导出成功');
  } catch (error) {
    // 错误处理
  }
};

// 分页
const handleSizeChange = (val: number) => {
  queryParams.pageSize = val;
  productStore.getProducts();
};

const handleCurrentChange = (val: number) => {
  queryParams.page = val;
  productStore.getProducts();
};
</script>

<style scoped>
.product-container {
  padding: 20px;
}

.toolbar {
  margin: 20px 0;
}

.product-list {
  background: #fff;
  border-radius: 4px;
  padding: 20px;
}

.list-container {
  height: calc(100vh - 300px);
  border: 1px solid #ebeef5;
  border-radius: 4px;
}

.product-item {
  padding: 10px 20px;
  border-bottom: 1px solid #ebeef5;
  display: flex;
  align-items: center;
  gap: 20px;
}

.product-image {
  width: 60px;
  height: 60px;
  flex-shrink: 0;
}

.image {
  width: 100%;
  height: 100%;
  border-radius: 4px;
}

.image-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f5f7fa;
  border-radius: 4px;
  color: #909399;
}

.product-info {
  flex: 1;
}

.product-info h3 {
  margin: 0 0 5px;
  font-size: 16px;
}

.product-info p {
  margin: 0;
  font-size: 14px;
  color: #666;
}

.product-actions {
  flex-shrink: 0;
}

.pagination {
  margin-top: 20px;
  text-align: right;
}

.upload-btn {
  display: inline-block;
  margin: 0 10px;
}

.product-upload {
  width: 148px;
  height: 148px;
  border: 1px dashed #d9d9d9;
  border-radius: 4px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
}

.product-upload:hover {
  border-color: #409eff;
}

.upload-image {
  width: 100%;
  height: 100%;
  display: block;
}

.upload-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  color: #8c939d;
}

.upload-placeholder .el-icon {
  font-size: 28px;
  margin-bottom: 8px;
}
</style> 