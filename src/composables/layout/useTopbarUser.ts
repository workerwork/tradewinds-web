import { computed } from 'vue';
import { storeToRefs } from 'pinia';
import { useUserStore } from '@/stores/user';
import { useUserDisplayName } from '../user/useUserDisplayName';

/**
 * 顶栏用户信息 Composable
 * 管理用户信息显示和头像相关逻辑
 */
export function useTopbarUser() {
  const userStore = useUserStore();
  const { userInfo } = storeToRefs(userStore);
  const { userDisplayName } = useUserDisplayName();

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

  return {
    userInfo,
    userDisplayName,
    getCurrentRoleName,
    getUserInitials,
  };
}
