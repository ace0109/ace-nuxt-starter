/**
 * 简单的 API 代理
 * 将客户端的 /api 请求转发到真实的后端 API
 */
import { forwardRequest } from '../utils/api'

export default defineEventHandler(async (event) => {
  // 只处理 /api 开头的请求
  if (!event.path.startsWith('/api')) {
    return
  }

  try {
    // 使用封装后的转发方法
    return await forwardRequest(event)
  }
  catch (error) {
    // 统一错误处理
    const err = error as { statusCode?: number, status?: number, message?: string, data?: unknown }
    const statusCode = err.statusCode || err.status || 500
    const message = err.message || 'Internal Server Error'

    throw createError({
      statusCode,
      statusMessage: message,
      data: err.data || null,
    })
  }
})
