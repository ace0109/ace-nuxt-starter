import type { Result, Resume } from '~~/types/api'
import request from '~~/utils/request'

// const runtimeConfig = useRuntimeConfig()

export default defineEventHandler(async (event) => {
  // return event.$fetch(`${runtimeConfig.public.apiHost}/${runtimeConfig.public.apiPrefix}/resume`)

  const ip = getRequestIP(event, { xForwardedFor: true })
  // const ip = event.node.req.headers['x-forwarded-for'] || event.node.req.headers['x-real-ip'] || event.node.req.socket?.remoteAddress

  try {
    const response = await request.get<Result<{ resume: Resume, ip: string }>>('resume')

    return {
      resume: response.data.resume,
      ip,
    }
  }
  catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred'
    throw createError({
      statusCode: 500,
      message: errorMessage,
    })
  }
})
