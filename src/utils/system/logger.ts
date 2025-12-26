interface LogData {
    level: 'info' | 'warn' | 'error';
    message: string;
    timestamp: number;
    data?: unknown;
    category?: string;
}

class Logger {
    private maxLogSize: number = 100;
    private logs: LogData[] = [];
    private reportUrl?: string;

    constructor(reportUrl?: string) {
        this.reportUrl = reportUrl;
        this.setupErrorListener();
    }

    /**
     * 检查是否为 WebSocket 连接错误（Vite 开发服务器相关，可忽略）
     */
    private isWebSocketError(error: unknown): boolean {
        if (!error || typeof error !== 'object') return false;

        const err = error as { message?: string; stack?: string; reason?: { message?: string } };
        const errorMessage = err?.message?.toLowerCase() || '';
        const errorStack = err?.stack?.toLowerCase() || '';
        const reasonMessage = err?.reason?.message?.toLowerCase() || '';

        return errorMessage.includes('websocket') ||
            errorMessage.includes('ws://') ||
            errorMessage.includes('wss://') ||
            errorMessage.includes('web socket') ||
            errorStack.includes('websocket') ||
            errorStack.includes('client:454') ||
            errorStack.includes('client:802') ||
            reasonMessage.includes('websocket');
    }

    /**
     * 设置错误监听
     */
    private setupErrorListener() {
        window.addEventListener('error', (event) => {
            // 过滤 WebSocket 连接错误
            if (this.isWebSocketError(event.error)) {
                // 在开发环境下静默处理
                if (import.meta.env.DEV) {
                    return
                }
            }

            this.error('全局错误', {
                message: event.message,
                filename: event.filename,
                lineno: event.lineno,
                colno: event.colno,
                error: event.error
            });
        });

        window.addEventListener('unhandledrejection', (event) => {
            // 过滤 WebSocket 连接错误
            if (this.isWebSocketError(event.reason)) {
                // 在开发环境下静默处理
                if (import.meta.env.DEV) {
                    return
                }
            }

            this.error('未处理的Promise拒绝', {
                reason: event.reason
            });
        });
    }

    /**
     * 记录信息日志
     */
    info(message: string, data?: unknown, category?: string) {
        this.addLog({
            level: 'info',
            message,
            timestamp: Date.now(),
            data,
            category
        });
    }

    /**
     * 记录警告日志
     */
    warn(message: string, data?: unknown, category?: string) {
        this.addLog({
            level: 'warn',
            message,
            timestamp: Date.now(),
            data,
            category
        });
    }

    /**
     * 记录错误日志
     */
    error(message: string, data?: unknown, category?: string) {
        const logData: LogData = {
            level: 'error',
            message,
            timestamp: Date.now(),
            data,
            category
        };

        this.addLog(logData);
        this.reportError(logData);
    }

    /**
     * 添加日志
     */
    private addLog(log: LogData) {
        this.logs.push(log);
        if (this.logs.length > this.maxLogSize) {
            this.logs.shift();
        }

        // 在开发环境下打印日志（生产环境不打印，减少性能开销）
        if (import.meta.env.DEV) {
            const logMethod = log.level === 'error' ? console.error :
                log.level === 'warn' ? console.warn :
                    console.log;
            // 只在开发环境打印，避免生产环境的性能开销
            logMethod(`[${log.category || 'General'}] ${log.message}`, log.data);
        }
    }

    /**
     * 上报错误
     */
    private async reportError(log: LogData) {
        if (!this.reportUrl) return;

        try {
            await fetch(this.reportUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(log)
            });
        } catch (error) {
            // 只在开发环境打印错误，生产环境静默处理
            if (import.meta.env.DEV) {
                console.error('Error reporting failed:', error);
            }
        }
    }

    /**
     * 获取所有日志
     */
    getLogs(level?: 'info' | 'warn' | 'error', category?: string) {
        return this.logs.filter(log => {
            if (level && log.level !== level) return false;
            if (category && log.category !== category) return false;
            return true;
        });
    }

    /**
     * 清除日志
     */
    clearLogs() {
        this.logs = [];
    }
}

export { Logger };
export const logger = new Logger(import.meta.env.VITE_LOG_REPORT_URL); 