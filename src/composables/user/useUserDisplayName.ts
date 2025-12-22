import { computed } from 'vue'
import { storeToRefs } from 'pinia'
import { useUserStore } from '@/stores/user'

/**
 * 用户显示名称 Composable
 * 统一处理用户名称的显示逻辑
 */
export function useUserDisplayName() {
    const userStore = useUserStore()
    const { userInfo } = storeToRefs(userStore)

    const userDisplayName = computed(() => {
        if (!userInfo.value) return '管理员'

        const user = userInfo.value as any

        // 按优先级查找名称字段
        const nameFields = [
            user.realName,
            user.real_name,
            user.username,
            user.user_name,
            user.name,
            user.roles?.[0]?.name,
            user.nickname,
            user.displayName,
            user.display_name
        ]

        for (const name of nameFields) {
            if (name && typeof name === 'string' && name.trim()) {
                return name.trim()
            }
        }

        return '管理员'
    })

    return {
        userDisplayName
    }
}

