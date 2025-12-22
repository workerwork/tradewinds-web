import { ref } from 'vue'

/**
 * Sidebar 抽屉管理 Composable
 * 统一管理侧边栏中的抽屉状态
 */
export function useSidebarDrawers() {
    const notificationDrawerVisible = ref(false)
    const todoDrawerVisible = ref(false)

    const showNotificationDrawer = () => {
        notificationDrawerVisible.value = true
    }

    const showTodoDrawer = () => {
        todoDrawerVisible.value = true
    }

    const closeNotificationDrawer = () => {
        notificationDrawerVisible.value = false
    }

    const closeTodoDrawer = () => {
        todoDrawerVisible.value = false
    }

    return {
        notificationDrawerVisible,
        todoDrawerVisible,
        showNotificationDrawer,
        showTodoDrawer,
        closeNotificationDrawer,
        closeTodoDrawer
    }
}

