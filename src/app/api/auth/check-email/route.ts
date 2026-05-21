import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { rateLimitIp } from '@/lib/ratelimit'

export async function POST(req: NextRequest) {
  // 10 verificações por minuto por IP
  const { allowed, retryAfterMs } = rateLimitIp(req, 'check-email', 10, 60_000)
  if (!allowed) {
    return NextResponse.json(
      { error: 'Muitas tentativas. Aguarde e tente novamente.' },
      { status: 429, headers: { 'Retry-After': String(Math.ceil(retryAfterMs / 1000)) } },
    )
  }

  try {
    const { email } = await req.json()
    if (!email || typeof email !== 'string') {
      return NextResponse.json({ exists: false })
    }
    const normalized = email.trim().toLowerCase()

    // Admin is defined via env var, not in the DB
    if (process.env.ADMIN_EMAIL && normalized === process.env.ADMIN_EMAIL.toLowerCase()) {
      return NextResponse.json({ exists: true })
    }

    const user = await prisma.user.findUnique({
      where: { email: normalized },
      select: { id: true },
    })
    return NextResponse.json({ exists: !!user })
  } catch {
    return NextResponse.json({ exists: false }, { status: 500 })
  }
}
