<template>
  <div class="super-admin-backup-container" v-loading="loading" element-loading-text="加载备份数据中...">
    <el-card class="page-header">
      <div class="header-content">
        <div class="header-text">
          <h2 class="page-title">
            <el-icon class="title-icon"><FolderOpened /></el-icon>
            数据备份
          </h2>
          <p class="page-description">管理系统数据备份和恢复</p>
        </div>
        <div class="header-actions">
          <el-button :icon="Refresh" circle @click="refreshBackupList" :loading="refreshing" />
        </div>
      </div>
    </el-card>

    <el-row :gutter="20" class="backup-row">
      <el-col :xs="24" :sm="24" :md="8">
        <el-card class="backup-card" shadow="hover">
          <template #header>
            <div class="card-header">
              <span class="card-title">
                <el-icon><Download /></el-icon>
                快速备份
              </span>
            </div>
          </template>
          <div class="backup-actions">
            <el-button 
              type="primary" 
              size="large" 
              @click="handleFullBackup" 
              :loading="backupLoading.full"
              class="backup-btn"
            >
              <el-icon class="btn-icon"><Download /></el-icon>
              <div class="btn-content">
                <span class="btn-title">完整备份</span>
                <span class="btn-desc">备份所有数据</span>
              </div>
            </el-button>
            <el-button 
              type="success" 
              size="large" 
              @click="handleIncrementalBackup" 
              :loading="backupLoading.incremental"
              class="backup-btn"
            >
              <el-icon class="btn-icon"><FolderOpened /></el-icon>
              <div class="btn-content">
                <span class="btn-title">增量备份</span>
                <span class="btn-desc">仅备份变更数据</span>
              </div>
            </el-button>
            <el-button 
              type="warning" 
              size="large" 
              @click="handleDatabaseBackup" 
              :loading="backupLoading.database"
              class="backup-btn"
            >
              <el-icon class="btn-icon"><DataAnalysis /></el-icon>
              <div class="btn-content">
                <span class="btn-title">数据库备份</span>
                <span class="btn-desc">仅备份数据库</span>
              </div>
            </el-button>
          </div>
        </el-card>
      </el-col>

      <el-col :xs="24" :sm="24" :md="16">
        <el-card class="history-card" shadow="hover">
          <template #header>
            <div class="card-header">
              <span class="card-title">
                <el-icon><Clock /></el-icon>
                备份历史
              </span>
              <el-button size="small" :icon="Refresh" @click="refreshBackupList" :loading="refreshing">
                刷新
              </el-button>
            </div>
          </template>
          <el-table 
            :data="backupHistory" 
            style="width: 100%" 
            v-loading="tableLoading"
            :empty-text="'暂无备份记录'"
            stripe
          >
            <el-table-column prop="name" label="备份名称" min-width="180" show-overflow-tooltip />
            <el-table-column prop="type" label="类型" width="110" align="center">
              <template #default="scope">
                <el-tag :type="getBackupTypeColor(scope.row.type)" effect="dark" size="small">
                  {{ scope.row.type }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="size" label="大小" width="90" align="center" />
            <el-table-column prop="createTime" label="创建时间" width="160" />
            <el-table-column prop="status" label="状态" width="110" align="center">
              <template #default="scope">
                <el-tag :type="scope.row.status === '成功' ? 'success' : 'danger'" effect="dark" size="small" class="status-tag">
                  <el-icon class="status-icon">
                    <component :is="scope.row.status === '成功' ? 'CircleCheck' : 'CircleClose'" />
                  </el-icon>
                  <span class="status-text">{{ scope.row.status }}</span>
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column label="操作" width="220" align="center" fixed="right">
              <template #default="scope">
                <div class="action-buttons">
                  <el-button 
                    size="small" 
                    :icon="Download" 
                    @click="handleDownload(scope.row)"
                    :disabled="scope.row.status !== '成功'"
                  >
                    下载
                  </el-button>
                  <el-button 
                    size="small" 
                    type="warning" 
                    :icon="RefreshRight" 
                    @click="handleRestore(scope.row)"
                    :disabled="scope.row.status !== '成功'"
                  >
                    恢复
                  </el-button>
                  <el-button 
                    size="small" 
                    type="danger" 
                    :icon="Delete" 
                    @click="handleDelete(scope.row)"
                  >
                    删除
                  </el-button>
                </div>
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-col>
    </el-row>

    <el-card class="settings-card" shadow="hover">
      <template #header>
        <div class="card-header">
          <span class="card-title">
            <el-icon><Setting /></el-icon>
            自动备份设置
          </span>
        </div>
      </template>
      <el-form :model="backupSettings" label-width="120px" :loading="saving">
        <el-row :gutter="20" align="middle">
          <el-col :xs="24" :sm="6" :md="4">
            <el-form-item label="启用自动备份">
              <el-switch v-model="backupSettings.enabled" />
            </el-form-item>
          </el-col>
          <el-col :xs="24" :sm="6" :md="5">
            <el-form-item label="备份频率">
              <el-select 
                v-model="backupSettings.frequency" 
                placeholder="请选择" 
                style="width: 100%"
                popper-class="backup-frequency-select-popper"
              >
                <el-option label="每天" value="daily" />
                <el-option label="每周" value="weekly" />
                <el-option label="每月" value="monthly" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :xs="24" :sm="6" :md="5">
            <el-form-item label="备份时间">
              <el-time-picker 
                v-model="backupSettings.time" 
                format="HH:mm" 
                value-format="HH:mm"
                style="width: 100%"
              />
            </el-form-item>
          </el-col>
          <el-col :xs="24" :sm="6" :md="5">
            <el-form-item label="保留天数">
              <el-input-number 
                v-model="backupSettings.retentionDays" 
                :min="1" 
                :max="365" 
                style="width: 100%"
              />
            </el-form-item>
          </el-col>
          <el-col :xs="24" :sm="24" :md="5">
            <el-form-item>
              <el-button type="primary" :icon="Check" @click="saveBackupSettings" :loading="saving">
                保存设置
              </el-button>
              <el-button :icon="RefreshLeft" @click="resetSettings">重置</el-button>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { 
  Download, FolderOpened, Refresh, Clock, Setting, Check, 
  RefreshLeft, RefreshRight, Delete, CircleCheck, CircleClose, DataAnalysis
} from '@element-plus/icons-vue';
import { useSuperAdminAccess } from '@/composables';

// 类型定义
interface BackupItem {
  id: number;
  name: string;
  type: string;
  size: string;
  createTime: string;
  status: string;
}

interface BackupSettings {
  enabled: boolean;
  frequency: 'daily' | 'weekly' | 'monthly';
  time: string;
  retentionDays: number;
}

interface BackupLoading {
  full: boolean;
  incremental: boolean;
  database: boolean;
}

// 使用权限检查 composable
const { checkAccess, executeWithPermission } = useSuperAdminAccess();

const loading = ref(false);
const refreshing = ref(false);
const tableLoading = ref(false);
const saving = ref(false);

const backupLoading = ref<BackupLoading>({
  full: false,
  incremental: false,
  database: false
});

const backupHistory = ref<BackupItem[]>([
  {
    id: 1,
    name: 'full_backup_2024-03-20',
    type: '完整备份',
    size: '2.5GB',
    createTime: '2024-03-20 02:00:00',
    status: '成功'
  },
  {
    id: 2,
    name: 'incremental_backup_2024-03-19',
    type: '增量备份',
    size: '150MB',
    createTime: '2024-03-19 02:00:00',
    status: '成功'
  },
  {
    id: 3,
    name: 'database_backup_2024-03-18',
    type: '数据库备份',
    size: '800MB',
    createTime: '2024-03-18 02:00:00',
    status: '成功'
  }
]);

const defaultSettings: BackupSettings = {
  enabled: true,
  frequency: 'daily',
  time: '02:00',
  retentionDays: 30
};

const backupSettings = ref<BackupSettings>({ ...defaultSettings });

// 获取备份类型颜色
const getBackupTypeColor = (type: string): 'primary' | 'success' | 'warning' | 'info' | 'danger' => {
  switch (type) {
    case '完整备份': return 'primary';
    case '增量备份': return 'success';
    case '数据库备份': return 'warning';
    default: return 'info';
  }
};

// 完整备份
const handleFullBackup = async () => {
  await executeWithPermission(async () => {
    await ElMessageBox.confirm(
      '确定要开始完整备份吗？此操作可能需要较长时间，建议在业务低峰期执行。',
      '确认完整备份',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    );
    
    backupLoading.value.full = true;
    try {
      // 模拟备份过程
      await new Promise(resolve => setTimeout(resolve, 2000));
      ElMessage.success('完整备份已开始，请在备份历史中查看进度');
      await refreshBackupList();
    } finally {
      backupLoading.value.full = false;
    }
  }, '完整备份操作失败');
};

// 增量备份
const handleIncrementalBackup = async () => {
  await executeWithPermission(async () => {
    backupLoading.value.incremental = true;
    try {
      // 模拟备份过程
      await new Promise(resolve => setTimeout(resolve, 1000));
      ElMessage.success('增量备份完成');
      await refreshBackupList();
    } finally {
      backupLoading.value.incremental = false;
    }
  }, '增量备份操作失败');
};

// 数据库备份
const handleDatabaseBackup = async () => {
  await executeWithPermission(async () => {
    backupLoading.value.database = true;
    try {
      // 模拟备份过程
      await new Promise(resolve => setTimeout(resolve, 1500));
      ElMessage.success('数据库备份完成');
      await refreshBackupList();
    } finally {
      backupLoading.value.database = false;
    }
  }, '数据库备份操作失败');
};

// 刷新备份列表
const refreshBackupList = async () => {
  refreshing.value = true;
  tableLoading.value = true;
  try {
    // 模拟API调用
    await new Promise(resolve => setTimeout(resolve, 500));
    ElMessage.success('备份列表已刷新');
  } catch (error: unknown) {
    ElMessage.error((error as { message?: string })?.message || '刷新备份列表失败');
  } finally {
    refreshing.value = false;
    tableLoading.value = false;
  }
};

// 下载备份
const handleDownload = async (backup: BackupItem) => {
  await executeWithPermission(async () => {
    if (backup.status !== '成功') {
      ElMessage.warning('只能下载成功的备份文件');
      return;
    }
    ElMessage.success(`开始下载: ${backup.name}`);
    // 这里可以调用实际的下载API
  }, '下载备份失败');
};

// 恢复备份
const handleRestore = async (backup: BackupItem) => {
  await executeWithPermission(async () => {
    if (backup.status !== '成功') {
      ElMessage.warning('只能恢复成功的备份文件');
      return;
    }
    
    await ElMessageBox.confirm(
      `确定要恢复备份 "${backup.name}" 吗？此操作将覆盖当前数据，且不可恢复！`,
      '确认恢复备份',
      {
        confirmButtonText: '确定恢复',
        cancelButtonText: '取消',
        type: 'error',
        dangerouslyUseHTMLString: false
      }
    );
    
    ElMessage.success(`开始恢复: ${backup.name}`);
    // 这里可以调用实际的恢复API
  }, '恢复备份失败');
};

// 删除备份
const handleDelete = async (backup: BackupItem) => {
  await executeWithPermission(async () => {
    await ElMessageBox.confirm(
      `确定要删除备份 "${backup.name}" 吗？删除后无法恢复。`,
      '确认删除备份',
      {
        confirmButtonText: '确定删除',
        cancelButtonText: '取消',
        type: 'warning'
      }
    );
    
    // 模拟删除操作
    const index = backupHistory.value.findIndex(item => item.id === backup.id);
    if (index > -1) {
      backupHistory.value.splice(index, 1);
      ElMessage.success('备份已删除');
    }
  }, '删除备份失败');
};

// 保存备份设置
const saveBackupSettings = async () => {
  await executeWithPermission(async () => {
    saving.value = true;
    try {
      // 模拟保存操作
      await new Promise(resolve => setTimeout(resolve, 500));
      ElMessage.success('备份设置已保存');
    } finally {
      saving.value = false;
    }
  }, '保存备份设置失败');
};

// 重置设置
const resetSettings = () => {
  backupSettings.value = { ...defaultSettings };
  ElMessage.info('设置已重置为默认值');
};

onMounted(() => {
  // 权限检查
  if (!checkAccess()) {
    return;
  }
  
  // 加载初始数据
  loading.value = true;
  refreshBackupList().finally(() => {
    loading.value = false;
  });
});
</script>

<style scoped lang="scss">
@import '@/styles/variables.scss';

.super-admin-backup-container {
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

  .backup-row {
    margin-bottom: $spacing-xl;

    .backup-card,
    .history-card {
      height: 100%;
      transition: $transition-base;

      &:hover {
        box-shadow: $shadow-lg;
      }

      .card-header {
        display: flex;
        justify-content: space-between;
        align-items: center;

        .card-title {
          display: flex;
          align-items: center;
          gap: $spacing-sm;
          font-weight: 600;
          color: $text-color-primary;
        }
      }
    }

    .backup-actions {
      display: flex;
      flex-direction: column;
      gap: $spacing-md;

      .backup-btn {
        height: 80px !important;
        min-height: 80px !important;
        padding: $spacing-md $spacing-lg !important;
        margin: 0 !important;
        display: flex !important;
        align-items: center !important;
        justify-content: flex-start !important;
        gap: $spacing-md;
        transition: $transition-base;
        width: 100%;
        text-align: left;
        box-sizing: border-box;
        line-height: normal !important;
        border-radius: $border-radius-md !important;

        &:hover {
          transform: translateX(4px);
        }

        // 重置 Element Plus 按钮的默认样式
        :deep(.el-icon) {
          margin: 0 !important;
        }

        :deep(> span) {
          display: flex !important;
          align-items: center !important;
          justify-content: flex-start !important;
          width: 100% !important;
          height: 100% !important;
          margin: 0 !important;
          padding: 0 !important;
          gap: $spacing-md;
        }

        .btn-icon {
          font-size: 24px;
          flex-shrink: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          width: 32px;
          height: 32px;
          line-height: 1;
          margin: 0 !important;
          padding: 0 !important;
        }

        .btn-content {
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          justify-content: center;
          gap: $spacing-xs;
          flex: 1;
          min-width: 0;
          height: 100%;
          padding: 0 !important;
          margin: 0 !important;

          .btn-title {
            font-size: 16px;
            font-weight: 600;
            line-height: 1.4;
            white-space: nowrap;
            display: block;
            margin: 0;
            padding: 0;
          }

          .btn-desc {
            font-size: 12px;
            opacity: 0.8;
            line-height: 1.4;
            white-space: nowrap;
            display: block;
            margin: 0;
            padding: 0;
          }
        }
      }
    }

    .history-card {
      // 确保表格内容不被遮挡
      :deep(.el-table) {
        .el-table__body-wrapper {
          overflow-x: auto;
        }

        // 移除固定列和非固定列之间的分隔线 - 使用更全面的选择器
        :deep(.el-table__fixed-right) {
          &::before {
            display: none !important;
            visibility: hidden !important;
            opacity: 0 !important;
            background-color: transparent !important;
            width: 0 !important;
            height: 0 !important;
            content: none !important;
          }

          &::after {
            display: none !important;
            visibility: hidden !important;
            opacity: 0 !important;
            background-color: transparent !important;
            width: 0 !important;
            height: 0 !important;
            content: none !important;
          }

          border-left: none !important;
          box-shadow: none !important;
        }

        :deep(.el-table__fixed-right-patch) {
          display: none !important;
          visibility: hidden !important;
          opacity: 0 !important;
          background-color: transparent !important;
          width: 0 !important;
          height: 0 !important;
          border: none !important;
        }

        // 移除状态列（倒数第二列）的右边框
        :deep(.el-table__body) {
          tr {
            td:nth-last-child(2) {
              border-right: none !important;
            }

            // 同时移除固定列第一列的左边框
            td:last-child {
              border-left: none !important;
            }
          }
        }

        :deep(.el-table__header) {
          th:nth-last-child(2) {
            border-right: none !important;
          }

          // 同时移除固定列第一列的左边框
          th:last-child {
            border-left: none !important;
          }
        }

        // 移除固定列容器的所有边框和阴影
        :deep(.el-table__fixed) {
          border: none !important;
          box-shadow: none !important;
        }

        // 移除固定列右侧的所有视觉效果
        :deep(.el-table__fixed-right-body-wrapper) {
          border-left: none !important;
          box-shadow: none !important;
        }
      }

      .status-tag {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        gap: 4px;
        line-height: 1;
        margin: 0 auto;
        white-space: nowrap;
        max-width: 100%;

        .status-icon {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          font-size: 12px;
          flex-shrink: 0;
          vertical-align: middle;
        }

        .status-text {
          display: inline-flex;
          align-items: center;
          line-height: 1;
          vertical-align: middle;
          white-space: nowrap;
        }
      }

      .action-buttons {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: $spacing-xs;
        flex-wrap: nowrap;
        white-space: nowrap;

        .el-button {
          flex-shrink: 0;
          padding: $spacing-xs $spacing-sm;
          font-size: 12px;
          min-width: auto;

          :deep(.el-icon) {
            margin-right: 2px;
          }
        }
      }
    }
  }

  .settings-card {
    transition: $transition-base;

    &:hover {
      box-shadow: $shadow-lg;
    }

    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;

      .card-title {
        display: flex;
        align-items: center;
        gap: $spacing-sm;
        font-weight: 600;
        color: $text-color-primary;
      }
    }

    // 备份频率下拉菜单样式穿透
    :deep(.el-select) {
      width: 100%;

      .el-input__wrapper {
        width: 100%;
      }
    }
  }
}

// 备份频率下拉菜单样式穿透（全局）
:deep(.backup-frequency-select-popper) {
  min-width: auto !important;
  width: auto !important;
  
  .el-select-dropdown__list {
    min-width: auto !important;
  }
  
  .el-select-dropdown__item {
    min-width: auto !important;
  }
}

// 响应式设计
@media (max-width: 768px) {
  .super-admin-backup-container {
    padding: $spacing-md;

    .backup-row {
      .backup-actions {
        .backup-btn {
          min-height: 70px;
          padding: $spacing-sm;

          .btn-icon {
            font-size: 20px;
          }

          .btn-content {
            .btn-title {
              font-size: 14px;
            }

            .btn-desc {
              font-size: 11px;
            }
          }
        }
      }
    }
  }
}
</style> 