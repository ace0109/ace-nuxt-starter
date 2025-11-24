import { joinURL } from 'ufo'

// SSE 透传到 AI 上游，保持流式响应
export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const apiBase = config.aiApiBase
  const apiPrefix = config.aiApiPrefix
  const targetURL = apiPrefix ? joinURL(apiBase, apiPrefix, 'chat') : joinURL(apiBase, 'chat')

  const body = await readRawBody(event)

  const upstream = await fetch(targetURL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-API-KEY': config.aiApiKey || config.apiKey,
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
