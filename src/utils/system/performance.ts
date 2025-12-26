import { logger } from '@/utils'
import { DEBUG } from '@/config'

interface PerformanceMetrics {
    fcp: number // First Contentful Paint
    lcp: number // Largest Contentful Paint
    fid: number // First Input Delay
    cls: number // Cumulative Layout Shift
    ttfb: number // Time to First Byte
    navigationTiming: any
    resourceTiming: any[]
}

type LayoutShift = PerformanceEntry & {
    hadRecentInput: boolean
    value: number
}

type PerformanceEventTiming = PerformanceEntry & {
    processingStart: number
    startTime: number
}

class PerformanceMonitor {
    private static instance: PerformanceMonitor
    private metrics: Partial<PerformanceMetrics> = {}

    private constructor() {
        this.initObservers()
    }

    public static getInstance(): PerformanceMonitor {
        if (!PerformanceMonitor.instance) {
            PerformanceMonitor.instance = new PerformanceMonitor()
        }
        return PerformanceMonitor.instance
    }

    // 初始化性能观察器
    private initObservers() {
        // FCP 观察器
        this.observeFCP()

        // LCP 观察器
        this.observeLCP()

        // FID 观察器
        this.observeFID()

        // CLS 观察器
        this.observeCLS()

        // 导航时间
        this.captureNavigationTiming()

        // 资源加载时间
        this.captureResourceTiming()
    }

    // 观察首次内容绘制 (FCP)
    private observeFCP() {
        const fcpObserver = new PerformanceObserver((entryList) => {
            const entries = entryList.getEntries()
            if (entries.length > 0) {
                this.metrics.fcp = entries[0].startTime
                this.reportMetric('FCP', this.metrics.fcp)
            }
        })

        fcpObserver.observe({ entryTypes: ['paint'] })
    }

    // 观察最大内容绘制 (LCP)
    private observeLCP() {
        const lcpObserver = new PerformanceObserver((entryList) => {
            const entries = entryList.getEntries()
            const lastEntry = entries[entries.length - 1]
            this.metrics.lcp = lastEntry.startTime
            this.reportMetric('LCP', this.metrics.lcp)
        })

        lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] })
    }

    // 观察首次输入延迟 (FID)
    private observeFID() {
        const fidObserver = new PerformanceObserver((entryList) => {
            const entries = entryList.getEntries()
            if (entries.length > 0) {
                const firstEntry = entries[0] as PerformanceEventTiming
                this.metrics.fid = firstEntry.processingStart - firstEntry.startTime
                this.reportMetric('FID', this.metrics.fid)
            }
        })

        fidObserver.observe({ entryTypes: ['first-input'] })
    }

    // 观察累积布局偏移 (CLS)
    private observeCLS() {
        let clsValue = 0
        let clsEntries: any[] = []
        let lastReportTime = 0
        const REPORT_INTERVAL = 1000 // 每秒最多报告一次

        const clsObserver = new PerformanceObserver((entryList) => {
            for (const entry of entryList.getEntries()) {
                const layoutShift = entry as LayoutShift
                if (!layoutShift.hadRecentInput) {
                    clsValue += layoutShift.value
                    clsEntries.push(entry)
                }
            }

            this.metrics.cls = clsValue

            // 限制报告频率：只在值变化较大或间隔时间足够长时报告
            const now = Date.now()
            const shouldReport =
                now - lastReportTime >= REPORT_INTERVAL || // 间隔时间足够
                clsValue >= 0.1 // CLS值达到警告阈值（0.1是Google推荐的"需要改进"阈值）

            if (shouldReport) {
                this.reportMetric('CLS', clsValue)
                lastReportTime = now
            }
        })

        clsObserver.observe({ entryTypes: ['layout-shift'] })

        // 页面卸载时报告最终CLS值
        window.addEventListener('beforeunload', () => {
            if (this.metrics.cls && this.metrics.cls > 0) {
                this.reportMetric('CLS (Final)', this.metrics.cls)
            }
        })
    }

    // 捕获导航时间
    private captureNavigationTiming() {
        window.addEventListener('load', () => {
            // 使用 requestIdleCallback 优化性能，避免阻塞主线程
            const captureTiming = () => {
                const navigationEntry = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming
                if (!navigationEntry) return;

                this.metrics.navigationTiming = navigationEntry
                this.metrics.ttfb = navigationEntry.responseStart - navigationEntry.requestStart

                // 只打印关键指标，而不是整个对象
                if (DEBUG) {
                    const summary = {
                        dns: navigationEntry.domainLookupEnd - navigationEntry.domainLookupStart,
                        tcp: navigationEntry.connectEnd - navigationEntry.connectStart,
                        request: navigationEntry.responseStart - navigationEntry.requestStart,
                        response: navigationEntry.responseEnd - navigationEntry.responseStart,
                        domProcessing: navigationEntry.domComplete - navigationEntry.domInteractive,
                        load: navigationEntry.loadEventEnd - navigationEntry.loadEventStart,
                        total: navigationEntry.loadEventEnd - navigationEntry.fetchStart
                    }
                    this.reportMetric('Navigation Timing', summary)
                }
            };

            // 优先使用 requestIdleCallback，降级到 setTimeout
            if ('requestIdleCallback' in window) {
                requestIdleCallback(captureTiming, { timeout: 2000 });
            } else {
                setTimeout(captureTiming, 0);
            }
        })
    }

    // 捕获资源加载时间
    private captureResourceTiming() {
        window.addEventListener('load', () => {
            // 使用 requestIdleCallback 优化性能，避免阻塞主线程
            const captureTiming = () => {
                const resourceEntries = performance.getEntriesByType('resource')
                this.metrics.resourceTiming = resourceEntries

                // 只打印摘要信息，避免打印大量对象
                if (DEBUG) {
                    const summary = {
                        total: resourceEntries.length,
                        byType: this.summarizeResourcesByType(resourceEntries),
                        slowest: this.getSlowestResources(resourceEntries, 5)
                    }
                    this.reportMetric('Resource Timing', summary)
                }
            };

            // 优先使用 requestIdleCallback，降级到 setTimeout
            if ('requestIdleCallback' in window) {
                requestIdleCallback(captureTiming, { timeout: 2000 });
            } else {
                setTimeout(captureTiming, 0);
            }
        })
    }

    // 按类型汇总资源
    private summarizeResourcesByType(entries: PerformanceEntry[]): Record<string, number> {
        const summary: Record<string, number> = {}
        entries.forEach(entry => {
            const initiatorType = (entry as PerformanceResourceTiming).initiatorType || 'unknown'
            summary[initiatorType] = (summary[initiatorType] || 0) + 1
        })
        return summary
    }

    // 获取最慢的资源
    private getSlowestResources(entries: PerformanceEntry[], limit: number = 5): Array<{ name: string; duration: number; type: string }> {
        return entries
            .map(entry => {
                const resource = entry as PerformanceResourceTiming
                return {
                    name: resource.name,
                    duration: resource.duration,
                    type: resource.initiatorType || 'unknown'
                }
            })
            .sort((a, b) => b.duration - a.duration)
            .slice(0, limit)
    }

    // 报告性能指标
    private reportMetric(name: string, value: unknown) {
        if (DEBUG) {
            logger.info(`Performance Metric - ${name}`, value, 'Performance')
        }
        // TODO: 在生产环境实现性能指标上报
    }

    // 获取所有性能指标
    public getMetrics(): Partial<PerformanceMetrics> {
        return this.metrics
    }

    // 清除性能条目
    public clearMetrics() {
        performance.clearMarks()
        performance.clearMeasures()
        performance.clearResourceTimings()
    }

    // 标记性能时间点
    public mark(name: string) {
        performance.mark(name)
    }

    // 测量两个标记之间的时间
    public measure(name: string, startMark: string, endMark: string) {
        try {
            performance.measure(name, startMark, endMark)
            const measures = performance.getEntriesByName(name)
            if (measures.length > 0) {
                this.reportMetric(name, measures[0].duration)
            }
        } catch (error: unknown) {
            logger.error(`Error measuring ${name}`, error, 'Performance')
        }
    }
}

export const performanceMonitor = PerformanceMonitor.getInstance()

// Vue 插件形式
export const installPerformanceMonitor = {
    install(app: any) {
        app.config.globalProperties.$performance = performanceMonitor

        // 路由性能监控
        if (app.$router) {
            app.$router.beforeEach((to: any, from: any, next: any) => {
                performanceMonitor.mark(`route-change-start-${to.path}`)
                next()
            })

            app.$router.afterEach((to: any) => {
                performanceMonitor.mark(`route-change-end-${to.path}`)
                performanceMonitor.measure(
                    `route-change-${to.path}`,
                    `route-change-start-${to.path}`,
                    `route-change-end-${to.path}`
                )
            })
        }
    }
} 