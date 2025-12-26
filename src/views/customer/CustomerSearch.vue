<template>
  <div class="customer-search">
    <el-card class="search-card">
      <template #header>
        <div class="card-header">
          <span>客户信息搜索</span>
        </div>
      </template>

      <el-form :model="searchForm" label-width="100px" class="search-form">
        <el-row :gutter="20">
          <el-col :span="8">
            <el-form-item label="客户名称">
              <el-input v-model="searchForm.name" placeholder="请输入客户名称" clearable />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="联系人">
              <el-input v-model="searchForm.contact" placeholder="请输入联系人" clearable />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="联系电话">
              <el-input v-model="searchForm.phone" placeholder="请输入联系电话" clearable />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="8">
            <el-form-item label="客户状态">
              <el-select v-model="searchForm.status" placeholder="请选择状态" clearable>
                <el-option label="全部" value="" />
                <el-option label="活跃" value="active" />
                <el-option label="非活跃" value="inactive" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="创建时间">
              <el-date-picker
                v-model="searchForm.dateRange"
                type="daterange"
                range-separator="至"
                start-placeholder="开始日期"
                end-placeholder="结束日期"
                value-format="YYYY-MM-DD"
              />
            </el-form-item>
          </el-col>
        </el-row>

        <el-form-item>
          <el-button type="primary" @click="handleSearch">搜索</el-button>
          <el-button @click="resetSearch">重置</el-button>
          <el-button type="success" @click="handleExport">导出结果</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <el-card class="result-card">
      <template #header>
        <div class="card-header">
          <span>搜索结果 (共 {{ total }} 条)</span>
        </div>
      </template>

      <el-table v-loading="loading" :data="searchResults" style="width: 100%">
        <el-table-column type="selection" width="55" />
        <el-table-column prop="id" label="客户ID" width="100" />
        <el-table-column prop="name" label="客户名称" />
        <el-table-column prop="contact" label="联系人" />
        <el-table-column prop="phone" label="联系电话" />
        <el-table-column prop="email" label="电子邮箱" />
        <el-table-column prop="address" label="地址" show-overflow-tooltip />
        <el-table-column prop="status" label="状态">
          <template #default="{ row }">
            <el-tag :type="row.status === 'active' ? 'success' : 'info'">
              {{ row.status === 'active' ? '活跃' : '非活跃' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="创建时间" width="180" />
        <el-table-column label="操作" width="150" fixed="right">
          <template #default="{ row }">
            <el-button size="small" @click="viewDetail(row)">查看</el-button>
            <el-button size="small" type="primary" @click="handleEdit(row)">编辑</el-button>
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
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue';
import { ElMessage } from 'element-plus';
import { useRouter } from 'vue-router';

const router = useRouter();
const loading = ref(false);
const currentPage = ref(1);
const pageSize = ref(10);
const total = ref(100);

const searchForm = reactive({
  name: '',
  contact: '',
  phone: '',
  status: '',
  dateRange: [],
});

// 模拟搜索结果数据
const searchResults = ref([
  {
    id: '1',
    name: '示例客户A',
    contact: '张三',
    phone: '13800138000',
    email: 'example@example.com',
    address: '北京市朝阳区xxx街道xxx号',
    status: 'active',
    createTime: '2024-03-15 14:30:00',
  },
  {
    id: '2',
    name: '示例客户B',
    contact: '李四',
    phone: '13900139000',
    email: 'example2@example.com',
    address: '上海市浦东新区xxx路xxx号',
    status: 'inactive',
    createTime: '2024-03-14 09:15:00',
  },
]);

const handleSearch = () => {
  loading.value = true;
  // 模拟搜索请求
  setTimeout(() => {
    loading.value = false;
    ElMessage({
      type: 'success',
      message: '搜索完成',
    });
  }, 1000);
};

const resetSearch = () => {
  searchForm.name = '';
  searchForm.contact = '';
  searchForm.phone = '';
  searchForm.status = '';
  searchForm.dateRange = [];
};

const handleExport = () => {
  ElMessage({
    type: 'success',
    message: '导出成功',
  });
};

const viewDetail = (row: any) => {
  router.push(`/customer/info?id=${row.id}`);
};

const handleEdit = (row: any) => {
  router.push(`/customer/info?id=${row.id}&edit=true`);
};

const handleSizeChange = (val: number) => {
  pageSize.value = val;
  handleSearch();
};

const handleCurrentChange = (val: number) => {
  currentPage.value = val;
  handleSearch();
};
</script>

<style scoped>
.customer-search {
  padding: 20px;
}

.search-card {
  margin-bottom: 20px;
}

.result-card {
  margin-top: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.search-form {
  padding: 20px 0;
}

.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}

:deep(.el-form-item) {
  margin-bottom: 18px;
}

:deep(.el-date-editor) {
  width: 100%;
}
</style>
