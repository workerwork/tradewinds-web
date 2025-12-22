import { ref, onMounted, onUnmounted } from 'vue'

/**
 * 顶栏全屏功能 Composable
 * 管理全屏状态的切换和监听，支持 F11 快捷键
 */
export function useTopbarFullscreen() {
    const isFullscreen = ref(false)

    const toggleFullscreen = () => {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen().catch(() => {
                // 全屏请求失败（用户拒绝或浏览器不支持）
                console.warn('全屏请求失败')
            })
        } else {
            document.exitFullscreen().catch(() => {
                // 退出全屏失败
                console.warn('退出全屏失败')
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

