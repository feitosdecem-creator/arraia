import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'

export async function POST(req: NextRequest) {
  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Requisição inválida.' }, { status: 400 })
  }

  const { token, password } = body as Record<string, unknown>

  if (typeof token !== 'string' || !token) {
    return NextResponse.json({ error: 'Link inválido ou expirado. Solicite um novo.' }, { status: 400 })
  }

  if (typeof password !== 'string' || password.length < 8) {
    return NextResponse.json({ error: 'A senha deve ter pelo menos 8 caracteres.' }, { status: 400 })
  }

  const record = await prisma.passwordResetToken.findUnique({
    where: { token },
    include: { user: true },
  })

  if (!record || record.usedAt !== null || record.expiresAt < new Date()) {
    return NextResponse.json({ error: 'Link inválido ou expirado. Solicite um novo.' }, { status: 400 })
  }

  const passwordHash = await bcrypt.hash(password, 12)

  await prisma.$transaction([
    prisma.user.update({
      where: { id: record.userId },
      data: { passwordHash },
    }),
    prisma.passwordResetToken.update({
      where: { id: record.id },
      data: { usedAt: new Date() },
    }),
  ])

  return NextResponse.json({ ok: true })
}
