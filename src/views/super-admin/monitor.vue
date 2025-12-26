<template>
  <div
    v-loading="loading"
    class="super-admin-monitor-container"
    element-loading-text="加载监控数据中..."
  >
    <el-card class="page-header">
      <div class="header-content">
        <div class="header-text">
          <h2 class="page-title">
            <el-icon class="title-icon"><Monitor /></el-icon>
            系统监控
          </h2>
          <p class="page-description">实时监控系统性能和运行状态</p>
        </div>
        <div class="header-actions">
          <el-button :icon="Refresh" circle :loading="refreshing" @click="refreshData" />
          <el-button
            :icon="FullScreen"
            circle
            :type="autoRefresh ? 'primary' : 'default'"
            @click="toggleAutoRefresh"
          />
        </div>
      </div>
    </el-card>

    <el-row :gutter="20" class="stats-row">
      <el-col v-for="stat in performanceStats" :key="stat.name" :xs="24" :sm="12" :md="6">
        <el-card class="stat-card" shadow="hover">
          <div class="stat-content">
            <div class="stat-icon" :style="{ background: stat.color }">
              <el-icon :size="24"><component :is="stat.icon" /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-label">{{ stat.label }}</div>
              <div class="stat-value">
                <span class="value-number">{{ formatPercentage(stat.value) }}</span>
                <span class="value-unit">%</span>
              </div>
              <el-progress
                :percentage="stat.value"
                :color="getStatusColor(stat.value)"
                :stroke-width="6"
                :show-text="false"
                class="stat-progress"
              />
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="20" class="content-row">
      <el-col :xs="24" :sm="24" :md="24">
        <el-card class="content-card">
          <template #header>
            <div class="card-header">
              <span class="card-title">
                <el-icon><Service /></el-icon>
                服务状态
              </span>
            </div>
          </template>
          <el-table :data="serviceStatus" style="width: 100%" :empty-text="'暂无服务数据'">
            <el-table-column prop="name" label="服务名称" min-width="150">
              <template #default="scope">
                <div class="service-name">
                  <el-icon class="service-icon"><component :is="scope.row.icon" /></el-icon>
                  <span>{{ scope.row.name }}</span>
                </div>
              </template>
            </el-table-column>
            <el-table-column prop="status" label="状态" width="120" align="center">
              <template #default="scope">
                <el-tag
                  :type="scope.row.status === '运行中' ? 'success' : 'danger'"
                  effect="dark"
                  class="status-tag"
                >
                  <el-icon class="status-icon">
                    <component
                      :is="scope.row.status === '运行中' ? 'CircleCheck' : 'CircleClose'"
                    />
                  </el-icon>
                  <span class="status-text">{{ scope.row.status }}</span>
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="uptime" label="运行时间" min-width="150" />
          </el-table>
        </el-card>
      </el-col>
    </el-row>

    <el-card class="log-card">
      <template #header>
        <div class="card-header">
          <span class="card-title">
            <el-icon><Document /></el-icon>
            实时日志
          </span>
          <el-button size="small" :disabled="realtimeLogs.length === 0" @click="clearLogs">
            <el-icon><Delete /></el-icon>
            清空日志
          </el-button>
        </div>
      </template>
      <div ref="logContainerRef" class="log-container">
        <el-empty v-if="realtimeLogs.length === 0" description="暂无日志数据" :image-size="100" />
        <div v-else>
          <div
            v-for="log in realtimeLogs"
            :key="log.id"
            class="log-item"
            :class="`log-item-${log.level.toLowerCase()}`"
          >
            <div class="log-time">
              <el-icon><Clock /></el-icon>
              {{ log.time }}
            </div>
            <div :class="['log-level', `log-level-${log.level.toLowerCase()}`]">
              <el-icon class="level-icon">
                <component :is="getLogLevelIcon(log.level)" />
              </el-icon>
              {{ log.level }}
            </div>
            <div class="log-message">{{ log.message }}</div>
          </div>
        </div>
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, nextTick } from 'vue';
import {
  Monitor,
  Refresh,
  FullScreen,
  DataAnalysis,
  Service,
  Document,
  Delete,
  Clock,
  Cpu,
  Connection,
  Folder,
  CircleCheck,
  CircleClose,
  InfoFilled,
  WarningFilled,
  CircleCloseFilled,
  SuccessFilled,
} from '@element-plus/icons-vue';
import { ElMessage } from 'element-plus';
import { useSuperAdminAccess } from '@/composables';
import { getSuperAdminDashboard } from '@/api/auth';
import type { Component } from 'vue';

// 类型定义
interface PerformanceStat {
  name: string;
  label: string;
  value: number;
  icon: Component;
  color: string;
}

interface ServiceStatus {
  name: string;
  status: string;
  uptime: string;
  icon: Component;
}

interface RealtimeLog {
  id: number;
  time: string;
  level: string;
  message: string;
}

// 使用权限检查 composable
const { checkAccess, executeWithPermission } = useSuperAdminAccess();

const loading = ref(false);
const refreshing = ref(false);
const autoRefresh = ref(true);
const logContainerRef = ref<HTMLElement | null>(null);

const cpuUsage = ref(45);
const memoryUsage = ref(62);
const diskUsage = ref(78);
const networkLoad = ref(23);

// 性能统计数据
const performanceStats = computed<PerformanceStat[]>(() => [
  {
    name: 'cpu',
    label: 'CPU使用率',
    value: cpuUsage.value,
    icon: Cpu,
    color: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  },
  {
    name: 'memory',
    label: '内存使用率',
    value: memoryUsage.value,
    icon: Connection,
    color: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
  },
  {
    name: 'disk',
    label: '磁盘使用率',
    value: diskUsage.value,
    icon: Folder,
    color: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
  },
  {
    name: 'network',
    label: '网络负载',
    value: networkLoad.value,
    icon: Connection,
    color: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
  },
]);

const serviceStatus = ref<ServiceStatus[]>([
  { name: 'Web服务器', status: '运行中', uptime: '15天 3小时', icon: Monitor },
  { name: '数据库', status: '运行中', uptime: '15天 3小时', icon: DataAnalysis },
  { name: '缓存服务', status: '运行中', uptime: '15天 3小时', icon: Service },
  { name: '消息队列', status: '运行中', uptime: '15天 3小时', icon: Connection },
]);

const realtimeLogs = ref<RealtimeLog[]>([
  { id: 1, time: '2024-03-20 14:30:25', level: 'INFO', message: '用户登录成功: admin' },
  { id: 2, time: '2024-03-20 14:29:15', level: 'WARN', message: '内存使用率达到60%' },
  { id: 3, time: '2024-03-20 14:28:45', level: 'INFO', message: '系统备份完成' },
  { id: 4, time: '2024-03-20 14:27:30', level: 'ERROR', message: '连接超时: 192.168.1.100' },
]);

// 格式化百分比，保留两位小数
const formatPercentage = (value: number): string => {
  return value.toFixed(2);
};

// 获取状态颜色
const getStatusColor = (percentage: number): string => {
  if (percentage < 50) return '#67C23A';
  if (percentage < 80) return '#E6A23C';
  return '#F56C6C';
};

// 获取日志级别图标
const getLogLevelIcon = (level: string): Component => {
  switch (level.toUpperCase()) {
    case 'INFO':
      return InfoFilled;
    case 'WARN':
      return WarningFilled;
    case 'ERROR':
      return CircleCloseFilled;
    case 'SUCCESS':
      return SuccessFilled;
    default:
      return InfoFilled;
  }
};

// 更新监控数据
const updateMonitorData = () => {
  // 模拟数据更新（实际应该调用API）
  // 生成更精确的随机数，保留两位小数
  const randomChange = (maxChange: number) => (Math.random() - 0.5) * maxChange;
  cpuUsage.value = Math.max(
    0,
    Math.min(100, Number((cpuUsage.value + randomChange(10)).toFixed(2)))
  );
  memoryUsage.value = Math.max(
    0,
    Math.min(100, Number((memoryUsage.value + randomChange(10)).toFixed(2)))
  );
  diskUsage.value = Math.max(
    0,
    Math.min(100, Number((diskUsage.value + randomChange(5)).toFixed(2)))
  );
  networkLoad.value = Math.max(
    0,
    Math.min(100, Number((networkLoad.value + randomChange(15)).toFixed(2)))
  );
};

// 添加新日志
const addLog = (level: string, message: string) => {
  const now = new Date();
  const time = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;

  realtimeLogs.value.unshift({
    id: Date.now(),
    time,
    level,
    message,
  });

  // 限制日志数量
  if (realtimeLogs.value.length > 100) {
    realtimeLogs.value = realtimeLogs.value.slice(0, 100);
  }

  // 自动滚动到底部
  nextTick(() => {
    if (logContainerRef.value) {
      logContainerRef.value.scrollTop = 0;
    }
  });
};

// 刷新数据
const refreshData = async () => {
  refreshing.value = true;
  try {
    await executeWithPermission(async () => {
      // 这里可以调用实际的API
      // const response = await getSuperAdminDashboard();
      // if (response?.systemHealth) {
      //   cpuUsage.value = response.systemHealth.cpu;
      //   memoryUsage.value = response.systemHealth.memory;
      //   diskUsage.value = response.systemHealth.disk;
      //   networkLoad.value = response.systemHealth.network;
      // }

      // 模拟API调用
      await new Promise(resolve => setTimeout(resolve, 500));
      updateMonitorData();
      addLog('INFO', '监控数据已刷新');
      ElMessage.success('数据刷新成功');
    }, '刷新数据失败');
  } finally {
    refreshing.value = false;
  }
};

// 切换自动刷新
const toggleAutoRefresh = () => {
  autoRefresh.value = !autoRefresh.value;
  ElMessage.info(autoRefresh.value ? '已启用自动刷新' : '已禁用自动刷新');
};

// 清空日志
const clearLogs = () => {
  realtimeLogs.value = [];
  ElMessage.success('日志已清空');
};

let updateInterval: ReturnType<typeof setInterval> | null = null;
let logInterval: ReturnType<typeof setInterval> | null = null;

// 启动自动更新
const startAutoUpdate = () => {
  if (updateInterval) {
    clearInterval(updateInterval);
  }
  if (logInterval) {
    clearInterval(logInterval);
  }

  // 每3秒更新一次性能数据
  updateInterval = setInterval(() => {
    if (autoRefresh.value) {
      updateMonitorData();
    }
  }, 3000);

  // 每10秒添加一条模拟日志
  logInterval = setInterval(() => {
    if (autoRefresh.value) {
      const levels = ['INFO', 'WARN', 'ERROR'];
      const messages = [
        '系统运行正常',
        '内存使用率较高',
        '数据库连接池正常',
        '缓存命中率: 85%',
        'API响应时间正常',
        '磁盘空间充足',
      ];
      const level = levels[Math.floor(Math.random() * levels.length)];
      const message = messages[Math.floor(Math.random() * messages.length)];
      addLog(level, message);
    }
  }, 10000);
};

// 停止自动更新
const stopAutoUpdate = () => {
  if (updateInterval) {
    clearInterval(updateInterval);
    updateInterval = null;
  }
  if (logInterval) {
    clearInterval(logInterval);
    logInterval = null;
  }
};

onMounted(() => {
  // 权限检查
  if (!checkAccess()) {
    return;
  }

  // 加载初始数据
  loading.value = true;
  refreshData().finally(() => {
    loading.value = false;
  });

  // 启动自动更新
  startAutoUpdate();
});

onUnmounted(() => {
  stopAutoUpdate();
});
</script>

<style scoped lang="scss">
@import '@/styles/variables.scss';

.super-admin-monitor-container {
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
      height: 100%;
      transition: $transition-base;
      cursor: pointer;

      &:hover {
        transform: translateY(-4px);
        box-shadow: $shadow-lg;
      }

      .stat-content {
        display: flex;
        align-items: center;
        gap: $spacing-lg;

        .stat-icon {
          width: 56px;
          height: 56px;
          border-radius: $border-radius-lg;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          flex-shrink: 0;
        }

        .stat-info {
          flex: 1;
          min-width: 0;

          .stat-label {
            font-size: 14px;
            color: $text-color-secondary;
            margin-bottom: $spacing-xs;
          }

          .stat-value {
            display: flex;
            align-items: baseline;
            margin-bottom: $spacing-sm;

            .value-number {
              font-size: 24px;
              font-weight: 600;
              color: $text-color-primary;
            }

            .value-unit {
              font-size: 14px;
              color: $text-color-secondary;
              margin-left: 2px;
            }
          }

          .stat-progress {
            :deep(.el-progress-bar__outer) {
              border-radius: $border-radius-sm;
            }
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

      .service-name {
        display: flex;
        align-items: center;
        gap: $spacing-sm;

        .service-icon {
          color: $color-primary;
        }
      }

      .status-tag {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        gap: 4px;
        line-height: 1;
        margin: 0 auto;

        .status-icon {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          font-size: 14px;
          flex-shrink: 0;
          vertical-align: middle;
        }

        .status-text {
          display: inline-flex;
          align-items: center;
          line-height: 1;
          vertical-align: middle;
        }
      }
    }
  }

  .log-card {
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

    .log-container {
      max-height: 400px;
      overflow-y: auto;
      font-family: 'Courier New', 'Consolas', monospace;
      font-size: 13px;
      background-color: $bg-color-light;
      border: 1px solid $border-color-light;
      border-radius: $border-radius-md;
      padding: $spacing-md;

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

      .log-item {
        display: grid;
        grid-template-columns: 180px 100px 1fr;
        gap: $spacing-md;
        padding: $spacing-sm $spacing-md;
        margin-bottom: $spacing-xs;
        border-radius: $border-radius-sm;
        border-left: 3px solid transparent;
        transition: $transition-fast;
        background-color: $bg-color-light;

        &:hover {
          background-color: $bg-color-base;
        }

        &.log-item-info {
          border-left-color: $color-primary;
          background-color: rgba(64, 158, 255, 0.05);
        }

        &.log-item-warn {
          border-left-color: $color-warning;
          background-color: rgba(230, 162, 60, 0.05);
        }

        &.log-item-error {
          border-left-color: $color-danger;
          background-color: rgba(245, 108, 108, 0.05);
        }

        .log-time {
          display: flex;
          align-items: center;
          gap: $spacing-xs;
          color: $text-color-secondary;
          font-size: 12px;
          white-space: nowrap;
        }

        .log-level {
          display: flex;
          align-items: center;
          gap: $spacing-xs;
          font-weight: 600;
          white-space: nowrap;

          .level-icon {
            font-size: 14px;
          }

          &.log-level-info {
            color: $color-primary;
          }

          &.log-level-warn {
            color: $color-warning;
          }

          &.log-level-error {
            color: $color-danger;
          }
        }

        .log-message {
          color: $text-color-regular;
          word-break: break-word;
        }
      }
    }
  }
}

// 响应式设计
@media (max-width: 768px) {
  .super-admin-monitor-container {
    padding: $spacing-md;

    .stats-row {
      .stat-card {
        .stat-content {
          flex-direction: column;
          text-align: center;

          .stat-icon {
            width: 48px;
            height: 48px;
          }
        }
      }
    }

    .log-card {
      .log-container {
        .log-item {
          grid-template-columns: 1fr;
          gap: $spacing-xs;

          .log-time,
          .log-level {
            font-size: 11px;
          }
        }
      }
    }
  }
}
</style>
