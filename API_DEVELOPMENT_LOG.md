# API 封装开发记录

## 项目架构说明

采用 **Nuxt BFF (Backend for Frontend)** 架构：

```
┌─────────┐  Cookie   ┌──────────────┐  JWT Token  ┌────────────┐
│ 浏览器  │ <-------> │ Nuxt Server  │ <---------> │  真实后端  │
│ (Client)│           │    (BFF)     │             │  (Backend) │
└─────────┘           └──────────────┘             └────────────┘
```

### 架构优势

- 🔒 **浏览器 ↔️ Nuxt Server**: 使用 HttpOnly Cookie (防止 XSS 攻击)
- 🎯 **Nuxt Server ↔️ 真实后端**: 使用 JWT Token (标准 API 认证)
- 🔐 **安全性**: JWT Token 只在 Nuxt Server 存在,前端无法访问
- 🛡️ **SSR 友好**: Cookie 在 SSR 请求时自动携带
- 🌐 **标准化**: 后端使用标准 JWT,可服务多个客户端

### 认证流程

1. **登录**: 浏览器 → Nuxt Server → 后端 (获取 JWT)
2. **存储**: Nuxt Server 将 JWT 存入 HttpOnly Cookie
3. **请求**: 浏览器自动携带 Cookie → Nuxt Server 提取 JWT → 后端
4. **响应**: 后端 → Nuxt Server → 浏览器

---

## 第一步：前端请求封装 ✅

### 📋 实现方案

#### 1. **`app/plugins/api.ts`** - 保持纯净

- ✅ 修改 baseURL 为 `/api`（请求 Nuxt Server API）
- ✅ 配置 `credentials: 'include'` 自动携带 cookie
- ✅ 统一错误处理（401/403/404/500+）
- ✅ 保持 `$api` 原始功能不变

#### 2. **`app/composables/useApi.ts`** - 统一入口（支持双模式）

- ✅ **响应式数据获取**（传入 url）
- ✅ **命令式操作**（不传 url）
- ✅ 完整的 TypeScript 类型支持（函数重载）
- ✅ 单一 composable，使用更简洁

### 🎯 设计理念

**为什么采用单一 `useApi`？**

1. **统一入口**：一个 composable 解决所有场景
2. **智能判断**：根据是否传入 url 自动选择模式
3. **符合直觉**：响应式获取和命令式操作都用 `useApi`
4. **保持简洁**：plugin 保持纯净，所有逻辑在 composable

### 📝 使用示例

#### 模式一：响应式数据获取（传入 URL）

适用于页面数据、列表、详情等需要响应式的场景。

```vue
<script setup lang="ts">
interface User {
  id: number;
  name: string;
  email: string;
}

// 基础用法
const { data: users, pending, error, refresh } = await useApi<User[]>("/users");

// 带查询参数
const page = ref(1);
const { data: users } = await useApi<User[]>("/users", {
  query: { page, limit: 10 },
  watch: [page], // page 变化时自动重新请求
});

// 动态 URL
const userId = ref(1);
const { data: user } = await useApi<User>(() => `/users/${userId.value}`, {
  watch: [userId],
});
</script>

<template>
  <div>
    <div v-if="pending">加载中...</div>
    <div v-else-if="error">加载失败: {{ error.message }}</div>
    <ul v-else>
      <li v-for="user in users" :key="user.id">
        {{ user.name }} - {{ user.email }}
      </li>
    </ul>
    <button @click="refresh">刷新</button>
  </div>
</template>
```

#### 模式二：命令式操作（不传 URL）

适用于表单提交、删除、更新等一次性的操作。

```vue
<script setup lang="ts">
// 获取命令式方法
const { get, post, put, patch, delete: del } = useApi();

// 创建操作
const formData = ref({ name: "", email: "" });
const handleCreate = async () => {
  try {
    const newUser = await post<User>("/users", formData.value);
    console.log("创建成功", newUser);
  } catch (error) {
    console.error("创建失败", error);
  }
};

// 更新操作
const handleUpdate = async (id: number, updates: Partial<User>) => {
  try {
    await patch(`/users/${id}`, updates);
    console.log("更新成功");
  } catch (error) {
    console.error("更新失败", error);
  }
};

// 删除操作
const handleDelete = async (id: number) => {
  if (!confirm("确认删除？")) return;
  try {
    await del(`/users/${id}`);
    console.log("删除成功");
  } catch (error) {
    console.error("删除失败", error);
  }
};
</script>
```

#### 组合使用（完整示例）

```vue
<script setup lang="ts">
interface User {
  id: number;
  name: string;
  email: string;
}

// 1. 响应式获取列表
const page = ref(1);
const {
  data: users,
  pending,
  error,
  refresh,
} = await useApi<User[]>("/users", {
  query: { page },
  watch: [page],
});

// 2. 命令式操作
const { post, patch, delete: del } = useApi();

// 创建用户
const formData = ref({ name: "", email: "" });
const handleCreate = async () => {
  try {
    await post("/users", formData.value);
    formData.value = { name: "", email: "" };
    await refresh(); // 刷新列表
  } catch (error) {
    console.error("创建失败", error);
  }
};

// 更新用户
const handleUpdate = async (id: number, name: string) => {
  try {
    await patch(`/users/${id}`, { name });
    await refresh();
  } catch (error) {
    console.error("更新失败", error);
  }
};

// 删除用户
const handleDelete = async (id: number) => {
  if (!confirm("确认删除？")) return;
  try {
    await del(`/users/${id}`);
    await refresh();
  } catch (error) {
    console.error("删除失败", error);
  }
};

const nextPage = () => page.value++;
const prevPage = () => page.value--;
</script>

<template>
  <div>
    <!-- 创建表单 -->
    <form @submit.prevent="handleCreate">
      <input v-model="formData.name" placeholder="姓名" required />
      <input v-model="formData.email" placeholder="邮箱" required />
      <button type="submit">创建用户</button>
    </form>

    <!-- 用户列表 -->
    <div v-if="pending">加载中...</div>
    <div v-else-if="error">加载失败</div>
    <ul v-else>
      <li v-for="user in users" :key="user.id">
        {{ user.name }} - {{ user.email }}
        <button @click="handleUpdate(user.id, '新名字')">编辑</button>
        <button @click="handleDelete(user.id)">删除</button>
      </li>
    </ul>

    <!-- 分页 -->
    <button @click="prevPage" :disabled="page === 1">上一页</button>
    <span>第 {{ page }} 页</span>
    <button @click="nextPage">下一页</button>
  </div>
</template>
```

### 📊 使用场景对照表

| 场景           | 使用模式           | 示例代码                           |
| -------------- | ------------------ | ---------------------------------- |
| 页面数据、列表 | 响应式（传 URL）   | `useApi('/users')`                 |
| 详情页         | 响应式（传 URL）   | `useApi(() => \`/users/\${id}\`)`  |
| 表单提交       | 命令式（不传 URL） | `const { post } = useApi()`        |
| 删除操作       | 命令式（不传 URL） | `const { delete: del } = useApi()` |
| 更新操作       | 命令式（不传 URL） | `const { patch } = useApi()`       |

### ✅ 完成状态

- [x] `app/plugins/api.ts` 修改完成
- [x] `app/composables/useApi.ts` 重构完成（支持双模式）
- [x] 删除 `app/composables/useFetchWrapper.ts`（功能已合并）
- [x] 使用示例文档完成
- [ ] 实际项目中测试验证

---

## 第二步：Server 端认证中间件

### 📋 设计目标

创建 Server 端中间件，统一处理所有 API 请求的认证逻辑，避免在每个 API handler 中重复处理 token。

### 🎯 核心功能

#### 1. **统一认证检查**

- 自动检查所有 `/api/*` 请求的认证状态
- 白名单机制：部分公开接口无需认证（如登录、注册）
- 从 session 中获取 token 并存储到 `event.context`

#### 2. **Token 管理**

- 使用 `nuxt-auth-utils` 的 `getUserSession()` 获取 session
- 将 token 和用户信息存储到 `event.context.auth`
- 供后续 handler 直接使用，无需重复获取

#### 3. **错误处理**

- 未登录（无 token）：返回 401
- Token 过期/无效：清除 session，返回 401
- 统一的错误响应格式

### 📁 文件结构

```
server/
├── middleware/
│   └── auth.ts           # 认证中间件（新增）
└── api/
    ├── auth/
    │   ├── login.post.ts  # 登录接口（公开）
    │   └── me.get.ts      # 获取当前用户
    └── users/
        └── index.get.ts   # 需要认证
```

### 💡 实现方案

#### `server/middleware/auth.ts`

```typescript
export default defineEventHandler(async (event) => {
  // 只处理 /api 开头的请求
  if (!event.path.startsWith("/api")) {
    return;
  }

  // 公开接口白名单（不需要认证）
  const publicPaths = ["/api/auth/login", "/api/auth/register", "/api/health"];

  if (publicPaths.includes(event.path)) {
    return;
  }

  // 获取用户 session
  const { session } = await getUserSession(event);

  // 检查是否有 token
  if (!session?.token) {
    throw createError({
      statusCode: 401,
      message: "Unauthorized",
    });
  }

  // 将认证信息存储到 event.context，供后续 handler 使用
  event.context.auth = {
    token: session.token,
    user: session.user,
  };
});
```

### 🔧 配置说明

#### 白名单配置

可以将白名单提取到配置文件：

```typescript
// server/utils/auth.ts
export const PUBLIC_PATHS = [
  "/api/auth/login",
  "/api/auth/register",
  "/api/auth/refresh",
  "/api/health",
];

// 支持通配符
export function isPublicPath(path: string): boolean {
  return PUBLIC_PATHS.some((publicPath) => {
    if (publicPath.includes("*")) {
      const regex = new RegExp(publicPath.replace("*", ".*"));
      return regex.test(path);
    }
    return path === publicPath;
  });
}
```

#### 在中间件中使用

```typescript
// server/middleware/auth.ts
export default defineEventHandler(async (event) => {
  if (!event.path.startsWith("/api")) {
    return;
  }

  // 使用工具函数判断
  if (isPublicPath(event.path)) {
    return;
  }

  const { session } = await getUserSession(event);

  if (!session?.token) {
    throw createError({
      statusCode: 401,
      message: "Unauthorized",
    });
  }

  event.context.auth = {
    token: session.token,
    user: session.user,
  };
});
```

### 📝 使用示例

#### 在 API Handler 中使用

```typescript
// server/api/users/index.get.ts
export default defineEventHandler(async (event) => {
  // 从 context 中获取认证信息（已由中间件处理）
  const { token, user } = event.context.auth;

  console.log("当前用户:", user);
  console.log("Token:", token);

  // 使用 token 请求后端
  const config = useRuntimeConfig();
  const users = await $fetch("/users", {
    baseURL: config.backendApiBase,
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return users;
});
```

#### 处理可选认证

某些接口可能需要支持可选认证（登录和未登录都能访问，但返回不同内容）：

```typescript
// server/middleware/auth.ts
export default defineEventHandler(async (event) => {
  if (!event.path.startsWith("/api")) {
    return;
  }

  // 公开接口
  if (isPublicPath(event.path)) {
    return;
  }

  // 可选认证接口
  const optionalAuthPaths = ["/api/posts"];
  if (optionalAuthPaths.includes(event.path)) {
    const { session } = await getUserSession(event);
    if (session?.token) {
      event.context.auth = {
        token: session.token,
        user: session.user,
      };
    }
    return; // 不抛出错误，继续执行
  }

  // 必需认证的接口
  const { session } = await getUserSession(event);
  if (!session?.token) {
    throw createError({
      statusCode: 401,
      message: "Unauthorized",
    });
  }

  event.context.auth = {
    token: session.token,
    user: session.user,
  };
});
```

### 🔐 类型定义

为了更好的类型支持，可以扩展 `event.context` 的类型：

```typescript
// types/server.ts
declare module "h3" {
  interface H3EventContext {
    auth?: {
      token: string;
      user: {
        id: number;
        email: string;
        name: string;
        // 其他用户字段
      };
    };
  }
}

export {};
```

### ⚡ 性能优化

#### 1. 路径匹配优化

```typescript
// 使用 Set 提升查找性能
const publicPathsSet = new Set([
  "/api/auth/login",
  "/api/auth/register",
  "/api/health",
]);

if (publicPathsSet.has(event.path)) {
  return;
}
```

#### 2. 缓存 session

```typescript
// 避免重复获取 session
const SESSION_CACHE_KEY = Symbol("session");

export default defineEventHandler(async (event) => {
  if (!event.path.startsWith("/api")) {
    return;
  }

  // 从缓存中获取
  let session = event.context[SESSION_CACHE_KEY];
  if (!session) {
    const { session: userSession } = await getUserSession(event);
    session = userSession;
    event.context[SESSION_CACHE_KEY] = session;
  }

  // ... 后续逻辑
});
```

### ✅ 完成状态

- [x] `server/middleware/auth.ts` 创建完成
- [x] `server/utils/auth.ts` 工具函数创建完成
- [x] 支持公开接口白名单
- [x] 支持可选认证接口
- [x] Token 正确存储到 `event.context.auth`
- [x] `types/server.ts` 类型定义完成
- [x] 错误处理完善（401 统一响应）
- [ ] 实际项目中测试验证

### 📦 已完成的文件

1. **`server/middleware/auth.ts`**

   - ✅ 自动处理所有 `/api/*` 请求
   - ✅ 公开接口白名单机制
   - ✅ 可选认证接口支持
   - ✅ Token 存储到 `event.context.auth`

2. **`server/utils/auth.ts`**

   - ✅ `getAuthSession()` - 获取认证信息（支持 cookie 和 header）
   - ✅ `setAuthSession()` - 设置认证 session
   - ✅ `clearAuthSession()` - 清除认证 session
   - ✅ `isPublicPath()` - 判断是否公开路径

3. **`types/server.ts`**
   - ✅ 扩展 `H3EventContext` 类型
   - ✅ 定义 `AuthUser` 接口

### 🎯 优势总结

1. **统一管理**：所有认证逻辑集中在中间件
2. **避免重复**：API handler 无需重复处理 token
3. **易于维护**：修改认证逻辑只需改一处
4. **灵活配置**：支持公开接口、可选认证
5. **类型安全**：完整的 TypeScript 支持

---

## 第三步：Server 端请求后端封装 ✅

### 📋 设计目标

创建 Nuxt Server 请求真实后端的工具函数，自动注入 JWT Token。

### 🎯 核心功能

#### 1. **自动注入 JWT Token**

- 从 `event.context.auth` 中获取 token
- 自动添加到 `Authorization: Bearer {token}` header
- 支持关闭认证（公开接口）

#### 2. **统一配置**

- 统一的 `BACKEND_URL` 配置
- 统一的错误处理
- 自动处理 401（清除前端 session）

#### 3. **简洁的 API**

```typescript
// 简单用法
const user = await backendFetch(event, "/users/me");

// 不需要认证
const data = await backendFetch(event, "/public/data", { auth: false });

// POST 请求
const result = await backendFetch(event, "/posts", {
  method: "POST",
  body: { title: "Hello" },
});
```

### 📁 实现方案

#### `server/utils/backendFetch.ts`

核心工具函数，使用 `$fetch.create()` 创建配置好的请求实例：

```typescript
export function createBackendFetch(event: H3Event) {
  const config = useRuntimeConfig();
  const backendBaseURL = config.public.BACKEND_URL || "http://localhost:8000";

  return $fetch.create({
    baseURL: backendBaseURL,
    async onRequest({ options }) {
      // 自动注入 JWT token
      const needsAuth = options.auth !== false;
      if (needsAuth) {
        const session = event.context.auth;
        if (session?.token) {
          options.headers = {
            ...options.headers,
            Authorization: `Bearer ${session.token}`,
          };
        }
      }
    },
    async onResponseError({ response }) {
      // 401 自动清除前端 session
      if (response.status === 401) {
        clearAuthSession(event);
      }
    },
  });
}

export async function backendFetch<T>(
  event: H3Event,
  endpoint: string,
  options?: BackendFetchOptions
): Promise<T> {
  const fetch = createBackendFetch(event);
  return fetch<T>(endpoint, options);
}
```

### 📝 使用示例

#### 在 Server API 中使用

```typescript
// server/api/users/[id].get.ts
export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, "id");

  // 自动注入 token，转发到真实后端
  const user = await backendFetch(event, `/users/${id}`);

  return user;
});
```

#### 自定义请求选项

```typescript
// POST 请求
const result = await backendFetch(event, "/posts", {
  method: "POST",
  body: { title: "Hello", content: "World" },
});

// PUT 请求
const updated = await backendFetch(event, `/posts/${id}`, {
  method: "PUT",
  body: { title: "Updated" },
});

// 不需要认证的请求
const publicData = await backendFetch(event, "/public/stats", {
  auth: false,
});

// 带查询参数
const list = await backendFetch(event, "/posts", {
  query: { page: 1, limit: 10 },
});
```

### ✅ 完成状态

- [x] `server/utils/backendFetch.ts` 创建完成
- [x] 自动注入 JWT Token 到 Authorization header
- [x] 支持关闭认证（`auth: false`）
- [x] 自动处理 401 错误（清除前端 session）
- [x] 完整的 TypeScript 类型支持
- [x] 错误日志记录

---

## 第四步：认证相关 API ✅

### 📋 实现的 API

#### 1. **登录 API** - `server/api/auth/login.post.ts`

```typescript
export default defineEventHandler(async (event) => {
  const body = await readBody(event);

  // 转发到后端登录
  const data = await backendFetch(event, "/auth/login", {
    method: "POST",
    body,
    auth: false, // 登录接口不需要认证
  });

  // 将后端返回的 JWT 存入 cookie
  setAuthSession(event, data.token, data.user);

  return { success: true, data: { user: data.user } };
});
```

**流程**：

1. 接收登录请求（email, password）
2. 转发到真实后端 `/auth/login`
3. 后端返回 JWT token 和用户信息
4. 将 JWT 存入 HttpOnly Cookie
5. 返回用户信息（不包含 token）

#### 2. **登出 API** - `server/api/auth/logout.post.ts`

```typescript
export default defineEventHandler(async (event) => {
  // 可选：通知后端登出
  try {
    await backendFetch(event, "/auth/logout", { method: "POST" });
  } catch (error) {
    console.error("Backend logout failed:", error);
  }

  // 清除 cookie
  clearAuthSession(event);

  return { success: true, message: "登出成功" };
});
```

**流程**：

1. 通知后端登出（可选，忽略错误）
2. 清除本地 Cookie
3. 返回成功

#### 3. **获取当前用户** - `server/api/auth/me.get.ts`

```typescript
export default defineEventHandler(async (event) => {
  // 自动携带 token 请求后端
  const user = await backendFetch(event, "/auth/me");

  return { success: true, data: { user } };
});
```

**流程**：

1. 从 cookie 中提取 JWT token
2. 携带 token 请求后端 `/auth/me`
3. 返回用户信息

### 📝 前端使用示例

```vue
<script setup lang="ts">
const { post } = useApi();

// 登录
async function handleLogin() {
  const result = await post("/auth/login", {
    email: "user@example.com",
    password: "password",
  });

  if (result.success) {
    console.log("登录成功", result.data.user);
    // Cookie 已自动设置，后续请求自动携带
  }
}

// 获取当前用户
const { data: currentUser } = await useApi("/auth/me");

// 登出
async function handleLogout() {
  await post("/auth/logout");
  // Cookie 已清除
}
</script>
```

### ✅ 完成状态

- [x] 登录 API (`/api/auth/login`)
- [x] 登出 API (`/api/auth/logout`)
- [x] 获取当前用户 API (`/api/auth/me`)
- [x] Cookie 自动管理（设置/清除）
- [x] JWT Token 转发到后端

---

## 第五步：通用转发层 ✅

### 📋 设计目标

创建一个通用的 API 转发层，自动将所有 `/api/*` 请求转发到真实后端。

### 🎯 核心功能

#### 1. **自动转发**

- 所有 `/api/*` 请求（除认证相关）自动转发
- 保持相同的请求方法（GET/POST/PUT/DELETE 等）
- 保持相同的请求体和查询参数
- 自动注入 JWT Token

#### 2. **路径映射**

```
浏览器请求              Nuxt Server               真实后端
GET  /api/posts    ->   转发处理   ->   GET  /posts
POST /api/users    ->   转发处理   ->   POST /users
```

### 📁 实现方案

#### `server/api/[...].ts`

Catch-all 路由，匹配所有未被其他 API 处理的请求：

```typescript
export default defineEventHandler(async (event) => {
  // 去掉 /api 前缀
  const path = event.path.replace(/^\/api/, "");
  const method = event.method;

  // 获取请求体
  let body;
  if (["POST", "PUT", "PATCH"].includes(method)) {
    body = await readBody(event);
  }

  // 获取查询参数
  const query = getQuery(event);

  // 转发到真实后端（自动注入 token）
  const data = await backendFetch(event, path, {
    method,
    body,
    query,
  });

  return data;
});
```

### 📝 使用示例

前端直接调用，无需关心转发逻辑：

```vue
<script setup lang="ts">
const { get, post, put, delete: del } = useApi();

// 获取文章列表（自动转发到 /posts）
const posts = await get("/posts");

// 创建文章（自动转发到 /posts，自动注入 token）
const newPost = await post("/posts", {
  title: "Hello",
  content: "World",
});

// 更新文章（自动转发到 /posts/123）
await put(`/posts/123`, { title: "Updated" });

// 删除文章（自动转发到 /posts/123）
await del(`/posts/123`);
</script>
```

### 🎯 路由优先级

Nuxt Server API 的路由匹配顺序：

1. **精确匹配**: `server/api/auth/login.post.ts` → `/api/auth/login`
2. **动态路由**: `server/api/users/[id].get.ts` → `/api/users/:id`
3. **Catch-all**: `server/api/[...].ts` → 其他所有路径

因此，认证相关的 API（`/api/auth/*`）会优先匹配，不会被 catch-all 捕获。

### ✅ 完成状态

- [x] `server/api/[...].ts` 通用转发层创建
- [x] 自动转发所有 `/api/*` 请求
- [x] 保持请求方法、请求体、查询参数
- [x] 自动注入 JWT Token
- [x] 认证中间件自动处理权限

---

## 第六步：环境变量配置 ✅

### 📋 配置项

在 `nuxt.config.ts` 中添加：

```typescript
export default defineNuxtConfig({
  runtimeConfig: {
    public: {
      // 真实后端 API 地址
      BACKEND_URL: process.env.BACKEND_URL || "http://localhost:8000",
      NODE_ENV: process.env.NODE_ENV || "development",
    },
  },
});
```

### 📝 使用环境变量

创建 `.env` 文件：

```bash
# 开发环境
BACKEND_URL=http://localhost:8000

# 生产环境
# BACKEND_URL=https://api.example.com
```

### ✅ 完成状态

- [x] `nuxt.config.ts` 配置完成
- [x] 支持环境变量覆盖
- [x] 开发/生产环境区分

---

## 🎉 完成总结

### ✅ 已完成的功能

1. **前端请求封装**

   - ✅ `app/plugins/api.ts` - HTTP 客户端配置
   - ✅ `app/composables/useApi.ts` - 统一 API 调用接口

2. **Server 端认证中间件**

   - ✅ `server/middleware/auth.ts` - 自动认证检查
   - ✅ `server/utils/auth.ts` - 认证工具函数
   - ✅ `types/server.ts` - TypeScript 类型定义

3. **Server 端请求后端**

   - ✅ `server/utils/backendFetch.ts` - 自动注入 JWT Token

4. **认证相关 API**

   - ✅ `server/api/auth/login.post.ts` - 登录
   - ✅ `server/api/auth/logout.post.ts` - 登出
   - ✅ `server/api/auth/me.get.ts` - 获取当前用户

5. **通用转发层**

   - ✅ `server/api/[...].ts` - 自动转发所有请求

6. **环境变量配置**
   - ✅ `nuxt.config.ts` - BACKEND_URL 配置

### 🎯 架构优势

1. **安全性**：浏览器 Cookie + 后端 JWT，防止 XSS
2. **标准化**：后端使用标准 JWT，可服务多端
3. **SSR 友好**：Cookie 自动携带，无需额外处理
4. **统一入口**：所有请求通过 BFF，便于监控和控制
5. **类型安全**：完整的 TypeScript 支持

### 📚 使用流程

#### 1. 登录

```typescript
const { post } = useApi();
await post("/auth/login", { email, password });
// Cookie 自动设置
```

#### 2. 请求数据

```typescript
// 响应式
const { data: posts } = await useApi("/posts");

// 命令式
const { get } = useApi();
const posts = await get("/posts");
// 自动携带 cookie → Nuxt Server 提取 JWT → 后端
```

#### 3. 登出

```typescript
const { post } = useApi();
await post("/auth/logout");
// Cookie 自动清除
```

### 🚀 下一步

- [ ] 编写单元测试
- [ ] 添加请求日志
- [ ] 添加请求缓存
- [ ] 性能监控和优化

---

## 开发进度

- [x] 第一步：前端请求封装（已完成）
- [x] 第二步：Server 端认证中间件（已完成）
- [ ] 第三步：Server 端请求封装
- [ ] 第四步：认证相关 API
- [ ] 第五步：通用转发层
- [ ] 第六步：完整测试与优化
