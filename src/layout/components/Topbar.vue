<template>
  <div class="topbar" :style="{ background: 'var(--theme-topbar)' }">
    <div class="left">
      <el-icon class="collapse-btn" @click="toggleSidebar">
        <component :is="isCollapse ? 'Expand' : 'Fold'" />
      </el-icon>
      <h1 class="system-title">{{ t('system.title') }}</h1>
    </div>

    <!-- 系统公告 -->
    <div class="announcement-container">
      <el-icon class="announcement-icon"><Bell /></el-icon>
      <el-carousel
        class="announcement-carousel"
        height="32px"
        direction="vertical"
        :autoplay="true"
        :interval="3000"
        indicator-position="none"
      >
        <el-carousel-item v-for="(notice, index) in systemNotices" :key="index">
          <div class="notice-item">
            <el-tag size="small" :type="notice.type" class="notice-tag">{{ t(`notice.${notice.tag}`) }}</el-tag>
            <span class="notice-text">{{ t(`notice.${notice.content}`) }}</span>
          </div>
        </el-carousel-item>
      </el-carousel>
    </div>

    <div class="topbar-right">
      <!-- 移除单独的主题色设置按钮，只保留系统设置按钮 -->
      <slot />
      <!-- 全屏按钮 -->
      <el-tooltip :content="isFullscreen ? '退出全屏' : '全屏'" placement="bottom">
        <el-button 
          class="fullscreen-btn" 
          circle 
          text
          @click="toggleFullscreen"
        >
          <el-icon>
            <component :is="isFullscreen ? 'CloseBold' : 'FullScreen'" />
          </el-icon>
        </el-button>
      </el-tooltip>

      <!-- 用户信息 -->
      <div class="user-info">
        <el-dropdown trigger="click" @command="handleCommand">
          <div class="user-profile">
            <el-avatar 
              :size="36" 
              :src="userInfo?.avatar" 
              class="user-avatar"
            >
              <span class="avatar-initials">{{ getUserInitials }}</span>
            </el-avatar>
            <div class="user-text">
              <div class="username">{{ getUserDisplayName() }}</div>
              <div class="user-role">{{ getCurrentRoleName() }}</div>
            </div>
            <el-icon class="dropdown-icon"><CaretBottom /></el-icon>
          </div>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item command="profile">
                <el-icon><UserFilled /></el-icon>
                <span>{{ t('system.profile') }}</span>
              </el-dropdown-item>
              <el-dropdown-item command="settings">
                <el-icon><Setting /></el-icon>
                <span>{{ t('system.settings') }}</span>
              </el-dropdown-item>
              <el-dropdown-item command="password">
                <el-icon><Lock /></el-icon>
                <span>修改密码</span>
              </el-dropdown-item>
              <el-dropdown-item divided command="logout">
                <el-icon><SwitchButton /></el-icon>
                <span>{{ t('system.logout') }}</span>
              </el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </div>
    </div>

    <!-- 个人资料弹窗 -->
    <el-dialog
      v-model="profileDialogVisible"
      title="个人资料"
      width="500px"
      :before-close="handleProfileClose"
    >
      <el-form
        ref="profileFormRef"
        :model="profileForm"
        :rules="profileRules"
        label-width="80px"
      >
        <div class="avatar-section">
          <el-upload
            class="avatar-uploader"
            action="#"
            :show-file-list="false"
            :before-upload="beforeAvatarUpload"
            :http-request="handleAvatarUpload"
          >
            <el-avatar :size="100" :src="profileForm.avatar" class="avatar-display">
              <el-icon v-if="!profileForm.avatar"><User /></el-icon>
            </el-avatar>
            <div class="avatar-text">点击上传头像</div>
          </el-upload>
        </div>

        <el-form-item label="用户名" prop="username">
          <el-input v-model="profileForm.username" disabled />
        </el-form-item>
        <el-form-item label="真实姓名" prop="realName">
          <el-input v-model="profileForm.realName" />
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="profileForm.email" />
        </el-form-item>
        <el-form-item label="电话" prop="phone">
          <el-input v-model="profileForm.phone" />
        </el-form-item>
        <el-form-item label="角色">
          <el-tag
            v-for="role in userInfo?.roles"
            :key="String(role.id ?? role.name ?? '')"
            type="primary"
            class="role-tag"
          >
            {{ role.name }}
          </el-tag>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="profileDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="saveProfile" :loading="saving">保存</el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 修改密码弹窗 -->
    <el-dialog
      v-model="passwordDialogVisible"
      title="修改密码"
      width="400px"
    >
      <el-form
        ref="passwordFormRef"
        :model="passwordForm"
        :rules="passwordRules"
        label-width="80px"
      >
        <el-form-item label="原密码" prop="oldPassword">
          <el-input 
            v-model="passwordForm.oldPassword" 
            type="password" 
            show-password
            placeholder="请输入原密码"
          />
        </el-form-item>
        <el-form-item label="新密码" prop="newPassword">
          <el-input 
            v-model="passwordForm.newPassword" 
            type="password" 
            show-password
            placeholder="请输入新密码"
          />
        </el-form-item>
        <el-form-item label="确认密码" prop="confirmPassword">
          <el-input 
            v-model="passwordForm.confirmPassword" 
            type="password" 
            show-password
            placeholder="请再次输入新密码"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="passwordDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="changePassword" :loading="changingPassword">确认</el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 系统设置弹窗 -->
    <el-dialog
      v-model="settingsDialogVisible"
      title="系统设置"
      width="600px"
    >
      <el-tabs v-model="activeTab">
        <el-tab-pane label="界面设置" name="interface">
          <el-form label-width="120px">
            <el-form-item label="顶栏颜色">
              <el-color-picker v-model="topbarColor" @change="changeTopbarColor" :predefine="predefineTopbarColors" />
              <el-button size="small" style="margin-left: 12px;" @click="resetTopbarColor">还原</el-button>
            </el-form-item>
            <el-form-item label="侧边栏颜色">
              <el-color-picker v-model="sidebarColor" @change="changeSidebarColor" :predefine="predefineSidebarColors" />
              <el-button size="small" style="margin-left: 12px;" @click="resetSidebarColor">还原</el-button>
            </el-form-item>
            <el-form-item label="语言">
              <el-select v-model="settings.language" @change="onLanguageChange">
                <el-option label="简体中文" value="zh-CN" />
                <el-option label="English" value="en" />
              </el-select>
            </el-form-item>
            <el-form-item label="侧边栏">
              <el-switch 
                v-model="settings.sidebarCollapsed"
                active-text="折叠"
                inactive-text="展开"
              />
            </el-form-item>
          </el-form>
        </el-tab-pane>
        <el-tab-pane label="通知设置" name="notification">
          <el-form label-width="120px">
            <el-form-item label="系统消息">
              <el-switch v-model="settings.systemNotification" />
            </el-form-item>
            <el-form-item label="邮件通知">
              <el-switch v-model="settings.emailNotification" />
            </el-form-item>
            <el-form-item label="声音提示">
              <el-switch v-model="settings.soundNotification" />
            </el-form-item>
          </el-form>
        </el-tab-pane>
      </el-tabs>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="settingsDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="saveSettings" :loading="savingSettings">保存设置</el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 主题色设置弹窗 -->
    <el-dialog v-model="themeDialogVisible" title="主题色设置" width="350px" append-to-body>
      <el-form label-width="80px">
        <el-form-item label="顶栏颜色">
          <el-color-picker v-model="topbarColor" @change="changeTopbarColor" :predefine="predefineTopbarColors" />
        </el-form-item>
        <el-form-item label="侧边栏颜色">
          <el-color-picker v-model="sidebarColor" @change="changeSidebarColor" :predefine="predefineSidebarColors" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="resetThemeColors">还原默认</el-button>
        <el-button type="primary" @click="themeDialogVisible = false">关闭</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, reactive, nextTick, onMounted, onUnmounted, watch } from 'vue';
import { storeToRefs } from 'pinia';
import { useI18n } from 'vue-i18n';
import { 
  User, 
  UserFilled,
  Setting,
  SwitchButton, 
  Expand, 
  Fold,
  Bell,
  CaretBottom,
  Lock,
  FullScreen,
  CloseBold,
  Plus
} from '@element-plus/icons-vue';
import { useUserStore } from '@/stores/user';
import { useRouter } from 'vue-router';
import { ElMessageBox, ElMessage } from 'element-plus';
import type { FormInstance, FormRules, UploadProps } from 'element-plus';
import { authAPI } from '@/api/auth';
import { updateProfile } from '@/api/system/user';
import { emitter } from '@/utils/emitter';
import { useAppStore } from '@/stores/app';
import notifySound from '@/assets/notify.mp3'; // 如无此文件请自行添加

const props = defineProps<{
  isCollapse: boolean;
}>();

const emit = defineEmits<{
  (e: 'update:isCollapse', value: boolean): void;
}>();

const router = useRouter();
const userStore = useUserStore();
const { userInfo } = storeToRefs(userStore);
const { t, locale } = useI18n();
const appStore = useAppStore();
const themeDialogVisible = ref(false);
const topbarColor = ref(appStore.topbarColor);
const sidebarColor = ref(appStore.sidebarColor);
const predefineTopbarColors = ['#409eff', '#667eea', '#764ba2', '#ff9800', '#13c2c2', '#f5222d'];
const predefineSidebarColors = ['#1f2937', '#2d3a4b', '#22313f', '#34495e', '#3a3f51', '#23272e'];
const changeTopbarColor = (val: string) => {
  appStore.setTopbarColor(val);
};
const changeSidebarColor = (val: string) => {
  appStore.setSidebarColor(val);
};
const resetThemeColors = () => {
  appStore.resetThemeColors();
  topbarColor.value = appStore.topbarColor;
  sidebarColor.value = appStore.sidebarColor;
};

const resetTopbarColor = () => {
  appStore.setTopbarColor('#111111');
  topbarColor.value = appStore.topbarColor;
};
const resetSidebarColor = () => {
  appStore.setSidebarColor('#1f2937');
  sidebarColor.value = appStore.sidebarColor;
};

// 获取用户显示名称
const getUserDisplayName = () => {
  console.log('Topbar - getUserDisplayName 调用:', {
    userInfo存在: !!userInfo.value,
    完整userInfo: userInfo.value
  });
  
  if (!userInfo.value) {
    console.log('Topbar - 用户信息为空，返回默认名称');
    return t('user.admin');
  }
  
  // 将用户信息转换为any类型以访问可能的字段
  const user = userInfo.value as any;
  
  // 优先使用登录用户名，而不是真实姓名
  const possibleNames = [
    user.username,
    user.user_name,
    user.name,
    user.realName,
    user.real_name,
    user.nickname,
    user.displayName,
    user.display_name
  ];
  
  console.log('Topbar - 可能的名称字段 (优先显示用户名):', {
    username: user.username,
    user_name: user.user_name,
    name: user.name,
    realName: user.realName,
    real_name: user.real_name,
    nickname: user.nickname,
    displayName: user.displayName,
    display_name: user.display_name,
    所有字段: possibleNames
  });
  
  // 返回第一个非空的名称
  for (const name of possibleNames) {
    if (name && typeof name === 'string' && name.trim()) {
      console.log('Topbar - 找到有效名称:', name.trim());
      return name.trim();
    }
  }
  
  console.log('Topbar - 没有找到有效名称，返回默认名称');
  return t('user.admin');
};

const currentLanguage = computed(() => locale.value);

// 全屏状态
const isFullscreen = ref(false);

// 弹窗状态
const profileDialogVisible = ref(false);
const passwordDialogVisible = ref(false);
const settingsDialogVisible = ref(false);
const saving = ref(false);
const changingPassword = ref(false);
const savingSettings = ref(false);

// 设置选项卡
const activeTab = ref('interface');

// 表单引用
const profileFormRef = ref<FormInstance>();
const passwordFormRef = ref<FormInstance>();

// 个人资料表单
const profileForm = reactive({
  username: '',
  realName: '',
  email: '',
  phone: '',
  avatar: ''
});

// 密码表单
const passwordForm = reactive({
  oldPassword: '',
  newPassword: '',
  confirmPassword: ''
});

// 系统设置
const settings = reactive({
  primaryColor: currentLanguage.value === 'zh-CN' ? '#409EFF' : '#667eea', // 默认中文主题色
  language: currentLanguage.value,
  sidebarCollapsed: props.isCollapse,
  systemNotification: true,
  emailNotification: true,
  soundNotification: false
});

// 监听侧边栏状态变化，同步到设置
watch(() => props.isCollapse, (newValue) => {
  settings.sidebarCollapsed = newValue;
});

// 监听系统消息开关，模拟轮询/推送
watch(() => settings.systemNotification, (val) => {
  if (val) {
    startSystemNotification();
  } else {
    stopSystemNotification();
  }
});

let notificationTimer: number | null = null;
function startSystemNotification() {
  // 模拟每10秒收到一条新消息
  stopSystemNotification();
  notificationTimer = window.setInterval(() => {
    onNewMessage({ content: '新系统消息', time: new Date().toLocaleTimeString() });
  }, 10000);
}
function stopSystemNotification() {
  if (notificationTimer) {
    clearInterval(notificationTimer);
    notificationTimer = null;
  }
}

function onNewMessage(msg: { content: string, time: string }) {
  // 这里可集成实际消息通知逻辑
  if (settings.soundNotification) {
    // 播放提示音
    const audio = new Audio(notifySound);
    audio.play();
  }
  // 可在此处弹窗/气泡/更新消息列表等
  ElMessage.info(`收到新消息: ${msg.content}`);
}

// 表单验证规则
const profileRules: FormRules = {
  realName: [
    { required: true, message: '请输入真实姓名', trigger: 'blur' }
  ],
  email: [
    { required: true, message: '请输入邮箱', trigger: 'blur' },
    { type: 'email', message: '请输入正确的邮箱格式', trigger: 'blur' }
  ],
  phone: [
    { required: true, message: '请输入电话号码', trigger: 'blur' },
    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号码', trigger: 'blur' }
  ]
};

const passwordRules: FormRules = {
  oldPassword: [
    { required: true, message: '请输入原密码', trigger: 'blur' }
  ],
  newPassword: [
    { required: true, message: '请输入新密码', trigger: 'blur' },
    { min: 6, message: '密码长度不能少于6位', trigger: 'blur' }
  ],
  confirmPassword: [
    { required: true, message: '请确认新密码', trigger: 'blur' },
    {
      validator: (rule, value, callback) => {
        if (value !== passwordForm.newPassword) {
          callback(new Error('两次输入的密码不一致'));
        } else {
          callback();
        }
      },
      trigger: 'blur'
    }
  ]
};

// 系统公告数据
const systemNotices = ref([
  { 
    type: 'success' as const,
    tag: 'update',
    content: 'updateContent'
  },
  { 
    type: 'warning' as const,
    tag: 'maintenance',
    content: 'maintenanceContent'
  },
  { 
    type: 'info' as const,
    tag: 'tip',
    content: 'tipContent'
  }
]);

// 获取当前角色名称
const getCurrentRoleName = () => {
  if (!userInfo.value?.roles || userInfo.value.roles.length === 0) {
    return '普通用户';
  }
  return userInfo.value.roles[0].name || '用户';
};

// 获取用户姓名缩写作为头像fallback
const getUserInitials = computed(() => {
  const name = userInfo.value?.realName || userInfo.value?.username || 'U';
  if (name.length === 1) return name.toUpperCase();
  if (name.length >= 2) {
    // 如果是中文名，取前两个字符
    if (/[\u4e00-\u9fa5]/.test(name)) {
      return name.slice(0, 2);
    }
    // 如果是英文名，取首字母
    const words = name.split(' ');
    if (words.length >= 2) {
      return (words[0].charAt(0) + words[1].charAt(0)).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  }
  return 'U';
});

// 切换侧边栏
const toggleSidebar = () => {
  emit('update:isCollapse', !props.isCollapse);
};

// 切换全屏
const toggleFullscreen = () => {
  if (!document.fullscreenElement) {
    document.documentElement.requestFullscreen();
    isFullscreen.value = true;
  } else {
    document.exitFullscreen();
    isFullscreen.value = false;
  }
};

// 处理下拉菜单命令
const handleCommand = (command: string) => {
  switch (command) {
    case 'profile':
      showProfile();
      break;
    case 'settings':
      showSettings();
      break;
    case 'password':
      showPasswordDialog();
      break;
    case 'logout':
      handleLogout();
      break;
  }
};

// 显示个人资料
const showProfile = () => {
  if (userInfo.value) {
    Object.assign(profileForm, {
      username: userInfo.value.username,
      realName: userInfo.value.realName,
      email: userInfo.value.email,
      phone: userInfo.value.phone,
      avatar: userInfo.value.avatar
    });
  }
  profileDialogVisible.value = true;
};

// 显示设置
const showSettings = () => {
  // 同步当前设置
  settings.language = currentLanguage.value;
  settingsDialogVisible.value = true;
};

// 显示修改密码弹窗
const showPasswordDialog = () => {
  Object.assign(passwordForm, {
    oldPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  passwordDialogVisible.value = true;
};

// 头像上传前验证
const beforeAvatarUpload: UploadProps['beforeUpload'] = (rawFile) => {
  if (!['image/jpeg', 'image/png', 'image/gif'].includes(rawFile.type)) {
    ElMessage.error('头像只能是 JPG、PNG、GIF 格式!');
    return false;
  }
  if (rawFile.size / 1024 / 1024 > 2) {
    ElMessage.error('头像大小不能超过 2MB!');
    return false;
  }
  return true;
};

// 处理头像上传
const handleAvatarUpload = (options: any): Promise<void> => {
  return new Promise((resolve) => {
    // 这里应该调用上传API，暂时模拟
    const reader = new FileReader();
    reader.onload = (e) => {
      profileForm.avatar = e.target?.result as string;
      resolve();
    };
    reader.readAsDataURL(options.file);
  });
};

// 保存个人资料
const saveProfile = async () => {
  if (!profileFormRef.value) return;
  
  try {
    await profileFormRef.value.validate();
    saving.value = true;
    
    // 调用API更新用户信息
    const updatedUser = await updateProfile({
      realName: profileForm.realName,
      email: profileForm.email,
      phone: profileForm.phone,
      avatar: profileForm.avatar
    });
    
    // 更新本地用户信息
    if (userInfo.value && typeof updatedUser !== 'undefined') {
      let userData: any = updatedUser;
      if (updatedUser && typeof updatedUser === 'object' && updatedUser !== null && 'data' in updatedUser) {
        userData = (updatedUser as any).data;
      }
      if (userData && typeof userData === 'object' && userData !== null) {
        Object.assign(userInfo.value, {
          realName: userData.realName ?? userInfo.value.realName,
          email: userData.email ?? userInfo.value.email,
          phone: userData.phone ?? userInfo.value.phone,
          avatar: userData.avatar ?? userInfo.value.avatar
        });
      }
    }
    // 强制刷新用户信息，确保本地数据与后端一致
    await userStore.getUserInfo();
    emitter.emit('user-profile-updated');
    
    ElMessage.success('个人资料更新成功');
    profileDialogVisible.value = false;
  } catch (error) {
    console.error('保存个人资料失败:', error);
    ElMessage.error('保存失败，请重试');
  } finally {
    saving.value = false;
  }
};

// 修改密码
const changePassword = async () => {
  if (!passwordFormRef.value) return;
  
  try {
    await passwordFormRef.value.validate();
    changingPassword.value = true;
    
    await authAPI.changePassword({
      oldPassword: passwordForm.oldPassword,
      newPassword: passwordForm.newPassword
    });
    
    ElMessage.success('密码修改成功');
    passwordDialogVisible.value = false;
    
    // 重置表单
    Object.assign(passwordForm, {
      oldPassword: '',
      newPassword: '',
      confirmPassword: ''
    });
  } catch (error) {
    console.error('修改密码失败:', error);
    ElMessage.error('修改密码失败，请检查原密码是否正确');
  } finally {
    changingPassword.value = false;
  }
};

// 保存设置
const saveSettings = async () => {
  try {
    savingSettings.value = true;
    // 语言切换
    if (settings.language !== currentLanguage.value) {
      locale.value = settings.language;
      localStorage.setItem('language', settings.language);
      await userStore.getUserInfo();
    }
    // 侧边栏折叠
    if (settings.sidebarCollapsed !== props.isCollapse) {
      emit('update:isCollapse', settings.sidebarCollapsed);
      localStorage.setItem('sidebarCollapsed', settings.sidebarCollapsed.toString());
    }
    // 保存通知设置到本地
    localStorage.setItem('systemNotification', String(settings.systemNotification));
    localStorage.setItem('emailNotification', String(settings.emailNotification));
    localStorage.setItem('soundNotification', String(settings.soundNotification));
    // TODO: 可在此调用后端API保存通知设置
    // await api.saveUserSettings({
    //   systemNotification: settings.systemNotification,
    //   emailNotification: settings.emailNotification,
    //   soundNotification: settings.soundNotification
    // });
    ElMessage.success('设置保存成功');
    settingsDialogVisible.value = false;
  } catch (error) {
    console.error('保存设置失败:', error);
    ElMessage.error('保存设置失败，请重试');
  } finally {
    savingSettings.value = false;
  }
};

// 关闭个人资料弹窗
const handleProfileClose = (done: () => void) => {
  done();
};

// 处理退出登录
const handleLogout = async () => {
  try {
    await ElMessageBox.confirm(t('system.logoutConfirm'), t('system.tip'), {
      confirmButtonText: t('system.confirm'),
      cancelButtonText: t('system.cancel'),
      type: 'warning'
    });
    
    // 等待登出操作完成
    await userStore.logout();
    router.push('/login');
  } catch (error) {
    // 用户取消登出或发生错误
    console.log('登出取消或发生错误:', error);
  }
};

// 监听全屏状态变化
const handleFullscreenChange = () => {
  isFullscreen.value = !!document.fullscreenElement;
};

// 语言切换处理
const onLanguageChange = (val: string) => {
  locale.value = val;
  localStorage.setItem('language', val);
};

// 生命周期
onMounted(() => {
  document.addEventListener('fullscreenchange', handleFullscreenChange);
  
  // 加载保存的设置
  loadSavedSettings();
  appStore.initThemeColors();
  // 加载通知设置
  settings.systemNotification = localStorage.getItem('systemNotification') === 'true';
  settings.emailNotification = localStorage.getItem('emailNotification') === 'true';
  settings.soundNotification = localStorage.getItem('soundNotification') === 'true';
});

onUnmounted(() => {
  document.removeEventListener('fullscreenchange', handleFullscreenChange);
});

// 加载保存的设置
const loadSavedSettings = () => {
  try {
    // 加载侧边栏状态
    const savedSidebarCollapsed = localStorage.getItem('sidebarCollapsed');
    if (savedSidebarCollapsed !== null) {
      const isCollapsed = savedSidebarCollapsed === 'true';
      settings.sidebarCollapsed = isCollapsed;
      
      // 如果保存的状态与当前状态不同，则更新
      if (isCollapsed !== props.isCollapse) {
        emit('update:isCollapse', isCollapsed);
      }
    }
    
    // 加载其他设置
    const savedSettings = localStorage.getItem('appSettings');
    if (savedSettings) {
      const parsedSettings = JSON.parse(savedSettings);
      
      if (parsedSettings.primaryColor) {
        settings.primaryColor = parsedSettings.primaryColor;
      }
      
      if (parsedSettings.systemNotification !== undefined) {
        settings.systemNotification = parsedSettings.systemNotification;
      }
      
      if (parsedSettings.emailNotification !== undefined) {
        settings.emailNotification = parsedSettings.emailNotification;
      }
      
      if (parsedSettings.soundNotification !== undefined) {
        settings.soundNotification = parsedSettings.soundNotification;
      }
    }
    
    console.log('已加载保存的设置:', settings);
  } catch (error) {
    console.error('加载设置失败:', error);
  }
};
</script>

<style scoped>
:root {
  --theme-topbar: #111111;
}

.topbar {
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0;
  background: var(--theme-topbar);
  color: #fff;
  position: relative;
}

.topbar::after {
  content: '';
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  height: 1px;
  background: linear-gradient(90deg, 
    rgba(255, 255, 255, 0.1),
    rgba(255, 255, 255, 0.05) 50%,
    rgba(255, 255, 255, 0)
  );
}

.left {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-left: -24px;
}

.system-title {
  font-size: 20px;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.95);
  margin: 0;
  letter-spacing: 1px;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
  white-space: nowrap;
}

.announcement-container {
  display: flex;
  align-items: center;
  gap: 12px;
  flex: 1;
  max-width: 600px;
  margin: 0 40px;
}

.announcement-icon {
  font-size: 18px;
  color: rgba(255, 255, 255, 0.8);
}

.announcement-carousel {
  flex: 1;
}

.notice-item {
  display: flex;
  align-items: center;
  gap: 8px;
  height: 32px;
}

.notice-tag {
  font-size: 12px;
  padding: 0 6px;
  border-radius: 3px;
}

.notice-text {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.9);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.collapse-btn {
  font-size: 20px;
  cursor: pointer;
  color: rgba(255, 255, 255, 0.7);
  transition: all 0.3s;
  
  &:hover {
    color: #fff;
    transform: scale(1.1);
  }
}

.topbar-right {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-right: -12px;
}

/* 全屏按钮样式 */
.fullscreen-btn {
  color: rgba(255, 255, 255, 0.8);
  transition: all 0.3s ease;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.fullscreen-btn:hover {
  color: #fff;
  transform: scale(1.1);
  background: rgba(255, 255, 255, 0.2);
  border-color: rgba(255, 255, 255, 0.3);
}

.user-info {
  display: flex;
  align-items: center;
  margin-right: -12px;
  position: relative;
}

.user-profile {
  display: flex;
  align-items: center;
  cursor: pointer;
  padding: 4px 10px;
  border-radius: 8px;
  transition: all 0.3s ease;
  border: 1px solid rgba(255, 255, 255, 0.1);
  background: rgba(255, 255, 255, 0.05);
  width: 110px;
}

.user-profile:hover {
  background: rgba(255, 255, 255, 0.15);
  border-color: rgba(255, 255, 255, 0.2);
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
}

.user-avatar {
  background: linear-gradient(135deg, #409EFF, #36A3F7);
  color: white;
  box-shadow: 0 2px 8px rgba(64, 158, 255, 0.3);
  border: 2px solid rgba(255, 255, 255, 0.2);
  overflow: hidden;
  width: 32px;
  height: 32px;
}

.user-avatar .el-icon {
  font-size: 18px;
  color: rgba(255, 255, 255, 0.9);
}

.user-avatar .avatar-initials {
  font-size: 12px;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.95);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.user-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.user-text {
  display: flex;
  flex-direction: column;
  margin: 0 6px;
  flex: 1;
  min-width: 60px;
  text-align: left;
}

.username {
  font-size: 14px;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.95);
  line-height: 1.2;
  margin-bottom: 2px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.user-role {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.7);
  line-height: 1;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.dropdown-icon {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.7);
  transition: transform 0.3s ease;
}

.user-profile:hover .dropdown-icon {
  transform: rotate(180deg);
}

/* 用户下拉菜单容器 */
:deep(.el-popper.is-light) {
  border: none !important;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1),
              0 2px 8px rgba(0, 0, 0, 0.05) !important;
  backdrop-filter: blur(10px) !important;
  -webkit-backdrop-filter: blur(10px) !important;
}

/* 用户下拉菜单 */
:deep(.el-dropdown-menu) {
  padding: 4px 0;
  border: none;
  box-shadow: none;
  width: 110px;
  min-width: auto;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.7);
  border: 1px solid rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
}

:deep(.el-dropdown-menu__item) {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 6px 8px;
  font-size: 13px;
  transition: all 0.2s ease;
  white-space: nowrap;
  text-align: center;
  border-radius: 8px;
  margin: 2px 4px;
  
  .el-icon {
    margin: 0 auto 3px;
    font-size: 15px;
    color: rgba(0, 0, 0, 0.7);
  }
  
  span {
    display: block;
    text-align: center;
    width: 100%;
    color: rgba(0, 0, 0, 0.8);
  }
}

:deep(.el-dropdown-menu__item:hover) {
  background: rgba(64, 158, 255, 0.1);
  color: #409EFF;
  box-shadow: 0 2px 6px rgba(64, 158, 255, 0.15);
  
  .el-icon {
    color: #409EFF;
  }
}

:deep(.el-dropdown-menu__item.is-divided) {
  position: relative;
  border-top: none;
  margin-top: 6px;
  padding-top: 8px;
}

:deep(.el-dropdown-menu__item.is-divided::before) {
  content: '';
  position: absolute;
  top: 0;
  left: 25%;
  right: 25%;
  height: 1px;
  background: rgba(0, 0, 0, 0.08);
  backdrop-filter: blur(4px);
}

:deep(.el-dropdown-menu__item.active) {
  color: #409EFF;
  font-weight: 500;
  background: rgba(64, 158, 255, 0.15);
  box-shadow: 0 2px 6px rgba(64, 158, 255, 0.2);
}

:deep(.el-dropdown-menu__item.active::after) {
  content: '✓';
  position: absolute;
  bottom: 3px;
  font-size: 9px;
  color: #409EFF;
}

.float-right {
  float: right;
  margin-left: auto;
}

/* 弹窗样式 */
.avatar-section {
  display: flex;
  justify-content: center;
  margin-bottom: 20px;
}

.avatar-uploader {
  text-align: center;
}

.avatar-display {
  cursor: pointer;
  border: 2px dashed #dcdfe6;
  border-radius: 50%;
  transition: all 0.3s ease;
  background: linear-gradient(135deg, #f5f7fa, #c3cfe2);
  overflow: hidden;
}

.avatar-display:hover {
  border-color: #409EFF;
  transform: scale(1.05);
}

.avatar-display .el-icon {
  font-size: 40px;
  color: #409EFF;
}

.avatar-display img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.avatar-text {
  margin-top: 8px;
  font-size: 12px;
  color: #666;
}

.role-tag {
  margin-right: 8px;
  margin-bottom: 4px;
}

.dialog-footer {
  text-align: right;
}

.dialog-footer .el-button + .el-button {
  margin-left: 10px;
}

/* 响应式样式 */
@media (max-width: 768px) {
  .user-text {
    display: none;
  }
  
  .user-profile {
    width: auto;
    padding: 4px 6px;
  }
  
  .topbar-right {
    gap: 8px;
  }
  
  .announcement-container {
    margin: 0 20px;
    max-width: 300px;
  }
  
  .system-title {
    font-size: 16px;
  }
  
  :deep(.el-dropdown-menu) {
    width: 90px;
    min-width: auto;
  }
}

@media (max-width: 480px) {
  .announcement-container {
    display: none;
  }
  
  .topbar-right {
    gap: 4px;
  }
  
  .user-profile {
    padding: 3px 5px;
  }
  
  :deep(.el-dropdown-menu) {
    width: 80px;
    min-width: auto;
  }
  
  :deep(.el-dropdown-menu__item) {
    padding: 5px 6px;
    font-size: 12px;
  }
}

/* 深色主题适配 */
:deep(.el-dialog) {
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
}

:deep(.el-dialog__header) {
  padding: 20px 24px 16px;
  border-bottom: 1px solid #f0f0f0;
}

:deep(.el-dialog__body) {
  padding: 24px;
}

:deep(.el-dialog__footer) {
  padding: 16px 24px 20px;
  border-top: 1px solid #f0f0f0;
}

:deep(.el-form-item__label) {
  font-weight: 500;
  color: #333;
}

:deep(.el-tabs__nav-wrap::after) {
  background-color: #e4e7ed;
}

:deep(.el-tabs__active-bar) {
  background-color: #409EFF;
}

:deep(.el-tabs__item.is-active) {
  color: #409EFF;
}

/* 头像上传样式优化 */
:deep(.el-upload) {
  display: block;
}

:deep(.avatar-uploader .el-upload:hover) {
  border-color: #409EFF;
}

:deep(.avatar-uploader-icon) {
  font-size: 28px;
  color: #8c939d;
  width: 100px;
  height: 100px;
  line-height: 100px;
  text-align: center;
  border: 2px dashed #dcdfe6;
  border-radius: 50%;
  cursor: pointer;
  position: relative;
  overflow: hidden;
}

:deep(.avatar-uploader-icon:hover) {
  border-color: #409EFF;
  color: #409EFF;
}

</style> 