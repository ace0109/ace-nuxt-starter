<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
    <UContainer>
      <div class="mb-8">
        <h1 class="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          API 使用示例
        </h1>
        <p class="text-gray-600 dark:text-gray-400">
          展示 useAPI 和 useLazyAPI 的各种使用方式
        </p>
      </div>

      <!-- 基础数据获取 -->
      <UCard class="mb-6">
        <template #header>
          <div class="flex justify-between items-center">
            <h2 class="text-xl font-semibold">
              基础数据获取 (SSR)
            </h2>
            <UButton
              variant="soft"
              size="xs"
              @click="() => refreshUsers()"
            >
              刷新数据
            </UButton>
          </div>
        </template>

        <div
          v-if="usersPending"
          class="flex justify-center py-8"
        >
          <UProgress animation="carousel" />
        </div>

        <UAlert
          v-else-if="usersError"
          color="primary"
          class="mb-4"
        >
          <template #description>
            {{ usersError.message }}
          </template>
        </UAlert>

        <div v-else-if="users?.data">
          <UTable
            :rows="users.data"
          >
            <template #id-data="{ row }">
              {{ (row as unknown as User).id }}
            </template>
            <template #name-data="{ row }">
              {{ (row as unknown as User).name }}
            </template>
            <template #email-data="{ row }">
              {{ (row as unknown as User).email }}
            </template>
            <template #status-data="{ row }">
              <UBadge
                :color="getStatusColor((row as unknown as User).status)"
                variant="subtle"
              >
                {{ (row as unknown as User).status }}
              </UBadge>
            </template>
            <template #role-data="{ row }">
              <UBadge variant="outline">
                {{ (row as unknown as User).role }}
              </UBadge>
            </template>
          </UTable>

          <div
            v-if="users.pagination"
            class="mt-4 flex justify-center"
          >
            <UPagination
              v-model="currentPage"
              :page-count="users.pagination.limit"
              :total="users.pagination.total"
            />
          </div>
        </div>
      </UCard>

      <!-- 懒加载示例 -->
      <UCard class="mb-6">
        <template #header>
          <h2 class="text-xl font-semibold">
            懒加载数据 (Client Only)
          </h2>
        </template>

        <div class="space-y-4">
          <UButton
            :loading="dashboardLoading"
            @click="loadDashboard"
          >
            加载仪表盘数据
          </UButton>

          <div
            v-if="dashboard"
            class="grid grid-cols-1 md:grid-cols-3 gap-4"
          >
            <UCard>
              <div class="text-center">
                <div class="text-2xl font-bold text-primary">
                  {{ dashboard.summary.totalUsers }}
                </div>
                <div class="text-sm text-gray-500">
                  用户总数
                </div>
              </div>
            </UCard>

            <UCard>
              <div class="text-center">
                <div class="text-2xl font-bold text-primary">
                  {{ dashboard.summary.totalPosts }}
                </div>
                <div class="text-sm text-gray-500">
                  文章总数
                </div>
              </div>
            </UCard>

            <UCard>
              <div class="text-center">
                <div class="text-2xl font-bold text-primary">
                  {{ dashboard.summary.activeUsers || 0 }}
                </div>
                <div class="text-sm text-gray-500">
                  活跃用户
                </div>
              </div>
            </UCard>
          </div>
        </div>
      </UCard>

      <!-- POST 请求示例 -->
      <UCard class="mb-6">
        <template #header>
          <h2 class="text-xl font-semibold">
            POST 请求示例
          </h2>
        </template>

        <UForm
          :state="formState"
          :validate="validateForm"
          class="space-y-4"
          @submit="handleSubmit"
        >
          <div>
            <label class="block text-sm font-medium mb-1">姓名</label>
            <UInput
              v-model="formState.name"
              placeholder="请输入姓名"
            />
          </div>

          <div>
            <label class="block text-sm font-medium mb-1">邮箱</label>
            <UInput
              v-model="formState.email"
              type="email"
              placeholder="请输入邮箱"
            />
          </div>

          <div>
            <label class="block text-sm font-medium mb-1">角色</label>
            <USelect
              v-model="formState.role"
              :options="roleOptions"
              placeholder="选择角色"
            />
          </div>

          <div class="flex gap-2">
            <UButton
              type="submit"
              :loading="submitting"
            >
              提交
            </UButton>
            <UButton
              variant="ghost"
              @click="resetForm"
            >
              重置
            </UButton>
          </div>
        </UForm>

        <UAlert
          v-if="submitResult"
          :color="submitResult.success ? 'green' : 'red'"
          class="mt-4"
        >
          <template #description>
            {{ submitResult.message }}
          </template>
        </UAlert>
      </UCard>

      <!-- 响应式数据示例 -->
      <UCard>
        <template #header>
          <h2 class="text-xl font-semibold">
            响应式数据更新
          </h2>
        </template>

        <div class="space-y-4">
          <div class="flex items-center gap-4">
            <div>
              <label class="block text-sm font-medium mb-1">搜索关键词</label>
              <UInput
                v-model="searchQuery"
                placeholder="输入搜索内容..."
              />
            </div>

            <div>
              <label class="block text-sm font-medium mb-1">每页条数</label>
              <USelect
                v-model="pageSize"
                :options="[5, 10, 20, 50]"
              />
            </div>
          </div>

          <div
            v-if="searchPending"
            class="text-center py-4"
          >
            <UProgress animation="carousel" />
          </div>

          <div v-else-if="searchResults">
            <div class="text-sm text-gray-600 mb-2">
              找到 {{ searchResults.length }} 条结果
            </div>
            <div class="space-y-2">
              <UCard
                v-for="item in searchResults"
                :key="item.id"
              >
                <div class="flex justify-between items-center">
                  <div>
                    <div class="font-medium">
                      {{ item.name }}
                    </div>
                    <div class="text-sm text-gray-500">
                      {{ item.email }}
                    </div>
                  </div>
                  <UBadge>
                    {{ item.role }}
                  </UBadge>
                </div>
              </UCard>
            </div>
          </div>
        </div>
      </UCard>
    </UContainer>
  </div>
</template>

<script setup lang="ts">
import { useAPI, useLazyAPI } from '~/composables/useAPI'

// 类型定义
interface User {
  id: number
  name: string
  email: string
  avatar: string
  status: 'active' | 'inactive' | 'pending'
  role: 'admin' | 'user' | 'guest'
  createdAt: string
}

interface ApiResponse<T> {
  data: T
  pagination?: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
  timestamp: number
}

interface DashboardData {
  summary: {
    totalUsers: number
    totalPosts: number
    activeUsers?: number
  }
  recentActivity: {
    users: User[]
    posts: unknown[]
  }
  metadata: {
    generatedAt: string
    apiVersion: string
    cached: boolean
  }
}

// 获取状态颜色
function getStatusColor(status: string) {
  const colorMap: Record<string, 'success' | 'secondary' | 'warning'> = {
    active: 'success',
    inactive: 'secondary',
    pending: 'warning',
  }
  return colorMap[status] || 'secondary'
}

// ========== 基础数据获取 (SSR) ==========
const currentPage = ref(1)
const {
  data: users,
  pending: usersPending,
  error: usersError,
  refresh: refreshUsers,
} = await useAPI<ApiResponse<User[]>>(() => `/example/mock-users?page=${currentPage.value}&limit=5`)

// ========== 懒加载数据 ==========
const dashboard = ref<DashboardData | null>(null)
const dashboardLoading = ref(false)

async function loadDashboard() {
  dashboardLoading.value = true
  try {
    const { data } = await useLazyAPI<DashboardData>('/example/dashboard')
    // 等待数据加载完成
    watch(data, (newData) => {
      if (newData) {
        dashboard.value = newData
        dashboardLoading.value = false
      }
    }, { immediate: true })
  }
  catch (error) {
    console.error('Failed to load dashboard:', error)
    dashboardLoading.value = false
  }
}

// ========== POST 请求示例 ==========
const formState = ref({
  name: '',
  email: '',
  role: 'user',
})

// 表单验证
function validateForm(state: typeof formState.value) {
  const errors = []
  if (!state.name || state.name.length < 2) {
    errors.push({ path: 'name', message: '姓名至少2个字符' })
  }
  if (!state.email || !state.email.includes('@')) {
    errors.push({ path: 'email', message: '请输入有效的邮箱地址' })
  }
  return errors
}

const roleOptions = ['admin', 'user', 'guest']
const submitting = ref(false)
const submitResult = ref<{ success: boolean, message: string } | null>(null)

async function handleSubmit() {
  submitting.value = true
  submitResult.value = null

  try {
    const { data } = await useAPI<{ message: string }>('/example/users', {
      method: 'POST',
      body: formState.value,
    })

    // 等待响应
    await new Promise((resolve) => {
      const unwatch = watch(data, (newData) => {
        if (newData) {
          submitResult.value = {
            success: true,
            message: newData.message || '提交成功！',
          }
          resetForm()
          unwatch()
          resolve(true)
        }
      }, { immediate: true })
    })
  }
  catch (err: unknown) {
    const error = err as Error
    submitResult.value = {
      success: false,
      message: error.message || '提交失败，请重试',
    }
  }
  finally {
    submitting.value = false
  }
}

function resetForm() {
  formState.value = {
    name: '',
    email: '',
    role: 'user',
  }
}

// ========== 响应式数据更新 ==========
const searchQuery = ref('')
const pageSize = ref(10)

// 使用响应式 URL 函数
const {
  data: searchData,
  pending: searchPending,
} = await useLazyAPI<ApiResponse<User[]>>(() => {
  const params = new URLSearchParams({
    q: searchQuery.value,
    limit: pageSize.value.toString(),
  })
  return `/example/mock-users?${params}`
})

const searchResults = computed(() => {
  if (!searchData.value?.data) return []
  // 模拟搜索过滤
  if (!searchQuery.value) return searchData.value.data
  return searchData.value.data.filter(user =>
    user.name.toLowerCase().includes(searchQuery.value.toLowerCase())
    || user.email.toLowerCase().includes(searchQuery.value.toLowerCase()),
  )
})

// 页面 SEO
useSeoMeta({
  title: 'API 使用示例',
  description: '展示 Nuxt 4 中 useAPI 和 useLazyAPI 的各种使用方式',
})
</script>
