import { ref, onMounted, onUnmounted, computed } from 'vue'

/**
 * 响应式布局管理 Composable
 * 检测屏幕尺寸并管理移动端/桌面端布局
 */
export function useResponsive() {
    // 安全获取窗口尺寸（支持 SSR）
    const getWindowWidth = () => {
        if (typeof window !== 'undefined') {
            return window.innerWidth
        }
        return 1024 // 默认桌面端宽度
    }

    const getWindowHeight = () => {
        if (typeof window !== 'undefined') {
            return window.innerHeight
        }
        return 768
    }

    const windowWidth = ref(getWindowWidth())
    const windowHeight = ref(getWindowHeight())

    // 断点定义
    const breakpoints = {
        xs: 480,   // 超小屏（手机）
        sm: 768,   // 小屏（平板）
        md: 1024,  // 中屏（小笔记本）
        lg: 1280,  // 大屏（桌面）
        xl: 1920   // 超大屏
    }

    // 判断是否为移动端（小于 768px）
    const isMobile = computed(() => windowWidth.value < breakpoints.sm)

    // 判断是否为平板（768px - 1024px）
    const isTablet = computed(() =>
        windowWidth.value >= breakpoints.sm && windowWidth.value < breakpoints.md
    )

    // 判断是否为桌面端（大于等于 1024px）
    const isDesktop = computed(() => windowWidth.value >= breakpoints.md)

    // 更新窗口尺寸
    const updateSize = () => {
        if (typeof window !== 'undefined') {
            windowWidth.value = window.innerWidth
            windowHeight.value = window.innerHeight
        }
    }

    // 节流函数
    const throttle = (func: Function, wait: number) => {
        let timeout: ReturnType<typeof setTimeout> | null = null
        return function (this: any, ...args: any[]) {
            if (!timeout) {
                timeout = setTimeout(() => {
                    timeout = null
                    func.apply(this, args)
                }, wait)
            }
        }
    }

    // 节流处理窗口大小变化
    const handleResize = throttle(updateSize, 150)

    onMounted(() => {
        if (typeof window !== 'undefined') {
            window.addEventListener('resize', handleResize)
            updateSize()
        }
    })

    onUnmounted(() => {
        if (typeof window !== 'undefined') {
            window.removeEventListener('resize', handleResize)
        }
    })

    return {
        windowWidth,
        windowHeight,
        isMobile,
        isTablet,
        isDesktop,
        breakpoints
    }
}

