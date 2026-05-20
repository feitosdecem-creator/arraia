import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

type Params = { params: Promise<{ id: string }> }

export async function DELETE(_req: Request, { params }: Params) {
  const session = await auth()
  if (!session?.user?.isAdmin) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  }

  const { id } = await params

  const ticket = await prisma.ticket.findUnique({ where: { id } })
  if (!ticket) return NextResponse.json({ error: 'Não encontrado' }, { status: 404 })

  if (ticket.usedAt) {
    return NextResponse.json(
      { error: 'Ingresso já utilizado na entrada — não pode ser excluído.' },
      { status: 400 }
    )
  }

  await prisma.$transaction([
    prisma.ticket.delete({ where: { id } }),
    prisma.ticketType.update({
      where: { id: ticket.ticketTypeId },
      data: { sold: { decrement: 1 } },
    }),
  ])

  return NextResponse.json({ ok: true })
}
