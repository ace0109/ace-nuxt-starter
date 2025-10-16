/**
 * 示例：数据聚合
 * 展示如何并行获取多个数据源并聚合
 */
import { createAPI } from '../../utils/api'

export default defineEventHandler(async (event) => {
  const api = createAPI(event)

  try {
    // 并行获取多个数据源
    const [users, posts, stats] = await Promise.all([
      api('/users', { query: { limit: 5 } }).catch(() => []),
      api('/posts', { query: { limit: 10, status: 'published' } }).catch(() => []),
      api('/stats/overview').catch(() => ({
        totalUsers: 0,
        totalPosts: 0,
        activeUsers: 0,
      })),
    ])

    // 聚合和处理数据
    const dashboard = {
      summary: {
        totalUsers: Array.isArray(users) ? users.length : 0,
        totalPosts: Array.isArray(posts) ? posts.length : 0,
        ...(typeof stats === 'object' ? stats : {}),
      },
      recentActivity: {
        users: Array.isArray(users) ? users.slice(0, 3) : [],
        posts: Array.isArray(posts) ? posts.slice(0, 5) : [],
      },
      metadata: {
        generatedAt: new Date().toISOString(),
        apiVersion: '1.0.0',
        cached: false,
      },
    }

    return dashboard
  }
  catch (error) {
    console.error('Dashboard API Error:', error)
    // 返回默认数据结构
    return {
      summary: {
        totalUsers: 0,
        totalPosts: 0,
      },
      recentActivity: {
        users: [],
        posts: [],
      },
      metadata: {
        generatedAt: new Date().toISOString(),
        apiVersion: '1.0.0',
        cached: false,
        error: true,
      },
    }
  }
})
