export interface AuthUser {
  id: number
  email: string
  name: string
  [key: string]: unknown
}

declare module 'h3' {
  interface H3EventContext {
    auth?: {
      token: string
      user?: AuthUser
    }
  }
}
