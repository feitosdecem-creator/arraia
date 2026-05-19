import 'next-auth'

declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      isAdmin: boolean
      name: string
      email: string
    }
  }
}
