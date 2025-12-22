<!-- 客户列表页面 -->
<template>
  <div class="customer-container">
    <!-- 搜索表单 -->
    <el-form :model="queryParams" inline class="search-form">
      <el-form-item label="客户名称">
        <el-input
          v-model="queryParams.name"
          placeholder="请输入客户名称"
          clearable
          @keyup.enter="handleSearch"
        />
      </el-form-item>
      <el-form-item label="联系人">
        <el-input
          v-model="queryParams.contact"
          placeholder="请输入联系人"
          clearable
          @keyup.enter="handleSearch"
        />
      </el-form-item>
      <el-form-item label="状态">
        <el-select v-model="queryParams.status" placeholder="请选择状态" clearable>
          <el-option label="启用" :value="1" />
          <el-option label="禁用" :value="0" />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="handleSearch">搜索</el-button>
        <el-button @click="handleReset">重置</el-button>
      </el-form-item>
    </el-form>

    <!-- 工具栏 -->
    <div class="toolbar">
      <el-button type="primary" @click="handleAdd">新增客户</el-button>
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

    <!-- 客户列表表格 -->
    <el-table
      v-loading="loading"
      :data="customerList"
      border
      stripe
      style="width: 100%"
    >
      <el-table-column prop="id" label="ID" width="80" />
      <el-table-column prop="name" label="客户名称" min-width="200" show-overflow-tooltip />
      <el-table-column prop="contact" label="联系人" width="120" />
      <el-table-column prop="phone" label="联系电话" width="140" />
      <el-table-column prop="type" label="客户类型" width="120">
        <template #default="{ row }">
          <el-tag :type="getCustomerTypeTag(row.type)">{{ row.type }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="source" label="来源" width="120" />
      <el-table-column prop="industry" label="行业" width="120" />
      <el-table-column prop="status" label="状态" width="80">
        <template #default="{ row }">
          <el-tag :type="row.status === 1 ? 'success' : 'danger'">
            {{ row.status === 1 ? '启用' : '禁用' }}
          </el-tag>
        </template>
      </el-table-column>
              <el-table-column prop="createTime" label="创建时间" width="180">
          <template #default="{ row }">
            {{ formatDateTime(row.createTime) }}
          </template>
        </el-table-column>
      <el-table-column label="操作" width="200" fixed="right">
        <template #default="{ row }">
          <el-button type="primary" link @click="handleView(row)">查看</el-button>
          <el-button type="primary" link @click="handleEdit(row)">编辑</el-button>
          <el-popconfirm
            title="确定删除该客户吗？"
            @confirm="handleDelete(row)"
          >
            <template #reference>
              <el-button type="danger" link>删除</el-button>
            </template>
          </el-popconfirm>
        </template>
      </el-table-column>
    </el-table>

    <!-- 分页 -->
    <div class="pagination">
      <el-pagination
        v-model:current-page="queryParams.page"
        v-model:page-size="queryParams.pageSize"
        :total="total"
        :page-sizes="[10, 20, 50, 100]"
        layout="total, sizes, prev, pager, next, jumper"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      />
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
        label-width="100px"
      >
        <el-form-item label="客户名称" prop="name">
          <el-input v-model="formData.name" placeholder="请输入客户名称" />
        </el-form-item>
        <el-form-item label="联系人" prop="contact">
          <el-input v-model="formData.contact" placeholder="请输入联系人" />
        </el-form-item>
        <el-form-item label="联系电话" prop="phone">
          <el-input v-model="formData.phone" placeholder="请输入联系电话" />
        </el-form-item>
        <el-form-item label="电子邮箱" prop="email">
          <el-input v-model="formData.email" placeholder="请输入电子邮箱" />
        </el-form-item>
        <el-form-item label="客户类型" prop="type">
          <el-select v-model="formData.type" placeholder="请选择客户类型">
            <el-option label="潜在客户" value="潜在客户" />
            <el-option label="意向客户" value="意向客户" />
            <el-option label="成交客户" value="成交客户" />
            <el-option label="流失客户" value="流失客户" />
          </el-select>
        </el-form-item>
        <el-form-item label="客户来源" prop="source">
          <el-select v-model="formData.source" placeholder="请选择客户来源">
            <el-option label="网络推广" value="网络推广" />
            <el-option label="朋友推荐" value="朋友推荐" />
            <el-option label="电话营销" value="电话营销" />
            <el-option label="展会获取" value="展会获取" />
          </el-select>
        </el-form-item>
        <el-form-item label="所属行业" prop="industry">
          <el-select v-model="formData.industry" placeholder="请选择所属行业">
            <el-option label="互联网" value="互联网" />
            <el-option label="金融" value="金融" />
            <el-option label="教育" value="教育" />
            <el-option label="医疗" value="医疗" />
            <el-option label="制造业" value="制造业" />
            <el-option label="房地产" value="房地产" />
          </el-select>
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-radio-group v-model="formData.status">
            <el-radio :label="1">启用</el-radio>
            <el-radio :label="0">禁用</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="地址" prop="address">
          <el-input v-model="formData.address" placeholder="请输入地址" />
        </el-form-item>
        <el-form-item label="备注" prop="remark">
          <el-input
            v-model="formData.remark"
            type="textarea"
            placeholder="请输入备注"
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
import { useRouter } from 'vue-router';
import { ElMessage, ElMessageBox } from 'element-plus';
import type { FormInstance } from 'element-plus';
import type { Customer } from '@/types/customer';
import { getCustomerList, addCustomer, updateCustomer, deleteCustomer } from '@/api/customer';
import { formatDateTime } from '@/utils';

const router = useRouter();
const formRef = ref<FormInstance>();

// 列表数据
const loading = ref(false);
const customerList = ref<Customer[]>([]);
const total = ref(0);

// 查询参数
const queryParams = reactive({
  page: 1,
  pageSize: 10,
  name: '',
  contact: '',
  status: undefined as number | undefined
});

// 表单数据
const formData = reactive<Partial<Customer>>({
  name: '',
  contact: '',
  phone: '',
  email: '',
  address: '',
  status: 1,
  type: '潜在客户',
  source: '网络推广',
  industry: '互联网',
  remark: ''
});

// 表单校验规则
const formRules = {
  name: [{ required: true, message: '请输入客户名称', trigger: 'blur' }],
  contact: [{ required: true, message: '请输入联系人', trigger: 'blur' }],
  phone: [
    { required: true, message: '请输入联系电话', trigger: 'blur' },
    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号码', trigger: 'blur' }
  ],
  email: [
    { required: true, message: '请输入电子邮箱', trigger: 'blur' },
    { type: 'email', message: '请输入正确的邮箱地址', trigger: 'blur' }
  ]
};

// 对话框相关
const dialogVisible = ref(false);
const dialogType = ref<'add' | 'edit'>('add');
const dialogTitle = computed(() => dialogType.value === 'add' ? '新增客户' : '编辑客户');

// 获取客户列表
const getList = async () => {
  loading.value = true;
  try {
    const res = await getCustomerList(queryParams);
    customerList.value = res.list;
    total.value = res.total;
  } catch (error) {
    console.error('获取客户列表失败:', error);
    ElMessage.error('获取客户列表失败');
  } finally {
    loading.value = false;
  }
};

// 初始化
onMounted(() => {
  getList();
});

// 搜索
const handleSearch = () => {
  queryParams.page = 1;
  getList();
};

// 重置
const handleReset = () => {
  queryParams.name = '';
  queryParams.contact = '';
  queryParams.status = undefined;
  handleSearch();
};

// 新增
const handleAdd = () => {
  dialogType.value = 'add';
  formData.id = undefined;
  formData.name = '';
  formData.contact = '';
  formData.phone = '';
  formData.email = '';
  formData.address = '';
  formData.status = 1;
  formData.type = '潜在客户';
  formData.source = '网络推广';
  formData.industry = '互联网';
  formData.remark = '';
  dialogVisible.value = true;
};

// 编辑
const handleEdit = (row: Customer) => {
  dialogType.value = 'edit';
  Object.assign(formData, row);
  dialogVisible.value = true;
};

// 查看
const handleView = (row: Customer) => {
  router.push(`/customer/info/${row.id}`);
};

// 删除
const handleDelete = async (row: Customer) => {
  try {
    await deleteCustomer(row.id);
    ElMessage.success('删除成功');
    getList();
  } catch (error) {
    console.error('删除失败:', error);
    ElMessage.error('删除失败');
  }
};

// 提交表单
const handleSubmit = async () => {
  if (!formRef.value) return;
  
  await formRef.value.validate();
  
  try {
    if (dialogType.value === 'add') {
      await addCustomer(formData);
      ElMessage.success('添加成功');
    } else {
      await updateCustomer(formData.id!, formData);
      ElMessage.success('更新成功');
    }
    dialogVisible.value = false;
    getList();
  } catch (error) {
    console.error('操作失败:', error);
    ElMessage.error('操作失败');
  }
};

// 分页
const handleSizeChange = (val: number) => {
  queryParams.pageSize = val;
  getList();
};

const handleCurrentChange = (val: number) => {
  queryParams.page = val;
  getList();
};

// 导入
const handleImport = (file: any) => {
  ElMessage.warning('导入功能待实现');
};

// 导出
const handleExport = () => {
  ElMessage.warning('导出功能待实现');
};

// 获取客户类型对应的标签类型
const getCustomerTypeTag = (type: string) => {
  const map: Record<string, string> = {
    '潜在客户': 'info',
    '意向客户': 'warning',
    '成交客户': 'success',
    '流失客户': 'danger'
  };
  return map[type] || 'info';
};
</script>

<style scoped>
.customer-container {
  padding: 20px;
  background: #fff;
  border-radius: 4px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.search-form {
  margin-bottom: 20px;
  padding: 20px;
  background: #f5f7fa;
  border-radius: 4px;
}

.toolbar {
  margin-bottom: 20px;
  display: flex;
  gap: 10px;
}

.pagination {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}

:deep(.el-table) {
  margin-top: 20px;
}

.customer-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px;
  border-bottom: 1px solid #ebeef5;
}

.customer-info {
  flex: 1;
}

.customer-info h3 {
  margin: 0 0 5px;
  font-size: 16px;
  color: #303133;
}

.customer-info p {
  margin: 0;
  font-size: 14px;
  color: #606266;
}

.customer-actions {
  display: flex;
  gap: 10px;
}
</style> 