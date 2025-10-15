import type { FetchOptions } from 'ofetch'
import type { UseFetchOptions } from 'nuxt/app'

/**
 * 统一的 API 调用工具
 * 支持响应式数据获取和命令式操作两种模式
 *
 * @example
 * // 方式一：响应式数据获取（传入 url）
 * const { data, pending, error, refresh } = await useApi<User[]>('/users', {
 *   query: { page: 1 },
 *   watch: [page],
 * })
 *
 * @example
 * // 方式二：命令式操作（不传 url）
 * const { get, post, delete: del } = useApi()
 * const newUser = await post('/users', { name: 'John' })
 * await del('/users/123')
 */

// 重载签名：有 url 参数时返回 useFetch 的返回类型
export function useApi<T = unknown>(
  url: string | (() => string),
  options?: UseFetchOptions<T>,
): ReturnType<typeof useFetch<T>>

// 重载签名：无参数时返回命令式方法对象
export function useApi(): {
  api: typeof $fetch
  get: <R = unknown>(url: string, options?: FetchOptions) => Promise<R>
  post: <R = unknown>(url: string, body?: unknown, options?: FetchOptions) => Promise<R>
  put: <R = unknown>(url: string, body?: unknown, options?: FetchOptions) => Promise<R>
  patch: <R = unknown>(url: string, body?: unknown, options?: FetchOptions) => Promise<R>
  delete: <R = unknown>(url: string, options?: FetchOptions) => Promise<R>
}

// 实现
export function useApi<T = unknown>(
  url?: string | (() => string),
  options?: UseFetchOptions<T>,
): unknown {
  const { $api } = useNuxtApp()
  const api = $api as typeof $fetch

  // 如果传入了 url，返回响应式数据（类似 useFetch）
  if (url !== undefined) {
    // @ts-expect-error - Type compatibility issue with useFetch options
    return useFetch<T>(url, {
      ...options,
      $fetch: api as typeof $fetch,
    })
  }

  // 如果没有传入 url，返回命令式方法
  return {
    /**
     * 原始 $api 实例，可以直接使用
     */
    api,

    /**
     * GET 请求
     */
    get: <R = unknown>(url: string, options?: FetchOptions) =>
      api<R>(url, { ...options, method: 'GET' as const }),

    /**
     * POST 请求
     */
    post: <R = unknown>(url: string, body?: unknown, options?: FetchOptions) =>
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      api<R>(url, { ...options, method: 'POST' as const, body: body as any }),

    /**
     * PUT 请求
     */
    put: <R = unknown>(url: string, body?: unknown, options?: FetchOptions) =>
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      api<R>(url, { ...options, method: 'PUT' as const, body: body as any }),

    /**
     * PATCH 请求
     */
    patch: <R = unknown>(url: string, body?: unknown, options?: FetchOptions) =>
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      api<R>(url, { ...options, method: 'PATCH' as const, body: body as any }),

    /**
     * DELETE 请求
     */
    delete: <R = unknown>(url: string, options?: FetchOptions) =>
      api<R>(url, { ...options, method: 'DELETE' as const }),
  }
}
