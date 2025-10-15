<script setup lang="ts">
/**
 * 认证示例页面
 * 演示登录、获取用户信息、登出等功能
 *
 * 注意：useApi 会被 Nuxt 自动导入，TypeScript 错误可以忽略
 */

// 响应式 API 调用
const { data: currentUser, pending, error, refresh } = await useApi<{
  success: boolean
  data: {
    user: {
      id: number
      name: string
      email: string
    }
  }
}>('/auth/me')

// 命令式 API 调用
const { post } = useApi()

// 登录表单
const loginForm = ref({
  email: 'user@example.com',
  password: 'password123',
})

const loginLoading = ref(false)
const loginError = ref<string | null>(null)

// 登录处理
async function handleLogin() {
  loginLoading.value = true
  loginError.value = null

  try {
    const result = await post('/auth/login', loginForm.value)
    console.log('登录成功', result)

    // 刷新用户信息
    await refresh()
  }
  catch (err: unknown) {
    loginError.value = (err as Error).message || '登录失败'
    console.error('登录失败', err)
  }
  finally {
    loginLoading.value = false
  }
}

// 登出处理
async function handleLogout() {
  try {
    await post('/auth/logout')
    console.log('登出成功')

    // 刷新用户信息（应该返回 401）
    await refresh()
  }
  catch (err) {
    console.error('登出失败', err)
  }
}
</script>

<template>
  <div class="p-8 max-w-2xl mx-auto">
    <h1 class="text-3xl font-bold mb-8">
      认证示例
    </h1>

    <!-- 当前用户信息 -->
    <div class="mb-8 p-4 border rounded">
      <h2 class="text-xl font-semibold mb-4">
        当前用户
      </h2>

      <div v-if="pending">
        加载中...
      </div>

      <div
        v-else-if="error"
        class="text-red-600"
      >
        未登录或登录已过期
      </div>

      <div
        v-else-if="currentUser?.data?.user"
        class="space-y-2"
      >
        <p><strong>ID:</strong> {{ currentUser.data.user.id }}</p>
        <p><strong>姓名:</strong> {{ currentUser.data.user.name }}</p>
        <p><strong>邮箱:</strong> {{ currentUser.data.user.email }}</p>

        <button
          type="button"
          class="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          @click="handleLogout"
        >
          登出
        </button>
      </div>
    </div>

    <!-- 登录表单 -->
    <div
      v-if="error"
      class="p-4 border rounded"
    >
      <h2 class="text-xl font-semibold mb-4">
        登录
      </h2>

      <form
        class="space-y-4"
        @submit.prevent="handleLogin"
      >
        <div>
          <label class="block text-sm font-medium mb-1">邮箱</label>
          <input
            v-model="loginForm.email"
            type="email"
            class="w-full px-3 py-2 border rounded"
            required
          >
        </div>

        <div>
          <label class="block text-sm font-medium mb-1">密码</label>
          <input
            v-model="loginForm.password"
            type="password"
            class="w-full px-3 py-2 border rounded"
            required
          >
        </div>

        <div
          v-if="loginError"
          class="text-red-600"
        >
          {{ loginError }}
        </div>

        <button
          type="submit"
          class="w-full px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
          :disabled="loginLoading"
        >
          {{ loginLoading ? '登录中...' : '登录' }}
        </button>
      </form>
    </div>

    <!-- 使用说明 -->
    <div class="mt-8 p-4 bg-gray-50 rounded">
      <h3 class="font-semibold mb-2">
        使用说明
      </h3>
      <ul class="list-disc list-inside space-y-1 text-sm text-gray-600">
        <li>首次访问会显示"未登录"状态</li>
        <li>输入邮箱和密码点击登录</li>
        <li>登录成功后会自动设置 HttpOnly Cookie</li>
        <li>后续请求会自动携带 Cookie</li>
        <li>点击登出会清除 Cookie</li>
      </ul>
    </div>

    <!-- 架构说明 -->
    <div class="mt-8 p-4 bg-blue-50 rounded">
      <h3 class="font-semibold mb-2">
        架构说明
      </h3>
      <div class="text-sm text-gray-700 space-y-2">
        <p>
          <strong>浏览器 → Nuxt Server:</strong> 使用 HttpOnly Cookie (安全)
        </p>
        <p>
          <strong>Nuxt Server → 真实后端:</strong> 使用 JWT Token (标准)
        </p>
        <p class="text-xs text-gray-500 mt-2">
          打开浏览器开发者工具 → Application → Cookies 可以看到 token cookie
        </p>
      </div>
    </div>
  </div>
</template>
