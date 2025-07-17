<template>
  <div class="super-admin-backup-container">
    <el-card class="page-header">
      <h2 class="page-title">数据备份</h2>
      <p class="page-description">管理系统数据备份和恢复</p>
    </el-card>

    <el-row :gutter="20">
      <el-col :span="8">
        <el-card>
          <template #header>
            <span>快速备份</span>
          </template>
          <div class="backup-actions">
            <el-button type="primary" size="large" @click="handleFullBackup" :loading="backupLoading">
              <el-icon><Download /></el-icon>
              完整备份
            </el-button>
            <el-button type="success" size="large" @click="handleIncrementalBackup" :loading="backupLoading">
              <el-icon><FolderOpened /></el-icon>
              增量备份
            </el-button>
            <el-button type="warning" size="large" @click="handleDatabaseBackup" :loading="backupLoading">
              <el-icon><Money /></el-icon>
              数据库备份
            </el-button>
          </div>
        </el-card>
      </el-col>

      <el-col :span="16">
        <el-card>
          <template #header>
            <span>备份历史</span>
            <el-button style="float: right;" @click="refreshBackupList">
              <el-icon><Refresh /></el-icon>
              刷新
            </el-button>
          </template>
          <el-table :data="backupHistory" style="width: 100%">
            <el-table-column prop="name" label="备份名称" />
            <el-table-column prop="type" label="类型">
              <template #default="scope">
                <el-tag :type="getBackupTypeColor(scope.row.type)">
                  {{ scope.row.type }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="size" label="大小" />
            <el-table-column prop="createTime" label="创建时间" />
            <el-table-column prop="status" label="状态">
              <template #default="scope">
                <el-tag :type="scope.row.status === '成功' ? 'success' : 'danger'">
                  {{ scope.row.status }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column label="操作" width="200">
              <template #default="scope">
                <el-button size="small" @click="handleDownload(scope.row)">下载</el-button>
                <el-button size="small" type="warning" @click="handleRestore(scope.row)">恢复</el-button>
                <el-button size="small" type="danger" @click="handleDelete(scope.row)">删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-col>
    </el-row>

    <el-card style="margin-top: 20px;">
      <template #header>
        <span>自动备份设置</span>
      </template>
      <el-form :model="backupSettings" label-width="120px">
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="启用自动备份">
              <el-switch v-model="backupSettings.enabled" />
            </el-form-item>
            <el-form-item label="备份频率">
              <el-select v-model="backupSettings.frequency" placeholder="请选择">
                <el-option label="每天" value="daily" />
                <el-option label="每周" value="weekly" />
                <el-option label="每月" value="monthly" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="备份时间">
              <el-time-picker v-model="backupSettings.time" format="HH:mm" />
            </el-form-item>
            <el-form-item label="保留天数">
              <el-input-number v-model="backupSettings.retentionDays" :min="1" :max="365" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item>
          <el-button type="primary" @click="saveBackupSettings">保存设置</el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { Download, FolderOpened, Money, Refresh } from '@element-plus/icons-vue';
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

const backupLoading = ref(false);

const backupHistory = ref([
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

const backupSettings = ref({
  enabled: true,
  frequency: 'daily',
  time: new Date(),
  retentionDays: 30
});

const getBackupTypeColor = (type: string) => {
  switch (type) {
    case '完整备份': return 'primary';
    case '增量备份': return 'success';
    case '数据库备份': return 'warning';
    default: return 'info';
  }
};

const handleFullBackup = async () => {
  backupLoading.value = true;
  try {
    await ElMessageBox.confirm('确定要开始完整备份吗？此操作可能需要较长时间。', '确认备份', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    });
    
    // 模拟备份过程
    await new Promise(resolve => setTimeout(resolve, 2000));
    ElMessage.success('完整备份已开始，请在备份历史中查看进度');
  } catch {
    ElMessage.info('已取消备份');
  } finally {
    backupLoading.value = false;
  }
};

const handleIncrementalBackup = async () => {
  backupLoading.value = true;
  try {
    await new Promise(resolve => setTimeout(resolve, 1000));
    ElMessage.success('增量备份完成');
  } finally {
    backupLoading.value = false;
  }
};

const handleDatabaseBackup = async () => {
  backupLoading.value = true;
  try {
    await new Promise(resolve => setTimeout(resolve, 1500));
    ElMessage.success('数据库备份完成');
  } finally {
    backupLoading.value = false;
  }
};

const refreshBackupList = () => {
  ElMessage.success('备份列表已刷新');
};

const handleDownload = (backup: any) => {
  ElMessage.success(`开始下载: ${backup.name}`);
};

const handleRestore = async (backup: any) => {
  try {
    await ElMessageBox.confirm(
      `确定要恢复备份 "${backup.name}" 吗？此操作将覆盖当前数据！`,
      '确认恢复',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'error'
      }
    );
    ElMessage.success(`开始恢复: ${backup.name}`);
  } catch {
    ElMessage.info('已取消恢复');
  }
};

const handleDelete = async (backup: any) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除备份 "${backup.name}" 吗？`,
      '确认删除',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    );
    ElMessage.success('备份已删除');
  } catch {
    ElMessage.info('已取消删除');
  }
};

const saveBackupSettings = () => {
  ElMessage.success('备份设置已保存');
};

onMounted(() => {
  // 权限检查
  if (!checkAccess()) {
    return;
  }
});
</script>

<style scoped lang="scss">
.super-admin-backup-container {
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

  .backup-actions {
    display: flex;
    flex-direction: column;
    gap: 15px;

    .el-button {
      height: 60px;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 5px;
    }
  }
}
</style> 