import { forwardRequest } from '../../utils/api'

export default defineEventHandler(async (event) => {
  return await forwardRequest(event)
})
