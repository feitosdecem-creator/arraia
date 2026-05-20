import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  }

  const tickets = await prisma.ticket.findMany({
    where: {
      order: {
        userId: session.user.id,
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
