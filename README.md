# TradeWinds Web

基于 Tauri + Vue 3 + TypeScript 构建的现代化桌面应用程序。

## 📋 项目简介

TradeWinds Web 是一个功能完善的企业级管理系统，采用现代化的技术栈，提供流畅的用户体验和强大的功能支持。

## 🛠️ 技术栈

### 前端框架
- **Vue 3** - 渐进式 JavaScript 框架
- **TypeScript** - 类型安全的 JavaScript 超集
- **Vite** - 下一代前端构建工具

### UI 组件库
- **Element Plus** - 基于 Vue 3 的组件库

### 状态管理
- **Pinia** - Vue 官方推荐的状态管理库
- **pinia-plugin-persistedstate** - Pinia 持久化插件

### 路由
- **Vue Router 4** - Vue.js 官方路由管理器

### 国际化
- **Vue I18n** - Vue.js 国际化插件

### HTTP 客户端
- **Axios** - 基于 Promise 的 HTTP 客户端

### 桌面应用框架
- **Tauri 2** - 使用 Rust 构建的轻量级桌面应用框架

### 开发工具
- **unplugin-auto-import** - 自动导入 API
- **unplugin-vue-components** - 自动导入组件
- **sass-embedded** - Sass 编译器
- **vite-plugin-compression** - Gzip 压缩插件

## 📁 项目结构

```
tradewinds-web/
├── src/                    # 源代码目录
│   ├── api/               # API 接口定义
│   ├── assets/            # 静态资源
│   ├── components/        # 公共组件
│   ├── composables/       # 组合式函数
│   ├── config/            # 配置文件
│   ├── constants/         # 常量定义
│   ├── directives/        # 自定义指令
│   ├── i18n/              # 国际化配置
│   ├── layout/            # 布局组件
│   ├── locales/           # 语言包
│   ├── router/            # 路由配置
│   ├── stores/            # Pinia 状态管理
│   ├── styles/            # 全局样式
│   ├── types/             # TypeScript 类型定义
│   ├── utils/             # 工具函数
│   ├── views/             # 页面组件
│   ├── App.vue            # 根组件
│   └── main.ts            # 入口文件
├── src-tauri/             # Tauri 后端代码（Rust）
├── public/                # 公共静态资源
├── scripts/               # 构建脚本
├── index.html             # HTML 入口
├── vite.config.ts         # Vite 配置
├── tsconfig.json          # TypeScript 配置
└── package.json           # 项目依赖配置
```

## 🚀 快速开始

### 环境要求

- **Node.js** >= 18.0.0
- **Rust** >= 1.70.0（用于 Tauri 构建）
- **npm** 或 **yarn** 包管理器

### 安装依赖

```bash
# 使用 npm
npm install

# 或使用 yarn
yarn install
```

### 开发模式

```bash
# 启动开发服务器（仅前端）
npm run dev

# 启动 Tauri 开发模式（包含桌面应用）
npm run tauri dev
```

开发服务器将在 `http://localhost:1420` 启动。

### 构建生产版本

```bash
# 构建前端资源
npm run build

# 构建 Tauri 桌面应用
npm run tauri build
```

构建产物将输出到 `dist/` 目录（前端）和 `src-tauri/target/release/` 目录（桌面应用）。

### 预览构建结果

```bash
npm run preview
```

## 📦 主要功能模块

### 系统管理
- **用户管理** - 用户信息的增删改查
- **角色管理** - 角色权限配置
- **权限管理** - 细粒度权限控制
- **菜单管理** - 动态菜单配置

### 超级管理员
- **仪表盘** - 系统概览和快速操作
- **系统监控** - 实时性能监控
- **系统配置** - 全局配置管理
- **操作日志** - 审计日志查看
- **数据备份** - 数据备份与恢复

### 业务模块
- **客户管理** - 客户信息管理
- **产品管理** - 产品信息管理
- **订单管理** - 订单处理流程

## 🎨 开发规范

### 代码风格
- 使用 TypeScript 进行类型约束
- 遵循 Vue 3 Composition API 最佳实践
- 使用 `<script setup>` 语法
- 组件命名采用 PascalCase
- 文件命名采用 kebab-case

### 目录规范
- **composables/** - 按功能分类（common、layout、menu、table、user）
- **utils/** - 按类型分类（http、storage、format、image、system、validation、common）
- **api/** - 按业务模块分类
- **views/** - 按页面模块分类，每个模块可包含 `components/` 和 `services/` 子目录

### 样式规范
- 使用 SCSS 预处理器
- 统一使用 `@/styles/variables.scss` 中的变量
- 使用 `:deep()` 进行样式穿透
- 响应式设计使用媒体查询

### 提交规范
- 提交信息使用中文描述
- 提交前确保通过 TypeScript 类型检查
- 提交前确保代码格式化

## 🔧 配置说明

### 环境变量

项目支持以下环境变量前缀：
- `VITE_` - 前端环境变量
- `TAURI_` - Tauri 相关环境变量

### API 配置

API 请求配置位于 `src/config/index.ts`，支持两种模式：
- **direct** - 直接 HTTP 请求模式
- **invoke** - Tauri invoke 调用模式

### 代理配置

开发环境下的 API 代理配置在 `vite.config.ts` 中：
- 代理路径：`/api`
- 目标地址：`http://localhost:8080`

## 🧪 开发工具推荐

### IDE 推荐
- **VS Code** + 以下插件：
  - [Volar](https://marketplace.visualstudio.com/items?itemName=Vue.volar) - Vue 3 语言支持
  - [Tauri](https://marketplace.visualstudio.com/items?itemName=tauri-apps.tauri-vscode) - Tauri 开发支持
  - [rust-analyzer](https://marketplace.visualstudio.com/items?itemName=rust-lang.rust-analyzer) - Rust 语言支持
  - [TypeScript Vue Plugin (Volar)](https://marketplace.visualstudio.com/items?itemName=Vue.vscode-typescript-vue-plugin) - TypeScript 支持

### Volar Take Over 模式

为了获得更好的 TypeScript 类型支持，建议启用 Volar 的 Take Over 模式：

1. 在 VS Code 命令面板中运行 `Extensions: Show Built-in Extensions`
2. 找到 `TypeScript and JavaScript Language Features`，右键选择 `Disable (Workspace)`
3. 运行 `Developer: Reload Window` 重新加载窗口

更多信息请参考 [Volar Take Over 模式文档](https://github.com/johnsoncodehk/volar/discussions/471)。

## 📝 注意事项

1. **target 目录**：Rust 构建产物目录，已添加到 `.gitignore`，无需提交到版本控制
2. **API 模式切换**：根据实际部署环境在 `src/config/index.ts` 中配置 `API_MODE`
3. **样式穿透**：使用 Element Plus 组件时，如需自定义样式，使用 `:deep()` 进行样式穿透
4. **类型安全**：所有 API 调用和组件 props 都应定义明确的 TypeScript 类型

## 🤝 贡献指南

1. Fork 本仓库
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启 Pull Request

## 📄 许可证

本项目采用私有许可证，未经授权不得使用。

## 👥 维护者

项目维护团队

---

**注意**：本项目仍在积极开发中，API 和功能可能会发生变化。
