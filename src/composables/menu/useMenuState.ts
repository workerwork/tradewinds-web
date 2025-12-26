import { computed } from 'vue'
import { storeToRefs } from 'pinia'
import { useMenuStore } from '@/stores/menu'
import { logger } from '@/utils'

/**
 * 菜单状态管理 Composable
 * 统一管理菜单相关的状态计算
 */
export function useMenuState() {
    try {
        const menuStore = useMenuStore()
        const { menus, loading } = storeToRefs(menuStore)

        // 是否有菜单
        const hasMenus = computed(() => {
            try {
                return Array.isArray(menus.value) && menus.value.length > 0
            } catch (error: unknown) {
                logger.error('useMenuState - hasMenus 计算错误', error, 'MenuState')
                return false
            }
        })

        // 菜单状态：loading | empty | ready
        const menuState = computed<'loading' | 'empty' | 'ready'>(() => {
            try {
                if (loading.value) return 'loading'
                if (!hasMenus.value) return 'empty'
                return 'ready'
            } catch (error: unknown) {
                logger.error('useMenuState - menuState 计算错误', error, 'MenuState')
                return 'empty'
            }
        })

        return {
            menus,
            loading,
            hasMenus,
            menuState
        }
    } catch (error: unknown) {
        logger.error('useMenuState - 初始化错误', error, 'MenuState')
        // 返回默认值，避免组件崩溃
        return {
            menus: computed(() => []),
            loading: computed(() => false),
            hasMenus: computed(() => false),
            menuState: computed(() => 'empty' as const)
        }
    }
}

