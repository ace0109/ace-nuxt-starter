<script setup lang="ts">
import type { AIMessageChunk } from '~~/types/api'

const messages = ref<{ role: 'user' | 'assistant', content: string }[]>([])
const input = ref('')
const loading = ref(false)

const sendMessage = async () => {
  if (!input.value.trim() || loading.value) return

  const userMessage = input.value
  messages.value.push({ role: 'user', content: userMessage })
  input.value = ''
  loading.value = true

  try {
    const response = await fetch('/api/chat', {
      method: 'POST',
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
    messages.value.push({ role: 'assistant', content: '' })
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
        // Fallback: if parse fails, append raw text
        assistantMessage += dataPayload
      }

      const currentMessage = messages.value[currentMessageIndex]
      if (!currentMessage) return
      currentMessage.content = assistantMessage
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
    messages.value.push({ role: 'assistant', content: 'Error: Failed to fetch response.' })
  }
  finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="flex flex-col h-[calc(100vh-140px)]">
    <h1 class="text-2xl font-bold mb-4">
      Chat with Ace AI
    </h1>
    <div class="flex-1 overflow-y-auto p-4 space-y-4 border rounded-lg mb-4 bg-white dark:bg-gray-900">
      <div
        v-for="(msg, index) in messages"
        :key="index"
        :class="['flex', msg.role === 'user' ? 'justify-end' : 'justify-start']"
      >
        <div :class="['max-w-[80%] rounded-lg p-3', msg.role === 'user' ? 'bg-primary-500 text-white' : 'bg-gray-100 dark:bg-gray-800']">
          <p class="whitespace-pre-wrap">
            {{ msg.content }}
          </p>
        </div>
      </div>
      <div
        v-if="messages.length === 0"
        class="text-center text-gray-500 mt-10"
      >
        Start a conversation...
      </div>
    </div>
    <div class="flex gap-2">
      <UInput
        v-model="input"
        placeholder="Type a message..."
        class="flex-1"
        :disabled="loading"
        @keydown.enter="sendMessage"
      />
      <UButton
        :loading="loading"
        label="Send"
        icon="i-heroicons-paper-airplane"
        @click="sendMessage"
      />
    </div>
  </div>
</template>
