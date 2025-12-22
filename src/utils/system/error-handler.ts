import { App } from 'vue'
import { ElMessage } from 'element-plus'
import { Router } from 'vue-router'
import { useUserStore } from '@/stores/user'

interface ErrorWithCode extends Error {
    code?: string | number
    config?: any
    request?: any
    response?: any
}

class ErrorHandler {
    private static instance: ErrorHandler
    private router?: Router

    private constructor() { }

    public static getInstance(): ErrorHandler {
        if (!ErrorHandler.instance) {
            ErrorHandler.instance = new ErrorHandler()
        }
        return ErrorHandler.instance
    }

    // 初始化依赖
    public initializeDependencies(router: Router) {
        this.router = router
    }

    // 检查是否为组件卸载相关错误
    private isComponentUnmountError(err: Error, info: string): boolean {
        const errorMessage = err.message.toLowerCase()
        const errorStack = err.stack?.toLowerCase() || ''

        // 检查常见的组件卸载错误
        const unmountErrorPatterns = [
            'cannot read properties of null',
            'reading \'ce\'',
            'renderSlot',
            'onScopeDispose',
            'effect scope',
            'component is unmounted'
        ]

        return unmountErrorPatterns.some(pattern =>
            errorMessage.includes(pattern) ||
            errorStack.includes(pattern) ||
            info.toLowerCase().includes(pattern)
        )
    }

    // 处理 Vue 组件错误
    public handleComponentError(err: Error, instance: any, info: string) {
        // 检查是否为组件卸载相关错误
        if (this.isComponentUnmountError(err, info)) {
            // 静默处理组件卸载错误，不显示给用户
            console.warn('组件卸载相关错误（已静默处理）:', {
                error: err.message,
                info,
                componentName: instance?.$options?.name
            })
            return
        }

        console.error('Component Error:', {
            error: err,
            instance,
            info
        })

        // 在开发环境显示详细错误
        if (import.meta.env.DEV) {
            ElMessage.error(`组件错误: ${err.message}\n${info}`)
        } else {
            ElMessage.error('应用发生错误，请刷新页面重试')
        }

        // 记录错误日志
        this.logError('component', err, {
            componentName: instance?.$options?.name,
            info
        })
    }

    // 检查是否为 WebSocket 连接错误（Vite 开发服务器相关，可忽略）
    private isWebSocketError(err: Error | ErrorWithCode): boolean {
        const errorMessage = err.message?.toLowerCase() || ''
        const errorStack = err.stack?.toLowerCase() || ''

        return errorMessage.includes('websocket') ||
            errorMessage.includes('ws://') ||
            errorMessage.includes('wss://') ||
            errorMessage.includes('web socket') ||
            errorStack.includes('websocket') ||
            errorStack.includes('client:454') ||
            errorStack.includes('client:802')
    }

    // 处理 Promise 错误
    public handlePromiseError(err: ErrorWithCode) {
        // 过滤 WebSocket 连接错误（Vite 开发服务器相关）
        if (this.isWebSocketError(err)) {
            // 在开发环境下静默处理，不显示错误提示
            if (import.meta.env.DEV) {
                return
            }
        }

        console.error('Unhandled Promise Rejection:', err)

        // 处理特定类型的错误
        if (err.code === 'ECONNABORTED') {
            ElMessage.error('请求超时，请检查网络连接')
        } else if (err.response?.status === 401) {
            this.handleAuthError()
        } else {
            ElMessage.error(err.message || '操作失败')
        }

        // 记录错误日志
        this.logError('promise', err)
    }

    // 处理认证错误
    private handleAuthError() {
        if (!this.router) {
            console.error('Router not initialized')
            return
        }

        ElMessage.error('登录已过期，请重新登录')
        const userStore = useUserStore()
        userStore.logout()
        this.router.push('/login')
    }

    // 记录错误日志
    private logError(type: string, error: Error, context?: any) {
        const errorLog = {
            type,
            timestamp: new Date().toISOString(),
            message: error.message,
            stack: error.stack,
            context,
            userAgent: navigator.userAgent,
            url: window.location.href
        }

        // 在这里可以将错误日志发送到服务器
        if (import.meta.env.PROD) {
            // TODO: 实现错误日志上报
            console.log('Error log:', errorLog)
        }
    }

    // 注册全局错误处理器
    public registerGlobalErrorHandlers(app: App) {
        // Vue 错误处理
        app.config.errorHandler = (err, instance, info) => {
            this.handleComponentError(err as Error, instance, info)
        }

        // Promise 错误处理
        window.addEventListener('unhandledrejection', (event) => {
            // 过滤 WebSocket 连接错误
            if (this.isWebSocketError(event.reason)) {
                // 在开发环境下静默处理
                if (import.meta.env.DEV) {
                    event.preventDefault()
                    return
                }
            }
            this.handlePromiseError(event.reason)
        })

        // 全局错误处理
        window.onerror = (message, source, lineno, colno, error) => {
            // 过滤 WebSocket 连接错误
            const errorObj = error || new Error(message as string)
            if (this.isWebSocketError(errorObj)) {
                // 在开发环境下静默处理
                if (import.meta.env.DEV) {
                    return true
                }
            }

            console.error('Global Error:', {
                message,
                source,
                lineno,
                colno,
                error
            })

            this.logError('global', errorObj, {
                source,
                lineno,
                colno
            })

            return false
        }
    }
}

export const errorHandler = ErrorHandler.getInstance()

// Vue 插件形式
export const installErrorHandler = {
    install(app: App, { router }: { router: Router }) {
        errorHandler.initializeDependencies(router)
        errorHandler.registerGlobalErrorHandlers(app)
    }
} 