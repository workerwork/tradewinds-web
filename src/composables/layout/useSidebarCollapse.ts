import { computed } from 'vue'

/**
 * Sidebar 折叠状态管理 Composable
 */
export function useSidebarCollapse(
    props: { isCollapse: boolean },
    emit: (e: 'update:isCollapse', value: boolean) => void
) {
    const isCollapsed = computed({
        get: () => props.isCollapse,
        set: (value) => emit('update:isCollapse', value)
    })

    const toggleCollapse = () => {
        isCollapsed.value = !isCollapsed.value
    }

    return {
        isCollapsed,
        toggleCollapse
    }
}

