// JWT strategy (stateless): tokens are signed with AUTH_SECRET and stored
// in an HttpOnly cookie. Sessions cannot be revoked server-side without
// rotating AUTH_SECRET (which invalidates all active sessions at once).
// maxAge=7d + updateAge=24h: tokens expire after 7 days of inactivity
// and are silently refreshed every 24h of active use.
// In an emergency (compromised token), rotate AUTH_SECRET in Vercel env vars.
import NextAuth from 'next-auth'
import Credentials from 'next-auth/providers/credentials'
import Google from 'next-auth/providers/google'
import bcrypt from 'bcryptjs'
import { nanoid } from 'nanoid'
import { prisma } from '@/lib/prisma'
import { rateLimitIp } from '@/lib/ratelimit'

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Google({
      clientId: process.env.AUTH_GOOGLE_ID,
      clientSecret: process.env.AUTH_GOOGLE_SECRET,
    }),
    Credentials({
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials, request) {
        if (!credentials?.email || !credentials?.password) return null

        // 10 tentativas de login por IP a cada 15 minutos
        if (request) {
          const { allowed } = rateLimitIp(request, 'login', 10, 15 * 60_000)
          if (!allowed) return null
        }

        const email = credentials.email as string
        const password = credentials.password as string

        const adminEmail = process.env.ADMIN_EMAIL
        const adminPasswordHash = process.env.ADMIN_PASSWORD_HASH
        if (adminEmail && adminPasswordHash && email === adminEmail) {
          const isValid = await bcrypt.compare(password, adminPasswordHash)
          if (!isValid) return null
          return {
            id: 'admin',
            email: adminEmail,
            name: 'Admin',
            isAdmin: true,
          }
        }

        const user = await prisma.user.findUnique({ where: { email } })
        if (!user) return null

        // OAuth-only accounts have no password
        if (!user.passwordHash || user.passwordHash.startsWith('oauth:')) return null

        const isValid = await bcrypt.compare(password, user.passwordHash)
        if (!isValid) return null

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          isAdmin: false,
        }
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account }) {
      // Upsert Google users into our users table on first OAuth sign-in
      if (account?.provider === 'google' && user.email) {
        await prisma.user.upsert({
          where: { email: user.email },
          update: { name: user.name ?? user.email },
          create: {
            email: user.email,
            name: user.name ?? user.email,
            passwordHash: `oauth:${nanoid(32)}`,
          },
        })
      }
      return true
    },
    async jwt({ token, user, account }) {
      if (user) {
        if (account?.provider === 'google') {
          // Map Google sub → our internal cuid
          const dbUser = await prisma.user.findUnique({
            where: { email: token.email! },
            select: { id: true },
          })
          token.id = dbUser?.id ?? user.id
          token.isAdmin = false
        } else {
          token.id = user.id
          token.isAdmin = (user as { isAdmin?: boolean }).isAdmin ?? false
        }
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
    redirect({ url, baseUrl }) {
      // Always redirect within the production domain, not Vercel preview URLs.
      // NEXT_PUBLIC_APP_URL takes precedence over whatever NextAuth auto-detected.
      const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://arraia.feitosdecem.com.br'
      if (url.startsWith('/')) return `${appUrl}${url}`
      try {
        const u = new URL(url)
        const app = new URL(appUrl)
        if (u.origin === app.origin) return url
        // Rewrite preview-domain absolute URLs to the production origin
        if (u.pathname) return `${appUrl}${u.pathname}${u.search}`
      } catch { /* ignore invalid URLs */ }
      return appUrl
    },
  },
  pages: {
    signIn: '/entrar',
  },
  session: {
    strategy: 'jwt',
    maxAge: 7 * 24 * 60 * 60,
    updateAge: 24 * 60 * 60,
  },
})
