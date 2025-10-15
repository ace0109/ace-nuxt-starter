import { backendFetch } from '../../utils/backendFetch'
import { setAuthSession } from '../../utils/auth'

/**
 * 登录 API
 * POST /api/auth/login
 */
export default defineEventHandler(async (event) => {
  const body = await readBody<{ email: string, password: string }>(event)

  // 转发登录请求到真实后端
  const data = await backendFetch<{
    token: string
    user: {
      id: number
      email: string
      name: string
    }
  }>(event, '/auth/login', {
    method: 'POST',
    body,
    auth: false, // 登录接口不需要认证
  })

  // 将后端返回的 JWT token 设置到 cookie
  setAuthSession(event, data.token, data.user)

  // 返回用户信息（不包含 token）
  return {
    success: true,
    data: {
      user: data.user,
    },
  }
})
