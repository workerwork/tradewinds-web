<template>
  <div class="super-admin-config-container">
    <el-card class="page-header">
      <h2 class="page-title">系统配置</h2>
      <p class="page-description">管理系统全局配置参数</p>
    </el-card>

    <el-tabs v-model="activeTab" class="config-tabs">
      <el-tab-pane label="基础配置" name="basic">
        <el-form :model="basicConfig" label-width="150px">
          <el-form-item label="系统名称">
            <el-input v-model="basicConfig.systemName" />
          </el-form-item>
          <el-form-item label="系统版本">
            <el-input v-model="basicConfig.systemVersion" />
          </el-form-item>
          <el-form-item label="系统描述">
            <el-input type="textarea" v-model="basicConfig.systemDescription" :rows="3" />
          </el-form-item>
          <el-form-item label="维护模式">
            <el-switch v-model="basicConfig.maintenanceMode" />
          </el-form-item>
        </el-form>
      </el-tab-pane>

      <el-tab-pane label="安全配置" name="security">
        <el-form :model="securityConfig" label-width="150px">
          <el-form-item label="登录失败次数限制">
            <el-input-number v-model="securityConfig.maxLoginAttempts" :min="1" :max="10" />
          </el-form-item>
          <el-form-item label="会话超时时间(分钟)">
            <el-input-number v-model="securityConfig.sessionTimeout" :min="5" :max="1440" />
          </el-form-item>
          <el-form-item label="强制HTTPS">
            <el-switch v-model="securityConfig.forceHttps" />
          </el-form-item>
          <el-form-item label="双因子认证">
            <el-switch v-model="securityConfig.twoFactorAuth" />
          </el-form-item>
          <el-form-item label="密码最小长度">
            <el-input-number v-model="securityConfig.minPasswordLength" :min="6" :max="32" />
          </el-form-item>
        </el-form>
      </el-tab-pane>

      <el-tab-pane label="邮件配置" name="email">
        <el-form :model="emailConfig" label-width="150px">
          <el-form-item label="SMTP服务器">
            <el-input v-model="emailConfig.smtpHost" />
          </el-form-item>
          <el-form-item label="SMTP端口">
            <el-input-number v-model="emailConfig.smtpPort" :min="1" :max="65535" />
          </el-form-item>
          <el-form-item label="发件人邮箱">
            <el-input v-model="emailConfig.fromEmail" />
          </el-form-item>
          <el-form-item label="邮箱密码">
            <el-input type="password" v-model="emailConfig.emailPassword" show-password />
          </el-form-item>
          <el-form-item label="启用SSL">
            <el-switch v-model="emailConfig.enableSsl" />
          </el-form-item>
        </el-form>
      </el-tab-pane>

      <el-tab-pane label="存储配置" name="storage">
        <el-form :model="storageConfig" label-width="150px">
          <el-form-item label="文件上传大小限制(MB)">
            <el-input-number v-model="storageConfig.maxFileSize" :min="1" :max="1024" />
          </el-form-item>
          <el-form-item label="允许上传的文件类型">
            <el-input v-model="storageConfig.allowedFileTypes" placeholder="jpg,png,pdf,doc" />
          </el-form-item>
          <el-form-item label="存储路径">
            <el-input v-model="storageConfig.storagePath" />
          </el-form-item>
          <el-form-item label="启用云存储">
            <el-switch v-model="storageConfig.enableCloudStorage" />
          </el-form-item>
        </el-form>
      </el-tab-pane>
    </el-tabs>

    <div class="config-actions">
      <el-button type="primary" @click="saveConfig" :loading="saving">保存配置</el-button>
      <el-button @click="resetConfig">重置</el-button>
      <el-button type="danger" @click="exportConfig">导出配置</el-button>
      <el-button type="warning" @click="importConfig">导入配置</el-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { ElMessage } from 'element-plus';
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

const activeTab = ref('basic');
const saving = ref(false);

const basicConfig = ref({
  systemName: '管理系统',
  systemVersion: '1.0.0',
  systemDescription: '企业级管理系统',
  maintenanceMode: false
});

const securityConfig = ref({
  maxLoginAttempts: 5,
  sessionTimeout: 30,
  forceHttps: true,
  twoFactorAuth: false,
  minPasswordLength: 8
});

const emailConfig = ref({
  smtpHost: 'smtp.example.com',
  smtpPort: 587,
  fromEmail: 'noreply@example.com',
  emailPassword: '',
  enableSsl: true
});

const storageConfig = ref({
  maxFileSize: 10,
  allowedFileTypes: 'jpg,png,gif,pdf,doc,docx,xls,xlsx',
  storagePath: '/uploads',
  enableCloudStorage: false
});

const saveConfig = async () => {
  saving.value = true;
  try {
    // 模拟保存过程
    await new Promise(resolve => setTimeout(resolve, 1000));
    ElMessage.success('配置保存成功');
  } finally {
    saving.value = false;
  }
};

const resetConfig = () => {
  ElMessage.info('配置已重置');
};

const exportConfig = () => {
  ElMessage.success('配置导出成功');
};

const importConfig = () => {
  ElMessage.success('配置导入成功');
};

onMounted(() => {
  // 权限检查
  if (!checkAccess()) {
    return;
  }
});
</script>

<style scoped lang="scss">
.super-admin-config-container {
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

  .config-tabs {
    margin-bottom: 20px;
    
    :deep(.el-tab-pane) {
      padding: 20px 0;
    }
  }

  .config-actions {
    text-align: center;
    padding: 20px;
    border-top: 1px solid #e4e7ed;
    
    .el-button {
      margin: 0 10px;
    }
  }
}
</style> 