/**
 * 示例：DELETE 请求处理
 * 展示如何处理删除请求并返回模拟结果
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
  await new Promise(resolve => setTimeout(resolve, 300))

  // 模拟特殊情况：某些 ID 不能删除
  if (id === '1' || id === '2') {
    throw createError({
      statusCode: 403,
      statusMessage: '系统用户不能删除',
    })
  }

  // 返回成功结果
  return {
    success: true,
    message: `用户 ${id} 已成功删除`,
    deletedAt: new Date().toISOString(),
  }
})