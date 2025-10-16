/**
 * 示例：POST 请求处理
 * 展示如何处理 POST 请求并返回模拟数据
 */
export default defineEventHandler(async (event) => {
  // 读取请求体
  const body = await readBody(event)

  // 验证必填字段
  if (!body.name || !body.email) {
    throw createError({
      statusCode: 400,
      statusMessage: '姓名和邮箱为必填项',
    })
  }

  // 模拟创建用户（不调用真实的后端）
  const newUser = {
    id: Date.now(), // 使用时间戳作为 ID
    ...body,
    createdAt: new Date().toISOString(),
    source: 'web',
    status: 'active',
  }

  // 模拟延迟
  await new Promise(resolve => setTimeout(resolve, 500))

  // 返回成功结果
  return {
    success: true,
    data: newUser,
    message: '用户创建成功',
  }
})
