<template>
  <div class="super-admin-dashboard-container" v-loading="loading" element-loading-text="加载仪表盘数据中...">
    <el-card class="page-header">
      <div class="header-content">
        <div class="header-text">
          <h2 class="page-title">
            <el-icon class="title-icon"><DataBoard /></el-icon>
            超级管理员控制台
          </h2>
          <p class="page-description">欢迎使用超级管理员功能，您拥有最高级别的系统权限。</p>
        </div>
        <div class="header-actions">
          <el-button :icon="Refresh" circle @click="getSystemInfo" :loading="loading" />
        </div>
      </div>
    </el-card>

    <el-row :gutter="20" class="stats-row">
      <el-col :xs="24" :sm="12" :md="6">
        <el-card class="stat-card" shadow="hover" @click="router.push('/super-admin/monitor')">
          <div class="stat-content">
            <div class="stat-icon system-icon">
              <el-icon><UserFilled /></el-icon>
            </div>
            <div class="stat-text">
              <h3>{{ totalUsers }}</h3>
              <p>总用户数</p>
            </div>
          </div>
        </el-card>
      </el-col>

      <el-col :xs="24" :sm="12" :md="6">
        <el-card class="stat-card" shadow="hover">
          <div class="stat-content">
            <div class="stat-icon user-icon">
              <el-icon><ShoppingCart /></el-icon>
            </div>
            <div class="stat-text">
              <h3>{{ totalOrders }}</h3>
              <p>总订单数</p>
            </div>
          </div>
        </el-card>
      </el-col>

      <el-col :xs="24" :sm="12" :md="6">
        <el-card class="stat-card" shadow="hover" @click="router.push('/super-admin/logs')">
          <div class="stat-content">
            <div class="stat-icon security-icon">
              <el-icon><Lock /></el-icon>
            </div>
            <div class="stat-text">
              <h3>安全审计</h3>
              <p>系统安全监控</p>
            </div>
          </div>
        </el-card>
      </el-col>

      <el-col :xs="24" :sm="12" :md="6">
        <el-card class="stat-card" shadow="hover" @click="router.push('/super-admin/monitor')">
          <div class="stat-content">
            <div class="stat-icon data-icon">
              <el-icon><DataAnalysis /></el-icon>
            </div>
            <div class="stat-text">
              <h3>数据中心</h3>
              <p>系统数据管理</p>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="20" class="content-row">
      <el-col :xs="24" :sm="24" :md="12">
        <el-card class="content-card" shadow="hover">
          <template #header>
            <div class="card-header">
              <span class="card-title">
                <el-icon><Monitor /></el-icon>
                系统监控
              </span>
            </div>
          </template>
          <div class="monitor-content">
            <el-descriptions :column="2" border>
              <el-descriptions-item label="系统状态">
                <el-tag type="success" effect="dark">正常运行</el-tag>
              </el-descriptions-item>
              <el-descriptions-item label="在线用户">
                <el-icon class="desc-icon"><User /></el-icon>
                {{ onlineUsers }}
              </el-descriptions-item>
              <el-descriptions-item label="CPU使用率">
                <el-icon class="desc-icon"><Cpu /></el-icon>
                {{ cpuUsage }}%
              </el-descriptions-item>
              <el-descriptions-item label="内存使用率">
                <el-icon class="desc-icon"><Connection /></el-icon>
                {{ memoryUsage }}%
              </el-descriptions-item>
            </el-descriptions>
          </div>
        </el-card>
      </el-col>

      <el-col :xs="24" :sm="24" :md="12">
        <el-card class="content-card" shadow="hover">
          <template #header>
            <div class="card-header">
              <span class="card-title">
                <el-icon><Operation /></el-icon>
                快速操作
              </span>
            </div>
          </template>
          <div class="quick-actions">
            <el-button type="primary" size="large" class="action-btn" @click="handleSystemBackup">
              <el-icon class="btn-icon"><Download /></el-icon>
              <span class="btn-text">系统备份</span>
            </el-button>
            <el-button type="warning" size="large" class="action-btn" @click="handleSystemMaintenance">
              <el-icon class="btn-icon"><Tools /></el-icon>
              <span class="btn-text">系统维护</span>
            </el-button>
            <el-button type="info" size="large" class="action-btn" @click="handleSystemLogs">
              <el-icon class="btn-icon"><Document /></el-icon>
              <span class="btn-text">查看日志</span>
            </el-button>
            <el-button type="danger" size="large" class="action-btn" @click="handleEmergencyMode">
              <el-icon class="btn-icon"><Warning /></el-icon>
              <span class="btn-text">紧急模式</span>
            </el-button>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <el-card class="recent-activities" shadow="hover">
      <template #header>
        <div class="card-header">
          <span class="card-title">
            <el-icon><Clock /></el-icon>
            最近活动
          </span>
        </div>
      </template>
      <el-table 
        :data="recentActivities" 
        style="width: 100%"
        :empty-text="'暂无活动记录'"
        stripe
      >
        <el-table-column prop="time" label="时间" width="180" sortable />
        <el-table-column prop="user" label="用户" width="120" />
        <el-table-column prop="action" label="操作" min-width="200" show-overflow-tooltip />
        <el-table-column prop="status" label="状态" width="100" align="center">
          <template #default="scope">
            <el-tag :type="scope.row.status === '成功' ? 'success' : 'danger'" effect="dark" size="small">
              {{ scope.row.status }}
            </el-tag>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { 
  DataBoard, Refresh, UserFilled, ShoppingCart, Lock, DataAnalysis, 
  Download, Tools, Document, Warning, Monitor, Operation, Clock,
  User, Cpu, Connection
} from '@element-plus/icons-vue';
import { getSuperAdminDashboard, type SuperAdminDashboard } from '@/api/auth';
import { useSuperAdminAccess } from '@/composables';
import { formatDateTime } from '@/utils';

// 使用权限检查 composable
const { checkAccess, executeWithPermission, router } = useSuperAdminAccess();

// 响应式数据
const loading = ref(false);
const onlineUsers = ref(0);
const cpuUsage = ref(0);
const memoryUsage = ref(0);
const totalUsers = ref(0);
const totalOrders = ref(0);
const totalRevenue = ref(0);
const recentActivities = ref<Array<{
  time: string;
  user: string;
  action: string;
  status: string;
}>>([]);

// 获取系统信息
const getSystemInfo = async () => {
  if (!checkAccess()) {
    return;
  }
  
  loading.value = true;
  try {
    const response = await getSuperAdminDashboard();
    
    // 处理API响应
    const data = response.data || response as SuperAdminDashboard;
    
    // 更新系统统计
    if (data.systemStats) {
      totalUsers.value = data.systemStats.totalUsers;
      onlineUsers.value = data.systemStats.onlineUsers;
      totalOrders.value = data.systemStats.totalOrders;
      totalRevenue.value = data.systemStats.totalRevenue;
    }
    
    // 更新系统健康状态
    if (data.systemHealth) {
      cpuUsage.value = data.systemHealth.cpu;
      memoryUsage.value = data.systemHealth.memory;
    }
    
    // 更新最近活动
    if (data.recentActivities) {
      recentActivities.value = data.recentActivities.map(activity => ({
        time: formatDateTime(activity.timestamp) || activity.timestamp,
        user: activity.user,
        action: activity.action,
        status: '成功' // 可以根据实际API返回的状态进行映射
      }));
    }
  } catch (error: unknown) {
    ElMessage.error((error as { message?: string })?.message || '获取仪表盘数据失败');
    
    // 使用默认数据
    onlineUsers.value = 0;
    cpuUsage.value = 0;
    memoryUsage.value = 0;
    recentActivities.value = [
      {
        time: formatDateTime(new Date().toISOString()),
        user: 'system',
        action: '数据加载失败',
        status: '失败'
      }
    ];
  } finally {
    loading.value = false;
  }
};

// 执行需要超级管理员权限的操作（已使用 composable 中的方法）

// 处理系统备份
const handleSystemBackup = async () => {
  await executeWithPermission(async () => {
    await ElMessageBox.confirm(
      '确定要执行系统备份吗？此操作可能需要较长时间。',
      '系统备份',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      }
    );
    ElMessage.success('系统备份已开始执行');
  }, '系统备份操作失败');
};

// 处理系统维护
const handleSystemMaintenance = async () => {
  await executeWithPermission(async () => {
    await ElMessageBox.confirm(
      '系统维护模式将暂停所有用户访问，确定要启用吗？',
      '系统维护',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      }
    );
    ElMessage.success('系统维护模式已启用');
  }, '系统维护操作失败');
};

// 查看系统日志
const handleSystemLogs = () => {
  if (!checkAccess()) {
    return;
  }
  ElMessage.info('正在跳转到系统日志页面...');
  router.push('/super-admin/logs');
};

// 处理紧急模式
const handleEmergencyMode = async () => {
  await executeWithPermission(async () => {
    await ElMessageBox.confirm(
      '紧急模式将立即终止所有非关键操作，确定要启用吗？',
      '紧急模式',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'error',
      }
    );
    ElMessage.error('紧急模式已启用');
  }, '紧急模式操作失败');
};

onMounted(() => {
  // 页面加载时进行权限检查
  if (checkAccess()) {
    getSystemInfo();
  }
});
</script>

<style scoped lang="scss">
@import '@/styles/variables.scss';

.super-admin-dashboard-container {
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

  .stats-row {
    margin-bottom: $spacing-xl;

    .stat-card {
      height: 120px;
      cursor: pointer;
      transition: $transition-base;

      &:hover {
        transform: translateY(-4px);
        box-shadow: $shadow-lg;
      }

      .stat-content {
        display: flex;
        align-items: center;
        height: 100%;

        .stat-icon {
          width: 60px;
          height: 60px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-right: $spacing-lg;
          font-size: 24px;
          color: white;
          flex-shrink: 0;

          &.system-icon {
            background: linear-gradient(135deg, #ff6b6b, #ee5a52);
          }

          &.user-icon {
            background: linear-gradient(135deg, #4ecdc4, #44a08d);
          }

          &.security-icon {
            background: linear-gradient(135deg, #fed330, #f7971e);
          }

          &.data-icon {
            background: linear-gradient(135deg, #6c5ce7, #5f3dc4);
          }
        }

        .stat-text {
          flex: 1;
          min-width: 0;

          h3 {
            margin: 0 0 $spacing-xs 0;
            font-size: 20px;
            font-weight: 600;
            color: $text-color-primary;
          }

          p {
            margin: 0;
            color: $text-color-secondary;
            font-size: 14px;
          }
        }
      }
    }
  }

  .content-row {
    margin-bottom: $spacing-xl;

    .content-card {
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

      .monitor-content {
        padding-top: $spacing-md;

        .desc-icon {
          margin-right: $spacing-xs;
          color: $text-color-secondary;
          vertical-align: middle;
        }
      }

      .quick-actions {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: $spacing-md;
        padding-top: $spacing-md;

        .action-btn {
          height: 80px !important;
          min-height: 80px !important;
          padding: $spacing-md $spacing-lg !important;
          margin: 0 !important;
          display: flex !important;
          flex-direction: column !important;
          align-items: center !important;
          justify-content: center !important;
          gap: $spacing-xs !important;
          transition: $transition-base;
          box-sizing: border-box !important;
          line-height: normal !important;

          &:hover {
            transform: translateY(-2px);
          }

          // 重置 Element Plus 按钮的默认样式
          :deep(.el-icon) {
            margin: 0 !important;
          }

          :deep(> span) {
            display: flex !important;
            flex-direction: column !important;
            align-items: center !important;
            justify-content: center !important;
            width: 100% !important;
            height: 100% !important;
            margin: 0 !important;
            padding: 0 !important;
            gap: $spacing-xs !important;
          }

          .btn-icon {
            font-size: 24px;
            flex-shrink: 0;
            display: flex;
            align-items: center;
            justify-content: center;
            width: 24px;
            height: 24px;
            line-height: 1;
            margin: 0 !important;
            padding: 0 !important;
          }

          .btn-text {
            font-size: 14px;
            font-weight: 500;
            line-height: 1.4;
            white-space: nowrap;
            display: block;
            margin: 0 !important;
            padding: 0 !important;
          }
        }
      }
    }
  }

  .recent-activities {
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
}

// 响应式设计
@media (max-width: 768px) {
  .super-admin-dashboard-container {
    padding: $spacing-md;

    .stats-row {
      .stat-card {
        margin-bottom: $spacing-md;
      }
    }

    .content-row {
      .content-card {
        margin-bottom: $spacing-md;

        .quick-actions {
          grid-template-columns: 1fr;
        }
      }
    }
  }
}
</style> 