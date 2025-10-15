import type { H3Event } from 'h3'
import type { FetchOptions } from 'ofetch'

/**
 * 后端 API 请求工具
 * 用于 Nuxt Server API 转发请求到真实后端
 * 自动注入 JWT Token 到 Authorization header
 */

export interface BackendFetchOptions extends Omit<FetchOptions, 'baseURL'> {
  /**
   * 是否需要认证（自动注入 token）
   * @default true
   */
  auth?: boolean
}

/**
 * 创建后端请求实例
 */
export function createBackendFetch(event: H3Event) {
  const config = useRuntimeConfig()
  const backendBaseURL = (config.public.BACKEND_URL as string) || 'http://localhost:3001'

  return $fetch.create({
    baseURL: backendBaseURL,
    async onRequest({ options }) {
      // 检查是否需要认证（默认需要）
      // @ts-expect-error - custom auth option
      const needsAuth = options.auth !== false

      if (needsAuth) {
        const session = event.context.auth
        if (session?.token) {
          // 注入 JWT token 到 Authorization header
          options.headers = {
            ...options.headers,
            // @ts-expect-error - Authorization is a valid header
            Authorization: `Bearer ${session.token}`,
          }
        }
        else {
          // 如果需要认证但没有 token，抛出错误
          throw createError({
            statusCode: 401,
            statusMessage: 'Unauthorized',
            message: '未登录或登录已过期',
          })
        }
      }
    },
    async onResponseError({ response }) {
      // 如果后端返回 401，清除前端的 session
      if (response.status === 401) {
        const { clearAuthSession } = await import('./auth')
        clearAuthSession(event)
      }

      // 记录错误日志
      console.error('[Backend API Error]', {
        status: response.status,
        statusText: response.statusText,
        url: response.url,
      })
    },
  })
}

/**
 * 便捷方法：backendFetch
 * 在 server API 中使用：const data = await backendFetch(event, '/users/me')
 *
 * @example
 * // 需要认证的请求（默认）
 * const user = await backendFetch(event, '/users/me')
 *
 * // 不需要认证的请求
 * const data = await backendFetch(event, '/public/data', { auth: false })
 *
 * // POST 请求
 * const result = await backendFetch(event, '/users', {
 *   method: 'POST',
 *   body: { name: 'John' }
 * })
 */
export async function backendFetch<T = unknown>(
  event: H3Event,
  endpoint: string,
  options?: BackendFetchOptions,
): Promise<T> {
  const fetch = createBackendFetch(event)
  // @ts-expect-error - ofetch type compatibility
  return fetch<T>(endpoint, options)
}
