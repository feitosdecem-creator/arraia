import type { NextAuthConfig } from 'next-auth'

export const authConfig: NextAuthConfig = {
  providers: [],
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.isAdmin = (user as { isAdmin?: boolean }).isAdmin ?? false
      }
      return token
    },
    session({ session, token }) {
      if (token) {
        session.user.id = token.id as string
        session.user.isAdmin = token.isAdmin as boolean
      }
      return session
    },
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user
      const isAdmin = auth?.user?.isAdmin === true
      const { pathname } = nextUrl

      if (pathname.startsWith('/admin') && pathname !== '/admin/login') {
        if (!isAdmin) {
          return Response.redirect(new URL('/admin/login', nextUrl))
        }
      }

      if (pathname.startsWith('/pagamento')) {
        if (!isLoggedIn) {
          return Response.redirect(new URL('/checkout', nextUrl))
        }
      }

      return true
    },
  },
  pages: {
    signIn: '/checkout',
  },
  session: {
    strategy: 'jwt',
  },
}
