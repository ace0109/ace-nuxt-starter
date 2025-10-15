# 快速入门指南

## 架构概览

```
┌─────────┐  Cookie   ┌──────────────┐  JWT Token  ┌────────────┐
│ 浏览器  │ <-------> │ Nuxt Server  │ <---------> │  真实后端  │
│ (Client)│           │    (BFF)     │             │  (Backend) │
└─────────┘           └──────────────┘             └────────────┘
```

- **浏览器 → Nuxt Server**: 使用 HttpOnly Cookie (安全)
- **Nuxt Server → 真实后端**: 使用 JWT Token (标准)

---

## 环境配置

### 1. 创建 `.env` 文件

```bash
# 复制示例文件
cp .env.example .env

# 编辑配置
BACKEND_URL=http://localhost:8000
```

### 2. 安装依赖

```bash
pnpm install
```

### 3. 启动开发服务器

```bash
pnpm dev
```

---

## 前端使用

### 方式一：响应式数据获取（推荐用于页面数据）

适用于需要响应式的场景：列表、详情、统计等。

```vue
<script setup lang="ts">
interface Post {
  id: number;
  title: string;
  content: string;
}

// 基础用法
const { data: posts, pending, error, refresh } = await useApi<Post[]>("/posts");

// 带查询参数（响应式）
const page = ref(1);
const { data: posts } = await useApi<Post[]>("/posts", {
  query: { page, limit: 10 },
  watch: [page], // page 变化时自动重新请求
});
</script>

<template>
  <div>
    <div v-if="pending">加载中...</div>
    <div v-else-if="error">{{ error.message }}</div>
    <ul v-else>
      <li v-for="post in posts" :key="post.id">
        {{ post.title }}
      </li>
    </ul>
    <button @click="refresh">刷新</button>
  </div>
</template>
```

### 方式二：命令式操作（推荐用于表单提交）

适用于一次性操作：登录、提交、删除等。

```vue
<script setup lang="ts">
const { get, post, put, patch, delete: del } = useApi();

// GET 请求
async function loadPosts() {
  const posts = await get<Post[]>("/posts");
  console.log(posts);
}

// POST 请求（创建）
async function createPost() {
  const newPost = await post("/posts", {
    title: "Hello",
    content: "World",
  });
  console.log("创建成功", newPost);
}

// PUT 请求（更新）
async function updatePost(id: number) {
  await put(`/posts/${id}`, {
    title: "Updated Title",
  });
}

// DELETE 请求
async function deletePost(id: number) {
  await del(`/posts/${id}`);
}
</script>
```

---

## 认证流程

### 1. 登录

```vue
<script setup lang="ts">
const { post } = useApi();

async function handleLogin() {
  try {
    const result = await post("/auth/login", {
      email: "user@example.com",
      password: "password123",
    });

    console.log("登录成功", result.data.user);
    // Cookie 已自动设置，后续请求自动携带
  } catch (error) {
    console.error("登录失败", error);
  }
}
</script>
```

**流程**：

1. 浏览器发送登录请求到 `/api/auth/login`
2. Nuxt Server 转发到真实后端 `/auth/login`
3. 后端返回 JWT token 和用户信息
4. Nuxt Server 将 JWT 存入 HttpOnly Cookie
5. 返回用户信息给浏览器

### 2. 获取当前用户

```vue
<script setup lang="ts">
// 响应式获取当前用户
const { data: currentUser, pending } = await useApi("/auth/me");
</script>

<template>
  <div v-if="pending">加载中...</div>
  <div v-else>欢迎, {{ currentUser?.user.name }}</div>
</template>
```

### 3. 登出

```vue
<script setup lang="ts">
const { post } = useApi();

async function handleLogout() {
  await post("/auth/logout");
  // Cookie 已自动清除
  console.log("登出成功");
}
</script>
```

---

## Server API 开发

### 创建新的 API 端点

所有 `/api/*` 请求会自动转发到真实后端，无需手动创建。但如果需要自定义逻辑：

#### 示例：自定义用户 API

```typescript
// server/api/users/[id].get.ts
import { backendFetch } from "../../utils/backendFetch";

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, "id");

  // 自动注入 JWT token 并转发到后端
  const user = await backendFetch(event, `/users/${id}`);

  // 可以在这里添加额外的处理逻辑
  return {
    success: true,
    data: user,
  };
});
```

#### 不需要认证的 API

```typescript
// server/api/public/stats.get.ts
import { backendFetch } from "../../utils/backendFetch";

export default defineEventHandler(async (event) => {
  // auth: false 表示不需要认证
  const stats = await backendFetch(event, "/public/stats", {
    auth: false,
  });

  return stats;
});
```

---

## 认证中间件配置

### 添加公开路径

编辑 `server/utils/auth.ts`：

```typescript
export function isPublicPath(path: string): boolean {
  const PUBLIC_PATHS = [
    "/api/auth/login", // 登录
    "/api/auth/register", // 注册
    "/api/auth/refresh", // 刷新 token
    "/api/health", // 健康检查
    "/api/public/*", // 所有 /api/public/* 路径
  ];

  return PUBLIC_PATHS.some((publicPath) => {
    if (publicPath.includes("*")) {
      const regex = new RegExp(publicPath.replace("*", ".*"));
      return regex.test(path);
    }
    return path === publicPath;
  });
}
```

---

## 错误处理

### 前端自动处理

`app/plugins/api.ts` 已配置全局错误处理：

- **401 Unauthorized**: 自动跳转登录页
- **403 Forbidden**: 显示"无权限"提示
- **404 Not Found**: 显示"资源不存在"
- **500+ Server Error**: 显示"服务器错误"

### 自定义错误处理

```vue
<script setup lang="ts">
const { post } = useApi();

async function handleSubmit() {
  try {
    await post("/posts", { title: "Test" });
  } catch (error: any) {
    // 自定义错误处理
    if (error.statusCode === 422) {
      console.error("验证失败", error.data);
    }
  }
}
</script>
```

---

## 常见问题

### Q1: 如何查看 Cookie？

在浏览器开发者工具：Application → Cookies → 查看 `token` cookie。

注意：由于是 HttpOnly，JavaScript 无法直接访问（安全特性）。

### Q2: 如何在 SSR 中使用认证？

Cookie 会自动在 SSR 请求中携带：

```vue
<script setup lang="ts">
// SSR 时，cookie 会自动从浏览器请求转发到 Nuxt Server
const { data: user } = await useApi("/auth/me");
// 如果未登录，会返回 401 错误
</script>
```

### Q3: 如何刷新 Token？

如果后端支持 refresh token：

```typescript
// server/api/auth/refresh.post.ts
export default defineEventHandler(async (event) => {
  const { refreshToken } = await readBody(event);

  const data = await backendFetch(event, "/auth/refresh", {
    method: "POST",
    body: { refreshToken },
    auth: false,
  });

  // 更新 cookie
  setAuthSession(event, data.token, data.user);

  return { success: true };
});
```

### Q4: 如何调试请求？

查看 Nuxt Server 日志：

```bash
# 开发环境会自动打印请求日志
pnpm dev

# 查看 backendFetch 的错误日志
[Backend API Error] { status: 401, url: '...' }
```

---

## 生产部署

### 1. 设置生产环境变量

```bash
# .env.production
BACKEND_URL=https://api.example.com
NODE_ENV=production
```

### 2. 构建项目

```bash
pnpm build
```

### 3. 启动生产服务器

```bash
pnpm start
```

---

## 项目结构

```
app/
├── plugins/
│   └── api.ts              # HTTP 客户端配置
├── composables/
│   └── useApi.ts           # 统一 API 调用接口
└── pages/
    └── index.vue           # 使用 useApi

server/
├── middleware/
│   └── auth.ts             # 认证中间件（自动检查 token）
├── utils/
│   ├── auth.ts             # 认证工具函数
│   └── backendFetch.ts     # 请求后端工具（自动注入 JWT）
└── api/
    ├── auth/
    │   ├── login.post.ts   # 登录 API
    │   ├── logout.post.ts  # 登出 API
    │   └── me.get.ts       # 获取当前用户
    └── [...].ts            # 通用转发层

types/
└── server.ts               # TypeScript 类型定义
```

---

## 更多文档

- [完整开发记录](./API_DEVELOPMENT_LOG.md) - 详细的架构设计和实现说明
- [Nuxt 官方文档](https://nuxt.com)
- [H3 文档](https://h3.unjs.io)
