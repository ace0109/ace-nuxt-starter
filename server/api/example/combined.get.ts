/**
 * 示例：自定义 API 端点
 * 展示如何使用封装后的 API 工具函数
 */
import { apiCall, createAPI } from '../../utils/api'

export default defineEventHandler(async (event) => {
  // 方式 1：使用 apiCall 进行单次请求
  const users = await apiCall(event, '/users', {
    query: { limit: 10 },
  })

  // 方式 2：创建 API 实例进行多次请求
  const api = createAPI(event)

  // 并行获取多个数据
  const [posts, comments] = await Promise.all([
    api('/posts', { query: { userId: 1 } }),
    api('/comments', { query: { postId: 1 } }),
  ])

  // 返回组合数据
  return {
    users,
    posts,
    comments,
    timestamp: Date.now(),
  }
})
