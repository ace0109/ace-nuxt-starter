# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 重要提示

**语言偏好：请始终使用中文与用户交流和回复问题。**

## 项目概述

这是一个基于 Nuxt 4 的现代化全栈开发模板，集成了 TypeScript、Nuxt UI、Tailwind CSS 和国际化支持。项目采用简化的 BFF 架构，支持 SSR/SEO。

## 常用命令

### 开发运行
```bash
pnpm dev              # 启动开发服务器 (默认端口 3333)
pnpm build            # 生产构建
pnpm preview          # 预览生产构建
```

### 代码质量
```bash
pnpm lint             # 检查代码规范
pnpm lint:fix         # 自动修复代码规范问题
```

### 版本发布
```bash
pnpm release          # 自动版本号升级（patch）
pnpm release:minor    # 升级 minor 版本
pnpm release:major    # 升级 major 版本
pnpm release:first    # 首次发布
```

## 核心架构

### API 请求流程

项目使用双层 API 架构，支持两个独立的上游服务：

```
客户端 → Nuxt Server (/api/*) → 后端上游
                ↓
        自动路由分发：
        /api/ai/* → AI 服务上游 (NUXT_AI_API_BASE)
        /api/*    → 默认后端上游 (NUXT_PUBLIC_API_BASE)
```

**核心文件：**
- `app/composables/useAPI.ts` - 客户端 API 封装（`useAPI`、`useLazyAPI`）
- `server/utils/api.ts` - 服务端 API 工具（`createAPI`、`apiCall`、`forwardRequest`）
- `server/api/[...all].ts` - 通用 API 代理，自动转发所有 `/api/*` 请求

**关键机制：**
1. `resolveUpstream()` 函数根据请求路径自动选择上游服务
2. `/api/ai/*` 请求会被路由到 AI 服务（移除 `/ai` 前缀后转发）
3. 其他 `/api/*` 请求转发到默认后端
4. 自动处理认证 token（从 cookie 读取）和 API Key
5. SSE 流式响应支持（见 `server/api/ai/chat.post.ts`）

### 环境配置

**必需的环境变量 (.env)：**
```bash
# 默认后端 API
NUXT_PUBLIC_API_BASE=https://nest.wangcaiyuan.com
NUXT_PUBLIC_API_PREFIX=api

# AI 服务后端
NUXT_AI_API_BASE=http://127.0.0.1:8000
NUXT_AI_API_PREFIX=api
NUXT_API_KEY=your-api-key

# 服务端口
PORT=3333
```

### 国际化 (i18n)

- 默认语言：英语 (en)
- 支持语言：英语 (en)、简体中文 (zh_cn)
- 语言文件位置：`app/locales/*.json`
- 切换语言：使用 `$switchLocalePath` 进行路由切换
- UI 组件：页面右上角的语言切换器（UPopover + UButton）

### 目录结构

```
app/
├── components/       # Vue 组件
├── composables/      # 组合式函数（包括 useAPI）
├── layouts/          # 布局组件 (default.vue, console.vue)
├── pages/            # 页面路由
├── plugins/          # Nuxt 插件
└── locales/          # 国际化文件

server/
├── api/              # API 路由
│   ├── [...all].ts   # 通用 API 代理
│   └── ai/           # AI 相关端点
│       ├── [...ai].ts       # AI 通用代理
│       └── chat.post.ts     # SSE 流式聊天
└── utils/
    └── api.ts        # 服务端 API 工具
```

## 开发规范

### TypeScript
- 所有组件使用 `<script setup lang="ts">` 语法
- 为 API 响应定义类型接口
- 使用泛型参数：`useAPI<ResponseType>('/endpoint')`

### Git 提交规范
遵循 Conventional Commits：
- `feat:` - 新功能
- `fix:` - Bug 修复
- `refactor:` - 重构
- `docs:` - 文档更新
- `chore:` - 构建/工具变更

版本管理使用 `commit-and-tag-version`（配置文件：`.versionrc.json`）

### ESLint
- 使用 `@nuxt/eslint` 模块
- 启用 stylistic 规则
- VS Code 配置：`.vscode/settings.json` 已配置自动格式化

## API 开发最佳实践

### 客户端请求
```typescript
// SSR 数据获取
const { data, pending, error } = await useAPI<User[]>('/users')

// 客户端懒加载
const { data } = await useLazyAPI('/posts')

// POST 请求
await useAPI('/users', {
  method: 'POST',
  body: { name: 'John' }
})
```

### 服务端自定义端点
```typescript
// server/api/custom.get.ts
import { apiCall } from '~/server/utils/api'

export default defineEventHandler(async (event) => {
  const data = await apiCall(event, '/backend/endpoint')
  return { ...data, customField: 'value' }
})
```

### SSE 流式响应处理
参考 `server/api/ai/chat.post.ts`：
- 使用 `sendStream()` 转发流式响应
- 设置正确的 SSE headers
- 确保 `X-Accel-Buffering: no` 禁用代理缓冲

## UI 组件

使用 Nuxt UI（基于 Tailwind CSS）：
- 完整组件文档：https://ui.nuxt.com
- 图标库：`@iconify-json/*`（carbon, heroicons, lucide, meteor-icons 等）
- 主题配置：`nuxt.config.ts` 中的 `ui` 选项

## Docker 部署

- Dockerfile 已配置
- 默认暴露端口：3000
- 构建命令：`docker build -t ace-nuxt4 .`
- 运行命令：`docker run -p 3000:3000 ace-nuxt4`

## 故障排查

### 认证相关
- 401 错误会自动清除 token 并跳转到 `/login`
- Token 存储在 cookie 中，key 为 `token`
- 服务端通过 `Authorization: Bearer {token}` header 传递

### API 路由问题
- 检查 `resolveUpstream()` 逻辑（`server/utils/api.ts:25-51`）
- 确认环境变量配置正确
- AI 请求必须以 `/api/ai/` 开头

### 类型错误
- 运行 `nuxt prepare` 重新生成类型
- 检查 `nuxt.config.ts` 的 `compatibilityDate` 设置

## 参考文档

详细的 API 架构说明请参阅项目根目录的 `API_DOCUMENTATION.md`。
