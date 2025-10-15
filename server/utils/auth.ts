import type { H3Event } from 'h3'

/**
 * 认证工具函数
 */

export interface AuthSession {
  token?: string
  user?: {
    id: number
    email: string
    name: string
    [key: string]: unknown
  }
}

/**
 * 从 event 中获取认证 session
 * 从 cookie 中读取 token (浏览器 -> Nuxt Server 使用 Cookie)
 */
export async function getAuthSession(event: H3Event): Promise<AuthSession | null> {
  // 从 cookie 中获取 JWT token
  const token = getCookie(event, 'token')

  if (!token) {
    return null
  }

  // TODO: 可选 - 在这里验证 JWT token 的有效性
  // 例如：检查过期时间、验证签名等
  // const decoded = await verifyJWT(token)

  // 可选：从另一个 cookie 中读取用户信息（避免重复解析 JWT）
  const userCookie = getCookie(event, 'user')
  const user = userCookie ? JSON.parse(userCookie) : undefined

  return {
    token, // 这个 token 将用于转发到真实后端
    user,
  }
}

/**
 * 设置认证 session
 */
export function setAuthSession(event: H3Event, token: string, user?: unknown): void {
  const config = useRuntimeConfig()
  const isProduction = config.public.NODE_ENV === 'production'

  // 设置 HttpOnly cookie
  setCookie(event, 'token', token, {
    httpOnly: true,
    secure: isProduction,
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7, // 7 天
    path: '/',
  })

  // 可选：将用户信息也存储到 cookie（非敏感信息）
  if (user) {
    setCookie(event, 'user', JSON.stringify(user), {
      httpOnly: false, // 前端可读
      secure: isProduction,
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7,
      path: '/',
    })
  }
}

/**
 * 清除认证 session
 */
export function clearAuthSession(event: H3Event): void {
  deleteCookie(event, 'token')
  deleteCookie(event, 'user')
}

/**
 * 判断路径是否为公开路径
 */
export function isPublicPath(path: string): boolean {
  const PUBLIC_PATHS = [
    '/api/auth/login',
    '/api/auth/register',
    '/api/auth/refresh',
    '/api/health',
  ]

  return PUBLIC_PATHS.some((publicPath) => {
    if (publicPath.includes('*')) {
      // 支持通配符
      const regex = new RegExp(publicPath.replace('*', '.*'))
      return regex.test(path)
    }
    return path === publicPath
  })
}
