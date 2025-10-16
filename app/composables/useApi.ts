/**
 * 简化版 API 封装
 * 仅用于浏览器端请求 Nuxt Server 的 /api/* 接口
 */

/**
 * 封装的 useFetch，自动设置基础配置
 * @param url - API 路径（会自动加上 /api 前缀）
 * @param options - useFetch 选项
 */
export function useAPI<T = unknown>(
  url: string | (() => string),
  options: Parameters<typeof useFetch<T>>[1] = {},
) {
  // 确保 URL 以 /api 开头
  const apiUrl = typeof url === 'function'
    ? () => {
        const path = url()
        return path.startsWith('/api') ? path : `/api${path}`
      }
    : (url.startsWith('/api') ? url : `/api${url}`)

  // 保存原始的错误处理函数
  const originalOnResponseError = options.onResponseError

  return useFetch<T>(apiUrl, {
    // 自动携带 cookie（用于认证）
    credentials: 'include',
    // 合并用户选项
    ...options,
    // 覆盖错误处理
    onResponseError: (context) => {
      const { response } = context

      // 401 未认证
      if (response.status === 401) {
        // 清除本地 token（如果有）
        const tokenCookie = useCookie('token')
        tokenCookie.value = null
        // 跳转到登录页
        navigateTo('/login')
      }

      // 调用原始的错误处理函数
      if (originalOnResponseError && typeof originalOnResponseError === 'function') {
        originalOnResponseError(context)
      }
    },
  } as Parameters<typeof useFetch<T>>[1])
}

/**
 * 懒加载版本（客户端渲染）
 */
export function useLazyAPI<T = unknown>(
  url: string | (() => string),
  options: Omit<Parameters<typeof useFetch<T>>[1], 'lazy' | 'server'> = {},
) {
  return useAPI<T>(url, {
    ...options,
    lazy: true,
    server: false,
  } as Parameters<typeof useFetch<T>>[1])
}
