import { ref, reactive } from 'vue';
import { ElMessage } from 'element-plus';
import type { FormInstance, FormRules } from 'element-plus';
import { authAPI } from '@/api/auth';

/**
 * 修改密码弹窗 Composable
 * 管理密码修改逻辑
 */
export function usePasswordDialog() {
  const passwordDialogVisible = ref(false);
  const changingPassword = ref(false);
  const passwordFormRef = ref<FormInstance>();

  const passwordForm = reactive({
    oldPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const passwordRules: FormRules = {
    oldPassword: [{ required: true, message: '请输入原密码', trigger: 'blur' }],
    newPassword: [
      { required: true, message: '请输入新密码', trigger: 'blur' },
      { min: 6, message: '密码长度不能少于6位', trigger: 'blur' },
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
        trigger: 'blur',
      },
    ],
  };

  const showPasswordDialog = () => {
    Object.assign(passwordForm, {
      oldPassword: '',
      newPassword: '',
      confirmPassword: '',
    });
    passwordDialogVisible.value = true;
  };

  const changePassword = async () => {
    if (!passwordFormRef.value) return;

    try {
      await passwordFormRef.value.validate();
      changingPassword.value = true;

      await authAPI.changePassword({
        oldPassword: passwordForm.oldPassword,
        newPassword: passwordForm.newPassword,
      });

      ElMessage.success('密码修改成功');

      Object.assign(passwordForm, {
        oldPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
    } catch (error) {
      ElMessage.error('修改密码失败，请检查原密码是否正确');
    } finally {
      changingPassword.value = false;
    }
  };

  return {
    passwordDialogVisible,
    changingPassword,
    passwordFormRef,
    passwordForm,
    passwordRules,
    showPasswordDialog,
    changePassword,
  };
}
