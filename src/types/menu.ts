/**
 * 菜单相关类型定义
 */

/**
 * 菜单类型枚举
 */
export enum MenuType {
  MENU = 'menu',
  BUTTON = 'button',
  DIR = 'dir',
}

export interface MenuItem {
  id?: string | number;
  parentId?: string | number;
  path: string;
  name?: string;
  title?: string;
  icon?: string;
  component?: string;
  redirect?: string;
  type?: MenuType | string;
  sort?: number;
  visible?: boolean;
  status?: number;
  perms?: string;
  roles?: string[];
  children?: MenuItem[];
  badge?: {
    value?: string | number;
    type?: 'primary' | 'success' | 'warning' | 'danger' | 'info';
  };
  meta?: {
    title?: string;
    icon?: string;
    hidden?: boolean;
    breadcrumb?: string;
    roles?: string[];
    [key: string]: any;
  };
  createTime?: string;
  updateTime?: string;
  [key: string]: any;
}

export interface WorkspaceMenu extends MenuItem {
  type?: 'workspace';
  component?: string;
}
