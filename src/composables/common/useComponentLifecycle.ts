import { ref, onUnmounted, getCurrentInstance } from 'vue'

/**
 * 安全的组件生命周期管理
 * 用于避免组件卸载时的常见错误
 */
export function useComponentLifecycle() {
    const isComponentMounted = ref(true)
    const instance = getCurrentInstance()

    // 检查组件是否已卸载
    const isUnmounted = () => {
        if (!isComponentMounted.value) return true;
        if (!instance) return true;
        // Vue 3 中，组件实例没有 isUnmounted 方法，使用其他方式判断
        return false;
    }

    // 安全地执行异步操作
    const safeAsync = async <T>(asyncFn: () => Promise<T>): Promise<T | null> => {
        if (isUnmounted()) {
            console.warn('组件已卸载，跳过异步操作')
            return null
        }

        try {
            const result = await asyncFn()
            if (isUnmounted()) {
                console.warn('组件在异步操作完成后已卸载')
                return null
            }
            return result
        } catch (error) {
            if (!isUnmounted()) {
                throw error
            }
            console.warn('组件在异步操作出错时已卸载')
            return null
        }
    }

    // 安全地设置响应式数据
    const safeSet = <T>(ref: { value: T }, value: T) => {
        if (!isUnmounted()) {
            ref.value = value
        }
    }

    // 组件卸载时清理
    onUnmounted(() => {
        isComponentMounted.value = false
    })

    return {
        isComponentMounted,
        isUnmounted,
        safeAsync,
        safeSet
    }
}

/**
 * 安全的对话框管理
 * 用于避免对话框组件卸载时的错误
 */
export function useSafeDialog() {
    const { isUnmounted, safeSet } = useComponentLifecycle()
    const dialogVisible = ref<boolean>(false)

    const showDialog = () => {
        if (!isUnmounted()) {
            dialogVisible.value = true
        }
    }

    const hideDialog = () => {
        if (!isUnmounted()) {
            dialogVisible.value = false
        }
    }

    const toggleDialog = () => {
        if (!isUnmounted()) {
            dialogVisible.value = !dialogVisible.value
        }
    }

    return {
        dialogVisible,
        showDialog,
        hideDialog,
        toggleDialog
    }
} 