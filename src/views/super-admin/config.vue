<template>
  <div class="super-admin-config-container" v-loading="loading" element-loading-text="加载配置数据中...">
    <el-card class="page-header">
      <div class="header-content">
        <div class="header-text">
          <h2 class="page-title">
            <el-icon class="title-icon"><Setting /></el-icon>
            系统配置
          </h2>
          <p class="page-description">管理系统全局配置参数</p>
        </div>
        <div class="header-actions">
          <el-button :icon="Refresh" circle @click="loadConfig" :loading="loading" />
        </div>
      </div>
    </el-card>

    <el-card class="config-card" shadow="hover">
      <el-tabs v-model="activeTab" class="config-tabs">
        <el-tab-pane label="基础配置" name="basic">
          <template #label>
            <span class="tab-label">
              <el-icon><Document /></el-icon>
              基础配置
            </span>
          </template>
          <el-form :model="basicConfig" :rules="basicRules" ref="basicFormRef" label-width="140px" class="config-form">
            <el-form-item label="系统名称" prop="systemName">
              <el-input v-model="basicConfig.systemName" placeholder="请输入系统名称" clearable />
            </el-form-item>
            <el-form-item label="系统版本" prop="systemVersion">
              <el-input v-model="basicConfig.systemVersion" placeholder="请输入系统版本" clearable />
            </el-form-item>
            <el-form-item label="系统描述" prop="systemDescription">
              <el-input 
                type="textarea" 
                v-model="basicConfig.systemDescription" 
                :rows="4" 
                placeholder="请输入系统描述"
                maxlength="500"
                show-word-limit
              />
            </el-form-item>
            <el-form-item label="维护模式" prop="maintenanceMode">
              <el-switch v-model="basicConfig.maintenanceMode" />
              <span class="form-tip">启用后，系统将进入维护模式，普通用户无法访问</span>
            </el-form-item>
          </el-form>
        </el-tab-pane>

        <el-tab-pane label="安全配置" name="security">
          <template #label>
            <span class="tab-label">
              <el-icon><Lock /></el-icon>
              安全配置
            </span>
          </template>
          <el-form :model="securityConfig" :rules="securityRules" ref="securityFormRef" label-width="140px" class="config-form">
            <el-form-item label="登录失败次数限制" prop="maxLoginAttempts">
              <el-input-number 
                v-model="securityConfig.maxLoginAttempts" 
                :min="1" 
                :max="10" 
                :step="1"
                style="width: 100%"
              />
              <span class="form-tip">达到限制次数后，账户将被临时锁定</span>
            </el-form-item>
            <el-form-item label="会话超时时间(分钟)" prop="sessionTimeout">
              <el-input-number 
                v-model="securityConfig.sessionTimeout" 
                :min="5" 
                :max="1440" 
                :step="5"
                style="width: 100%"
              />
              <span class="form-tip">用户无操作超过此时间，会话将自动过期</span>
            </el-form-item>
            <el-form-item label="强制HTTPS" prop="forceHttps">
              <el-switch v-model="securityConfig.forceHttps" />
              <span class="form-tip">启用后，所有HTTP请求将重定向到HTTPS</span>
            </el-form-item>
            <el-form-item label="双因子认证" prop="twoFactorAuth">
              <el-switch v-model="securityConfig.twoFactorAuth" />
              <span class="form-tip">启用后，用户登录需要额外的身份验证</span>
            </el-form-item>
            <el-form-item label="密码最小长度" prop="minPasswordLength">
              <el-input-number 
                v-model="securityConfig.minPasswordLength" 
                :min="6" 
                :max="32" 
                :step="1"
                style="width: 100%"
              />
              <span class="form-tip">用户密码必须达到此长度要求</span>
            </el-form-item>
          </el-form>
        </el-tab-pane>

        <el-tab-pane label="邮件配置" name="email">
          <template #label>
            <span class="tab-label">
              <el-icon><Message /></el-icon>
              邮件配置
            </span>
          </template>
          <el-form :model="emailConfig" :rules="emailRules" ref="emailFormRef" label-width="140px" class="config-form">
            <el-form-item label="SMTP服务器" prop="smtpHost">
              <el-input v-model="emailConfig.smtpHost" placeholder="例如: smtp.example.com" clearable />
            </el-form-item>
            <el-form-item label="SMTP端口" prop="smtpPort">
              <el-input-number 
                v-model="emailConfig.smtpPort" 
                :min="1" 
                :max="65535" 
                :step="1"
                style="width: 100%"
              />
              <span class="form-tip">常用端口: 25(非加密), 587(TLS), 465(SSL)</span>
            </el-form-item>
            <el-form-item label="发件人邮箱" prop="fromEmail">
              <el-input v-model="emailConfig.fromEmail" placeholder="例如: noreply@example.com" clearable />
            </el-form-item>
            <el-form-item label="邮箱密码" prop="emailPassword">
              <el-input 
                type="password" 
                v-model="emailConfig.emailPassword" 
                placeholder="请输入邮箱密码或授权码"
                show-password 
                clearable
              />
            </el-form-item>
            <el-form-item label="启用SSL" prop="enableSsl">
              <el-switch v-model="emailConfig.enableSsl" />
              <span class="form-tip">启用SSL加密连接</span>
            </el-form-item>
          </el-form>
        </el-tab-pane>

        <el-tab-pane label="存储配置" name="storage">
          <template #label>
            <span class="tab-label">
              <el-icon><FolderOpened /></el-icon>
              存储配置
            </span>
          </template>
          <el-form :model="storageConfig" :rules="storageRules" ref="storageFormRef" label-width="140px" class="config-form">
            <el-form-item label="文件上传大小限制(MB)" prop="maxFileSize">
              <el-input-number 
                v-model="storageConfig.maxFileSize" 
                :min="1" 
                :max="1024" 
                :step="10"
                style="width: 100%"
              />
              <span class="form-tip">单个文件的最大上传大小</span>
            </el-form-item>
            <el-form-item label="允许上传的文件类型" prop="allowedFileTypes">
              <el-input 
                v-model="storageConfig.allowedFileTypes" 
                placeholder="例如: jpg,png,pdf,doc,docx"
                clearable
              />
              <span class="form-tip">多个类型用逗号分隔</span>
            </el-form-item>
            <el-form-item label="存储路径" prop="storagePath">
              <el-input v-model="storageConfig.storagePath" placeholder="例如: /uploads" clearable />
              <span class="form-tip">文件存储的服务器路径</span>
            </el-form-item>
            <el-form-item label="启用云存储" prop="enableCloudStorage">
              <el-switch v-model="storageConfig.enableCloudStorage" />
              <span class="form-tip">启用后，文件将上传到云存储服务</span>
            </el-form-item>
          </el-form>
        </el-tab-pane>
      </el-tabs>

      <div class="config-actions">
        <el-button type="primary" :icon="Check" @click="saveConfig" :loading="saving">
          保存配置
        </el-button>
        <el-button :icon="RefreshLeft" @click="resetConfig">重置</el-button>
        <el-button type="success" :icon="Download" @click="exportConfig">导出配置</el-button>
        <el-button type="warning" :icon="Upload" @click="importConfig">导入配置</el-button>
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { ElMessage, ElMessageBox, type FormInstance, type FormRules } from 'element-plus';
import { 
  Setting, Refresh, Check, RefreshLeft, Download, Upload, 
  Document, Lock, Message, FolderOpened
} from '@element-plus/icons-vue';
import { useSuperAdminAccess } from '@/composables';

// 类型定义
interface BasicConfig {
  systemName: string;
  systemVersion: string;
  systemDescription: string;
  maintenanceMode: boolean;
}

interface SecurityConfig {
  maxLoginAttempts: number;
  sessionTimeout: number;
  forceHttps: boolean;
  twoFactorAuth: boolean;
  minPasswordLength: number;
}

interface EmailConfig {
  smtpHost: string;
  smtpPort: number;
  fromEmail: string;
  emailPassword: string;
  enableSsl: boolean;
}

interface StorageConfig {
  maxFileSize: number;
  allowedFileTypes: string;
  storagePath: string;
  enableCloudStorage: boolean;
}

// 使用权限检查 composable
const { checkAccess, executeWithPermission } = useSuperAdminAccess();

const loading = ref(false);
const saving = ref(false);
const activeTab = ref('basic');

const basicFormRef = ref<FormInstance>();
const securityFormRef = ref<FormInstance>();
const emailFormRef = ref<FormInstance>();
const storageFormRef = ref<FormInstance>();

// 默认配置
const defaultBasicConfig: BasicConfig = {
  systemName: '管理系统',
  systemVersion: '1.0.0',
  systemDescription: '企业级管理系统',
  maintenanceMode: false
};

const defaultSecurityConfig: SecurityConfig = {
  maxLoginAttempts: 5,
  sessionTimeout: 30,
  forceHttps: true,
  twoFactorAuth: false,
  minPasswordLength: 8
};

const defaultEmailConfig: EmailConfig = {
  smtpHost: 'smtp.example.com',
  smtpPort: 587,
  fromEmail: 'noreply@example.com',
  emailPassword: '',
  enableSsl: true
};

const defaultStorageConfig: StorageConfig = {
  maxFileSize: 10,
  allowedFileTypes: 'jpg,png,gif,pdf,doc,docx,xls,xlsx',
  storagePath: '/uploads',
  enableCloudStorage: false
};

const basicConfig = ref<BasicConfig>({ ...defaultBasicConfig });
const securityConfig = ref<SecurityConfig>({ ...defaultSecurityConfig });
const emailConfig = ref<EmailConfig>({ ...defaultEmailConfig });
const storageConfig = ref<StorageConfig>({ ...defaultStorageConfig });

// 表单验证规则
const basicRules: FormRules = {
  systemName: [
    { required: true, message: '请输入系统名称', trigger: 'blur' },
    { min: 2, max: 50, message: '长度在 2 到 50 个字符', trigger: 'blur' }
  ],
  systemVersion: [
    { required: true, message: '请输入系统版本', trigger: 'blur' },
    { pattern: /^\d+\.\d+\.\d+$/, message: '版本格式不正确，例如: 1.0.0', trigger: 'blur' }
  ]
};

const securityRules: FormRules = {
  maxLoginAttempts: [
    { required: true, message: '请输入登录失败次数限制', trigger: 'blur' },
    { type: 'number', min: 1, max: 10, message: '范围在 1 到 10 之间', trigger: 'blur' }
  ],
  sessionTimeout: [
    { required: true, message: '请输入会话超时时间', trigger: 'blur' },
    { type: 'number', min: 5, max: 1440, message: '范围在 5 到 1440 分钟之间', trigger: 'blur' }
  ],
  minPasswordLength: [
    { required: true, message: '请输入密码最小长度', trigger: 'blur' },
    { type: 'number', min: 6, max: 32, message: '范围在 6 到 32 之间', trigger: 'blur' }
  ]
};

const emailRules: FormRules = {
  smtpHost: [
    { required: true, message: '请输入SMTP服务器地址', trigger: 'blur' }
  ],
  smtpPort: [
    { required: true, message: '请输入SMTP端口', trigger: 'blur' },
    { type: 'number', min: 1, max: 65535, message: '端口范围在 1 到 65535 之间', trigger: 'blur' }
  ],
  fromEmail: [
    { required: true, message: '请输入发件人邮箱', trigger: 'blur' },
    { type: 'email', message: '请输入正确的邮箱地址', trigger: 'blur' }
  ]
};

const storageRules: FormRules = {
  maxFileSize: [
    { required: true, message: '请输入文件上传大小限制', trigger: 'blur' },
    { type: 'number', min: 1, max: 1024, message: '范围在 1 到 1024 MB 之间', trigger: 'blur' }
  ],
  allowedFileTypes: [
    { required: true, message: '请输入允许上传的文件类型', trigger: 'blur' }
  ],
  storagePath: [
    { required: true, message: '请输入存储路径', trigger: 'blur' }
  ]
};

// 获取当前表单引用
const getCurrentFormRef = (): FormInstance | undefined => {
  switch (activeTab.value) {
    case 'basic':
      return basicFormRef.value;
    case 'security':
      return securityFormRef.value;
    case 'email':
      return emailFormRef.value;
    case 'storage':
      return storageFormRef.value;
    default:
      return undefined;
  }
};

// 加载配置
const loadConfig = async () => {
  await executeWithPermission(async () => {
    loading.value = true;
    try {
      // 这里可以调用实际的API
      // const response = await getSystemConfig();
      // basicConfig.value = response.basicConfig;
      // securityConfig.value = response.securityConfig;
      // emailConfig.value = response.emailConfig;
      // storageConfig.value = response.storageConfig;
      
      // 模拟API调用
      await new Promise(resolve => setTimeout(resolve, 500));
      ElMessage.success('配置加载成功');
    } finally {
      loading.value = false;
    }
  }, '加载配置失败');
};

// 保存配置
const saveConfig = async () => {
  const formRef = getCurrentFormRef();
  if (formRef) {
    await formRef.validate(async (valid) => {
      if (valid) {
        await executeWithPermission(async () => {
          saving.value = true;
          try {
            // 这里可以调用实际的API
            // await saveSystemConfig({
            //   basic: basicConfig.value,
            //   security: securityConfig.value,
            //   email: emailConfig.value,
            //   storage: storageConfig.value
            // });
            
            // 模拟保存过程
            await new Promise(resolve => setTimeout(resolve, 1000));
            ElMessage.success('配置保存成功');
          } finally {
            saving.value = false;
          }
        }, '保存配置失败');
      } else {
        ElMessage.warning('请检查表单输入是否正确');
      }
    });
  } else {
    // 如果没有表单验证，直接保存
    await executeWithPermission(async () => {
      saving.value = true;
      try {
        await new Promise(resolve => setTimeout(resolve, 1000));
        ElMessage.success('配置保存成功');
      } finally {
        saving.value = false;
      }
    }, '保存配置失败');
  }
};

// 重置配置
const resetConfig = async () => {
  try {
    await ElMessageBox.confirm(
      '确定要重置当前标签页的配置吗？此操作将恢复为默认值。',
      '确认重置',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    );

    switch (activeTab.value) {
      case 'basic':
        basicConfig.value = { ...defaultBasicConfig };
        basicFormRef.value?.resetFields();
        break;
      case 'security':
        securityConfig.value = { ...defaultSecurityConfig };
        securityFormRef.value?.resetFields();
        break;
      case 'email':
        emailConfig.value = { ...defaultEmailConfig };
        emailFormRef.value?.resetFields();
        break;
      case 'storage':
        storageConfig.value = { ...defaultStorageConfig };
        storageFormRef.value?.resetFields();
        break;
    }
    ElMessage.success('配置已重置为默认值');
  } catch {
    // 用户取消
  }
};

// 导出配置
const exportConfig = async () => {
  await executeWithPermission(async () => {
    const allConfig = {
      basic: basicConfig.value,
      security: securityConfig.value,
      email: emailConfig.value,
      storage: storageConfig.value
    };
    
    // 创建下载链接
    const dataStr = JSON.stringify(allConfig, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `system-config-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    ElMessage.success('配置导出成功');
  }, '导出配置失败');
};

// 导入配置
const importConfig = async () => {
  await executeWithPermission(async () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = async (e: Event) => {
      const target = e.target as HTMLInputElement;
      const file = target.files?.[0];
      if (!file) return;

      try {
        const text = await file.text();
        const config = JSON.parse(text);
        
        if (config.basic) basicConfig.value = config.basic;
        if (config.security) securityConfig.value = config.security;
        if (config.email) emailConfig.value = config.email;
        if (config.storage) storageConfig.value = config.storage;
        
        ElMessage.success('配置导入成功');
      } catch (error: unknown) {
        ElMessage.error((error as { message?: string })?.message || '配置文件格式错误');
      }
    };
    input.click();
  }, '导入配置失败');
};

onMounted(() => {
  // 权限检查
  if (!checkAccess()) {
    return;
  }
  
  // 加载初始配置
  loadConfig();
});
</script>

<style scoped lang="scss">
@import '@/styles/variables.scss';

.super-admin-config-container {
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

  .config-card {
    transition: $transition-base;

    &:hover {
      box-shadow: $shadow-lg;
    }

    .config-tabs {
      margin-bottom: $spacing-xl;

      :deep(.el-tabs__header) {
        margin-bottom: $spacing-xl;
      }

      :deep(.el-tabs__item) {
        font-size: 15px;
        font-weight: 500;
        padding: 0 $spacing-lg;

        .tab-label {
          display: flex;
          align-items: center;
          gap: $spacing-xs;
        }
      }

      :deep(.el-tabs__active-bar) {
        height: 3px;
      }

      :deep(.el-tab-pane) {
        padding: $spacing-xl 0;
      }
    }

    .config-form {
      max-width: 800px;

      .form-tip {
        margin-left: $spacing-md;
        font-size: 12px;
        color: $text-color-secondary;
      }

      :deep(.el-form-item) {
        margin-bottom: $spacing-xl;
      }

      :deep(.el-input-number) {
        width: 100%;
      }

      :deep(.el-switch) {
        margin-right: $spacing-sm;
      }
    }

    .config-actions {
      display: flex;
      justify-content: center;
      align-items: center;
      gap: $spacing-md;
      padding: $spacing-xl;
      border-top: 1px solid $border-color-light;
      margin-top: $spacing-xl;
      flex-wrap: wrap;

      .el-button {
        min-width: 120px;
      }
    }
  }
}

// 响应式设计
@media (max-width: 768px) {
  .super-admin-config-container {
    padding: $spacing-md;

    .config-card {
      .config-form {
        :deep(.el-form-item) {
          .form-tip {
            display: block;
            margin-left: 0;
            margin-top: $spacing-xs;
          }
        }
      }

      .config-actions {
        flex-direction: column;

        .el-button {
          width: 100%;
          min-width: auto;
        }
      }
    }
  }
}
</style> 