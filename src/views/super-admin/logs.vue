<template>
  <div class="super-admin-logs-container" v-loading="initialLoading" element-loading-text="加载日志数据中...">
    <el-card class="page-header">
      <div class="header-content">
        <div class="header-text">
          <h2 class="page-title">
            <el-icon class="title-icon"><Document /></el-icon>
            操作日志
          </h2>
          <p class="page-description">查看系统操作日志和审计记录</p>
        </div>
        <div class="header-actions">
          <el-button :icon="Refresh" circle @click="loadLogs" :loading="loading" />
        </div>
      </div>
    </el-card>

    <el-card class="content-card" shadow="hover">
      <div class="filter-bar">
        <el-form :inline="true" :model="searchForm" class="filter-form">
          <el-form-item label="日志级别">
            <el-select 
              v-model="searchForm.level" 
              placeholder="请选择" 
              clearable
              style="width: 150px"
            >
              <el-option label="全部" value="" />
              <el-option label="INFO" value="INFO" />
              <el-option label="WARN" value="WARN" />
              <el-option label="ERROR" value="ERROR" />
              <el-option label="DEBUG" value="DEBUG" />
            </el-select>
          </el-form-item>
          <el-form-item label="操作用户">
            <el-input 
              v-model="searchForm.user" 
              placeholder="请输入用户名" 
              clearable
              style="width: 180px"
            />
          </el-form-item>
          <el-form-item label="时间范围">
            <el-date-picker
              v-model="searchForm.dateRange"
              type="datetimerange"
              range-separator="至"
              start-placeholder="开始日期"
              end-placeholder="结束日期"
              format="YYYY-MM-DD HH:mm:ss"
              value-format="YYYY-MM-DD HH:mm:ss"
              style="width: 380px"
            />
          </el-form-item>
          <el-form-item>
            <el-button type="primary" :icon="Search" @click="searchLogs" :loading="loading">
              查询
            </el-button>
            <el-button :icon="Refresh" @click="resetSearch">
              重置
            </el-button>
            <el-button type="success" :icon="Download" @click="exportLogs" :loading="exporting">
              导出
            </el-button>
            <el-button type="danger" :icon="Delete" @click="clearAllLogs" :disabled="logList.length === 0">
              清空
            </el-button>
          </el-form-item>
        </el-form>
      </div>

      <el-table 
        :data="logList" 
        style="width: 100%" 
        v-loading="loading"
        :empty-text="'暂无日志数据'"
        stripe
        @selection-change="handleSelectionChange"
      >
        <el-table-column type="selection" width="55" align="center" />
        <el-table-column prop="time" label="时间" width="180" sortable />
        <el-table-column prop="level" label="级别" width="100" align="center">
          <template #default="scope">
            <el-tag :type="getLevelColor(scope.row.level)" effect="dark" size="small">
              <el-icon class="level-icon">
                <component :is="getLevelIcon(scope.row.level)" />
              </el-icon>
              {{ scope.row.level }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="user" label="操作用户" width="120" />
        <el-table-column prop="action" label="操作" min-width="180" show-overflow-tooltip />
        <el-table-column prop="resource" label="资源" min-width="150" show-overflow-tooltip />
        <el-table-column prop="ip" label="IP地址" width="130" />
        <el-table-column prop="userAgent" label="用户代理" min-width="200" show-overflow-tooltip />
        <el-table-column prop="result" label="结果" width="100" align="center">
          <template #default="scope">
            <el-tag :type="scope.row.result === '成功' ? 'success' : 'danger'" effect="dark" size="small">
              {{ scope.row.result }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="120" align="center" fixed="right">
          <template #default="scope">
            <el-button 
              size="small" 
              type="primary" 
              :icon="View" 
              link
              @click="viewDetails(scope.row)"
            >
              详情
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <div class="table-footer">
        <div class="batch-actions" v-if="selectedLogs.length > 0">
          <el-button 
            size="small" 
            type="danger" 
            :icon="Delete" 
            @click="batchDeleteLogs"
            :loading="deleting"
          >
            批量删除 ({{ selectedLogs.length }})
          </el-button>
        </div>
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
      </div>
    </el-card>

    <!-- 详情对话框 -->
    <el-dialog 
      v-model="detailVisible" 
      title="日志详情" 
      width="70%"
      :close-on-click-modal="false"
    >
      <el-descriptions :column="2" border v-if="currentLog" class="log-descriptions">
        <el-descriptions-item label="时间" :span="2">
          <el-icon class="desc-icon"><Clock /></el-icon>
          {{ currentLog.time }}
        </el-descriptions-item>
        <el-descriptions-item label="级别">
          <el-tag :type="getLevelColor(currentLog.level)" effect="dark">
            <el-icon class="level-icon">
              <component :is="getLevelIcon(currentLog.level)" />
            </el-icon>
            {{ currentLog.level }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="结果">
          <el-tag :type="currentLog.result === '成功' ? 'success' : 'danger'" effect="dark">
            {{ currentLog.result }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="操作用户">
          <el-icon class="desc-icon"><User /></el-icon>
          {{ currentLog.user }}
        </el-descriptions-item>
        <el-descriptions-item label="IP地址">
          <el-icon class="desc-icon"><Connection /></el-icon>
          {{ currentLog.ip }}
        </el-descriptions-item>
        <el-descriptions-item label="操作" :span="2">
          <el-icon class="desc-icon"><Operation /></el-icon>
          {{ currentLog.action }}
        </el-descriptions-item>
        <el-descriptions-item label="资源" :span="2">
          <el-icon class="desc-icon"><Link /></el-icon>
          {{ currentLog.resource }}
        </el-descriptions-item>
        <el-descriptions-item label="耗时">
          <el-icon class="desc-icon"><Timer /></el-icon>
          {{ currentLog.duration || 0 }}ms
        </el-descriptions-item>
        <el-descriptions-item label="用户代理" :span="2">
          <el-icon class="desc-icon"><Monitor /></el-icon>
          {{ currentLog.userAgent }}
        </el-descriptions-item>
        <el-descriptions-item label="详细信息" :span="2">
          <pre class="log-detail">{{ currentLog.details || '无详细信息' }}</pre>
        </el-descriptions-item>
      </el-descriptions>
      <template #footer>
        <el-button @click="detailVisible = false">关闭</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, type Component } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { 
  Document, Refresh, Search, Download, Delete, View,
  Clock, User, Connection, Operation, Link, Timer, Monitor,
  InfoFilled, WarningFilled, CircleCloseFilled, QuestionFilled
} from '@element-plus/icons-vue';
import { useSuperAdminAccess } from '@/composables';
import { getLogList, exportLogs as exportLogsAPI, clearLogs, batchDeleteLogs as batchDeleteLogsAPI } from '@/api/system/log';
import type { Log } from '@/types';

// 使用权限检查 composable
const { checkAccess, executeWithPermission } = useSuperAdminAccess();

// 日志项类型定义
interface LogItem {
  id: number;
  time: string;
  level: string;
  user: string;
  action: string;
  resource: string;
  ip: string;
  userAgent: string;
  result: string;
  duration?: number;
  details?: string;
}

interface SearchForm {
  level: string;
  user: string;
  dateRange: [string, string] | null;
}

const initialLoading = ref(false);
const loading = ref(false);
const exporting = ref(false);
const deleting = ref(false);
const detailVisible = ref(false);
const currentLog = ref<LogItem | null>(null);
const selectedLogs = ref<LogItem[]>([]);

const searchForm = ref<SearchForm>({
  level: '',
  user: '',
  dateRange: null
});

const pagination = ref({
  current: 1,
  size: 20,
  total: 0
});

const logList = ref<LogItem[]>([
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

// 获取日志级别颜色
const getLevelColor = (level: string): 'primary' | 'warning' | 'danger' | 'info' => {
  switch (level) {
    case 'INFO': return 'primary';
    case 'WARN': return 'warning';
    case 'ERROR': return 'danger';
    case 'DEBUG': return 'info';
    default: return 'info';
  }
};

// 获取日志级别图标
const getLevelIcon = (level: string): Component => {
  switch (level) {
    case 'INFO': return InfoFilled;
    case 'WARN': return WarningFilled;
    case 'ERROR': return CircleCloseFilled;
    case 'DEBUG': return QuestionFilled;
    default: return InfoFilled;
  }
};

// 加载日志列表
const loadLogs = async () => {
  await executeWithPermission(async () => {
    loading.value = true;
    try {
      // 这里可以调用实际的API
      // const response = await getLogList({
      //   page: pagination.value.current,
      //   pageSize: pagination.value.size,
      //   operator: searchForm.value.user || undefined,
      //   type: searchForm.value.level || undefined,
      //   dateRange: searchForm.value.dateRange || undefined
      // });
      // logList.value = response.data.list;
      // pagination.value.total = response.data.total;
      
      // 模拟API调用
      await new Promise(resolve => setTimeout(resolve, 500));
      pagination.value.total = logList.value.length;
      ElMessage.success('日志加载成功');
    } finally {
      loading.value = false;
    }
  }, '加载日志失败');
};

// 查询日志
const searchLogs = async () => {
  pagination.value.current = 1;
  await loadLogs();
};

// 重置搜索
const resetSearch = () => {
  searchForm.value = {
    level: '',
    user: '',
    dateRange: null
  };
  pagination.value.current = 1;
  loadLogs();
  ElMessage.info('搜索条件已重置');
};

// 导出日志
const exportLogs = async () => {
  await executeWithPermission(async () => {
    exporting.value = true;
    try {
      // 这里可以调用实际的API
      // const response = await exportLogsAPI({
      //   operator: searchForm.value.user || undefined,
      //   type: searchForm.value.level || undefined,
      //   dateRange: searchForm.value.dateRange || undefined
      // });
      // 
      // // 创建下载链接
      // const blob = new Blob([response.data], { type: 'application/vnd.ms-excel' });
      // const url = URL.createObjectURL(blob);
      // const link = document.createElement('a');
      // link.href = url;
      // link.download = `logs-${new Date().toISOString().split('T')[0]}.xlsx`;
      // document.body.appendChild(link);
      // link.click();
      // document.body.removeChild(link);
      // URL.revokeObjectURL(url);
      
      // 模拟导出
      await new Promise(resolve => setTimeout(resolve, 1000));
      ElMessage.success('日志导出成功');
    } finally {
      exporting.value = false;
    }
  }, '导出日志失败');
};

// 清空所有日志
const clearAllLogs = async () => {
  await executeWithPermission(async () => {
    try {
      await ElMessageBox.confirm(
        '确定要清空所有日志吗？此操作不可恢复！',
        '确认清空日志',
        {
          confirmButtonText: '确定清空',
          cancelButtonText: '取消',
          type: 'error'
        }
      );

      // 这里可以调用实际的API
      // await clearLogs();
      
      // 模拟清空
      await new Promise(resolve => setTimeout(resolve, 500));
      logList.value = [];
      pagination.value.total = 0;
      selectedLogs.value = [];
      ElMessage.success('日志已清空');
    } catch {
      // 用户取消
    }
  }, '清空日志失败');
};

// 查看详情
const viewDetails = (log: LogItem) => {
  currentLog.value = log;
  detailVisible.value = true;
};

// 选择变化
const handleSelectionChange = (selection: LogItem[]) => {
  selectedLogs.value = selection;
};

// 批量删除
const batchDeleteLogs = async () => {
  await executeWithPermission(async () => {
    try {
      await ElMessageBox.confirm(
        `确定要删除选中的 ${selectedLogs.value.length} 条日志吗？此操作不可恢复！`,
        '确认删除日志',
        {
          confirmButtonText: '确定删除',
          cancelButtonText: '取消',
          type: 'warning'
        }
      );

      deleting.value = true;
      try {
        // 这里可以调用实际的API
        // const ids = selectedLogs.value.map(log => log.id);
        // await batchDeleteLogsAPI(ids);
        
        // 模拟删除
        await new Promise(resolve => setTimeout(resolve, 500));
        const ids = selectedLogs.value.map(log => log.id);
        logList.value = logList.value.filter(log => !ids.includes(log.id));
        pagination.value.total = logList.value.length;
        selectedLogs.value = [];
        ElMessage.success('日志删除成功');
      } finally {
        deleting.value = false;
      }
    } catch {
      // 用户取消
    }
  }, '删除日志失败');
};

// 分页大小变化
const handleSizeChange = (size: number) => {
  pagination.value.size = size;
  pagination.value.current = 1;
  loadLogs();
};

// 当前页变化
const handleCurrentChange = (current: number) => {
  pagination.value.current = current;
  loadLogs();
};

onMounted(() => {
  // 权限检查
  if (!checkAccess()) {
    return;
  }
  
  // 加载初始数据
  initialLoading.value = true;
  loadLogs().finally(() => {
    initialLoading.value = false;
  });
});
</script>

<style scoped lang="scss">
@import '@/styles/variables.scss';

.super-admin-logs-container {
  padding: $spacing-xl;
  background-color: $bg-color-base;
  min-height: calc(100vh - 60px);

  .page-header {
    margin-bottom: $spacing-xl;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    border: none;
    box-shadow: $shadow-md;

    .header-content {
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      gap: $spacing-md;

      .header-text {
        flex: 1;
        min-width: 200px;

        .page-title {
          margin: 0 0 $spacing-sm 0;
          font-size: 24px;
          font-weight: 600;
          display: flex;
          align-items: center;
          gap: $spacing-sm;

          .title-icon {
            font-size: 28px;
          }
        }

        .page-description {
          margin: 0;
          opacity: 0.9;
          font-size: 14px;
        }
      }

      .header-actions {
        display: flex;
        gap: $spacing-sm;
      }
    }
  }

  .content-card {
    transition: $transition-base;

    &:hover {
      box-shadow: $shadow-lg;
    }

    .filter-bar {
      margin-bottom: $spacing-xl;
      padding: $spacing-xl;
      background-color: $bg-color-light;
      border-radius: $border-radius-md;
      border: 1px solid $border-color-light;

      .filter-form {
        :deep(.el-form-item) {
          margin-bottom: $spacing-md;
        }

        :deep(.el-button) {
          margin-left: $spacing-xs;
        }
      }
    }

    .table-footer {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-top: $spacing-xl;
      padding-top: $spacing-xl;
      border-top: 1px solid $border-color-light;
      flex-wrap: wrap;
      gap: $spacing-md;

      .batch-actions {
        display: flex;
        align-items: center;
        gap: $spacing-sm;
      }

      .pagination {
        flex: 1;
        display: flex;
        justify-content: flex-end;
      }
    }

    // 表格样式优化
    :deep(.el-table) {
      .level-icon {
        margin-right: $spacing-xs;
        font-size: 14px;
      }

      .el-table__row {
        transition: $transition-fast;

        &:hover {
          background-color: $bg-color-base;
        }
      }
    }
  }

  // 详情对话框样式
  :deep(.el-dialog) {
    .log-descriptions {
      .desc-icon {
        margin-right: $spacing-xs;
        color: $text-color-secondary;
        vertical-align: middle;
      }

      .level-icon {
        margin-right: $spacing-xs;
        vertical-align: middle;
      }
    }

    .log-detail {
      background-color: $bg-color-light;
      padding: $spacing-md;
      border-radius: $border-radius-md;
      font-family: 'Courier New', 'Consolas', monospace;
      font-size: 13px;
      line-height: 1.6;
      max-height: 300px;
      overflow-y: auto;
      border: 1px solid $border-color-light;
      margin: 0;
      white-space: pre-wrap;
      word-break: break-word;

      &::-webkit-scrollbar {
        width: 6px;
      }

      &::-webkit-scrollbar-track {
        background: $bg-color-base;
        border-radius: $border-radius-sm;
      }

      &::-webkit-scrollbar-thumb {
        background: $border-color-base;
        border-radius: $border-radius-sm;

        &:hover {
          background: $text-color-secondary;
        }
      }
    }
  }
}

// 响应式设计
@media (max-width: 768px) {
  .super-admin-logs-container {
    padding: $spacing-md;

    .content-card {
      .filter-bar {
        padding: $spacing-md;

        .filter-form {
          :deep(.el-form-item) {
            width: 100%;
            margin-bottom: $spacing-sm;
          }

          :deep(.el-form-item__label) {
            width: auto !important;
          }

          :deep(.el-form-item__content) {
            width: 100%;
            margin-left: 0 !important;
          }

          :deep(.el-select),
          :deep(.el-input),
          :deep(.el-date-picker) {
            width: 100% !important;
          }
        }
      }

      .table-footer {
        flex-direction: column;
        align-items: stretch;

        .batch-actions {
          width: 100%;
          justify-content: center;
          margin-bottom: $spacing-md;
        }

        .pagination {
          justify-content: center;
        }
      }
    }
  }
}
</style> 