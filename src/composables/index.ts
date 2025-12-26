/**
 * Composables 统一导出
 * 按功能模块分类导出
 */

// Layout 相关
export { useSidebarCollapse } from './layout/useSidebarCollapse';
export { useSidebarDrawers } from './layout/useSidebarDrawers';
export { useTopbarAnnouncement } from './layout/useTopbarAnnouncement';
export { useTopbarFullscreen } from './layout/useTopbarFullscreen';
export { useTopbarSettings } from './layout/useTopbarSettings';
export { useTopbarUser } from './layout/useTopbarUser';

// Menu 相关
export { useMenuHandler } from './menu/useMenuHandler';
export { useMenuState } from './menu/useMenuState';

// User 相关
export { useUserDisplayName } from './user/useUserDisplayName';
export { usePasswordDialog } from './user/usePasswordDialog';
export { useProfileDialog } from './user/useProfileDialog';

// Table 相关
export { useTablePersist } from './table/useTablePersist';
export { useSearchHistory } from './table/useSearchHistory';
export { useTableSearch } from './table/useTableSearch';
export { useAutocomplete, type AutocompleteSuggestion } from './table/useAutocomplete';

// 通用工具
export { useComponentLifecycle, useSafeDialog } from './common/useComponentLifecycle';
export { useDialog, type DialogType, type UseDialogOptions } from './common/useDialog';
export { useErrorHandler } from './common/useErrorHandler';
export { useNotifications, type Notification } from './common/useNotifications';
export { useResponsive } from './common/useResponsive';
export { useSystemInfo } from './common/useSystemInfo';
export { useSuperAdminAccess } from './common/useSuperAdminAccess';
export { useTodo } from './common/useTodo';

