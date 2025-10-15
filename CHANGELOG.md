# Changelog

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

## [Unreleased] (2025-10-15)

### ✨ Features

- **架构**: 实现完整的 BFF (Backend for Frontend) 架构
- **认证**: 实现基于 Cookie + JWT 的双重认证系统
  - 浏览器 ↔️ Nuxt Server: HttpOnly Cookie (安全)
  - Nuxt Server ↔️ 真实后端: JWT Token (标准)
- **API 封装**: 创建统一的 `useApi` composable
  - 支持响应式数据获取模式
  - 支持命令式操作模式
  - 完整的 TypeScript 类型支持
- **中间件**: Server 端认证中间件自动保护 API
  - 自动提取 Cookie 中的 token
  - 公开路径白名单机制
  - Token 存储到 `event.context.auth`
- **转发层**: 实现通用 API 转发
  - 自动转发所有 `/api/*` 请求到真实后端
  - 自动注入 JWT Token 到 Authorization header
  - 自动处理 401 错误
- **示例页面**: 添加完整的认证示例 (`/auth-demo`)

### 🛠️ 新增文件

- `app/plugins/api.ts` - HTTP 客户端配置
- `app/composables/useApi.ts` - 统一 API 调用接口
- `server/middleware/auth.ts` - 认证中间件
- `server/utils/auth.ts` - 认证工具函数
- `server/utils/backendFetch.ts` - 后端请求工具
- `server/api/auth/login.post.ts` - 登录 API
- `server/api/auth/logout.post.ts` - 登出 API
- `server/api/auth/me.get.ts` - 获取当前用户 API
- `server/api/[...].ts` - 通用转发层
- `types/server.ts` - TypeScript 类型定义
- `app/pages/auth-demo.vue` - 认证示例页面

### 📚 Documentation

- 创建 `API_DEVELOPMENT_LOG.md` - 完整的开发记录和架构说明 (580+ 行)
- 创建 `QUICK_START.md` - 详细的快速入门指南 (350+ 行)
- 创建 `PROJECT_SUMMARY.md` - 项目完成总结
- 更新 `README.md` - 添加 BFF 架构说明和使用指南
- 创建 `.env.example` - 环境变量示例

### ⚙️ Configuration

- 更新 `nuxt.config.ts` - 添加 `BACKEND_URL` 配置
- 支持通过环境变量配置真实后端地址

### 🎯 架构优势

- 🔒 安全性: HttpOnly Cookie 防止 XSS 攻击
- 📐 标准化: 后端使用标准 JWT，可服务多端
- 🌐 SSR 友好: Cookie 在 SSR 时自动携带
- 👨‍💻 开发体验: 简洁的 API，自动管理认证

---

## [0.0.3](https://github.com/ace0109/ace-nuxt-starter/compare/v0.0.2...v0.0.3) (2025-10-09)

### ✨ Features

- 更新 API 主机地址为生产环境 ([4487766](https://github.com/ace0109/ace-nuxt-starter/commit/4487766ee7f60b0743b6559f9973f44e8ee0f43b))
- 添加 MDC 支持和首页简历展示功能 ([843a96f](https://github.com/ace0109/ace-nuxt-starter/commit/843a96f58c3d63548d65dfeb94dc0ceddfc72add))
- 添加语言切换功能并重构导航菜单 ([fa09abe](https://github.com/ace0109/ace-nuxt-starter/commit/fa09abe24372b009aaaab5394988ae7e2927d5d5))
- 重构语言切换功能并优化国际化配置 ([a032418](https://github.com/ace0109/ace-nuxt-starter/commit/a0324181301c5e89493f031c43f32e0b778f31ab))

### 📚 Documentation

- 更新 README.md，添加项目特性和技术栈信息 ([732004f](https://github.com/ace0109/ace-nuxt-starter/commit/732004f0b943907da7c5977ab6bb07800cefb7a4))

### [0.0.2](https://github.com/ace0109/ace-nuxt-starter/compare/v0.0.1...v0.0.2) (2025-09-29)

### ✨ Features

- 更新 VSCode 设置以支持 Tailwind CSS ([36d44bc](https://github.com/ace0109/ace-nuxt-starter/commit/36d44bcb57d72a22874d1568f750e1395c763bb4))
- 添加博客和项目页面功能 ([6062cc1](https://github.com/ace0109/ace-nuxt-starter/commit/6062cc141b14a1091185f956eeaf77c76b49f386))

### [0.0.1](https://github.com/ace0109/ace-nuxt-starter/compare/v0.0.0...v0.0.1) (2025-09-29)

### ✨ Features

- 添加 ESLint 代码检查和格式化功能 ([834265f](https://github.com/ace0109/ace-nuxt-starter/commit/834265fd172b996a86c92aa95b8749701c626e08))

## 0.0.0 (2025-09-29)

### ✨ Features

- add standard-version for automated versioning and changelog generation ([931a327](https://github.com/ace0109/ace-nuxt-starter/commit/931a327b30ef308e9a2dedb094debdf9724e3778))
