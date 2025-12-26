import { ref, reactive } from 'vue';
import { storeToRefs } from 'pinia';
import { useUserStore } from '@/stores/user';
import { ElMessage } from 'element-plus';
import type { FormInstance, FormRules, UploadProps } from 'element-plus';
import { updateProfile } from '@/api/system/user';
import { emitter } from '@/utils';

/**
 * 个人资料弹窗 Composable
 * 管理个人资料的编辑和保存
 */
export function useProfileDialog() {
  const userStore = useUserStore();
  const { userInfo } = storeToRefs(userStore);

  const profileDialogVisible = ref(false);
  const saving = ref(false);
  const profileFormRef = ref<FormInstance>();

  const profileForm = reactive({
    username: '',
    realName: '',
    email: '',
    phone: '',
    avatar: '',
  });

  const profileRules: FormRules = {
    realName: [{ required: true, message: '请输入真实姓名', trigger: 'blur' }],
    email: [
      { required: true, message: '请输入邮箱', trigger: 'blur' },
      { type: 'email', message: '请输入正确的邮箱格式', trigger: 'blur' },
    ],
    phone: [
      { required: true, message: '请输入电话号码', trigger: 'blur' },
      { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号码', trigger: 'blur' },
    ],
  };

  const showProfile = () => {
    if (userInfo.value) {
      Object.assign(profileForm, {
        username: userInfo.value.username,
        realName: userInfo.value.realName,
        email: userInfo.value.email,
        phone: userInfo.value.phone,
        avatar: userInfo.value.avatar,
      });
    }
    profileDialogVisible.value = true;
  };

  const beforeAvatarUpload: UploadProps['beforeUpload'] = rawFile => {
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

  const handleAvatarUpload = (options: any): Promise<void> => {
    return new Promise(resolve => {
      const reader = new FileReader();
      reader.onload = e => {
        profileForm.avatar = e.target?.result as string;
        resolve();
      };
      reader.readAsDataURL(options.file);
    });
  };

  const saveProfile = async () => {
    if (!profileFormRef.value) return;

    try {
      await profileFormRef.value.validate();
      saving.value = true;

      const updatedUser = await updateProfile({
        realName: profileForm.realName,
        email: profileForm.email,
        phone: profileForm.phone,
        avatar: profileForm.avatar,
      });

      if (userInfo.value && typeof updatedUser !== 'undefined') {
        let userData: any = updatedUser;
        if (
          updatedUser &&
          typeof updatedUser === 'object' &&
          updatedUser !== null &&
          'data' in updatedUser
        ) {
          userData = (updatedUser as any).data;
        }
        if (userData && typeof userData === 'object' && userData !== null) {
          Object.assign(userInfo.value, {
            realName: userData.realName ?? userInfo.value.realName,
            email: userData.email ?? userInfo.value.email,
            phone: userData.phone ?? userInfo.value.phone,
            avatar: userData.avatar ?? userInfo.value.avatar,
          });
        }
      }
      await userStore.getUserInfo();
      emitter.emit('user-profile-updated');

      ElMessage.success('个人资料更新成功');
      profileDialogVisible.value = false;
    } catch (error) {
      ElMessage.error('保存失败，请重试');
    } finally {
      saving.value = false;
    }
  };

  return {
    profileDialogVisible,
    saving,
    profileFormRef,
    profileForm,
    profileRules,
    showProfile,
    beforeAvatarUpload,
    handleAvatarUpload,
    saveProfile,
  };
}
