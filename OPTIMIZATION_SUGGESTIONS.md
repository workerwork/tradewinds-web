# 项目优化建议

本文档列出了项目中可以优化的地方，按优先级和类别组织。

## ✅ 已完成的优化

### 1. ✅ Vite 构建配置问题
**状态**: 已修复
**修复内容**: 移除了无效的 `terserOptions` 配置

### 2. ✅ 不必要的依赖
**状态**: 已清理
**修复内容**: 从 `package.json` 中移除了 `localstorage`、`path`、`url`（这些依赖未在代码中使用）

### 3. ✅ 缺少的依赖
**状态**: 已添加
**修复内容**: 添加了 `@vueuse/core@^14.1.0` 到 `dependencies`

### 4. ✅ TypeScript 配置
**状态**: 已优化
**修复内容**: 
- 安装了 `@types/node`
- 更新了 `tsconfig.node.json` 添加 Node.js 类型支持
- 修复了 `vite.config.ts` 的 lint 错误

### 5. ✅ HMR WebSocket 配置
**状态**: 已修复
**修复内容**: 将 HMR 的 `host` 从 `'0.0.0.0'` 改为 `'localhost'`，解决浏览器连接问题

### 6. ✅ 路由加载优化
**状态**: 已优化
**修复内容**: 改进了动态路由加载的错误处理和空路由检查

### 7. ✅ 调试代码清理
**状态**: 已清理
**修复内容**: 移除了所有调试打印语句（console.log/warn/error）

### 8. ✅ Node.js 版本管理
**状态**: 已添加
**修复内容**: 创建了 `.nvmrc` 文件，指定 Node.js 版本为 20.19.0

### 9. ✅ 脚本优化
**状态**: 已优化
**修复内容**: 添加了 `type-check` 脚本

## 🔴 高优先级 - 必须修复

### 1. ~~Vite 构建配置问题~~ ✅ 已修复

### 2. ~~不必要的依赖~~ ✅ 已清理

### 3. ~~缺少的依赖~~ ✅ 已添加

## 🟡 中优先级 - 建议优化

### 4. TypeScript 严格模式
**位置**: `tsconfig.json:26-31`
**问题**: 
- `strict: false` - 未启用严格模式
- `noImplicitAny: false` - 允许隐式 any
- 代码中有大量 `any` 和 `unknown` 类型（217 处）

**建议**: 逐步启用严格模式
```json
{
  "strict": true,
  "noImplicitAny": true,
  "strictNullChecks": true,
  "strictFunctionTypes": true
}
```

### 5. 代码重复和类型安全
**问题**: 
- 多处使用 `any` 类型（41 个文件）
- 类型转换不够安全
- 数据适配器中有大量类型断言

**建议**: 
- 创建更严格的类型定义
- 使用类型守卫替代类型断言
- 统一数据适配逻辑

### 6. 未完成的功能（TODO）
**位置**: 多个文件
**问题**: 发现 78 处 TODO 注释，包括：
- `src/views/product/ProductList.vue` - 搜索、新增、编辑等功能
- `src/views/quotation/QuotationList.vue` - 报价单相关功能
- `src/views/order/OrderList.vue` - 订单相关功能
- `src-tauri/src/handlers/auth.rs` - 真实登录逻辑
- `src/utils/system/error-handler.ts` - 错误日志上报
- `src/utils/system/performance.ts` - 性能指标上报

**建议**: 按业务优先级逐步实现这些功能

### 7. 测试覆盖率
**问题**: 只有一个测试文件 `src/api/auth/__tests__/auth.test.ts`
**建议**: 
- 为核心业务逻辑添加单元测试
- 为 API 层添加集成测试
- 为关键组件添加组件测试
- 目标覆盖率：> 60%

## 🟢 低优先级 - 可选优化

### 8. 性能优化

#### 8.1 代码分割优化
**位置**: `vite.config.ts:67-73`
**建议**: 考虑添加更多的手动代码分割
```typescript
manualChunks: {
  'vue-vendor': ['vue', 'vue-router', 'pinia'],
  'element-plus-vendor': ['element-plus'],
  'utils-vendor': ['@vueuse/core'],
  'axios': ['axios'],
  'i18n': ['vue-i18n'],
  // 可以考虑添加
  'tauri': ['@tauri-apps/api'],
  'charts': ['echarts'], // 如果使用图表库
}
```

#### 8.2 图片优化
**建议**: 
- 使用 WebP 格式
- 实现图片懒加载（已有 `lazy` 指令）
- 考虑使用 CDN

#### 8.3 路由懒加载
**位置**: `src/router/index.ts`
**建议**: 确保所有路由都使用动态导入
```typescript
component: () => import('@/views/xxx.vue')
```

### 9. 代码质量

#### 9.1 ESLint 配置
**建议**: 
- 添加 ESLint 配置
- 添加 Prettier 配置
- 在 CI/CD 中集成代码检查

#### 9.2 代码注释
**建议**: 
- 为复杂逻辑添加 JSDoc 注释
- 统一注释风格
- 移除过时的注释

### 10. 安全性

#### 10.1 敏感信息检查
**建议**: 
- 检查是否有硬编码的密钥、密码
- 确保所有敏感配置使用环境变量
- 添加 `.env.example` 文件

#### 10.2 依赖安全
**建议**: 
- 定期运行 `yarn audit` 检查安全漏洞
- 使用 `yarn upgrade-interactive` 更新依赖
- 考虑使用 Dependabot 自动更新

### 11. 开发体验

#### 11.1 脚本优化
**位置**: `package.json`
**建议**: 添加更多有用的脚本
```json
{
  "scripts": {
    "dev": "vite",
    "build": "vue-tsc --noEmit && vite build",
    "preview": "vite preview",
    "lint": "eslint src --ext .vue,.js,.ts",
    "format": "prettier --write \"src/**/*.{vue,js,ts}\"",
    "type-check": "vue-tsc --noEmit",
    "test": "vitest",
    "test:coverage": "vitest --coverage"
  }
}
```

#### 11.2 Git Hooks
**建议**: 
- 使用 Husky 添加 pre-commit hooks
- 自动运行 lint 和 type-check

#### 11.3 环境变量管理
**建议**: 
- 创建 `.env.example` 文件
- 文档化所有环境变量
- 使用 `vite-plugin-environment` 进行类型检查

### 12. 文档

#### 12.1 README 完善
**建议**: 
- 添加项目介绍
- 添加快速开始指南
- 添加开发指南
- 添加部署指南

#### 12.2 API 文档
**建议**: 
- 使用 TypeDoc 生成 API 文档
- 为 API 接口添加 JSDoc 注释

### 13. 项目结构

#### 13.1 文件组织
**建议**: 
- 检查是否有未使用的文件
- 统一文件命名规范
- 考虑按功能模块组织代码

#### 13.2 常量管理
**建议**: 
- 将魔法数字和字符串提取为常量
- 统一常量定义位置

## 📊 优化统计

- **高优先级问题**: 3 个
- **中优先级问题**: 4 个
- **低优先级优化**: 6 个类别
- **TODO 注释**: 78 处
- **类型安全问题**: 217 处 `any`/`unknown`
- **测试文件**: 1 个

## 🎯 建议的优化顺序

1. **第一阶段**（立即执行）:
   - 修复 Vite 配置问题
   - 清理不必要的依赖
   - 添加缺失的依赖

2. **第二阶段**（1-2 周内）:
   - 启用 TypeScript 严格模式（逐步）
   - 实现关键的 TODO 功能
   - 添加基础测试

3. **第三阶段**（1 个月内）:
   - 提升类型安全性
   - 完善测试覆盖率
   - 性能优化

4. **第四阶段**（持续改进）:
   - 代码质量提升
   - 文档完善
   - 安全性检查

## 📝 注意事项

- 优化时要注意向后兼容性
- 建议在单独的分支进行优化
- 每次优化后进行充分测试
- 记录优化前后的性能对比

