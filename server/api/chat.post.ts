import { joinURL } from 'ufo'

// 专门处理聊天接口的 SSE 转发，避免使用 $fetch 丢失流
export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const apiBase = config.public.apiBase
  const apiPrefix = config.public.apiPrefix
  const targetURL = apiPrefix ? joinURL(apiBase, apiPrefix, 'chat') : joinURL(apiBase, 'chat')

  const body = await readRawBody(event)

  const upstream = await fetch(targetURL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-API-KEY': config.apiKey,
    },
    body,
  })

  if (!upstream.body) {
    throw createError({
      statusCode: 502,
      statusMessage: 'Upstream response has no body',
    })
  }

  setResponseStatus(event, upstream.status)

  const sseHeaders: Record<string, string | null> = {
    'Content-Type': upstream.headers.get('content-type') || 'text/event-stream',
    'Cache-Control': upstream.headers.get('cache-control') || 'no-cache',
    'Connection': upstream.headers.get('connection') || 'keep-alive',
    'X-Accel-Buffering': 'no',
  }

  Object.entries(sseHeaders).forEach(([key, value]) => {
    if (value)
      appendHeader(event, key, value)
  })

  return sendStream(event, upstream.body)
})
