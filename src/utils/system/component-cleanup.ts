import { App, ComponentInternalInstance, getCurrentInstance } from 'vue'
import { logger } from '@/utils'

/**
 * 组件清理管理器
 * 用于安全地处理组件卸载时的清理工作
 */
class ComponentCleanupManager {
    private static instance: ComponentCleanupManager
    private cleanupTasks = new Map<ComponentInternalInstance, (() => void)[]>()

    private constructor() { }

    public static getInstance(): ComponentCleanupManager {
        if (!ComponentCleanupManager.instance) {
            ComponentCleanupManager.instance = new ComponentCleanupManager()
        }
        return ComponentCleanupManager.instance
    }

    /**
     * 注册组件的清理任务
     */
    public registerCleanup(instance: ComponentInternalInstance, cleanupFn: () => void) {
        if (!this.cleanupTasks.has(instance)) {
            this.cleanupTasks.set(instance, [])
        }
        this.cleanupTasks.get(instance)!.push(cleanupFn)
    }

    /**
     * 执行组件的清理任务
     */
    public cleanup(instance: ComponentInternalInstance) {
        const tasks = this.cleanupTasks.get(instance)
        if (tasks) {
            tasks.forEach(task => {
                try {
                    task()
                } catch (error: unknown) {
                    logger.warn('组件清理任务执行失败', error, 'ComponentCleanup')
                }
            })
            this.cleanupTasks.delete(instance)
        }
    }

    /**
     * 清理所有任务
     */
    public clear() {
        this.cleanupTasks.clear()
    }
}

export const componentCleanupManager = ComponentCleanupManager.getInstance()

/**
 * Vue 插件：自动处理组件清理
 */
export const installComponentCleanup = {
    install(app: App) {
        // 监听组件卸载
        app.config.globalProperties.$cleanup = (cleanupFn: () => void) => {
            const instance = getCurrentInstance()
            if (instance) {
                componentCleanupManager.registerCleanup(instance, cleanupFn)
            }
        }

        // 在组件卸载时自动清理
        const originalUnmount = app.config.globalProperties.$options?.beforeUnmount
        app.config.globalProperties.$options = {
            ...app.config.globalProperties.$options,
            beforeUnmount() {
                const instance = getCurrentInstance()
                if (instance) {
                    componentCleanupManager.cleanup(instance)
                }
                if (originalUnmount) {
                    originalUnmount.call(this)
                }
            }
        }
    }
}

/**
 * 安全的异步操作包装器
 */
export function createSafeAsync<T extends any[], R>(
    asyncFn: (...args: T) => Promise<R>
) {
    return async (...args: T): Promise<R | null> => {
        const instance = getCurrentInstance()
        if (!instance) {
            logger.warn('在组件上下文外调用异步函数', undefined, 'ComponentCleanup')
            return null
        }

        try {
            const result = await asyncFn(...args)

            // 检查组件是否仍然挂载
            if (instance.isUnmounted?.()) {
                logger.warn('组件在异步操作完成后已卸载', undefined, 'ComponentCleanup')
                return null
            }

            return result
        } catch (error) {
            // 只有在组件仍然挂载时才抛出错误
            if (!instance.isUnmounted?.()) {
                throw error
            }
            logger.warn('组件在异步操作出错时已卸载', error, 'ComponentCleanup')
            return null
        }
    }
}

/**
 * 安全的响应式数据设置器
 */
export function createSafeSetter<T>(ref: { value: T }) {
    return (value: T) => {
        const instance = getCurrentInstance()
        if (instance && !instance.isUnmounted?.()) {
            ref.value = value
        }
    }
} 