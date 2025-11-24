<script setup lang="ts">
const toast = useToast()

const fileInput = ref<HTMLInputElement | null>(null)
const uploading = ref(false)
const ingesting = ref(false)
const deletingBySource = ref(false)
const resetting = ref(false)

const deleteSource = ref('')
const ingestTextInput = ref('')

const uploadFile = async (event: Event) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  if (!file) return

  uploading.value = true
  const formData = new FormData()
  formData.append('file', file)

  try {
    const { error } = await useAPI('/ai/documents/upload', {
      method: 'POST',
      body: formData,
      server: false,
    })
    if (error.value) throw error.value

    toast.add({ title: '上传成功', color: 'success' })
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

const ingestText = async (text: string) => {
  if (!text.trim()) return
  ingesting.value = true
  try {
    const { error } = await useAPI('/ai/ingest', {
      method: 'POST',
      body: { text },
      server: false,
    })
    if (error.value) throw error.value
    toast.add({ title: '入库成功', color: 'success' })
  }
  catch (error) {
    console.error('Ingest failed', error)
    toast.add({ title: '入库失败', color: 'error' })
  }
  finally {
    ingesting.value = false
    ingestTextInput.value = ''
  }
}

const submitIngest = () => {
  ingestText(ingestTextInput.value)
}

const deleteBySource = async () => {
  if (!deleteSource.value.trim()) return
  if (!confirm(`删除来源 "${deleteSource.value}" 的全部分片？`)) return
  deletingBySource.value = true
  try {
    const { error } = await useAPI('/ai/documents/batch/by-source', {
      method: 'DELETE',
      query: { source: deleteSource.value.trim() },
      server: false,
    })
    if (error.value) throw error.value
    toast.add({ title: '删除完成', color: 'success' })
  }
  catch (error) {
    console.error('Delete by source failed', error)
    toast.add({ title: '删除失败', color: 'error' })
  }
  finally {
    deletingBySource.value = false
    deleteSource.value = ''
  }
}

const resetKnowledgeBase = async () => {
  if (!confirm('确定要重置整个知识库吗？此操作不可恢复。')) return
  resetting.value = true
  try {
    const { error } = await useAPI('/ai/reset', {
      method: 'POST',
      server: false,
    })
    if (error.value) throw error.value
    toast.add({ title: '知识库已重置', color: 'success' })
  }
  catch (error) {
    console.error('Reset failed', error)
    toast.add({ title: '重置失败', color: 'error' })
  }
  finally {
    resetting.value = false
  }
}
</script>

<template>
  <div class="space-y-4">
    <div class="flex items-center justify-between">
      <div>
        <p class="text-xs text-neutral-500 uppercase tracking-[0.2em]">
          知识库
        </p>
        <h1 class="text-xl font-semibold">
          入库与维护
        </h1>
      </div>
      <UButton
        icon="i-heroicons-list-bullet"
        label="文档列表"
        variant="ghost"
        to="/console/knowledge-base"
      />
    </div>

    <div class="grid md:grid-cols-2 gap-4">
      <UCard>
        <template #header>
          <div class="flex items-center justify-between">
            <span class="font-semibold">上传文档</span>
            <UBadge color="primary">
              /api/ai/documents/upload
            </UBadge>
          </div>
        </template>
        <div class="space-y-3">
          <input
            ref="fileInput"
            type="file"
            class="hidden"
            accept=".txt,.pdf,.md"
            @change="uploadFile"
          >
          <div class="flex gap-2">
            <UButton
              label="选择文件"
              icon="i-heroicons-arrow-up-tray"
              :loading="uploading"
              @click="fileInput?.click()"
            />
            <p class="text-xs text-neutral-500 self-center">
              支持 txt / pdf / md
            </p>
          </div>
        </div>
      </UCard>

      <UCard>
        <template #header>
          <div class="flex items-center justify-between">
            <span class="font-semibold">文本入库</span>
            <UBadge color="primary">
              /api/ai/ingest
            </UBadge>
          </div>
        </template>
        <div class="space-y-3">
          <UTextarea
            v-model="ingestTextInput"
            placeholder="粘贴或输入要入库的文本..."
            :rows="4"
          />
          <div class="flex justify-end">
            <UButton
              label="入库"
              icon="i-heroicons-bolt"
              :loading="ingesting"
              :disabled="!ingestTextInput.trim()"
              @click="submitIngest"
            />
          </div>
        </div>
      </UCard>
    </div>

    <div class="grid md:grid-cols-2 gap-4">
      <UCard>
        <template #header>
          <div class="flex items-center justify-between">
            <span class="font-semibold">按来源删除</span>
            <UBadge color="neutral">
              /api/ai/documents/batch/by-source
            </UBadge>
          </div>
        </template>
        <div class="space-y-3">
          <UInput
            v-model="deleteSource"
            placeholder="输入来源文件名，例如 manual.pdf"
          />
          <div class="flex justify-end gap-2">
            <UButton
              label="删除"
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

      <UCard>
        <template #header>
          <div class="flex items-center justify-between">
            <span class="font-semibold">重置知识库</span>
            <UBadge color="error">
              /api/ai/reset
            </UBadge>
          </div>
        </template>
        <div class="space-y-3">
          <p class="text-sm text-neutral-500">
            将清空全部文档与分片，请谨慎操作。
          </p>
          <div class="flex justify-end">
            <UButton
              label="重置"
              color="error"
              icon="i-heroicons-exclamation-triangle"
              variant="solid"
              :loading="resetting"
              @click="resetKnowledgeBase"
            />
          </div>
        </div>
      </UCard>
    </div>
  </div>
</template>
