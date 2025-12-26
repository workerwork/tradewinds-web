<template>
  <div class="customer-info">
    <el-card class="box-card">
      <template #header>
        <div class="card-header">
          <span>客户详情</span>
          <div class="header-actions">
            <el-button @click="handleBack">返回</el-button>
            <el-button type="primary" @click="handleEdit">编辑</el-button>
          </div>
        </div>
      </template>

      <el-descriptions v-loading="loading" :column="2" border>
        <el-descriptions-item label="客户名称">{{ customerInfo.name }}</el-descriptions-item>
        <el-descriptions-item label="联系电话">{{ customerInfo.phone }}</el-descriptions-item>
        <el-descriptions-item label="联系人">{{ customerInfo.contact }}</el-descriptions-item>
        <el-descriptions-item label="电子邮箱">{{ customerInfo.email }}</el-descriptions-item>
        <el-descriptions-item label="所在地区">{{ customerInfo.region }}</el-descriptions-item>
        <el-descriptions-item label="详细地址">{{ customerInfo.address }}</el-descriptions-item>
        <el-descriptions-item label="客户类型">{{ customerInfo.type }}</el-descriptions-item>
        <el-descriptions-item label="状态">
          <el-tag :type="customerInfo.status === 1 ? 'success' : 'danger'">
            {{ customerInfo.status === 1 ? '启用' : '禁用' }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="创建时间">{{ customerInfo.createTime }}</el-descriptions-item>
        <el-descriptions-item label="最后更新">{{ customerInfo.updateTime }}</el-descriptions-item>
        <el-descriptions-item label="备注" :span="2">{{
          customerInfo.remark
        }}</el-descriptions-item>
      </el-descriptions>
    </el-card>

    <el-card class="box-card contact-history">
      <template #header>
        <div class="card-header">
          <span>联系记录</span>
          <el-button type="primary" @click="handleAddRecord">添加记录</el-button>
        </div>
      </template>

      <el-timeline v-loading="recordsLoading">
        <el-timeline-item
          v-for="activity in activities"
          :key="activity.id"
          :timestamp="activity.timestamp"
          :type="activity.type"
        >
          {{ activity.content }}
        </el-timeline-item>
      </el-timeline>
    </el-card>

    <!-- 添加联系记录对话框 -->
    <el-dialog v-model="dialogVisible" title="添加联系记录" width="500px" append-to-body>
      <el-form ref="formRef" :model="recordForm" :rules="recordRules" label-width="80px">
        <el-form-item label="内容" prop="content">
          <el-input
            v-model="recordForm.content"
            type="textarea"
            rows="4"
            placeholder="请输入联系记录内容"
          />
        </el-form-item>
        <el-form-item label="类型" prop="type">
          <el-select v-model="recordForm.type" placeholder="请选择类型">
            <el-option label="一般联系" value="info" />
            <el-option label="重要进展" value="primary" />
            <el-option label="成功交易" value="success" />
            <el-option label="问题处理" value="warning" />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmitRecord">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useCustomerStore } from '@/stores';
import { contactRecordApi } from '@/api';
import type { FormInstance } from 'element-plus';
import type { ContactRecord } from '@/types';

const route = useRoute();
const router = useRouter();
const customerStore = useCustomerStore();
const formRef = ref<FormInstance>();

const loading = ref(false);
const recordsLoading = ref(false);
const dialogVisible = ref(false);

// 客户信息
const customerInfo = reactive({
  id: '',
  name: '',
  contact: '',
  phone: '',
  email: '',
  region: '',
  address: '',
  type: '',
  status: 1,
  createTime: '',
  updateTime: '',
  remark: '',
});

// 联系记录
const activities = ref<ContactRecord[]>([]);

// 联系记录表单
const recordForm = reactive({
  content: '',
  type: 'info' as ContactRecord['type'],
});

// 表单校验规则
const recordRules = {
  content: [{ required: true, message: '请输入联系记录内容', trigger: 'blur' }],
  type: [{ required: true, message: '请选择类型', trigger: 'change' }],
};

// 获取客户信息
const getCustomerInfo = async () => {
  loading.value = true;
  try {
    const data = await customerStore.getCustomerDetail(Number(route.params.id));
    Object.assign(customerInfo, data);
  } catch (error) {
    ElMessage.error('获取客户信息失败');
  } finally {
    loading.value = false;
  }
};

// 获取联系记录
const getContactRecords = async () => {
  recordsLoading.value = true;
  try {
    const data = await contactRecordApi.getContactRecords(Number(route.params.id));
    activities.value = data;
  } catch (error) {
    ElMessage.error('获取联系记录失败');
  } finally {
    recordsLoading.value = false;
  }
};

// 返回列表页
const handleBack = () => {
  router.push('/customer/list');
};

// 处理编辑按钮点击
const handleEdit = () => {
  router.push(`/customer/edit/${route.params.id}`);
};

// 处理添加记录按钮点击
const handleAddRecord = () => {
  dialogVisible.value = true;
  recordForm.content = '';
  recordForm.type = 'info';
};

// 提交联系记录
const handleSubmitRecord = async () => {
  if (!formRef.value) return;

  await formRef.value.validate();

  try {
    await contactRecordApi.addContactRecord({
      customerId: Number(route.params.id),
      ...recordForm,
    });
    dialogVisible.value = false;
    ElMessage.success('添加联系记录成功');
    getContactRecords(); // 刷新联系记录列表
  } catch (error) {
    ElMessage.error('添加联系记录失败');
  }
};

onMounted(() => {
  getCustomerInfo();
  getContactRecords();
});
</script>

<style scoped lang="scss">
.customer-info {
  padding: 20px;

  .box-card {
    margin-bottom: 20px;
  }

  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;

    .header-actions {
      .el-button {
        margin-left: 10px;
      }
    }
  }

  .contact-history {
    margin-top: 20px;
  }

  :deep(.el-descriptions) {
    margin: 20px 0;
  }

  :deep(.el-timeline) {
    margin: 20px 0;
    padding: 0 20px;
  }
}
</style>
