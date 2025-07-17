<template>
  <div class="super-admin-container" v-loading="loading" element-loading-text="加载仪表盘数据中...">
    <el-card class="page-header">
      <h2 class="page-title">超级管理员控制台</h2>
      <p class="page-description">欢迎使用超级管理员功能，您拥有最高级别的系统权限。</p>
    </el-card>

    <el-row :gutter="20" class="stats-row">
      <el-col :span="6">
        <el-card class="stat-card" shadow="hover">
          <div class="stat-content">
            <div class="stat-icon system-icon">
              <el-icon><Setting /></el-icon>
            </div>
            <div class="stat-text">
              <h3>{{ totalUsers }}</h3>
              <p>总用户数</p>
            </div>
          </div>
        </el-card>
      </el-col>

      <el-col :span="6">
        <el-card class="stat-card" shadow="hover">
          <div class="stat-content">
            <div class="stat-icon user-icon">
              <el-icon><UserFilled /></el-icon>
            </div>
            <div class="stat-text">
              <h3>{{ totalOrders }}</h3>
              <p>总订单数</p>
            </div>
          </div>
        </el-card>
      </el-col>

      <el-col :span="6">
        <el-card class="stat-card" shadow="hover">
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

      <el-col :span="6">
        <el-card class="stat-card" shadow="hover">
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
      <el-col :span="12">
        <el-card class="content-card">
          <template #header>
            <span class="card-title">系统监控</span>
          </template>
          <div class="monitor-content">
            <el-descriptions :column="2" border>
              <el-descriptions-item label="系统状态">
                <el-tag type="success">正常运行</el-tag>
              </el-descriptions-item>
              <el-descriptions-item label="在线用户">{{ onlineUsers }}</el-descriptions-item>
              <el-descriptions-item label="CPU使用率">{{ cpuUsage }}%</el-descriptions-item>
              <el-descriptions-item label="内存使用率">{{ memoryUsage }}%</el-descriptions-item>
            </el-descriptions>
          </div>
        </el-card>
      </el-col>

      <el-col :span="12">
        <el-card class="content-card">
          <template #header>
            <span class="card-title">快速操作</span>
          </template>
          <div class="quick-actions">
            <el-button type="primary" size="large" class="action-btn" @click="handleSystemBackup">
              <el-icon><Download /></el-icon>
              系统备份
            </el-button>
            <el-button type="warning" size="large" class="action-btn" @click="handleSystemMaintenance">
              <el-icon><Tools /></el-icon>
              系统维护
            </el-button>
            <el-button type="info" size="large" class="action-btn" @click="handleSystemLogs">
              <el-icon><Document /></el-icon>
              查看日志
            </el-button>
            <el-button type="danger" size="large" class="action-btn" @click="handleEmergencyMode">
              <el-icon><Warning /></el-icon>
              紧急模式
            </el-button>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <el-card class="recent-activities">
      <template #header>
        <span class="card-title">最近活动</span>
      </template>
      <el-table :data="recentActivities" style="width: 100%">
        <el-table-column prop="time" label="时间" width="180" />
        <el-table-column prop="user" label="用户" width="120" />
        <el-table-column prop="action" label="操作" />
        <el-table-column prop="status" label="状态" width="100">
          <template #default="scope">
            <el-tag :type="scope.row.status === '成功' ? 'success' : 'danger'">
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
import { Setting, UserFilled, Lock, DataAnalysis, Download, Tools, Document, Warning } from '@element-plus/icons-vue';
import { getSuperAdminDashboard, type SuperAdminDashboard } from '@/api/auth';
import { useUserStore } from '@/stores/user';
import { useRouter } from 'vue-router';

// 响应式数据
const userStore = useUserStore();
const router = useRouter();
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

// 前端权限检查（用户体验优化，真正的权限控制在后端）
const checkSuperAdminAccess = () => {
  console.log('SuperAdmin - 前端权限检查:', {
    用户角色: userStore.roles,
    是否超级管理员: userStore.hasRole('super_admin')
  });
  
  if (!userStore.hasRole('super_admin')) {
    console.warn('SuperAdmin - 前端检测到无权限访问');
    ElMessage.error('您没有权限访问此页面');
    router.push('/dashboard');
    return false;
  }
  return true;
};

// 获取系统信息
const getSystemInfo = async () => {
  // 前端权限检查（第一层保护）
  if (!checkSuperAdminAccess()) {
    return;
  }
  
  loading.value = true;
  try {
    console.log('SuperAdmin - 获取仪表盘数据');
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
        time: activity.timestamp,
        user: activity.user,
        action: activity.action,
        status: '成功' // 可以根据实际API返回的状态进行映射
      }));
    }
    
    console.log('SuperAdmin - 仪表盘数据加载成功');
  } catch (error: any) {
    console.error('SuperAdmin - 获取系统信息失败:', error);
    
    // 处理不同类型的错误（后端权限控制）
    if (error.response?.status === 403) {
      console.error('SuperAdmin - 后端拒绝访问，权限不足');
      ElMessage.error('权限不足，无法访问超级管理员功能');
      router.push('/dashboard');
      return;
    } else if (error.response?.status === 401) {
      console.error('SuperAdmin - 未授权访问');
      ElMessage.error('身份验证失败，请重新登录');
      userStore.logout();
      router.push('/login');
      return;
    } else {
      ElMessage.error('获取仪表盘数据失败：' + (error.message || '未知错误'));
    }
    
    // 使用默认数据
    onlineUsers.value = 0;
    cpuUsage.value = 0;
    memoryUsage.value = 0;
    recentActivities.value = [
      {
        time: new Date().toLocaleString(),
        user: 'system',
        action: '数据加载失败',
        status: '失败'
      }
    ];
  } finally {
    loading.value = false;
  }
};

// 执行需要超级管理员权限的操作
const executeSuperAdminAction = async (actionName: string, actionFn: () => Promise<void>) => {
  if (!checkSuperAdminAccess()) {
    return;
  }
  
  try {
    await actionFn();
  } catch (error: any) {
    if (error.response?.status === 403) {
      ElMessage.error(`权限不足，无法执行${actionName}操作`);
    } else if (error.response?.status === 401) {
      ElMessage.error('身份验证失败，请重新登录');
      userStore.logout();
      router.push('/login');
    } else {
      console.error(`${actionName}操作失败:`, error);
    }
  }
};

// 处理系统备份
const handleSystemBackup = async () => {
  await executeSuperAdminAction('系统备份', async () => {
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
  });
};

// 处理系统维护
const handleSystemMaintenance = async () => {
  await executeSuperAdminAction('系统维护', async () => {
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
  });
};

// 查看系统日志
const handleSystemLogs = () => {
  if (!checkSuperAdminAccess()) {
    return;
  }
  ElMessage.info('正在跳转到系统日志页面...');
  router.push('/super-admin/logs');
};

// 处理紧急模式
const handleEmergencyMode = async () => {
  await executeSuperAdminAction('紧急模式', async () => {
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
  });
};

onMounted(() => {
  // 页面加载时进行权限检查
  console.log('SuperAdmin - 页面加载，开始权限检查');
  if (checkSuperAdminAccess()) {
    getSystemInfo();
  }
});
</script>

<style scoped lang="scss">
.super-admin-container {
  padding: 20px;
  background-color: #f5f5f5;
  min-height: calc(100vh - 60px);

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

  .stats-row {
    margin-bottom: 20px;

    .stat-card {
      height: 120px;
      cursor: pointer;
      transition: all 0.3s ease;

      &:hover {
        transform: translateY(-5px);
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
          margin-right: 15px;
          font-size: 24px;
          color: white;

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

          h3 {
            margin: 0 0 5px 0;
            font-size: 18px;
            color: #333;
          }

          p {
            margin: 0;
            color: #666;
            font-size: 14px;
          }
        }
      }
    }
  }

  .content-row {
    margin-bottom: 20px;

    .content-card {
      height: 300px;

      .card-title {
        font-weight: 600;
        color: #333;
      }

      .monitor-content {
        padding-top: 20px;
      }

      .quick-actions {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 15px;
        padding-top: 20px;

        .action-btn {
          height: 60px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 5px;
        }
      }
    }
  }

  .recent-activities {
    .card-title {
      font-weight: 600;
      color: #333;
    }
  }
}
</style> 