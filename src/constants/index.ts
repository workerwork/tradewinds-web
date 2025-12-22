/**
 * 应用常量配置
 */

// 布局相关常量
export const LAYOUT = {
    TOPBAR_HEIGHT: 64,
    SIDEBAR_WIDTH: 220,
    SIDEBAR_COLLAPSED_WIDTH: 56
} as const

// 抽屉配置
export const DRAWER = {
    NOTIFICATION: {
        SIZE: '400px',
        Z_INDEX: 2000
    },
    TODO: {
        SIZE: '400px',
        Z_INDEX: 2000
    }
} as const

// 通知类型
export const NOTIFICATION_TYPE = {
    INFO: 'info',
    WARNING: 'warning',
    SUCCESS: 'success',
    ERROR: 'error'
} as const

// 通知类型颜色映射
export const NOTIFICATION_COLORS = {
    [NOTIFICATION_TYPE.INFO]: '#409EFF',
    [NOTIFICATION_TYPE.WARNING]: '#E6A23C',
    [NOTIFICATION_TYPE.SUCCESS]: '#67C23A',
    [NOTIFICATION_TYPE.ERROR]: '#F56C6C'
} as const

