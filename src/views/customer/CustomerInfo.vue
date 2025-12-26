<template>
  <div class="customer-info">
    <el-card class="box-card">
      <template #header>
        <div class="card-header">
          <span>客户信息管理</span>
          <el-button type="primary" @click="handleAdd">新增客户</el-button>
        </div>
      </template>

      <el-table v-loading="loading" :data="customerList" style="width: 100%" row-key="id">
        <el-table-column type="expand">
          <template #default="props">
            <el-form label-position="left" inline class="customer-detail">
              <el-row :gutter="20">
                <el-col :span="8">
                  <el-form-item label="公司简介">
                    <span>{{ props.row.companyProfile }}</span>
                  </el-form-item>
                </el-col>
                <el-col :span="8">
                  <el-form-item label="主营业务">
                    <span>{{ props.row.mainBusiness }}</span>
                  </el-form-item>
                </el-col>
                <el-col :span="8">
                  <el-form-item label="年营业额">
                    <span>{{ props.row.annualRevenue }}</span>
                  </el-form-item>
                </el-col>
              </el-row>
              <el-row :gutter="20">
                <el-col :span="8">
                  <el-form-item label="合作历史">
                    <span>{{ props.row.cooperationHistory }}</span>
                  </el-form-item>
                </el-col>
                <el-col :span="8">
                  <el-form-item label="信用评级">
                    <el-rate
                      v-model="props.row.creditRating"
                      disabled
                      show-score
                      text-color="#ff9900"
                    />
                  </el-form-item>
                </el-col>
                <el-col :span="8">
                  <el-form-item label="最近联系">
                    <span>{{ props.row.lastContact }}</span>
                  </el-form-item>
                </el-col>
              </el-row>
            </el-form>
          </template>
        </el-table-column>
        <el-table-column prop="id" label="客户ID" width="100" />
        <el-table-column prop="name" label="客户名称" />
        <el-table-column prop="type" label="客户类型" width="120">
          <template #default="{ row }">
            <el-tag :type="getCustomerTypeTag(row.type)">{{ row.type }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="contact" label="联系人" />
        <el-table-column prop="phone" label="联系电话" />
        <el-table-column prop="email" label="电子邮箱" />
        <el-table-column prop="address" label="地址" show-overflow-tooltip />
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="row.status === 'active' ? 'success' : 'info'">
              {{ row.status === 'active' ? '活跃' : '非活跃' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button size="small" @click="handleEdit(row)">编辑</el-button>
            <el-button size="small" type="success" @click="handleTrack(row)">跟踪</el-button>
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
      :title="dialogType === 'add' ? '新增客户' : '编辑客户'"
      width="800px"
    >
      <el-form :model="form" label-width="100px">
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="客户名称" required>
              <el-input v-model="form.name" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="客户类型" required>
              <el-select v-model="form.type">
                <el-option label="直接客户" value="direct" />
                <el-option label="代理商" value="agent" />
                <el-option label="经销商" value="distributor" />
                <el-option label="其他" value="other" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="联系人">
              <el-input v-model="form.contact" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="联系电话">
              <el-input v-model="form.phone" />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="电子邮箱">
              <el-input v-model="form.email" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="状态">
              <el-select v-model="form.status">
                <el-option label="活跃" value="active" />
                <el-option label="非活跃" value="inactive" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>

        <el-form-item label="地址">
          <el-input v-model="form.address" type="textarea" />
        </el-form-item>

        <el-form-item label="公司简介">
          <el-input
            v-model="form.companyProfile"
            type="textarea"
            :rows="3"
            placeholder="请输入公司简介"
          />
        </el-form-item>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="主营业务">
              <el-input
                v-model="form.mainBusiness"
                type="textarea"
                :rows="2"
                placeholder="请输入主营业务"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="年营业额">
              <el-input v-model="form.annualRevenue" placeholder="请输入年营业额" />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="合作历史">
              <el-input
                v-model="form.cooperationHistory"
                type="textarea"
                :rows="2"
                placeholder="请输入合作历史"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="信用评级">
              <el-rate v-model="form.creditRating" show-score text-color="#ff9900" />
            </el-form-item>
          </el-col>
        </el-row>

        <el-form-item label="备注">
          <el-input v-model="form.notes" type="textarea" :rows="3" placeholder="请输入备注信息" />
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

// 模拟客户数据
const customerList = ref([
  {
    id: '1',
    name: '示例客户A',
    type: 'direct',
    contact: '张三',
    phone: '13800138000',
    email: 'example@example.com',
    address: '北京市朝阳区xxx街道xxx号',
    status: 'active',
    companyProfile: '成立于2010年，是一家专业的进出口贸易公司...',
    mainBusiness: '电子产品贸易、服装贸易',
    annualRevenue: '1000万美元',
    cooperationHistory: '自2018年开始合作，主要采购电子产品',
    creditRating: 4.5,
    lastContact: '2024-03-15',
    notes: '重要客户，需重点关注',
  },
]);

const form = reactive({
  id: '',
  name: '',
  type: 'direct',
  contact: '',
  phone: '',
  email: '',
  address: '',
  status: 'active',
  companyProfile: '',
  mainBusiness: '',
  annualRevenue: '',
  cooperationHistory: '',
  creditRating: 3,
  notes: '',
});

const getCustomerTypeTag = (type: string) => {
  const typeMap: Record<string, string> = {
    direct: 'success',
    agent: 'warning',
    distributor: 'primary',
    other: 'info',
  };
  return typeMap[type] || 'info';
};

const resetForm = () => {
  form.id = '';
  form.name = '';
  form.type = 'direct';
  form.contact = '';
  form.phone = '';
  form.email = '';
  form.address = '';
  form.status = 'active';
  form.companyProfile = '';
  form.mainBusiness = '';
  form.annualRevenue = '';
  form.cooperationHistory = '';
  form.creditRating = 3;
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
  ElMessageBox.confirm(`确认删除客户 ${row.name} 吗？`, '警告', {
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

const handleTrack = (row: any) => {
  router.push(`/customer/track?customerId=${row.id}`);
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
.customer-info {
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

.customer-detail {
  padding: 20px;
}

:deep(.el-form--inline .el-form-item) {
  margin-right: 32px;
  margin-bottom: 16px;
}

:deep(.el-select) {
  width: 100%;
}

:deep(.el-tag) {
  min-width: 80px;
  text-align: center;
}
</style>
