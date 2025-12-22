import { ElMessage } from 'element-plus'
import type { WorkspaceMenu } from '@/types/menu'

/**
 * 菜单处理逻辑 Composable
 * 统一管理菜单相关的交互逻辑
 */
export function useMenuHandler() {
    /**
     * 处理工作区菜单显示
     */
    const handleShowWorkspace = (menu: WorkspaceMenu) => {
        // TODO: 在主内容区域显示工作区组件
        // 这里可以通过event bus、状态管理或者直接在Layout中处理
        const menuName = menu.title || menu.name || '工作区'
        ElMessage.success(`正在加载工作区: ${menuName}`)
    }

    /**
     * 处理菜单选择事件
     * @param index 菜单索引路径
     */
    const handleMenuSelect = (index: string) => {
        // 路由跳转由 el-menu 的 :router="true" 自动处理
        // 这里可以添加额外的逻辑，如埋点、权限检查等

        // 示例：可以在这里添加埋点
        // trackEvent('menu_select', { path: index })

        // 示例：可以在这里添加权限检查
        // if (!hasPermission(index)) {
        //   ElMessage.warning('无权限访问')
        //   return false
        // }
    }

    return {
        handleShowWorkspace,
        handleMenuSelect
    }
}

