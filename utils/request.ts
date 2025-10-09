import type { Recordable } from '~~/types/api'

const runtimeConfig = useRuntimeConfig()

interface ResponseMap {
  blob: Blob
  text: string
  arrayBuffer: ArrayBuffer
  stream: ReadableStream<Uint8Array>
}
type ResponseType = keyof ResponseMap | 'json'

interface IFetchWrapperOptions {
  method: 'get' | 'post' | 'delete' | 'put' | 'patch'
  params?: Recordable
  body?: Recordable | FormData
  contentType?: string
  responseType?: ResponseType
  headers?: Recordable<string>
}

function fetchWrapper<T>(request: string, options: IFetchWrapperOptions): Promise<T> {
  return $fetch(`${runtimeConfig.public.apiHost}/${runtimeConfig.public.apiPrefix}/${request}`, options)
}

export default {
  get<T>(url: string, params?: Recordable) {
    return fetchWrapper<T>(url, { method: 'get', params })
  },
  post<T>(url: string, body?: Recordable, options?: Omit<IFetchWrapperOptions, 'method' | 'body'>) {
    return fetchWrapper<T>(url, { method: 'post', body, ...options })
  },
  delete<T>(url: string) {
    return fetchWrapper<T>(url, { method: 'delete' })
  },
  put<T>(url: string) {
    return fetchWrapper<T>(url, { method: 'put' })
  },
  patch<T>(url: string) {
    return fetchWrapper<T>(url, { method: 'patch' })
  },
}
