# Nuxt 4 API 架构文档

## 目录
- [架构设计](#架构设计)
- [开发指南](#开发指南)
- [使用文档](#使用文档)
- [最佳实践](#最佳实践)
- [示例代码](#示例代码)

---

## 架构设计

### 设计理念

本方案采用简化的 BFF (Backend for Frontend) 架构，主要目标是：
1. **支持 SSR/SEO** - 实现服务端渲染以满足 SEO 需求
2. **统一接口** - 提供一致的 API 调用方式
3. **简单易用** - 最小化配置和代码复杂度
4. **类型安全** - 完整的 TypeScript 支持

### 架构图

```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│   Browser    │────▶│ Nuxt Server  │────▶│   Backend    │
│              │     │              │     │   API        │
└──────────────┘     └──────────────┘     └──────────────┘
     useAPI()          /api/[...all]        真实的后端服务
   (useFetch封装)        (API代理)         (nest.wangcaiyuan.com)
```

### 核心组件

#### 1. 客户端 API 封装 (`app/composables/useAPI.ts`)
- **useAPI**: 基础的 `useFetch` 封装，自动添加 `/api` 前缀，处理认证
- **useLazyAPI**: 懒加载版本，用于客户端渲染

#### 2. 服务端 API 工具 (`server/utils/api.ts`)
- **createAPI**: 创建配置好的 `$fetch` 实例
- **apiCall**: 便捷的 API 请求方法
- **forwardRequest**: 自动转发请求到后端

#### 3. API 代理 (`server/api/[...all].ts`)
- 统一处理所有 `/api` 请求
- 自动转发到真实后端
- 统一错误处理

---

## 开发指南

### 环境配置

#### 1. 环境变量设置 (`.env`)

```bash
# 后端 API 基础地址
NUXT_PUBLIC_API_BASE=https://nest.wangcaiyuan.com

# API 路径前缀（可选）
NUXT_PUBLIC_API_PREFIX=api

# 服务端口
PORT=3333
```

#### 2. Nuxt 配置 (`nuxt.config.ts`)

```typescript
export default defineNuxtConfig({
  runtimeConfig: {
    public: {
      apiBase: '', // 从环境变量 NUXT_PUBLIC_API_BASE 读取
      apiPrefix: '', // 从环境变量 NUXT_PUBLIC_API_PREFIX 读取
    },
  },
})
```

### 创建 API 路由

#### 方式 1: 自动代理（推荐）

所有 `/api/*` 请求会自动转发到后端：

```typescript
// 客户端请求 /api/users/1
// 自动转发到 https://nest.wangcaiyuan.com/api/users/1
```

#### 方式 2: 自定义 API 路由

在 `server/api/` 目录下创建文件：

```typescript
// server/api/custom/endpoint.get.ts
import { apiCall } from '~/server/utils/api'

export default defineEventHandler(async (event) => {
  // 自定义逻辑
  const data = await apiCall(event, '/backend/endpoint')

  // 数据处理
  return {
    ...data,
    timestamp: Date.now(),
  }
})
```

### 错误处理

服务端 API 会统一处理错误：

```typescript
// server/api/[...all].ts
try {
  return await forwardRequest(event)
} catch (error) {
  const err = error as { statusCode?: number, message?: string }
  throw createError({
    statusCode: err.statusCode || 500,
    statusMessage: err.message || 'Internal Server Error',
  })
}
```

---

## 使用文档

### 客户端使用

#### 基础用法

```vue
<script setup lang="ts">
// 1. SSR 数据获取（会在服务端执行）
const { data, pending, error, refresh } = await useAPI('/users')

// 2. 客户端懒加载（仅在客户端执行）
const { data: lazyData } = await useLazyAPI('/posts')
</script>
```

#### 带参数请求

```typescript
// GET 请求带查询参数
const { data } = await useAPI('/users', {
  query: { page: 1, limit: 10 }
})

// POST 请求
const { data } = await useAPI('/users', {
  method: 'POST',
  body: {
    name: 'John Doe',
    email: 'john@example.com'
  }
})
```

#### 响应式数据

```vue
<script setup lang="ts">
const page = ref(1)

// URL 会根据 page 变化自动更新
const { data } = await useAPI(() => `/users?page=${page.value}`)

// 改变 page 会触发重新请求
function nextPage() {
  page.value++
}
</script>
```

#### 错误处理

```typescript
const { data, error } = await useAPI('/users')

if (error.value) {
  // 处理错误
  console.error('请求失败:', error.value)
}
```

### 服务端使用

#### 在 API 路由中调用后端

```typescript
// server/api/example.get.ts
import { apiCall } from '~/server/utils/api'

export default defineEventHandler(async (event) => {
  // 直接调用后端 API
  const users = await apiCall(event, '/users')

  // 并行请求
  const [posts, comments] = await Promise.all([
    apiCall(event, '/posts'),
    apiCall(event, '/comments')
  ])

  return { users, posts, comments }
})
```

#### 转发请求

```typescript
// server/api/proxy/[...path].ts
import { forwardRequest } from '~/server/utils/api'

export default defineEventHandler(async (event) => {
  // 自动转发，保留所有请求信息
  return await forwardRequest(event)
})
```

---

## 最佳实践

### 1. 类型定义

始终为 API 响应定义类型：

```typescript
// types/api.ts
export interface User {
  id: number
  name: string
  email: string
}

export interface ApiResponse<T> {
  data: T
  message: string
  timestamp: number
}
```

使用类型：

```typescript
const { data } = await useAPI<ApiResponse<User[]>>('/users')
```

### 2. 请求缓存

利用 `useFetch` 的缓存机制：

```typescript
// 使用 key 控制缓存
const { data } = await useAPI('/users', {
  key: 'users-list',
  // 缓存时间（毫秒）
  getCachedData(key) {
    const data = nuxtApp.payload.data[key] || nuxtApp.static.data[key]
    if (!data) return

    const expirationDate = new Date(data.fetchedAt + 5 * 60 * 1000) // 5分钟
    if (expirationDate > new Date()) {
      return data
    }
  }
})
```

### 3. 加载状态处理

```vue
<template>
  <div>
    <!-- 加载中 -->
    <div v-if="pending">
      <UProgress animation="carousel" />
    </div>

    <!-- 错误状态 -->
    <UAlert v-else-if="error" color="red">
      {{ error.message }}
    </UAlert>

    <!-- 数据展示 -->
    <div v-else>
      <!-- 你的内容 -->
    </div>
  </div>
</template>
```

### 4. 认证处理

`useAPI` 会自动处理 401 错误：

```typescript
// app/composables/useAPI.ts
onResponseError: (context) => {
  if (context.response.status === 401) {
    // 清除 token
    const tokenCookie = useCookie('token')
    tokenCookie.value = null
    // 跳转登录
    navigateTo('/login')
  }
}
```

### 5. 环境区分

```typescript
// 根据环境使用不同的 API
const { data } = await useAPI('/users', {
  // 仅在客户端执行
  server: false,
  // 仅在服务端执行
  client: false,
})
```

---

## 示例代码

### 完整的 CRUD 示例

```vue
<!-- pages/users.vue -->
<template>
  <UContainer>
    <UCard>
      <template #header>
        <div class="flex justify-between items-center">
          <h1 class="text-2xl font-bold">用户管理</h1>
          <UButton @click="showCreateModal = true">
            新增用户
          </UButton>
        </div>
      </template>

      <!-- 用户列表 -->
      <div v-if="pending" class="flex justify-center p-8">
        <UProgress animation="carousel" />
      </div>

      <UTable v-else :rows="users" :columns="columns">
        <template #actions-data="{ row }">
          <UButtonGroup>
            <UButton
              variant="soft"
              size="xs"
              @click="editUser(row)"
            >
              编辑
            </UButton>
            <UButton
              color="red"
              variant="soft"
              size="xs"
              @click="deleteUser(row.id)"
            >
              删除
            </UButton>
          </UButtonGroup>
        </template>
      </UTable>
    </UCard>

    <!-- 创建/编辑模态框 -->
    <UModal v-model="showCreateModal">
      <UCard>
        <template #header>
          <h3 class="text-lg font-semibold">
            {{ editingUser ? '编辑用户' : '新增用户' }}
          </h3>
        </template>

        <UForm :state="formState" @submit="handleSubmit">
          <UFormGroup label="姓名" name="name" required>
            <UInput v-model="formState.name" />
          </UFormGroup>

          <UFormGroup label="邮箱" name="email" required>
            <UInput v-model="formState.email" type="email" />
          </UFormGroup>

          <div class="flex justify-end gap-2 mt-4">
            <UButton
              variant="ghost"
              @click="showCreateModal = false"
            >
              取消
            </UButton>
            <UButton type="submit">
              {{ editingUser ? '更新' : '创建' }}
            </UButton>
          </div>
        </UForm>
      </UCard>
    </UModal>
  </UContainer>
</template>

<script setup lang="ts">
import type { User } from '~/types/api'

// 表格列配置
const columns = [
  { key: 'id', label: 'ID' },
  { key: 'name', label: '姓名' },
  { key: 'email', label: '邮箱' },
  { key: 'actions', label: '操作' }
]

// 获取用户列表
const {
  data: users,
  pending,
  refresh
} = await useAPI<User[]>('/users', {
  default: () => []
})

// 表单状态
const showCreateModal = ref(false)
const editingUser = ref<User | null>(null)
const formState = ref({
  name: '',
  email: ''
})

// 编辑用户
function editUser(user: User) {
  editingUser.value = user
  formState.value = {
    name: user.name,
    email: user.email
  }
  showCreateModal.value = true
}

// 提交表单
async function handleSubmit() {
  try {
    if (editingUser.value) {
      // 更新用户
      await useAPI(`/users/${editingUser.value.id}`, {
        method: 'PUT',
        body: formState.value
      })
    } else {
      // 创建用户
      await useAPI('/users', {
        method: 'POST',
        body: formState.value
      })
    }

    // 刷新列表
    await refresh()

    // 关闭模态框
    showCreateModal.value = false
    editingUser.value = null
    formState.value = { name: '', email: '' }

    // 显示成功提示
    const toast = useToast()
    toast.add({
      title: editingUser.value ? '更新成功' : '创建成功',
      color: 'green'
    })
  } catch (error) {
    // 显示错误提示
    const toast = useToast()
    toast.add({
      title: '操作失败',
      description: error.message,
      color: 'red'
    })
  }
}

// 删除用户
async function deleteUser(id: number) {
  if (!confirm('确定要删除这个用户吗？')) return

  try {
    await useAPI(`/users/${id}`, {
      method: 'DELETE'
    })

    await refresh()

    const toast = useToast()
    toast.add({
      title: '删除成功',
      color: 'green'
    })
  } catch (error) {
    const toast = useToast()
    toast.add({
      title: '删除失败',
      description: error.message,
      color: 'red'
    })
  }
}
</script>
```

### 数据聚合示例

```typescript
// server/api/dashboard.get.ts
import { apiCall } from '~/server/utils/api'

export default defineEventHandler(async (event) => {
  // 并行获取多个数据源
  const [users, posts, stats] = await Promise.all([
    apiCall(event, '/users?limit=10'),
    apiCall(event, '/posts?status=published'),
    apiCall(event, '/stats/overview')
  ])

  // 聚合数据
  return {
    summary: {
      totalUsers: users.length,
      totalPosts: posts.length,
      ...stats
    },
    recentUsers: users.slice(0, 5),
    popularPosts: posts.slice(0, 5),
    timestamp: Date.now()
  }
})
```

---

## 故障排查

### 常见问题

1. **CORS 错误**
   - 确保后端允许来自 Nuxt 服务器的请求
   - 检查环境变量配置是否正确

2. **401 认证错误**
   - 检查 token 是否正确设置在 cookie 中
   - 验证后端的认证逻辑

3. **类型错误**
   - 确保为 API 响应定义了正确的类型
   - 使用 `as` 断言或泛型参数

4. **SSR/CSR 不一致**
   - 使用 `useLazyAPI` 处理仅客户端数据
   - 检查 `server: false` 配置

### 调试技巧

```typescript
// 开启详细日志
const { data, error } = await useAPI('/users', {
  onRequest({ request, options }) {
    console.log('[Request]', request, options)
  },
  onResponse({ request, response, options }) {
    console.log('[Response]', response._data)
  },
  onResponseError({ request, response, options }) {
    console.error('[Error]', response._data)
  }
})
```

---

## 总结

这个简化的 API 架构方案提供了：

✅ **简单直观** - 仅 3 个核心文件
✅ **类型安全** - 完整的 TypeScript 支持
✅ **SSR 友好** - 原生支持服务端渲染
✅ **统一处理** - 认证、错误、代理一体化
✅ **易于扩展** - 可按需添加自定义逻辑

适合需要 SEO 支持的中小型项目，同时保持了良好的可维护性和扩展性。