import { getAuthSession, isPublicPath } from '../utils/auth'

/**
 * Server 端认证中间件
 * 统一处理所有 API 请求的认证逻辑
 */

// 可选认证接口（登录和未登录都能访问）
const OPTIONAL_AUTH_PATHS = new Set<string>([
  // 例如：'/api/posts'
])

export default defineEventHandler(async (event) => {
  // 只处理 /api 开头的请求
  if (!event.path.startsWith('/api')) {
    return
  }

  // 公开接口，直接放行
  if (isPublicPath(event.path)) {
    return
  }

  // 获取用户 session（从 cookie 或 header 中）
  const session = await getAuthSession(event)

  // 可选认证接口
  if (OPTIONAL_AUTH_PATHS.has(event.path)) {
    // 如果有 token，存储到 context
    if (session?.token) {
      event.context.auth = {
        token: session.token,
        user: session.user,
      }
    }
    return // 不抛出错误，继续执行
  }

  // 必需认证的接口：检查是否有 token
  if (!session?.token) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Unauthorized',
      message: '未登录或登录已过期',
    })
  }

  // 将认证信息存储到 event.context，供后续 handler 使用
  event.context.auth = {
    token: session.token,
    user: session.user,
  }
})
