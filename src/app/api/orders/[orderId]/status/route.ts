import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

type Props = { params: Promise<{ orderId: string }> }

export async function GET(_req: NextRequest, { params }: Props) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  }

  const { orderId } = await params

  const order = await prisma.order.findUnique({
    where: { id: orderId },
    select: { status: true, userId: true },
  })

  if (!order) {
    return NextResponse.json({ error: 'Pedido não encontrado' }, { status: 404 })
  }

  // Verifica que o pedido pertence ao usuário logado (ou é admin)
  if (order.userId !== session.user.id && !session.user.isAdmin) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 403 })
  }

  return NextResponse.json({ status: order.status })
}
