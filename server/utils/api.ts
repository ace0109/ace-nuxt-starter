import type { H3Event } from 'h3'
import { joinURL } from 'ufo'

interface UpstreamConfig {
  baseURL: string
  apiKey?: string
}

interface ResolvedUpstream {
  baseURL: string
  apiKey?: string
  path: string
}

function normalizePath(path: string) {
  if (!path.startsWith('/'))
    return `/${path}`
  return path
}

function stripSlashes(value?: string) {
  return (value || '').replace(/^\/+/, '').replace(/\/+$/, '')
}

function resolveUpstream(path: string): ResolvedUpstream {
  const config = useRuntimeConfig()
  const apiPrefix = stripSlashes(config.public.apiPrefix)
  const aiPrefix = stripSlashes(config.aiApiPrefix)
  const aiNamespace = 'ai' // 前端代理到 /api/ai/*，再转发到 AI 上游

  const normalizedPath = normalizePath(path || '/')
  const aiPrefixPattern = new RegExp(`^/${aiNamespace}(?=/|$)`)
  const isAIRequest = aiPrefixPattern.test(normalizedPath)

  if (isAIRequest) {
    const trimmedPath = normalizedPath.replace(aiPrefixPattern!, '') || '/'
    const baseURL = aiPrefix ? joinURL(config.aiApiBase, aiPrefix) : config.aiApiBase
    return {
      baseURL,
      apiKey: config.aiApiKey || config.apiKey,
      path: normalizePath(trimmedPath),
    }
  }

  const baseURL = apiPrefix ? joinURL(config.public.apiBase, apiPrefix) : config.public.apiBase
  return {
    baseURL,
    apiKey: config.apiKey,
    path: normalizedPath,
  }
}

// Creates a fetch client with sane defaults (base URL, auth token, API key)
export function createAPI(event: H3Event, upstream?: UpstreamConfig) {
  const config = useRuntimeConfig()
  const baseURL = upstream?.baseURL || (config.public.apiPrefix ? joinURL(config.public.apiBase, config.public.apiPrefix) : config.public.apiBase)
  const token = getCookie(event, 'token')
  const apiKey = upstream?.apiKey ?? config.apiKey

  const headers: HeadersInit = {}
  if (token)
    headers.Authorization = `Bearer ${token}`
  if (apiKey)
    headers['X-API-KEY'] = apiKey

  return $fetch.create({
    baseURL,
    headers,
  })
}

// Thin wrapper over $fetch that supports upstream overrides
export async function apiCall<T = unknown>(
  event: H3Event,
  path: string,
  options?: Parameters<typeof $fetch>[1],
  upstream?: UpstreamConfig,
): Promise<T> {
  const api = createAPI(event, upstream)
  return await api<T>(normalizePath(path), options) as T
}

// Forward any /api/* request to the appropriate upstream (default or AI)
export async function forwardRequest<T = unknown>(
  event: H3Event,
  targetPath?: string,
) {
  const path = targetPath || event.path.replace(/^\/api/, '')
  const method = event.method
  const query = getQuery(event)

  let body
  if (['POST', 'PUT', 'PATCH'].includes(method))
    body = await readBody(event)

  const headers = getHeaders(event)
  const requestHeaders: Record<string, string> = {}
  for (const [key, value] of Object.entries(headers)) {
    const lowerKey = key.toLowerCase()
    if (!['host', 'x-forwarded-for', 'x-forwarded-proto', 'connection', 'x-api-key'].includes(lowerKey))
      requestHeaders[key] = value as string
  }

  const upstream = resolveUpstream(path)

  return await apiCall<T>(event, upstream.path, {
    method: method as 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE',
    headers: requestHeaders,
    body,
    query,
  }, upstream)
}
