# 组件错误修复说明

## 问题描述

应用在路由切换时出现以下错误：
- `Cannot read properties of null (reading 'ce')`
- `onScopeDispose() is called when there is no active effect scope`

这些错误通常发生在组件卸载时，仍有异步操作或响应式更新尝试访问已销毁的组件实例。

## 修复方案

### 1. 错误处理器增强 (`src/utils/error-handler.ts`)

- 添加了组件卸载错误的检测和静默处理
- 避免向用户显示组件卸载相关的错误信息
- 在开发环境中仍会记录警告信息

### 2. 组件生命周期管理 (`src/composables/useComponentLifecycle.ts`)

- 提供安全的组件生命周期管理
- 包含 `safeAsync` 方法用于安全的异步操作
- 包含 `safeSet` 方法用于安全的响应式数据设置
- 提供 `useSafeDialog` 用于安全的对话框管理

### 3. 组件清理管理器 (`src/utils/component-cleanup.ts`)

- 自动管理组件的清理任务
- 提供安全的异步操作包装器
- 提供安全的响应式数据设置器

### 4. 路由守卫增强 (`src/router/index.ts`)

- 添加路由后置守卫，给组件更多时间进行清理
- 在路由切换时进行垃圾回收（如果浏览器支持）

## 使用方法

### 在组件中使用安全的异步操作

```typescript
import { useComponentLifecycle } from '@/composables/useComponentLifecycle'

export default {
  setup() {
    const { safeAsync, safeSet } = useComponentLifecycle()
    const data = ref(null)
    
    const fetchData = async () => {
      const result = await safeAsync(async () => {
        return await api.getData()
      })
      
      if (result) {
        safeSet(data, result)
      }
    }
  }
}
```

### 使用安全的对话框

```typescript
import { useSafeDialog } from '@/composables/useComponentLifecycle'

export default {
  setup() {
    const { dialogVisible, showDialog, hideDialog } = useSafeDialog()
    
    return {
      dialogVisible,
      showDialog,
      hideDialog
    }
  }
}
```

## 注意事项

1. 这些修复主要针对组件卸载时的错误，不会影响正常的组件功能
2. 在开发环境中，组件卸载相关的错误仍会在控制台显示为警告
3. 建议在编写组件时使用提供的安全方法，特别是在处理异步操作时
4. 如果仍有错误出现，请检查是否有其他地方直接操作已卸载的组件

## 测试

修复后，在路由切换时应该不再出现组件卸载相关的错误。可以通过以下方式测试：

1. 快速切换不同的路由页面
2. 在页面加载过程中快速切换到其他页面
3. 在对话框打开时快速切换路由 