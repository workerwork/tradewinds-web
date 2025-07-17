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

        const clsObserver = new PerformanceObserver((entryList) => {
            for (const entry of entryList.getEntries()) {
                const layoutShift = entry as LayoutShift
                if (!layoutShift.hadRecentInput) {
                    clsValue += layoutShift.value
                    clsEntries.push(entry)
                }
            }

            this.metrics.cls = clsValue
            this.reportMetric('CLS', clsValue)
        })

        clsObserver.observe({ entryTypes: ['layout-shift'] })
    }

    // 捕获导航时间
    private captureNavigationTiming() {
        window.addEventListener('load', () => {
            setTimeout(() => {
                const navigationEntry = performance.getEntriesByType('navigation')[0]
                this.metrics.navigationTiming = navigationEntry
                this.metrics.ttfb = (navigationEntry as any).responseStart
                this.reportMetric('Navigation Timing', navigationEntry)
            }, 0)
        })
    }

    // 捕获资源加载时间
    private captureResourceTiming() {
        window.addEventListener('load', () => {
            setTimeout(() => {
                const resourceEntries = performance.getEntriesByType('resource')
                this.metrics.resourceTiming = resourceEntries
                this.reportMetric('Resource Timing', resourceEntries)
            }, 0)
        })
    }

    // 报告性能指标
    private reportMetric(name: string, value: any) {
        if (import.meta.env.PROD) {
            // TODO: 实现性能指标上报
            console.log(`Performance Metric - ${name}:`, value)
        }
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
        } catch (error) {
            console.error(`Error measuring ${name}:`, error)
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