/**
 * 示例：带参数的 GET 请求
 * 展示如何处理路径参数并返回模拟数据
 */
export default defineEventHandler(async (event) => {
  // 获取路径参数
  const id = getRouterParam(event, 'id')

  if (!id) {
    throw createError({
      statusCode: 400,
      statusMessage: '用户 ID 不能为空',
    })
  }

  // 模拟延迟
  await new Promise(resolve => setTimeout(resolve, 200))

  // 检查是否为特殊的 404 ID
  if (id === '999999') {
    throw createError({
      statusCode: 404,
      statusMessage: `用户 ${id} 不存在`,
    })
  }

  // 返回模拟的用户数据
  return {
    id: parseInt(id),
    name: `用户 ${id}`,
    email: `user${id}@example.com`,
    firstName: `名`,
    lastName: `姓${id}`,
    fullName: `姓${id} 名`,
    avatar: `https://i.pravatar.cc/150?u=${id}`,
    status: 'active',
    role: 'user',
    phone: `+86 138****${id.padStart(4, '0').slice(-4)}`,
    department: '技术部',
    createdAt: new Date(Date.now() - Math.random() * 10000000000).toISOString(),
    fetchedAt: new Date().toISOString(),
  }
})
