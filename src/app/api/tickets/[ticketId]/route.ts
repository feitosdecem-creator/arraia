import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

type Props = { params: Promise<{ ticketId: string }> }

export async function GET(_req: NextRequest, { params }: Props) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  }

  const { ticketId } = await params

  const ticket = await prisma.ticket.findUnique({
    where: { id: ticketId },
    include: {
      ticketType: {
        include: { event: true },
      },
      order: {
        include: { user: { select: { name: true, email: true } } },
      },
    },
  })

  if (!ticket) {
    return NextResponse.json({ error: 'Ingresso não encontrado' }, { status: 404 })
  }

  // Apenas o dono ou admin podem acessar
  if (ticket.order.userId !== session.user.id && !session.user.isAdmin) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 403 })
  }

  return NextResponse.json({
    id: ticket.id,
    code: ticket.code,
    usedAt: ticket.usedAt,
    createdAt: ticket.createdAt,
    ticketType: {
      name: ticket.ticketType.name,
      description: ticket.ticketType.description,
      event: {
        name: ticket.ticketType.event.name,
        date: ticket.ticketType.event.date,
        location: ticket.ticketType.event.location,
      },
    },
    buyer: {
      name: ticket.order.user.name,
    },
  })
}
