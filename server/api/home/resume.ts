import type { Result, Resume } from '~~/types/api'

export default defineEventHandler(async (event) => {
  try {
    const response = await forwardRequest<Result<{ resume: Resume }>>(event, '/resume')

    return {
      resume: response.data.resume,
    }
  }
  catch (error) {
    console.error(error)

    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred'
    throw createError({
      statusCode: 500,
      message: errorMessage,
    })
  }
})
