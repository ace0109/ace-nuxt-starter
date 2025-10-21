/**
 * 服务端 API 请求工具
 * 封装 baseURL 和 token 处理逻辑
 */

import type { H3Event } from 'h3'

/**
 * 创建带有默认配置的 fetch 实例
 * 自动设置 baseURL 和从 cookie 中读取 token
 */
export function createAPI(event: H3Event) {
  const config = useRuntimeConfig()
  const apiBase = config.public.apiBase
  const apiPrefix = config.public.apiPrefix
  const baseURL = apiPrefix ? `${apiBase}/${apiPrefix}` : apiBase
  const token = getCookie(event, 'token')

  // 构建请求头
  const headers: HeadersInit = token
    ? { Authorization: `Bearer ${token}` }
    : {}

  return $fetch.create({
    baseURL,
    headers,
  })
}

/**
 * 便捷的 API 请求方法
 * 使用示例：
 * ```ts
 * const data = await apiCall(event, '/users', { method: 'GET' })
 * ```
 */
export async function apiCall<T = unknown>(
  event: H3Event,
  path: string,
  options?: Parameters<typeof $fetch>[1],
): Promise<T> {
  const api = createAPI(event)
  return await api<T>(path, options) as T
}

/**
 * 转发请求到后端 API
 * 自动处理请求方法、请求体、查询参数等
 * 使用示例：
 * ```ts
 * export default defineEventHandler(async (event) => {
 *   return await forwardRequest(event, '/custom/path')
 * })
 * ```
 */
export async function forwardRequest<T = unknown>(
  event: H3Event,
  targetPath?: string,
) {
  // 如果没有指定目标路径，使用当前路径（去掉 /api 前缀）
  const path = targetPath || event.path.replace(/^\/api/, '')
  const method = event.method
  const query = getQuery(event)

  // 获取请求体（如果有）
  let body
  if (['POST', 'PUT', 'PATCH'].includes(method)) {
    body = await readBody(event)
  }

  // 获取请求头（排除一些不需要的）
  const headers = getHeaders(event)
  const requestHeaders: Record<string, string> = {}

  for (const [key, value] of Object.entries(headers)) {
    if (!['host', 'x-forwarded-for', 'x-forwarded-proto', 'connection'].includes(key.toLowerCase())) {
      requestHeaders[key] = value as string
    }
  }

  // 使用 apiCall 发送请求
  return await apiCall<T>(event, path, {
    method: method as 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE',
    headers: requestHeaders,
    body,
    query,
  })
}
