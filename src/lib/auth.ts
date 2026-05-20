import NextAuth from 'next-auth'
import Credentials from 'next-auth/providers/credentials'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'
import { rateLimitIp } from '@/lib/ratelimit'

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
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
  },
  pages: {
    signIn: '/entrar',
  },
  session: {
    strategy: 'jwt',
  },
})
