/**
 * 前端 API 插件
 * 创建统一的 HTTP 客户端，请求 Nuxt Server API
 */
export default defineNuxtPlugin((nuxtApp) => {
  const api = $fetch.create({
    // 请求 Nuxt Server API，不直接请求外部 API
    baseURL: '/api',

    // 重要：自动携带 cookie（包含 session）
    credentials: 'include',

    // 请求拦截器
    onRequest({ options }) {
      // 添加全局 headers（可选）
      if (!options.headers) {
        options.headers = new Headers()
      }

      if (options.headers instanceof Headers) {
        options.headers.set('Accept-Language', 'zh-CN')
        options.headers.set('X-Requested-With', 'XMLHttpRequest')
      }
    },

    // 响应拦截器
    async onResponse({ response: _response }) {
      // 可以在这里做全局数据转换
      // 例如：统一的数据格式处理
    },

    // 错误处理拦截器
    async onResponseError({ response }) {
      const status = response.status

      // 401: 未授权，跳转登录
      if (status === 401) {
        await nuxtApp.runWithContext(async () => {
          // 清除可能存在的本地状态
          console.warn('未授权访问，跳转登录页面')
          await navigateTo('/login')
        })
      }
      // 403: 无权限
      else if (status === 403) {
        console.error('无权限访问该资源')
        // 可以显示错误提示
      }
      // 404: 资源不存在
      else if (status === 404) {
        console.error('请求的资源不存在')
      }
      // 500+: 服务器错误
      else if (status >= 500) {
        console.error('服务器错误，请稍后重试')
      }
    },
  })

  // 暴露给 useNuxtApp().$api
  return {
    provide: {
      api,
    },
  }
})
