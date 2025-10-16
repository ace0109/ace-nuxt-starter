/**
 * 示例：模拟数据 API
 * 用于前端开发测试，不依赖真实后端
 */
export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const page = parseInt(query.page as string) || 1
  const limit = parseInt(query.limit as string) || 10

  // 模拟延迟
  await new Promise(resolve => setTimeout(resolve, 300))

  // 生成模拟数据
  const mockData = Array.from({ length: limit }, (_, i) => ({
    id: (page - 1) * limit + i + 1,
    name: `用户 ${(page - 1) * limit + i + 1}`,
    email: `user${(page - 1) * limit + i + 1}@example.com`,
    avatar: `https://i.pravatar.cc/150?u=${(page - 1) * limit + i + 1}`,
    status: ['active', 'inactive', 'pending'][Math.floor(Math.random() * 3)],
    role: ['admin', 'user', 'guest'][Math.floor(Math.random() * 3)],
    createdAt: new Date(Date.now() - Math.random() * 10000000000).toISOString(),
  }))

  return {
    data: mockData,
    pagination: {
      page,
      limit,
      total: 100,
      totalPages: Math.ceil(100 / limit),
    },
    timestamp: Date.now(),
  }
})
