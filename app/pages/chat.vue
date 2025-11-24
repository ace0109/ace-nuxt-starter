<script setup lang="ts">
import type { AIMessageChunk } from '~~/types/api'

const messages = ref<{ role: 'user' | 'assistant', content: string }[]>([])
const input = ref('')
const loading = ref(false)
const scrollEl = ref<HTMLElement | null>(null)
let controller: AbortController | null = null

const scrollToBottom = async () => {
  await nextTick()
  const el = scrollEl.value
  if (el)
    el.scrollTop = el.scrollHeight
}

const pushMessage = (role: 'user' | 'assistant', content: string) => {
  messages.value.push({ role, content })
  scrollToBottom()
}

const stop = () => {
  controller?.abort()
  controller = null
  loading.value = false
}

const sendMessage = async () => {
  if (!input.value.trim() || loading.value) return

  stop()
  controller = new AbortController()

  const userMessage = input.value
  pushMessage('user', userMessage)
  input.value = ''
  loading.value = true

  try {
    const response = await fetch('/api/ai/chat', {
      method: 'POST',
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ message: userMessage }),
    })

    if (!response.ok) throw new Error('Network response was not ok')

    if (!response.body) throw new Error('Response body is null')
    const reader = response.body.getReader()

    const decoder = new TextDecoder()
    let buffer = ''
    let assistantMessage = ''
    pushMessage('assistant', '')
    const currentMessageIndex = messages.value.length - 1

    const handleEvent = (rawEvent: string) => {
      const lines = rawEvent.split(/\r?\n/)
      const dataPayload = lines
        .filter(line => line.startsWith('data:'))
        .map(line => line.replace(/^data:\s*/, '').trim())
        .join('\n')

      if (!dataPayload || dataPayload === '[DONE]') return

      try {
        const chunk = JSON.parse(dataPayload) as AIMessageChunk
        assistantMessage += chunk.content ?? ''
      }
      catch {
        assistantMessage += dataPayload
      }

      const currentMessage = messages.value[currentMessageIndex]
      if (!currentMessage) return
      currentMessage.content = assistantMessage
      scrollToBottom()
    }

    while (true) {
      const { done, value } = await reader.read()
      if (done) break

      const chunk = decoder.decode(value!, { stream: true })
      buffer += chunk

      const events = buffer.split(/\r?\n\r?\n/)
      buffer = events.pop() || ''

      for (const event of events) {
        if (event.trim())
          handleEvent(event)
      }
    }

    if (buffer.trim()) {
      handleEvent(buffer)
    }
  }
  catch (error) {
    console.error('Error:', error)
    pushMessage('assistant', 'Error occurred. Please retry or check your connection.')
  }
  finally {
    loading.value = false
    controller = null
  }
}

onBeforeUnmount(() => stop())
</script>

<template>
  <div class="h-[calc(100vh-140px)] flex flex-col rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 shadow-sm overflow-hidden">
    <div class="flex items-center justify-between px-4 py-3 border-b border-slate-200 dark:border-slate-800">
      <h1 class="text-lg font-semibold text-slate-900 dark:text-slate-100">
        ACE AI
      </h1>
      <div class="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
        <span
          class="w-2 h-2 rounded-full"
          :class="loading ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'"
        />
        <span>{{ loading ? 'Replying...' : 'Idle' }}</span>
      </div>
    </div>

    <div class="flex-1 overflow-hidden">
      <div
        ref="scrollEl"
        class="h-full overflow-y-auto px-4 py-4 space-y-4"
      >
        <div
          v-for="(msg, index) in messages"
          :key="index"
          class="flex items-start gap-3"
          :class="msg.role === 'user' ? 'justify-end' : 'justify-start'"
        >
          <template v-if="msg.role === 'assistant'">
            <UAvatar
              size="xs"
              icon="i-heroicons-sparkles"
              class="bg-emerald-500/15 text-emerald-600 dark:text-emerald-200 border border-emerald-500/30"
            />
            <div class="max-w-[75%] rounded-2xl px-4 py-3 bg-slate-50 border border-slate-200 dark:bg-slate-800/70 dark:border-slate-700">
              <MDC
                class="prose prose-sm max-w-none text-slate-800 dark:prose-invert"
                :value="msg.content || '...'"
              />
            </div>
          </template>
          <template v-else>
            <div class="max-w-[75%] rounded-2xl px-4 py-3 bg-primary-500 text-white shadow-sm">
              <MDC
                class="prose prose-sm max-w-none text-white"
                :value="msg.content || ''"
              />
            </div>
            <UAvatar
              size="xs"
              icon="i-heroicons-user"
              class="bg-primary-500/15 text-primary-700 dark:text-primary-200 border border-primary-400/30"
            />
          </template>
        </div>

        <div
          v-if="messages.length === 0"
          class="text-center text-slate-400 py-10"
        >
          <p class="text-sm">
            Start chatting with ACE AI.
          </p>
        </div>
      </div>
    </div>

    <div class="sticky bottom-0 w-full border-t border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 px-4 py-3">
      <div class="flex gap-2 items-end">
        <UTextarea
          v-model="input"
          placeholder="Type your question, press Enter to send"
          class="flex-1"
          :autosize="{ minRows: 2, maxRows: 4 }"
          :disabled="loading"
          @keydown.enter.prevent="sendMessage"
          @keydown.meta.enter.prevent="sendMessage"
          @keydown.ctrl.enter.prevent="sendMessage"
        />
        <div class="flex flex-col gap-2">
          <UButton
            color="primary"
            :loading="loading"
            label="Send"
            icon="i-heroicons-paper-airplane"
            class="w-24"
            @click="sendMessage"
          />
          <UButton
            v-if="loading"
            color="neutral"
            variant="ghost"
            icon="i-heroicons-stop-circle"
            label="Stop"
            class="w-24"
            @click="stop"
          />
        </div>
      </div>
    </div>
  </div>
</template>
