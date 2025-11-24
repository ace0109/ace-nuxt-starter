export type Recordable<T = unknown> = Record<string, T>

export interface Result<T = unknown> {
  code: string
  data: T
  message: string
  extends?: Recordable
}

export interface ChinaArea {
  id: string
  code: string
  name: string
  parent_code: string | null
  pinyin: string
  leaf: 0 | 1
  children: ChinaArea[]
}

export type ChinaAreaTreeResponse = Result<ChinaArea[]>

export interface Resume {
  resume: { content: string }
}

export interface Article {
  id: string
  title: string
  content: string
  tags: string[]
  createdAt: string
  updatedAt: string
}

export interface ArticleResponse {
  articles: Article[]
}

export interface AIMessageChunk {
  content: string
  additional_kwargs: Record<string, unknown>
  response_metadata: Record<string, unknown>
  type: 'AIMessageChunk'
  name: string | null
  id: string
  tool_calls: unknown[]
  invalid_tool_calls: unknown[]
  usage_metadata: Record<string, unknown> | null
  tool_call_chunks: unknown[]
  chunk_position: number | null
}
