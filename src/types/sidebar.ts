/**
 * Sidebar 相关类型定义
 */

export interface SidebarProps {
    isCollapse: boolean
}

export interface SidebarEmits {
    (e: 'update:isCollapse', value: boolean): void
}

export interface SystemInfo {
    onlineUsers: number
    runtime: string
    version: string
}

