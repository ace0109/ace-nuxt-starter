<script setup lang="ts">
import type { AIMessageChunk } from '~~/types/api'
import { getTextFromMessage } from '@nuxt/ui/utils/ai'

definePageMeta({
  ssr: false,
})

interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  parts: { type: 'text', text: string }[]
}

interface HistoryMessage {
  id: number
  role: 'user' | 'assistant'
  content: string
  created_at: string
}

interface HistoryResponse {
  code: string
  message: string
  data: HistoryMessage[]
}

const route = useRoute()
const router = useRouter()

const messages = ref<ChatMessage[]>([])
const input = ref('')
const status = ref<'ready' | 'submitted' | 'streaming' | 'error'>('ready')
const chatContainerRef = ref<HTMLElement | null>(null)
const sessionId = ref<string | null>(null)
let controller: AbortController | null = null

// 从路由获取 session_id
const initSessionId = () => {
  const id = route.query.session_id
  if (id && typeof id === 'string') {
    sessionId.value = id
  }
}

// 更新路由中的 session_id
const updateRouteSessionId = (id: string) => {
  sessionId.value = id
  router.replace({ query: { ...route.query, session_id: id } })
}

// 滚动到底部
const scrollToBottom = () => {
  const el = chatContainerRef.value
  if (!el) return
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      el.scrollTop = el.scrollHeight
    })
  })
}

// 加载聊天历史记录
const loadChatHistory = async () => {
  if (!sessionId.value) return

  try {
    const response = await $fetch<HistoryResponse>(`/api/ai/chat/sessions/${sessionId.value}/messages`)
    if (response.code === '200' && response.data) {
      messages.value = response.data.map(msg => ({
        id: String(msg.id),
        role: msg.role,
        parts: [{ type: 'text', text: msg.content }],
      }))
    }
  }
  catch (error) {
    console.error('Failed to load chat history:', error)
  }
}

const pushMessage = (role: 'user' | 'assistant', content: string) => {
  messages.value.push({
    id: crypto.randomUUID(),
    role,
    parts: [{ type: 'text', text: content }],
  })
  nextTick(() => scrollToBottom())
}

const stop = () => {
  controller?.abort()
  controller = null
  status.value = 'ready'
}

const sendMessage = async () => {
  if (!input.value.trim() || status.value === 'streaming') return

  stop()
  controller = new AbortController()

  const userMessage = input.value
  pushMessage('user', userMessage)
  input.value = ''
  status.value = 'submitted'

  try {
    const response = await fetch('/api/ai/chat', {
      method: 'POST',
      signal: controller.signal,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: userMessage,
        session_id: sessionId.value,
      }),
    })

    if (!response.ok) throw new Error('Network response was not ok')
    if (!response.body) throw new Error('Response body is null')

    const reader = response.body.getReader()
    const decoder = new TextDecoder()
    let buffer = ''
    let assistantMessage = ''
    let isFirstChunk = true

    pushMessage('assistant', '')
    const currentMessageIndex = messages.value.length - 1
    status.value = 'streaming'

    const handleEvent = (rawEvent: string) => {
      const lines = rawEvent.split(/\r?\n/)
      const dataPayload = lines
        .filter(line => line.startsWith('data:'))
        .map(line => line.replace(/^data:\s*/, '').trim())
        .join('\n')

      if (!dataPayload || dataPayload === '[DONE]') return

      try {
        const chunk = JSON.parse(dataPayload)

        // 检查是否是 session_id 响应
        if (isFirstChunk && chunk.session_id && !sessionId.value) {
          updateRouteSessionId(chunk.session_id)
          isFirstChunk = false
          return
        }
        isFirstChunk = false

        // 处理消息内容
        const messageChunk = chunk as AIMessageChunk
        assistantMessage += messageChunk.content ?? ''
      }
      catch {
        assistantMessage += dataPayload
      }

      const currentMessage = messages.value[currentMessageIndex]
      if (currentMessage) {
        currentMessage.parts = [{ type: 'text', text: assistantMessage }]
        scrollToBottom()
      }
    }

    while (true) {
      const { done, value } = await reader.read()
      if (done) break

      const chunk = decoder.decode(value!, { stream: true })
      buffer += chunk

      const events = buffer.split(/\r?\n\r?\n/)
      buffer = events.pop() || ''

      for (const event of events) {
        if (event.trim()) handleEvent(event)
      }
    }

    if (buffer.trim()) handleEvent(buffer)
    status.value = 'ready'
  }
  catch (error) {
    console.error('Error:', error)
    status.value = 'error'
    pushMessage('assistant', 'Error occurred. Please retry or check your connection.')
  }
  finally {
    controller = null
  }
}

// 初始化
onMounted(async () => {
  initSessionId()
  if (sessionId.value) {
    await loadChatHistory()
  }
})

onBeforeUnmount(() => stop())
</script>

<template>
  <div class="h-[calc(100vh-118px)] py-4">
    <UCard
      class="h-full flex flex-col"
      :ui="{ body: 'relative flex-1 h-px p-0 sm:p-0', footer: 'p-4' }"
    >
      <template #header>
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-2">
            <UIcon
              name="i-heroicons-sparkles"
              class="text-primary size-5"
            />
            <span class="text-lg font-semibold">ACE AI</span>
          </div>
          <UBadge
            :color="status === 'streaming' ? 'success' : status === 'error' ? 'error' : 'neutral'"
            :variant="status === 'streaming' ? 'solid' : 'subtle'"
            :label="status === 'streaming' ? 'Replying...' : status === 'error' ? 'Error' : 'Idle'"
            :class="status === 'streaming' && 'animate-pulse'"
          />
        </div>
      </template>

      <div
        v-if="messages.length === 0"
        class="h-full flex items-center justify-center"
      >
        <div class="text-center text-muted">
          <UIcon
            name="i-heroicons-chat-bubble-left-right"
            class="size-12 mb-4 opacity-50"
          />
          <p class="text-sm">
            Start chatting with ACE AI.
          </p>
        </div>
      </div>

      <div
        v-else
        ref="chatContainerRef"
        class="h-full overflow-y-auto pt-8"
      >
        <UChatMessages
          :messages="messages"
          :status="status"
          class="px-4 py-4"
          :user="{
            side: 'right',
            variant: 'soft',
            avatar: { icon: 'i-heroicons-user' },
          }"
          :assistant="{
            side: 'left',
            variant: 'outline',
            avatar: { icon: 'i-heroicons-sparkles' },
          }"
        >
          <template #content="{ message }">
            <MDC
              :value="getTextFromMessage(message) || '...'"
              :cache-key="message.id"
              class="max-w-none *:first:mt-0 *:last:mb-0"
            />
          </template>
        </UChatMessages>
      </div>

      <template #footer>
        <UChatPrompt
          v-model="input"
          placeholder="Type your question, press Enter to send"
          :disabled="status === 'streaming'"
          @submit="sendMessage"
        >
          <UChatPromptSubmit
            :status="status"
            @stop="stop"
          />
        </UChatPrompt>
      </template>
    </UCard>
  </div>
</template>
