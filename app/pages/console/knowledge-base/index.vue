<script setup lang="ts">
import type { ColumnDef } from '@tanstack/vue-table'

interface Document {
  id: string
  content: string
  metadata: Record<string, string | number | boolean | null | undefined>
}

const toast = useToast()

const documents = ref<Document[]>([])
const total = ref(0)
const page = ref(1)
const limit = ref(20)
const tableLoading = ref(false)

const showDetail = ref(false)
const selectedDoc = ref<Document | null>(null)

const totalPages = computed(() => {
  if (!limit.value) return 1
  const pages = Math.ceil((total.value || 0) / limit.value)
  return Math.max(1, pages || 1)
})

const fetchDocuments = async () => {
  tableLoading.value = true
  const offset = (page.value - 1) * limit.value
  try {
    const { data, error } = await useAPI<{ documents: Document[], total: number }>('/ai/documents', {
      query: { limit: limit.value, offset },
      server: false,
    })
    if (error.value) throw error.value
    const payload = data.value || {}
    documents.value = payload.documents || []
    total.value = payload.total ?? documents.value.length

    const currentTotalPages = totalPages.value
    if (page.value > currentTotalPages) {
      page.value = currentTotalPages
      await fetchDocuments()
    }
  }
  catch (error) {
    console.error('Error fetching documents', error)
    toast.add({ title: '获取文档失败', color: 'error' })
  }
  finally {
    tableLoading.value = false
  }
}

const deleteDocument = async (docId: string) => {
  if (!confirm('确定删除该文档片段吗？')) return

  try {
    const { error } = await useAPI(`/ai/documents/${docId}`, {
      method: 'DELETE',
      server: false,
    })
    if (error.value) throw error.value

    toast.add({ title: '删除成功', color: 'success' })
    fetchDocuments()
  }
  catch (error) {
    console.error('Delete failed', error)
    toast.add({ title: '删除失败', color: 'error' })
  }
}

const columns: ColumnDef<Document>[] = [
  {
    accessorKey: 'id',
    header: 'ID',
  },
  {
    id: 'source',
    header: '来源',
  },
  {
    accessorKey: 'content',
    header: '内容',
  },
  {
    accessorKey: 'metadata',
    header: '元数据',
  },
  {
    id: 'actions',
    header: '操作',
  },
]

const getSource = (doc: Document) => {
  const meta = doc.metadata || {}
  const candidate = meta.source ?? meta.file ?? meta.filename ?? meta.name
  if (candidate === undefined || candidate === null) return 'Unknown'
  return typeof candidate === 'string' ? candidate : String(candidate)
}

const openDetail = (doc: Document) => {
  selectedDoc.value = doc
  showDetail.value = true
}

const changePage = (nextPage: number) => {
  if (nextPage < 1 || nextPage > totalPages.value) return
  page.value = nextPage
  fetchDocuments()
}

const changeLimit = (value: unknown) => {
  const parsed = typeof value === 'number' ? value : Number(value ?? limit.value)
  if (Number.isNaN(parsed)) return
  limit.value = parsed
  page.value = 1
  fetchDocuments()
}

onMounted(() => {
  fetchDocuments()
})
</script>

<template>
  <div class="space-y-4">
    <div class="flex items-center justify-between">
      <div>
        <p class="text-xs text-neutral-500 uppercase tracking-[0.2em]">
          知识库
        </p>
        <h1 class="text-xl font-semibold">
          文档列表
        </h1>
      </div>
      <div class="flex gap-2">
        <UButton
          label="入库与维护"
          icon="i-heroicons-wrench-screwdriver"
          variant="ghost"
          to="/console/knowledge-base/manage"
        />
        <UButton
          icon="i-heroicons-arrow-path"
          variant="ghost"
          label="刷新"
          :loading="tableLoading"
          @click="fetchDocuments"
        />
      </div>
    </div>

    <UCard>
      <template #header>
        <div class="flex items-center justify-between w-full">
          <div class="flex items-center gap-2">
            <span class="font-semibold">文档</span>
            <UBadge color="neutral">
              {{ total }} 条
            </UBadge>
          </div>
          <div class="flex items-center gap-3">
            <USelect
              v-model="limit"
              :options="[10, 20, 50, 100]"
              :ui="{ base: 'w-28' }"
              @update:model-value="changeLimit"
            />
            <div class="flex items-center gap-2">
              <UButton
                icon="i-heroicons-chevron-left"
                variant="ghost"
                :disabled="page <= 1 || tableLoading"
                @click="changePage(page - 1)"
              />
              <span class="text-sm">第 {{ page }} / {{ totalPages }} 页</span>
              <UButton
                icon="i-heroicons-chevron-right"
                variant="ghost"
                :disabled="page >= totalPages || tableLoading"
                @click="changePage(page + 1)"
              />
            </div>
          </div>
        </div>
      </template>

      <UTable
        :data="documents"
        :columns="columns"
        :loading="tableLoading"
      >
        <template #id-cell="{ row }: any">
          <span class="font-mono text-xs">{{ row.original.id }}</span>
        </template>
        <template #source-cell="{ row }: any">
          <span
            class="truncate block max-w-[180px]"
            :title="getSource(row.original)"
          >{{ getSource(row.original) }}</span>
        </template>
        <template #content-cell="{ row }: any">
          <span
            class="truncate max-w-xs block"
            :title="row.original.content"
          >{{ row.original.content?.slice(0, 80) }}...</span>
        </template>
        <template #metadata-cell="{ row }: any">
          <pre class="text-xs max-w-[300px] overflow-x-auto whitespace-pre-wrap">{{ JSON.stringify(row.original.metadata, null, 2) }}</pre>
        </template>
        <template #actions-cell="{ row }: any">
          <div class="flex gap-2">
            <UButton
              icon="i-heroicons-eye"
              size="xs"
              variant="ghost"
              @click="openDetail(row.original)"
            />
            <UButton
              icon="i-heroicons-trash"
              size="xs"
              color="error"
              variant="ghost"
              @click="deleteDocument(row.original.id)"
            />
          </div>
        </template>
      </UTable>
    </UCard>

    <UModal v-model="showDetail">
      <UCard>
        <template #header>
          <div class="flex justify-between items-center w-full">
            <div>
              <p class="text-sm text-neutral-500">
                Document ID
              </p>
              <p class="font-mono text-sm">
                {{ selectedDoc?.id }}
              </p>
            </div>
            <UButton
              icon="i-heroicons-x-mark"
              variant="ghost"
              @click="showDetail = false"
            />
          </div>
        </template>
        <div class="space-y-4">
          <div>
            <p class="text-sm font-semibold mb-1">
              内容
            </p>
            <p class="whitespace-pre-wrap text-sm leading-relaxed">
              {{ selectedDoc?.content }}
            </p>
          </div>
          <div>
            <p class="text-sm font-semibold mb-1">
              元数据
            </p>
            <pre class="text-xs bg-gray-50 dark:bg-gray-900 p-3 rounded">{{ JSON.stringify(selectedDoc?.metadata, null, 2) }}</pre>
          </div>
        </div>
      </UCard>
    </UModal>
  </div>
</template>
