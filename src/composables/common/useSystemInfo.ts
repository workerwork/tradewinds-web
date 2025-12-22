import { ref } from 'vue'
import type { SystemInfo } from '@/types/sidebar'

/**
 * 系统信息管理 Composable
 * 管理系统运行状态信息
 */
export function useSystemInfo() {
    const systemInfo = ref<SystemInfo>({
        onlineUsers: 12,
        runtime: '3天12小时',
        version: 'v1.0.0'
    })

    // 更新系统信息
    const updateSystemInfo = (info: Partial<SystemInfo>) => {
        systemInfo.value = { ...systemInfo.value, ...info }
    }

    // 刷新系统信息（可以从 API 获取）
    const refreshSystemInfo = async () => {
        // TODO: 从 API 获取系统信息
        // const data = await getSystemInfo()
        // updateSystemInfo(data)
    }

    return {
        systemInfo,
        updateSystemInfo,
        refreshSystemInfo
    }
}

