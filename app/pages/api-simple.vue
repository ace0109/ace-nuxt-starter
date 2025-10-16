<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
    <UContainer>
      <!-- 页面标题 -->
      <div class="mb-8">
        <h1 class="text-3xl font-bold mb-2">
          API 简单示例
        </h1>
        <p class="text-gray-600 dark:text-gray-400">
          使用 useAPI 进行数据请求的基础示例
        </p>
      </div>

      <!-- 数据展示 -->
      <UCard>
        <template #header>
          <div class="flex justify-between items-center">
            <h2 class="text-xl font-semibold">
              用户列表
            </h2>
            <div class="flex gap-2">
              <UButton
                variant="soft"
                size="sm"
                :loading="pending"
                @click="() => refresh()"
              >
                刷新
              </UButton>
            </div>
          </div>
        </template>

        <!-- 加载状态 -->
        <div
          v-if="pending"
          class="flex justify-center py-12"
        >
          <UProgress animation="carousel" />
        </div>

        <!-- 错误提示 -->
        <UAlert
          v-else-if="error"
          color="primary"
          class="mb-4"
        >
          <template #title>
            加载失败
          </template>
          <template #description>
            {{ error.message }}
          </template>
        </UAlert>

        <!-- 数据表格 -->
        <div v-else-if="data?.data">
          <UTable
            :rows="data.data"
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
                :color="(row as unknown as User).status === 'active' ? 'primary' : 'secondary'"
                variant="subtle"
              >
                {{ (row as unknown as User).status }}
              </UBadge>
            </template>
            <template #actions-data="{ row }">
              <UButton
                color="primary"
                variant="ghost"
                size="xs"
                @click="deleteUser((row as unknown as User).id)"
              >
                删除
              </UButton>
            </template>
          </UTable>

          <!-- 分页 -->
          <div
            v-if="data.pagination"
            class="mt-4 text-center text-sm text-gray-600"
          >
            显示 {{ data.data.length }} 条，共 {{ data.pagination.total }} 条记录
          </div>
        </div>

        <!-- 空状态 -->
        <div
          v-else
          class="text-center py-12 text-gray-500"
        >
          暂无数据
        </div>
      </UCard>

      <!-- 添加用户模态框 -->
      <UModal>
        <UButton
          size="sm"
          @click="showAddModal = true"
        >
          添加用户
        </UButton>

        <template #body>
          <UCard>
            <template #header>
              <h3 class="text-lg font-semibold">
                添加用户
              </h3>
            </template>

            <UForm
              :state="formState"
              class="space-y-4"
              @submit="handleSubmit"
            >
              <div>
                <label class="block text-sm font-medium mb-1">姓名</label>
                <UInput
                  v-model="formState.name"
                  placeholder="请输入姓名"
                  required
                />
              </div>

              <div>
                <label class="block text-sm font-medium mb-1">邮箱</label>
                <UInput
                  v-model="formState.email"
                  type="email"
                  placeholder="请输入邮箱"
                  required
                />
              </div>

              <div class="flex justify-end gap-2 pt-4">
                <UButton
                  variant="ghost"
                  @click="showAddModal = false"
                >
                  取消
                </UButton>
                <UButton
                  type="submit"
                  :loading="submitting"
                >
                  确定
                </UButton>
              </div>
            </UForm>
          </UCard>
        </template>
      </UModal>
    </UContainer>
  </div>
</template>

<script setup lang="ts">
import { useAPI } from '~/composables/useAPI'

// 类型定义
interface User {
  id: number
  name: string
  email: string
  status: string
  [key: string]: unknown
}

interface ApiResponse {
  data: User[]
  pagination?: {
    total: number
    [key: string]: unknown
  }
}

// 获取数据
const {
  data,
  pending,
  error,
  refresh,
} = await useAPI<ApiResponse>('/example/mock-users', {
  query: { limit: 10 },
  default: () => ({ data: [] }),
})

// 添加用户相关
const showAddModal = ref(false)
const submitting = ref(false)
const formState = ref({
  name: '',
  email: '',
})

const toast = useToast()

// 提交表单
async function handleSubmit() {
  submitting.value = true

  try {
    // 发送 POST 请求
    await useAPI('/example/users', {
      method: 'POST',
      body: formState.value,
    })

    // 显示成功提示
    toast.add({
      title: '添加成功',
      color: 'green',
    })

    // 关闭模态框并刷新列表
    showAddModal.value = false
    formState.value = { name: '', email: '' }
    await refresh()
  }
  catch (err: unknown) {
    const error = err as Error
    // 显示错误提示
    toast.add({
      title: '添加失败',
      description: error.message,
      color: 'red',
    })
  }
  finally {
    submitting.value = false
  }
}

// 删除用户
async function deleteUser(id: number) {
  if (!confirm('确定要删除这个用户吗？')) return

  try {
    await useAPI(`/example/users/${id}`, {
      method: 'DELETE',
    })

    toast.add({
      title: '删除成功',
      color: 'green',
    })

    await refresh()
  }
  catch (err: unknown) {
    const error = err as Error
    toast.add({
      title: '删除失败',
      description: error.message,
      color: 'red',
    })
  }
}

// 设置页面 SEO
useSeoMeta({
  title: 'API 示例 - Nuxt 4',
  description: '展示如何使用 useAPI 进行数据请求',
})
</script>
