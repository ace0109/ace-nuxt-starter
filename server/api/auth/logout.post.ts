import { backendFetch } from '../../utils/backendFetch'
import { clearAuthSession } from '../../utils/auth'

/**
 * 登出 API
 * POST /api/auth/logout
 */
export default defineEventHandler(async (event) => {
  // 可选：通知后端登出
  try {
    await backendFetch(event, '/auth/logout', {
      method: 'POST',
    })
  }
  catch (error) {
    // 忽略后端错误，继续清除本地 session
    console.error('Backend logout failed:', error)
  }

  // 清除 cookie
  clearAuthSession(event)

  return {
    success: true,
    message: '登出成功',
  }
})
