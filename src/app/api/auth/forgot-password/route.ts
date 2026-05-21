import { NextRequest, NextResponse } from 'next/server'
import { nanoid } from 'nanoid'
import { prisma } from '@/lib/prisma'
import { rateLimitIp } from '@/lib/ratelimit'
import { sendPasswordResetEmail } from '@/lib/email'

export async function POST(req: NextRequest) {
  rateLimitIp(req, 'forgot-password', 3, 15 * 60 * 1000)

  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ ok: true })
  }

  const email = typeof (body as Record<string, unknown>).email === 'string'
    ? ((body as Record<string, unknown>).email as string).toLowerCase().trim()
    : ''

  if (!email || !email.includes('@')) {
    return NextResponse.json({ ok: true })
  }

  try {
    const user = await prisma.user.findUnique({ where: { email } })

    if (user && !user.passwordHash.startsWith('oauth:') && user.id !== 'admin') {
      await prisma.passwordResetToken.deleteMany({ where: { userId: user.id } })

      const token = nanoid(48)
      const expiresAt = new Date(Date.now() + 60 * 60 * 1000)

      await prisma.passwordResetToken.create({
        data: { userId: user.id, token, expiresAt },
      })

      sendPasswordResetEmail(user.email, user.name, token).catch(() => undefined)
    }
  } catch {
    // swallow errors silently
  }

  return NextResponse.json({ ok: true })
}
