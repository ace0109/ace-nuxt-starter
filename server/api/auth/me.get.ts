import { backendFetch } from '../../utils/backendFetch'

/**
 * 获取当前用户信息 API
 * GET /api/auth/me
 */
export default defineEventHandler(async (event) => {
  // 从真实后端获取用户信息
  const user = await backendFetch<{
    id: number
    email: string
    name: string
    avatar?: string
    [key: string]: unknown
  }>(event, '/auth/me')

  return {
    success: true,
    data: { user },
  }
})
