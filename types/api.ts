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
