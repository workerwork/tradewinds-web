import { ref, computed } from 'vue'
import { NOTIFICATION_COLORS } from '@/constants'

export interface Notification {
    id: number
    title: string
    content: string
    time: string
    type: 'info' | 'warning' | 'success' | 'error'
    read: boolean
}

/**
 * 通知管理 Composable
 */
export function useNotifications() {
    const notifications = ref<Notification[]>([
        {
            id: 1,
            title: '系统更新',
            content: '系统将于今晚12点进行维护，预计2小时',
            time: '2分钟前',
            type: 'warning',
            read: false
        },
        {
            id: 2,
            title: '订单提醒',
            content: '您有3个新订单待处理',
            time: '10分钟前',
            type: 'info',
            read: false
        },
        {
            id: 3,
            title: '客户咨询',
            content: '张三询问产品详情',
            time: '1小时前',
            type: 'success',
            read: true
        }
    ])

    // 未读通知数量
    const unreadCount = computed(() =>
        notifications.value.filter(n => !n.read).length
    )

    // 标记单个通知为已读
    const markAsRead = (notification: Notification) => {
        if (!notification.read) {
            notification.read = true
        }
    }

    // 标记所有通知为已读
    const markAllAsRead = () => {
        notifications.value.forEach(notification => {
            notification.read = true
        })
    }

    // 获取通知图标颜色
    const getNotificationColor = (type: Notification['type']) => {
        return NOTIFICATION_COLORS[type] || '#909399'
    }

    // 获取通知图标组件
    const getNotificationIcon = (type: Notification['type']) => {
        // 这里可以根据类型返回不同的图标组件
        // 暂时返回类型字符串，由组件内部处理
        return type
    }

    return {
        notifications,
        unreadCount,
        markAsRead,
        markAllAsRead,
        getNotificationColor,
        getNotificationIcon
    }
}

