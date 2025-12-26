import { ref, onMounted, onUnmounted } from 'vue'
import { logger } from '@/utils'

/**
 * 顶栏全屏功能 Composable
 * 管理全屏状态的切换和监听，支持 F11 快捷键
 */
export function useTopbarFullscreen() {
    const isFullscreen = ref(false)

    const toggleFullscreen = () => {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen().catch((error: unknown) => {
                // 全屏请求失败（用户拒绝或浏览器不支持）
                logger.warn('全屏请求失败', error, 'TopbarFullscreen')
            })
        } else {
            document.exitFullscreen().catch((error: unknown) => {
                // 退出全屏失败
                logger.warn('退出全屏失败', error, 'TopbarFullscreen')
            })
        }
    }

    const handleFullscreenChange = () => {
        isFullscreen.value = !!document.fullscreenElement
    }

    onMounted(() => {
        document.addEventListener('fullscreenchange', handleFullscreenChange)
    })

    onUnmounted(() => {
        document.removeEventListener('fullscreenchange', handleFullscreenChange)
    })

    return {
        isFullscreen,
        toggleFullscreen
    }
}

