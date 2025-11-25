<script setup lang="ts">
import type { ColumnDef } from '@tanstack/vue-table'
import type { Result } from '~~/types/api'

interface Document {
  id: string
  content: string
  metadata: Record<string, string | number | boolean | null | undefined>
}

interface DocumentsData {
  total: number
  documents: Document[]
}

const props = defineProps<{
  modelValue: boolean
}>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
}>()

const isOpen = computed({
  get: () => props.modelValue,
  set: value => emit('update:modelValue', value),
})

const toast = useToast()

// ===== 文档列表相关 =====
const documents = ref<Document[]>([])
const total = ref(0)
const page = ref(1)
const limit = ref(20)
const tableLoading = ref(false)
const showDetail = ref(false)
const showManage = ref(false)
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
    const res = await $fetch<Result<DocumentsData>>('/api/ai/documents', {
      query: { limit: limit.value, offset },
    })
    const payload = res?.data
    documents.value = payload?.documents || []
    total.value = payload?.total ?? documents.value.length

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

const columns: ColumnDef<Document>[] = [
  { accessorKey: 'id', header: 'ID' },
  { id: 'source', header: '来源' },
  { accessorKey: 'content', header: '内容' },
  { id: 'actions', header: '操作' },
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

// ===== 入库相关 =====
const fileInput = ref<HTMLInputElement | null>(null)
const uploading = ref(false)
const ingesting = ref(false)
const ingestTextInput = ref('')

const uploadFile = async (event: Event) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  if (!file) return

  uploading.value = true
  const formData = new FormData()
  formData.append('file', file)

  try {
    await $fetch('/api/ai/documents/upload', {
      method: 'POST',
      body: formData,
    })
    toast.add({ title: '上传成功', color: 'success' })
    fetchDocuments()
  }
  catch (error) {
    console.error('Upload failed', error)
    toast.add({ title: '上传失败', color: 'error' })
  }
  finally {
    uploading.value = false
    if (fileInput.value) fileInput.value.value = ''
  }
}

const submitIngest = async () => {
  if (!ingestTextInput.value.trim()) return
  ingesting.value = true
  try {
    await $fetch('/api/ai/ingest', {
      method: 'POST',
      body: { text: ingestTextInput.value },
    })
    toast.add({ title: '入库成功', color: 'success' })
    ingestTextInput.value = ''
    fetchDocuments()
  }
  catch (error) {
    console.error('Ingest failed', error)
    toast.add({ title: '入库失败', color: 'error' })
  }
  finally {
    ingesting.value = false
  }
}

// 打开抽屉时加载数据
watch(isOpen, (open) => {
  if (open) {
    fetchDocuments()
  }
})
</script>

<template>
  <!-- 右侧抽屉：文档列表 -->
  <UDrawer
    v-model:open="isOpen"
    title="知识库"
    description="管理知识库文档"
    direction="right"
    :handle="false"
    :ui="{ content: 'w-[1000px] max-w-[90vw]' }"
  >
    <template #content>
      <UCard
        class="w-full h-full flex flex-col"
        :ui="{ body: 'flex-1 overflow-y-auto', footer: 'p-2 sm:p-2' }"
      >
        <template #header>
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-2">
              <UIcon
                name="i-heroicons-book-open"
                class="size-5 text-primary"
              />
              <span class="font-semibold text-lg">知识库</span>
              <UBadge
                color="neutral"
                variant="subtle"
              >
                {{ total }} 条
              </UBadge>
            </div>
            <div class="flex gap-1">
              <UButton
                icon="i-heroicons-arrow-path"
                variant="ghost"
                size="sm"
                :loading="tableLoading"
                @click="fetchDocuments"
              />
              <UButton
                icon="i-heroicons-plus"
                size="sm"
                label="入库"
                @click="showManage = true"
              />
              <UButton
                icon="i-heroicons-x-mark"
                variant="ghost"
                color="neutral"
                @click="isOpen = false"
              />
            </div>
          </div>
        </template>

        <UTable
          :data="documents"
          :columns="columns"
          :loading="tableLoading"
        >
          <template #id-cell="{ row }">
            <span class="font-mono text-xs">{{ row.original.id.slice(0, 8) }}...</span>
          </template>
          <template #source-cell="{ row }">
            <span
              class="truncate block max-w-[120px]"
              :title="getSource(row.original)"
            >
              {{ getSource(row.original) }}
            </span>
          </template>
          <template #content-cell="{ row }">
            <span
              class="truncate max-w-[180px] block"
              :title="row.original.content"
            >
              {{ row.original.content?.slice(0, 40) }}...
            </span>
          </template>
          <template #actions-cell="{ row }">
            <UButton
              icon="i-heroicons-eye"
              size="xs"
              variant="ghost"
              @click="openDetail(row.original)"
            />
          </template>
        </UTable>

        <template #footer>
          <div class="flex justify-center">
            <UPagination
              v-model:page="page"
              :total="total"
              :items-per-page="limit"
              :disabled="tableLoading"
              @update:page="fetchDocuments"
            />
          </div>
        </template>
      </UCard>
    </template>
  </UDrawer>

  <!-- 入库管理弹窗 -->
  <UModal
    v-model:open="showManage"
    title="入库维护"
    description="上传文档或输入文本入库"
    :ui="{ content: 'sm:max-w-2xl' }"
  >
    <template #content>
      <UCard>
        <template #header>
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-2">
              <UIcon
                name="i-heroicons-wrench-screwdriver"
                class="size-5 text-primary"
              />
              <span class="font-semibold">入库维护</span>
            </div>
            <UButton
              icon="i-heroicons-x-mark"
              variant="ghost"
              color="neutral"
              @click="showManage = false"
            />
          </div>
        </template>

        <div class="grid md:grid-cols-2 gap-4">
          <!-- 上传文档 -->
          <UCard variant="outline">
            <template #header>
              <span class="font-medium text-sm">上传文档</span>
            </template>
            <div class="space-y-3">
              <input
                ref="fileInput"
                type="file"
                class="hidden"
                accept=".txt,.pdf,.md"
                @change="uploadFile"
              >
              <div class="flex items-center gap-2">
                <UButton
                  label="选择文件"
                  icon="i-heroicons-arrow-up-tray"
                  size="sm"
                  :loading="uploading"
                  @click="fileInput?.click()"
                />
                <span class="text-xs text-muted">支持 txt / pdf / md</span>
              </div>
            </div>
          </UCard>

          <!-- 文本入库 -->
          <UCard variant="outline">
            <template #header>
              <span class="font-medium text-sm">文本入库</span>
            </template>
            <div class="space-y-3">
              <UTextarea
                v-model="ingestTextInput"
                placeholder="粘贴或输入要入库的文本..."
                :rows="3"
              />
              <div class="flex justify-end">
                <UButton
                  label="入库"
                  icon="i-heroicons-bolt"
                  size="sm"
                  :loading="ingesting"
                  :disabled="!ingestTextInput.trim()"
                  @click="submitIngest"
                />
              </div>
            </div>
          </UCard>
        </div>
      </UCard>
    </template>
  </UModal>

  <!-- 文档详情弹窗 -->
  <UModal
    v-model:open="showDetail"
    title="文档详情"
    description="查看文档内容和元数据"
  >
    <template #content>
      <UCard>
        <template #header>
          <div class="flex justify-between items-center">
            <div>
              <p class="text-sm text-muted">
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
            <p class="whitespace-pre-wrap text-sm leading-relaxed max-h-[300px] overflow-y-auto">
              {{ selectedDoc?.content }}
            </p>
          </div>
          <div>
            <p class="text-sm font-semibold mb-1">
              元数据
            </p>
            <pre class="text-xs bg-elevated p-3 rounded max-h-[200px] overflow-y-auto">{{ JSON.stringify(selectedDoc?.metadata, null, 2) }}</pre>
          </div>
        </div>
      </UCard>
    </template>
  </UModal>
</template>
