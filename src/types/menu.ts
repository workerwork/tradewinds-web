// 菜单类型枚举
export enum MenuType {
    MENU = 'menu',      // 菜单
    BUTTON = 'button',  // 按钮
    IFRAME = 'iframe'   // 外部链接
}

// 菜单项接口
export interface MenuItem {
    id: string | number;
    parentId?: string | number;
    name: string;
    title: string;
    path: string;
    component?: string;
    redirect?: string;
    icon?: string;
    type: MenuType;
    sort: number;
    visible: boolean;
    status: number;
    perms?: string;
    roles?: string[];
    badge?: {
        value: string | number;
        type?: 'primary' | 'success' | 'warning' | 'danger' | 'info';
    };
    meta?: {
        title: string;
        icon?: string;
        hidden?: boolean;
        keepAlive?: boolean;
        breadcrumb?: boolean | string;
        activeMenu?: string;
        roles?: string[];
    };
    children?: MenuItem[];
    createTime?: string;
    updateTime?: string;
}

// 菜单API响应
export interface MenuResponse {
    code: number;
    message: string;
    data: MenuItem[];
}

// 路由元信息
export interface RouteMeta {
    title: string;
    icon?: string;
    hidden?: boolean;
    keepAlive?: boolean;
    breadcrumb?: boolean | string;
    activeMenu?: string;
    roles?: string[];
} 