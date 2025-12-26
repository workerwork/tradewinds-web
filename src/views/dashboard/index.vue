<template>
  <div class="dashboard">
    <div class="page-header">
      <h2>系统概览</h2>
    </div>

    <!-- 调试信息卡片（来自overview.vue） -->
    <el-card v-if="showDebugInfo" class="debug-info">
      <template #header>
        <span>用户状态调试信息</span>
        <el-button style="float: right" @click="refreshDebugInfo">刷新</el-button>
      </template>
      <el-descriptions :column="2" border>
        <el-descriptions-item label="Token状态">
          <el-tag :type="userStore.token ? 'success' : 'danger'">
            {{ userStore.token ? '有效' : '无效' }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="Token值">
          {{ userStore.token ? '***' + userStore.token.slice(-10) : '无' }}
        </el-descriptions-item>
        <el-descriptions-item label="用户信息">
          <el-tag :type="userStore.userInfo ? 'success' : 'danger'">
            {{ userStore.userInfo ? '已加载' : '未加载' }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="用户名">
          {{ userStore.userInfo?.username || '无' }}
        </el-descriptions-item>
        <el-descriptions-item label="角色数量">
          {{ userStore.roles.length }}
        </el-descriptions-item>
        <el-descriptions-item label="角色列表">
          {{ userStore.roles.join(', ') || '无' }}
        </el-descriptions-item>
        <el-descriptions-item label="权限数量">
          {{ userStore.permissions.length }}
        </el-descriptions-item>
        <el-descriptions-item label="LocalStorage Token">
          {{ localStorageToken ? '存在' : '不存在' }}
        </el-descriptions-item>
      </el-descriptions>
      <div style="margin-top: 20px">
        <el-button type="warning" @click="testTokenClear">测试清除Token</el-button>
        <el-button type="info" @click="testUserInfo">测试获取用户信息</el-button>
      </div>
    </el-card>

    <!-- 原有统计卡片和布局 -->
    <el-row :gutter="20">
      <el-col :span="6">
        <el-card class="data-card">
          <template #header>
            <div class="card-header">
              <span>客户总数</span>
              <el-tag type="info">本月</el-tag>
            </div>
          </template>
          <div class="card-content">
            <div class="number">128</div>
            <div class="trend">
              <span class="label">较上月</span>
              <span class="value up">+12%</span>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="data-card">
          <template #header>
            <div class="card-header">
              <span>订单总数</span>
              <el-tag type="info">本月</el-tag>
            </div>
          </template>
          <div class="card-content">
            <div class="number">56</div>
            <div class="trend">
              <span class="label">较上月</span>
              <span class="value up">+8%</span>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="data-card">
          <template #header>
            <div class="card-header">
              <span>销售额</span>
              <el-tag type="info">本月</el-tag>
            </div>
          </template>
          <div class="card-content">
            <div class="number">$286,420</div>
            <div class="trend">
              <span class="label">较上月</span>
              <span class="value up">+15%</span>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="data-card">
          <template #header>
            <div class="card-header">
              <span>报价转化率</span>
              <el-tag type="info">本月</el-tag>
            </div>
          </template>
          <div class="card-content">
            <div class="number">32%</div>
            <div class="trend">
              <span class="label">较上月</span>
              <span class="value down">-2%</span>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 图表区域（来自overview.vue） -->
    <el-row :gutter="20" style="margin-top: 20px">
      <el-col :span="12">
        <el-card>
          <template #header>
            <span>用户增长趋势</span>
          </template>
          <div
            style="
              height: 300px;
              display: flex;
              align-items: center;
              justify-content: center;
              color: #999;
            "
          >
            图表区域（需要集成图表库）
          </div>
        </el-card>
      </el-col>
      <el-col :span="12">
        <el-card>
          <template #header>
            <span>销售统计</span>
          </template>
          <div
            style="
              height: 300px;
              display: flex;
              align-items: center;
              justify-content: center;
              color: #999;
            "
          >
            图表区域（需要集成图表库）
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { ElMessage } from 'element-plus';
import { useUserStore } from '@/stores/user';

const userStore = useUserStore();

// 是否显示调试信息（仅开发环境）
const showDebugInfo = computed(() => import.meta.env.DEV);

// localStorage中的token
const localStorageToken = ref('');

// 刷新调试信息
const refreshDebugInfo = () => {
  localStorageToken.value = localStorage.getItem('token') || '';
  ElMessage.info('调试信息已刷新');
};

// 测试清除Token
const testTokenClear = () => {
  userStore.clearUserState();
  refreshDebugInfo();
  ElMessage.warning('用户状态已清除');
};

// 测试获取用户信息
const testUserInfo = async () => {
  try {
    await userStore.getUserInfo();
    refreshDebugInfo();
    ElMessage.success('用户信息获取成功');
  } catch (error) {
    ElMessage.error('用户信息获取失败：' + (error as Error).message);
  }
};

onMounted(() => {
  if (showDebugInfo.value) {
    refreshDebugInfo();
  }
});
</script>

<style scoped lang="scss">
.dashboard {
  padding: 20px;
}

.page-header {
  margin-bottom: 20px;
}

.debug-info {
  margin-bottom: 20px;
  border: 2px solid #e6a23c;
  :deep(.el-card__header) {
    background-color: #fdf6ec;
    color: #e6a23c;
  }
}

.data-card {
  margin-bottom: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-content {
  text-align: center;
  padding: 20px 0;
}

.number {
  font-size: 24px;
  font-weight: bold;
  margin-bottom: 10px;
}

.trend {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 8px;
}

.trend .label {
  color: #909399;
}

.trend .value {
  font-weight: bold;
}

.trend .value.up {
  color: #67c23a;
}

.trend .value.down {
  color: #f56c6c;
}

.charts-row {
  margin-top: 20px;
}

.chart-card {
  margin-bottom: 20px;
}

.chart-container {
  height: 300px;
}
</style>
