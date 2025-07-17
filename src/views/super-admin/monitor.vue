<template>
  <div class="super-admin-monitor-container">
    <el-card class="page-header">
      <h2 class="page-title">系统监控</h2>
      <p class="page-description">实时监控系统性能和运行状态</p>
    </el-card>

    <el-row :gutter="20">
      <el-col :span="12">
        <el-card>
          <template #header>
            <span>系统性能</span>
          </template>
          <el-descriptions :column="2" border>
            <el-descriptions-item label="CPU使用率">
              <el-progress :percentage="cpuUsage" :color="getStatusColor(cpuUsage)" />
            </el-descriptions-item>
            <el-descriptions-item label="内存使用率">
              <el-progress :percentage="memoryUsage" :color="getStatusColor(memoryUsage)" />
            </el-descriptions-item>
            <el-descriptions-item label="磁盘使用率">
              <el-progress :percentage="diskUsage" :color="getStatusColor(diskUsage)" />
            </el-descriptions-item>
            <el-descriptions-item label="网络负载">
              <el-progress :percentage="networkLoad" :color="getStatusColor(networkLoad)" />
            </el-descriptions-item>
          </el-descriptions>
        </el-card>
      </el-col>

      <el-col :span="12">
        <el-card>
          <template #header>
            <span>服务状态</span>
          </template>
          <el-table :data="serviceStatus" style="width: 100%">
            <el-table-column prop="name" label="服务名称" />
            <el-table-column prop="status" label="状态">
              <template #default="scope">
                <el-tag :type="scope.row.status === '运行中' ? 'success' : 'danger'">
                  {{ scope.row.status }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="uptime" label="运行时间" />
          </el-table>
        </el-card>
      </el-col>
    </el-row>

    <el-card style="margin-top: 20px;">
      <template #header>
        <span>实时日志</span>
      </template>
      <div class="log-container">
        <div v-for="log in realtimeLogs" :key="log.id" class="log-item">
          <span class="log-time">{{ log.time }}</span>
          <span :class="['log-level', `log-${log.level}`]">{{ log.level }}</span>
          <span class="log-message">{{ log.message }}</span>
        </div>
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import { ElMessage } from 'element-plus';
import { useUserStore } from '@/stores/user';
import { useRouter } from 'vue-router';

const userStore = useUserStore();
const router = useRouter();

// 权限检查函数
const checkAccess = () => {
  console.log('Monitor - 权限检查:', {
    用户角色: userStore.roles,
    是否超级管理员: userStore.hasRole('super_admin')
  });
  
  if (!userStore.hasRole('super_admin')) {
    console.warn('Monitor - 权限不足，跳转到仪表盘');
    ElMessage.error('您没有权限访问此页面');
    router.push('/dashboard');
    return false;
  }
  return true;
};

const cpuUsage = ref(45);
const memoryUsage = ref(62);
const diskUsage = ref(78);
const networkLoad = ref(23);

const serviceStatus = ref([
  { name: 'Web服务器', status: '运行中', uptime: '15天 3小时' },
  { name: '数据库', status: '运行中', uptime: '15天 3小时' },
  { name: '缓存服务', status: '运行中', uptime: '15天 3小时' },
  { name: '消息队列', status: '运行中', uptime: '15天 3小时' }
]);

const realtimeLogs = ref([
  { id: 1, time: '2024-03-20 14:30:25', level: 'INFO', message: '用户登录成功: admin' },
  { id: 2, time: '2024-03-20 14:29:15', level: 'WARN', message: '内存使用率达到60%' },
  { id: 3, time: '2024-03-20 14:28:45', level: 'INFO', message: '系统备份完成' },
  { id: 4, time: '2024-03-20 14:27:30', level: 'ERROR', message: '连接超时: 192.168.1.100' }
]);

const getStatusColor = (percentage: number) => {
  if (percentage < 50) return '#67C23A';
  if (percentage < 80) return '#E6A23C';
  return '#F56C6C';
};

let interval: NodeJS.Timeout;

onMounted(() => {
  // 权限检查
  if (!checkAccess()) {
    return;
  }
  
  // 模拟实时数据更新
  interval = setInterval(() => {
    cpuUsage.value = Math.floor(Math.random() * 100);
    memoryUsage.value = Math.floor(Math.random() * 100);
    diskUsage.value = Math.floor(Math.random() * 100);
    networkLoad.value = Math.floor(Math.random() * 100);
  }, 3000);
});

onUnmounted(() => {
  if (interval) {
    clearInterval(interval);
  }
});
</script>

<style scoped lang="scss">
.super-admin-monitor-container {
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

  .log-container {
    max-height: 300px;
    overflow-y: auto;
    font-family: 'Courier New', monospace;
    font-size: 12px;

    .log-item {
      display: flex;
      margin-bottom: 5px;
      padding: 5px;
      border-radius: 3px;
      background-color: #f8f9fa;

      .log-time {
        color: #666;
        margin-right: 10px;
        min-width: 120px;
      }

      .log-level {
        margin-right: 10px;
        min-width: 50px;
        font-weight: bold;

        &.log-INFO {
          color: #409EFF;
        }

        &.log-WARN {
          color: #E6A23C;
        }

        &.log-ERROR {
          color: #F56C6C;
        }
      }

      .log-message {
        flex: 1;
      }
    }
  }
}
</style> 