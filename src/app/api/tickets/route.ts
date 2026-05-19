import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  const email = req.nextUrl.searchParams.get('email')

  if (!email) {
    return NextResponse.json({ error: 'E-mail obrigatório' }, { status: 400 })
  }

  const user = await prisma.user.findUnique({
    where: { email: email.toLowerCase() },
  })

  if (!user) {
    return NextResponse.json({ tickets: [] })
  }

  const tickets = await prisma.ticket.findMany({
    where: {
      order: {
        userId: user.id,
        status: 'PAID',
      },
    },
    orderBy: { createdAt: 'desc' },
    include: {
      ticketType: {
        include: { event: true },
      },
    },
  })

  return NextResponse.json({ tickets })
}
