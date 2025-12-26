<template>
  <div class="login-container">
    <div class="login-box">
      <div class="login-header">
        <img src="@/assets/logo.svg" alt="Logo" class="logo" />
        <h2>系统登录</h2>
      </div>
      <el-form
        ref="loginFormRef"
        :model="loginForm"
        :rules="loginRules"
        class="login-form"
        size="large"
      >
        <el-form-item prop="username">
          <el-input
            v-model="loginForm.username"
            placeholder="用户名"
            :prefix-icon="User"
            clearable
            @keyup.enter="handleLogin"
          />
        </el-form-item>
        <el-form-item prop="password">
          <el-input
            v-model="loginForm.password"
            placeholder="密码"
            :prefix-icon="Lock"
            :type="showPassword ? 'text' : 'password'"
            clearable
            @keyup.enter="handleLogin"
          >
            <template #suffix>
              <el-icon
                class="cursor-pointer"
                @click="showPassword = !showPassword"
              >
                <component :is="showPassword ? View : Hide" />
              </el-icon>
            </template>
          </el-input>
        </el-form-item>
        <el-form-item class="login-options">
          <el-checkbox v-model="loginForm.remember">记住我</el-checkbox>
          <el-link type="primary" underline="never">忘记密码？</el-link>
        </el-form-item>
        <el-form-item>
          <el-button
            type="primary"
            class="login-button"
            :loading="loading"
            @click="handleLogin"
          >
            {{ loading ? '登录中...' : '登录' }}
          </el-button>
        </el-form-item>
      </el-form>
      <div class="login-footer">
        <p>测试账号：admin / admin123</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// 定义组件名称，用于 keep-alive 排除
defineOptions({
  name: 'Login'
});
import { ref, reactive } from 'vue';
import { useRouter } from 'vue-router';
import { ElMessage } from 'element-plus';
import { User, Lock, View, Hide } from '@element-plus/icons-vue';
import type { FormInstance } from 'element-plus';
import { useUserStore } from '@/stores/user';
import { authAPI } from '@/api/auth';
import { useErrorHandler } from '@/composables';
import { logger } from '@/utils';
import { DEBUG } from '@/config';

const router = useRouter();
const userStore = useUserStore();
const { handleApiError } = useErrorHandler();
const loginFormRef = ref<FormInstance>();
const loading = ref(false);
const showPassword = ref(false);

const loginForm = reactive({
  username: '',
  password: '',
  remember: false
});

const loginRules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 3, max: 20, message: '用户名长度应在 3 到 20 个字符之间', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, max: 20, message: '密码长度应在 6 到 20 个字符之间', trigger: 'blur' }
  ]
};

const handleLogin = async () => {
  if (!loginFormRef.value) return;
  
  try {
    await loginFormRef.value.validate();
    loading.value = true;
    
    if (DEBUG) {
      logger.info('开始登录', { username: loginForm.username }, 'Login');
    }

    // 使用userStore.login方法，确保用户信息被正确设置
    await userStore.login(loginForm.username.trim(), loginForm.password);

    // 如果选择记住我，可以在这里处理
    if (loginForm.remember) {
      localStorage.setItem('remember_username', loginForm.username);
    } else {
      localStorage.removeItem('remember_username');
    }

    ElMessage.success('登录成功');
    
    // 跳转到 dashboard
    router.push('/dashboard').catch(() => {
      // 如果跳转失败，尝试跳转到根路径
      router.push('/');
    });
  } catch (error: unknown) {
    handleApiError(error, '登录失败，请重试', 'Login');
  } finally {
    loading.value = false;
  }
};

// 初始化记住的用户名
const initRememberUsername = () => {
  const rememberedUsername = localStorage.getItem('remember_username');
  if (rememberedUsername) {
    loginForm.username = rememberedUsername;
    loginForm.remember = true;
  }
};

initRememberUsername();
</script>

<style scoped lang="scss">
.login-container {
  min-height: 100vh;
  width: 100vw;
  display: flex;
  justify-content: center;
  align-items: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  animation: bgMove 10s linear infinite alternate;
}

@keyframes bgMove {
  0% { background-position: 0 0; }
  100% { background-position: 100% 100%; }
}

.login-box {
  width: 100%;
  max-width: 420px;
  padding: 2.5rem 2rem 2rem 2rem;
  background: rgba(255, 255, 255, 0.98);
  border-radius: 18px;
  box-shadow: 0 8px 32px rgba(102, 126, 234, 0.18);
  transition: box-shadow 0.3s;
  position: relative;
}

.login-header {
  text-align: center;
  margin-bottom: 2rem;

  .logo {
    width: 80px;
    height: 80px;
    margin-bottom: 1rem;
    border-radius: 16px;
    box-shadow: 0 2px 8px rgba(102, 126, 234, 0.12);
  }

  h2 {
    font-size: 2rem;
    color: #333;
    margin: 0;
    font-weight: 700;
    letter-spacing: 2px;
  }
  .subtitle {
    color: #888;
    font-size: 1rem;
    margin-top: 0.5rem;
  }
}

.login-form {
  :deep(.el-input) {
    --el-input-hover-border-color: #667eea;
    --el-input-focus-border-color: #667eea;
    font-size: 1.1rem;
  }

  .login-options {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1rem;

    .el-link {
      font-size: 0.95rem;
      color: #667eea;
      transition: text-decoration 0.2s;
      &:hover {
        text-decoration: underline;
      }
    }
  }

  .login-button {
    width: 100%;
    padding: 0.85rem;
    font-size: 1.1rem;
    background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
    border: none;
    color: #fff;
    border-radius: 8px;
    transition: background 0.2s, box-shadow 0.2s;
    box-shadow: 0 2px 8px rgba(102, 126, 234, 0.10);
    &:hover, &:focus {
      background: linear-gradient(90deg, #5a67d8 0%, #6b47b6 100%);
      box-shadow: 0 4px 16px rgba(102, 126, 234, 0.18);
    }
  }
}

.login-footer {
  text-align: center;
  margin-top: 2rem;
  color: #aaa;
  font-size: 0.95rem;
  letter-spacing: 1px;
}

@media (max-width: 600px) {
  .login-box {
    max-width: 98vw;
    padding: 1.2rem 0.5rem 1rem 0.5rem;
  }
  .login-header .logo {
    width: 60px;
    height: 60px;
  }
  .login-header h2 {
    font-size: 1.3rem;
  }
}
</style> 