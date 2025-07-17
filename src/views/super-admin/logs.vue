<template>
  <div class="super-admin-logs-container">
    <el-card class="page-header">
      <h2 class="page-title">操作日志</h2>
      <p class="page-description">查看系统操作日志和审计记录</p>
    </el-card>

    <el-card>
      <div class="filter-bar">
        <el-form :inline="true" :model="searchForm">
          <el-form-item label="日志级别">
            <el-select v-model="searchForm.level" placeholder="请选择" clearable>
              <el-option label="全部" value="" />
              <el-option label="INFO" value="INFO" />
              <el-option label="WARN" value="WARN" />
              <el-option label="ERROR" value="ERROR" />
              <el-option label="DEBUG" value="DEBUG" />
            </el-select>
          </el-form-item>
          <el-form-item label="操作用户">
            <el-input v-model="searchForm.user" placeholder="请输入用户名" clearable />
          </el-form-item>
          <el-form-item label="时间范围">
            <el-date-picker
              v-model="searchForm.dateRange"
              type="datetimerange"
              range-separator="至"
              start-placeholder="开始日期"
              end-placeholder="结束日期"
            />
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="searchLogs">
              <el-icon><Search /></el-icon>
              查询
            </el-button>
            <el-button @click="resetSearch">
              <el-icon><Refresh /></el-icon>
              重置
            </el-button>
            <el-button type="success" @click="exportLogs">
              <el-icon><Download /></el-icon>
              导出
            </el-button>
          </el-form-item>
        </el-form>
      </div>

      <el-table :data="logList" style="width: 100%" v-loading="loading">
        <el-table-column prop="time" label="时间" width="180" />
        <el-table-column prop="level" label="级别" width="80">
          <template #default="scope">
            <el-tag :type="getLevelColor(scope.row.level) as any">
              {{ scope.row.level }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="user" label="操作用户" width="120" />
        <el-table-column prop="action" label="操作" width="200" />
        <el-table-column prop="resource" label="资源" width="150" />
        <el-table-column prop="ip" label="IP地址" width="120" />
        <el-table-column prop="userAgent" label="用户代理" show-overflow-tooltip />
        <el-table-column prop="result" label="结果" width="80">
          <template #default="scope">
            <el-tag :type="scope.row.result === '成功' ? 'success' : 'danger'">
              {{ scope.row.result }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="120">
          <template #default="scope">
            <el-button size="small" @click="viewDetails(scope.row)">
              <el-icon><View /></el-icon>
              详情
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <el-pagination
        v-model:current-page="pagination.current"
        v-model:page-size="pagination.size"
        :page-sizes="[10, 20, 50, 100]"
        :total="pagination.total"
        layout="total, sizes, prev, pager, next, jumper"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        class="pagination"
      />
    </el-card>

    <!-- 详情对话框 -->
    <el-dialog v-model="detailVisible" title="日志详情" width="60%">
      <el-descriptions :column="2" border v-if="currentLog">
        <el-descriptions-item label="时间">{{ currentLog.time }}</el-descriptions-item>
        <el-descriptions-item label="级别">
          <el-tag :type="getLevelColor(currentLog.level) as any">{{ currentLog.level }}</el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="用户">{{ currentLog.user }}</el-descriptions-item>
        <el-descriptions-item label="IP地址">{{ currentLog.ip }}</el-descriptions-item>
        <el-descriptions-item label="操作">{{ currentLog.action }}</el-descriptions-item>
        <el-descriptions-item label="资源">{{ currentLog.resource }}</el-descriptions-item>
        <el-descriptions-item label="结果">
          <el-tag :type="currentLog.result === '成功' ? 'success' : 'danger'">
            {{ currentLog.result }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="耗时">{{ currentLog.duration }}ms</el-descriptions-item>
        <el-descriptions-item label="用户代理" :span="2">{{ currentLog.userAgent }}</el-descriptions-item>
        <el-descriptions-item label="详细信息" :span="2">
          <pre class="log-detail">{{ currentLog.details }}</pre>
        </el-descriptions-item>
      </el-descriptions>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { ElMessage } from 'element-plus';
import { Search, Refresh, Download, View } from '@element-plus/icons-vue';
import { useUserStore } from '@/stores/user';
import { useRouter } from 'vue-router';

const userStore = useUserStore();
const router = useRouter();

// 权限检查函数
const checkAccess = () => {
  if (!userStore.hasRole('super_admin')) {
    ElMessage.error('您没有权限访问此页面');
    router.push('/dashboard');
    return false;
  }
  return true;
};

const loading = ref(false);
const detailVisible = ref(false);
const currentLog = ref(null);

const searchForm = ref({
  level: '',
  user: '',
  dateRange: []
});

const pagination = ref({
  current: 1,
  size: 20,
  total: 0
});

const logList = ref([
  {
    id: 1,
    time: '2024-03-20 14:30:25',
    level: 'INFO',
    user: 'admin',
    action: '用户登录',
    resource: '/auth/login',
    ip: '192.168.1.100',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    result: '成功',
    duration: 152,
    details: '用户admin登录成功，IP地址：192.168.1.100'
  },
  {
    id: 2,
    time: '2024-03-20 14:29:15',
    level: 'WARN',
    user: 'user1',
    action: '登录失败',
    resource: '/auth/login',
    ip: '192.168.1.101',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    result: '失败',
    duration: 89,
    details: '用户user1登录失败，原因：密码错误，连续失败次数：3'
  },
  {
    id: 3,
    time: '2024-03-20 14:28:45',
    level: 'INFO',
    user: 'admin',
    action: '系统备份',
    resource: '/admin/backup',
    ip: '192.168.1.100',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    result: '成功',
    duration: 30000,
    details: '系统完整备份完成，备份文件：backup_2024-03-20.tar.gz，大小：2.5GB'
  }
]);

const getLevelColor = (level: string) => {
  switch (level) {
    case 'INFO': return 'primary';
    case 'WARN': return 'warning';
    case 'ERROR': return 'danger';
    case 'DEBUG': return 'info';
    default: return '';
  }
};

const searchLogs = () => {
  loading.value = true;
  setTimeout(() => {
    loading.value = false;
    ElMessage.success('查询完成');
  }, 1000);
};

const resetSearch = () => {
  searchForm.value = {
    level: '',
    user: '',
    dateRange: []
  };
  ElMessage.info('搜索条件已重置');
};

const exportLogs = () => {
  ElMessage.success('日志导出成功');
};

const viewDetails = (log: any) => {
  currentLog.value = log;
  detailVisible.value = true;
};

const handleSizeChange = (size: number) => {
  pagination.value.size = size;
  searchLogs();
};

const handleCurrentChange = (current: number) => {
  pagination.value.current = current;
  searchLogs();
};

onMounted(() => {
  // 权限检查
  if (!checkAccess()) {
    return;
  }
  
  pagination.value.total = logList.value.length;
});
</script>

<style scoped lang="scss">
.super-admin-logs-container {
  padding: 20px;

  .page-header {
    margin-bottom: 20px;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    border: none;

    .page-title {
      margin: 0 0 10px 0;
      font-size: 24px;
      font-weight: 600;
    }

    .page-description {
      margin: 0;
      opacity: 0.9;
    }
  }

  .filter-bar {
    margin-bottom: 20px;
    padding: 20px;
    background-color: #f8f9fa;
    border-radius: 4px;
  }

  .pagination {
    margin-top: 20px;
    text-align: right;
  }

  .log-detail {
    background-color: #f5f5f5;
    padding: 10px;
    border-radius: 4px;
    font-family: 'Courier New', monospace;
    font-size: 12px;
    line-height: 1.4;
    max-height: 200px;
    overflow-y: auto;
  }
}
</style> 