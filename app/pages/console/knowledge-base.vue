<script setup lang="ts">
import type { ColumnDef } from '@tanstack/vue-table'

const toast = useToast()

interface Document {
  id: string
  content: string
  metadata: Record<string, string | number | boolean | null | undefined>
}

const documents = ref<Document[]>([])
const total = ref(0)
const page = ref(1)
const limit = ref(20)

const tableLoading = ref(false)
const uploading = ref(false)
const ingesting = ref(false)
const deletingBySource = ref(false)

const fileInput = ref<HTMLInputElement | null>(null)
const deleteSource = ref('')

const showDetail = ref(false)
const selectedDoc = ref<Document | null>(null)

const totalPages = computed(() => {
  if (!total.value || !limit.value) return 1
  return Math.max(1, Math.ceil(total.value / limit.value))
})

const fetchDocuments = async () => {
  tableLoading.value = true
  const offset = (page.value - 1) * limit.value
  try {
    const response = await fetch(`/api/documents?limit=${limit.value}&offset=${offset}`)
    if (!response.ok) throw new Error('Failed to fetch documents')
    const data = await response.json()
    documents.value = data.documents || []
    total.value = data.total || documents.value.length

    const currentTotalPages = totalPages.value
    if (page.value > currentTotalPages) {
      page.value = currentTotalPages
      // If the current page exceeds the new total, refetch with the corrected page
      await fetchDocuments()
    }
  }
  catch (error) {
    console.error('Error fetching documents', error)
    toast.add({ title: 'Error fetching documents', color: 'error' })
  }
  finally {
    tableLoading.value = false
  }
}

const uploadFile = async (event: Event) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  if (!file) return

  uploading.value = true
  const formData = new FormData()
  formData.append('file', file)

  try {
    const response = await fetch('/api/documents/upload', {
      method: 'POST',
      body: formData,
    })
    if (!response.ok) throw new Error('Upload failed')

    toast.add({ title: 'Upload successful', color: 'success' })
    fetchDocuments()
  }
  catch (error) {
    console.error('Upload failed', error)
    toast.add({ title: 'Upload failed', color: 'error' })
  }
  finally {
    uploading.value = false
    if (fileInput.value) fileInput.value.value = ''
  }
}

const deleteDocument = async (docId: string) => {
  if (!confirm('Are you sure you want to delete this document chunk?')) return

  try {
    const response = await fetch(`/api/documents/${docId}`, {
      method: 'DELETE',
    })
    if (!response.ok) throw new Error('Delete failed')

    toast.add({ title: 'Deleted successfully', color: 'success' })
    fetchDocuments()
  }
  catch (error) {
    console.error('Delete failed', error)
    toast.add({ title: 'Delete failed', color: 'error' })
  }
}

const resetKnowledgeBase = async () => {
  if (!confirm('Are you sure you want to RESET the entire knowledge base? This cannot be undone.')) return

  try {
    const response = await fetch('/api/reset', {
      method: 'POST',
    })
    if (!response.ok) throw new Error('Reset failed')

    toast.add({ title: 'Knowledge base reset', color: 'success' })
    fetchDocuments()
  }
  catch (error) {
    console.error('Reset failed', error)
    toast.add({ title: 'Reset failed', color: 'error' })
  }
}

const ingestText = async (text: string) => {
  if (!text.trim()) return
  ingesting.value = true
  try {
    const response = await fetch('/api/ingest', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ text }),
    })
    if (!response.ok) throw new Error('Ingest failed')
    toast.add({ title: 'Text ingested', color: 'success' })
    fetchDocuments()
  }
  catch (error) {
    console.error('Ingest failed', error)
    toast.add({ title: 'Ingest failed', color: 'error' })
  }
  finally {
    ingesting.value = false
  }
}

const ingestTextInput = ref('')

const submitIngest = () => {
  ingestText(ingestTextInput.value)
  ingestTextInput.value = ''
}

const deleteBySource = async () => {
  if (!deleteSource.value.trim()) return
  if (!confirm(`Delete all chunks for source "${deleteSource.value}"?`)) return
  deletingBySource.value = true
  try {
    const response = await fetch(`/api/documents/batch/by-source?source=${encodeURIComponent(deleteSource.value.trim())}`, {
      method: 'DELETE',
    })
    if (!response.ok) throw new Error('Delete by source failed')
    toast.add({ title: 'Deleted by source', color: 'success' })
    fetchDocuments()
  }
  catch (error) {
    console.error('Delete by source failed', error)
    toast.add({ title: 'Delete by source failed', color: 'error' })
  }
  finally {
    deletingBySource.value = false
    deleteSource.value = ''
  }
}

const columns: ColumnDef<Document>[] = [
  {
    accessorKey: 'id',
    header: 'ID',
  },
  {
    id: 'source',
    header: 'Source',
  },
  {
    accessorKey: 'content',
    header: 'Content',
  },
  {
    accessorKey: 'metadata',
    header: 'Metadata',
  },
  {
    id: 'actions',
    header: 'Actions',
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
    <div class="flex flex-wrap gap-3 items-center justify-between">
      <h1 class="text-2xl font-bold">
        Knowledge Base Management
      </h1>
      <div class="flex gap-2">
        <UButton
          icon="i-heroicons-arrow-path"
          variant="ghost"
          label="Refresh"
          @click="fetchDocuments"
        />
        <input
          ref="fileInput"
          type="file"
          class="hidden"
          accept=".txt,.pdf,.md"
          @change="uploadFile"
        >
        <UButton
          label="Upload Document"
          icon="i-heroicons-arrow-up-tray"
          :loading="uploading"
          @click="fileInput?.click()"
        />
        <UButton
          label="Reset All"
          color="error"
          variant="outline"
          icon="i-heroicons-trash"
          @click="resetKnowledgeBase"
        />
      </div>
    </div>

    <div class="grid md:grid-cols-2 gap-4">
      <UCard>
        <template #header>
          <div class="flex items-center justify-between">
            <span class="font-semibold">Ingest Text</span>
            <UBadge color="primary">
              /api/ingest
            </UBadge>
          </div>
        </template>
        <div class="space-y-3">
          <UTextarea
            v-model="ingestTextInput"
            placeholder="Paste or type text to ingest into the knowledge base..."
            :rows="4"
          />
          <div class="flex justify-end">
            <UButton
              label="Ingest"
              icon="i-heroicons-bolt"
              :loading="ingesting"
              :disabled="!ingestTextInput.trim()"
              @click="submitIngest"
            />
          </div>
        </div>
      </UCard>

      <UCard>
        <template #header>
          <div class="flex items-center justify-between">
            <span class="font-semibold">Delete By Source</span>
            <UBadge color="neutral">
              /api/documents/batch/by-source
            </UBadge>
          </div>
        </template>
        <div class="space-y-3">
          <UInput
            v-model="deleteSource"
            placeholder="Enter source filename, e.g. manual.pdf"
          />
          <div class="flex justify-end gap-2">
            <UButton
              label="Delete"
              color="error"
              icon="i-heroicons-trash"
              variant="outline"
              :loading="deletingBySource"
              :disabled="!deleteSource.trim()"
              @click="deleteBySource"
            />
          </div>
        </div>
      </UCard>
    </div>

    <UCard>
      <template #header>
        <div class="flex items-center justify-between w-full">
          <div class="flex items-center gap-2">
            <span class="font-semibold">Documents</span>
            <UBadge color="neutral">
              {{ total }} total
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
              <span class="text-sm">Page {{ page }} / {{ totalPages }}</span>
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
          <pre class="text-xs max-w-[300px] overflow-x-auto">{{ JSON.stringify(row.original.metadata, null, 2) }}</pre>
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
              Content
            </p>
            <p class="whitespace-pre-wrap text-sm leading-relaxed">
              {{ selectedDoc?.content }}
            </p>
          </div>
          <div>
            <p class="text-sm font-semibold mb-1">
              Metadata
            </p>
            <pre class="text-xs bg-gray-50 dark:bg-gray-900 p-3 rounded">{{ JSON.stringify(selectedDoc?.metadata, null, 2) }}</pre>
          </div>
        </div>
      </UCard>
    </UModal>
  </div>
</template>
