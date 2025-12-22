import { ref } from 'vue'
import { useI18n } from 'vue-i18n'

/**
 * 顶栏公告管理 Composable
 * 管理系统公告的显示
 */
export interface SystemNotice {
    type: 'success' | 'warning' | 'info' | 'danger'
    tag: string
    content: string
}

export function useTopbarAnnouncement() {
    const { t } = useI18n()

    // 系统公告数据
    const systemNotices = ref<SystemNotice[]>([
        {
            type: 'success',
            tag: 'update',
            content: 'updateContent'
        },
        {
            type: 'warning',
            tag: 'maintenance',
            content: 'maintenanceContent'
        },
        {
            type: 'info',
            tag: 'tip',
            content: 'tipContent'
        }
    ])

    // 获取公告国际化文本
    const getNoticeText = (notice: SystemNotice) => {
        return {
            tag: t(`notice.${notice.tag}`),
            content: t(`notice.${notice.content}`)
        }
    }

    return {
        systemNotices,
        getNoticeText
    }
}

