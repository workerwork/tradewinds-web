<template>
  <div class="factory-info">
    <el-card class="box-card">
      <template #header>
        <div class="card-header">
          <span>工厂信息管理</span>
          <el-button type="primary" @click="handleAdd">新增工厂</el-button>
        </div>
      </template>

      <el-table v-loading="loading" :data="factoryList" style="width: 100%">
        <el-table-column prop="id" label="工厂ID" width="100" />
        <el-table-column prop="name" label="工厂名称" />
        <el-table-column prop="contact" label="联系人" />
        <el-table-column prop="phone" label="联系电话" />
        <el-table-column prop="email" label="电子邮箱" />
        <el-table-column prop="address" label="地址" show-overflow-tooltip />
        <el-table-column prop="mainProducts" label="主营产品" show-overflow-tooltip />
        <el-table-column prop="status" label="状态">
          <template #default="{ row }">
            <el-tag :type="row.status === 'active' ? 'success' : 'info'">
              {{ row.status === 'active' ? '合作中' : '已终止' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="250">
          <template #default="{ row }">
            <el-button size="small" @click="handleEdit(row)">编辑</el-button>
            <el-button size="small" type="success" @click="viewProducts(row)">查看产品</el-button>
            <el-button size="small" type="danger" @click="handleDelete(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <div class="pagination-container">
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :page-sizes="[10, 20, 50, 100]"
          :total="total"
          layout="total, sizes, prev, pager, next"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </el-card>

    <el-dialog
      v-model="dialogVisible"
      :title="dialogType === 'add' ? '新增工厂' : '编辑工厂'"
      width="600px"
    >
      <el-form :model="form" label-width="100px">
        <el-form-item label="工厂名称" required>
          <el-input v-model="form.name" />
        </el-form-item>
        <el-form-item label="联系人">
          <el-input v-model="form.contact" />
        </el-form-item>
        <el-form-item label="联系电话">
          <el-input v-model="form.phone" />
        </el-form-item>
        <el-form-item label="电子邮箱">
          <el-input v-model="form.email" />
        </el-form-item>
        <el-form-item label="地址">
          <el-input v-model="form.address" type="textarea" />
        </el-form-item>
        <el-form-item label="主营产品">
          <el-select
            v-model="form.mainProducts"
            multiple
            filterable
            allow-create
            default-first-option
            placeholder="请选择或输入主营产品"
          >
            <el-option
              v-for="item in productOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="合作状态">
          <el-select v-model="form.status">
            <el-option label="合作中" value="active" />
            <el-option label="已终止" value="inactive" />
          </el-select>
        </el-form-item>
        <el-form-item label="备注">
          <el-input v-model="form.notes" type="textarea" :rows="3" />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="handleSubmit">确定</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { useRouter } from 'vue-router';

const router = useRouter();
const loading = ref(false);
const currentPage = ref(1);
const pageSize = ref(10);
const total = ref(0);
const dialogVisible = ref(false);
const dialogType = ref('add');

const productOptions = [
  { value: '电子产品', label: '电子产品' },
  { value: '服装', label: '服装' },
  { value: '家具', label: '家具' },
  { value: '玩具', label: '玩具' },
  { value: '五金', label: '五金' },
];

const factoryList = ref([
  {
    id: '1',
    name: '示例工厂A',
    contact: '张三',
    phone: '13800138000',
    email: 'factory@example.com',
    address: '广东省深圳市xxx工业园',
    mainProducts: ['电子产品', '玩具'],
    status: 'active',
    notes: '优质供应商',
  },
]);

const form = reactive({
  id: '',
  name: '',
  contact: '',
  phone: '',
  email: '',
  address: '',
  mainProducts: [],
  status: 'active',
  notes: '',
});

const resetForm = () => {
  form.id = '';
  form.name = '';
  form.contact = '';
  form.phone = '';
  form.email = '';
  form.address = '';
  form.mainProducts = [];
  form.status = 'active';
  form.notes = '';
};

const handleAdd = () => {
  dialogType.value = 'add';
  resetForm();
  dialogVisible.value = true;
};

const handleEdit = (row: any) => {
  dialogType.value = 'edit';
  Object.assign(form, row);
  dialogVisible.value = true;
};

const handleDelete = (row: any) => {
  ElMessageBox.confirm(`确认删除工厂 ${row.name} 吗？`, '警告', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning',
  }).then(() => {
    ElMessage({
      type: 'success',
      message: '删除成功',
    });
  });
};

const viewProducts = (row: any) => {
  router.push(`/product/info?factoryId=${row.id}`);
};

const handleSubmit = () => {
  ElMessage({
    type: 'success',
    message: dialogType.value === 'add' ? '添加成功' : '更新成功',
  });
  dialogVisible.value = false;
};

const handleSizeChange = (val: number) => {
  pageSize.value = val;
  // 重新加载数据
};

const handleCurrentChange = (val: number) => {
  currentPage.value = val;
  // 重新加载数据
};
</script>

<style scoped>
.factory-info {
  padding: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

:deep(.el-select) {
  width: 100%;
}
</style>
