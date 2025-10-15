# 🚀 Ace Nuxt 4 Starter

基于 Nuxt 4 的现代化全栈 Web 应用启动模板，集成了 BFF 架构和完整的认证系统。

## ✨ 核心特性

### 🏗️ BFF 架构（Backend for Frontend）

```
┌─────────┐  Cookie   ┌──────────────┐  JWT Token  ┌────────────┐
│ 浏览器  │ <-------> │ Nuxt Server  │ <---------> │  真实后端  │
│ (Client)│           │    (BFF)     │             │  (Backend) │
└─────────┘           └──────────────┘             └────────────┘
```

- **浏览器 ↔️ Nuxt Server**: HttpOnly Cookie（防止 XSS 攻击）
- **Nuxt Server ↔️ 真实后端**: JWT Token（标准 API 认证）
- **安全性**: JWT Token 只在服务端存在，前端无法访问
- **SSR 友好**: Cookie 在服务端渲染时自动携带

### 🎯 完整的 API 封装

- ✅ **统一的 API 调用接口** - `useApi` composable（支持响应式和命令式）
- ✅ **自动认证管理** - Cookie 自动携带，JWT 自动注入
- ✅ **类型安全** - 完整的 TypeScript 支持
- ✅ **错误处理** - 统一的错误处理和提示
- ✅ **请求转发** - 所有 API 请求自动转发到真实后端

### � 认证系统

- ✅ **登录/登出** - 完整的认证流程
- ✅ **会话管理** - HttpOnly Cookie 存储
- ✅ **中间件保护** - 自动验证 API 请求
- ✅ **公开路径白名单** - 灵活配置

### 🛠️ 技术栈

- �🔥 **Nuxt 4** - Vue.js 全栈框架
- 🎨 **Nuxt UI** - Tailwind CSS 组件库
- 📝 **TypeScript** - 类型安全开发
- 🎯 **ESLint** - 代码质量检查
- 📦 **pnpm** - 包管理器
- 🔒 **H3** - 服务端 HTTP 框架
- 🌐 **ofetch** - 统一的请求库

## 🛠️ 技术栈

- **前端框架**: Vue 3 + Nuxt 4
- **样式方案**: Tailwind CSS + Nuxt UI
- **开发语言**: TypeScript
- **包管理器**: pnpm
- **代码规范**: ESLint
- **版本管理**: Standard Version

## 📁 项目结构

```
ace-nuxt4/
├── app/
│   ├── plugins/
│   │   └── api.ts              # HTTP 客户端配置
│   ├── composables/
│   │   └── useApi.ts           # 统一 API 调用接口
│   ├── components/             # 公共组件
│   ├── pages/
│   │   ├── auth-demo.vue       # 认证示例页面
│   │   ├── blog/               # 博客相关页面
│   │   └── projects/           # 项目展示页面
│   ├── assets/                 # 静态资源
│   └── app.vue                 # 根组件
├── server/
│   ├── middleware/
│   │   └── auth.ts             # 认证中间件
│   ├── utils/
│   │   ├── auth.ts             # 认证工具函数
│   │   └── backendFetch.ts     # 后端请求工具
│   └── api/
│       ├── auth/
│       │   ├── login.post.ts   # 登录 API
│       │   ├── logout.post.ts  # 登出 API
│       │   └── me.get.ts       # 获取当前用户
│       └── [...].ts            # 通用转发层
├── types/
│   └── server.ts               # TypeScript 类型定义
├── public/                     # 公共静态文件
├── API_DEVELOPMENT_LOG.md      # 完整开发记录
├── QUICK_START.md              # 快速入门指南
└── ...
```

## 🚀 快速开始

### 环境要求

- Node.js 18+
- pnpm
- 真实后端 API 服务（可选，用于完整认证流程）

### 1. 安装依赖

```bash
pnpm install
```

### 2. 配置环境变量

```bash
# 复制环境变量示例文件
cp .env.example .env

# 编辑 .env 文件，配置你的后端 API 地址
BACKEND_URL=http://localhost:8000
```

### 3. 启动开发服务器

```bash
pnpm dev
```

访问 `http://localhost:3000` 查看应用。

### 4. 查看认证示例

访问 `http://localhost:3000/auth-demo` 查看完整的认证流程示例。

## 📖 使用指南

### 前端 API 调用

#### 响应式数据获取（推荐用于页面数据）

```vue
<script setup lang="ts">
// 自动获取数据，支持响应式
const { data: posts, pending, error, refresh } = await useApi("/posts");

// 带查询参数
const page = ref(1);
const { data } = await useApi("/posts", {
  query: { page, limit: 10 },
  watch: [page], // page 变化时自动重新请求
});
</script>
```

#### 命令式操作（推荐用于表单提交）

```vue
<script setup lang="ts">
const { get, post, put, delete: del } = useApi();

// 创建
await post("/posts", { title: "Hello", content: "World" });

// 更新
await put("/posts/123", { title: "Updated" });

// 删除
await del("/posts/123");
</script>
```

### 认证流程

```vue
<script setup lang="ts">
const { post } = useApi();

// 登录
async function login() {
  await post("/auth/login", { email, password });
  // Cookie 自动设置
}

// 获取当前用户
const { data: user } = await useApi("/auth/me");

// 登出
async function logout() {
  await post("/auth/logout");
  // Cookie 自动清除
}
</script>
```

### Server API 开发

所有 `/api/*` 请求会自动转发到真实后端。如需自定义逻辑：

```typescript
// server/api/users/[id].get.ts
import { backendFetch } from "../../utils/backendFetch";

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, "id");

  // 自动注入 JWT token 并转发
  const user = await backendFetch(event, `/users/${id}`);

  return user;
});
```

## 📚 文档

- **[快速入门指南](./QUICK_START.md)** - 详细的使用说明和示例
- **[API 开发记录](./API_DEVELOPMENT_LOG.md)** - 完整的架构设计和实现过程

## 🎯 主要功能

### ✅ 已实现

- ✅ 前端请求封装（useApi）
- ✅ Server 端认证中间件
- ✅ Server 端请求后端工具
- ✅ 登录/登出/获取用户 API
- ✅ 通用 API 转发层
- ✅ HttpOnly Cookie 管理
- ✅ JWT Token 自动注入
- ✅ TypeScript 类型支持
- ✅ 认证示例页面

### 🚧 待优化

- [ ] 单元测试
- [ ] 请求日志
- [ ] 请求缓存
- [ ] 性能监控

### 代码检查

```bash
# 检查代码质量
pnpm lint

# 自动修复代码格式
pnpm lint:fix
```

## 📦 构建和部署

### 构建生产版本

```bash
pnpm build
```

### 本地预览

```bash
pnpm preview
```

## 🏷️ 版本管理

本项目使用 [Standard Version](https://github.com/conventional-changelog/standard-version) 进行自动化版本管理。

### 发布新版本

```bash
# 自动升级补丁版本 (0.1.0 -> 0.1.1)
pnpm release

# 升级小版本 (0.1.0 -> 0.2.0)
pnpm release:minor

# 升级大版本 (0.1.0 -> 1.0.0)
pnpm release:major
```

### 提交规范

请使用 [Conventional Commits](https://conventionalcommits.org/) 规范：

- `feat:` 新功能
- `fix:` 修复 bug
- `docs:` 文档更新
- `style:` 代码格式调整
- `refactor:` 代码重构
- `test:` 测试相关
- `chore:` 构建过程或辅助工具的变动

## 📖 更多资源

- [Nuxt 文档](https://nuxt.com/docs)
- [Nuxt UI 文档](https://ui.nuxt.com/)
- [Vue 3 文档](https://vuejs.org/)
- [Tailwind CSS 文档](https://tailwindcss.com/)

## 📄 许可证

[MIT License](LICENSE)

---

⭐ 如果这个项目对你有帮助，请给它一个 Star！
