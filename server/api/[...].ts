import { backendFetch } from '../utils/backendFetch'

/**
 * 通用 API 转发
 * 所有非认证相关的 API 请求都会通过这里转发到真实后端
 *
 * 例如:
 * GET  /api/users      -> GET  {BACKEND_URL}/users
 * POST /api/posts/123  -> POST {BACKEND_URL}/posts/123
 */
export default defineEventHandler(async (event) => {
  // 获取请求路径（去掉 /api 前缀）
  const path = event.path.replace(/^\/api/, '')

  // 获取请求方法
  const method = event.method

  // 获取请求体（如果有）
  let body
  if (['POST', 'PUT', 'PATCH'].includes(method)) {
    body = await readBody(event)
  }

  // 获取查询参数
  const query = getQuery(event)

  // 转发到真实后端
  const data = await backendFetch(event, path, {
    method,
    body,
    query,
  })

  return data
})
