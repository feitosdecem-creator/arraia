import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { rateLimitIp } from '@/lib/ratelimit'

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.isAdmin) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  }

  const { allowed } = rateLimitIp(req, 'validate-ticket', 60, 60_000)
  if (!allowed) {
    return NextResponse.json({ error: 'Muitas validações. Aguarde 1 minuto.' }, { status: 429 })
  }

  const { code } = await req.json()

  if (!code) {
    return NextResponse.json({ valid: false, reason: 'not_found' })
  }

  const ticket = await prisma.ticket.findUnique({
    where: { code: String(code).toUpperCase() },
    include: {
      ticketType: { select: { name: true } },
      order: { include: { user: { select: { name: true } } } },
    },
  })

  if (!ticket) {
    return NextResponse.json({ valid: false, reason: 'not_found' })
  }

  if (ticket.usedAt) {
    return NextResponse.json({
      valid: false,
      reason: 'already_used',
      usedAt: ticket.usedAt,
    })
  }

  await prisma.ticket.update({
    where: { id: ticket.id },
    data: { usedAt: new Date(), validatedBy: session.user.id },
  })

  return NextResponse.json({
    valid: true,
    ticket: {
      ticketType: { name: ticket.ticketType.name },
      order: { user: { name: ticket.order.user.name } },
    },
  })
}
