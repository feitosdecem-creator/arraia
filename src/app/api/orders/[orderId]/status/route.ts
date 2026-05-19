import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

type Props = { params: Promise<{ orderId: string }> }

export async function GET(_req: NextRequest, { params }: Props) {
  const { orderId } = await params

  const order = await prisma.order.findUnique({
    where: { id: orderId },
    select: { status: true },
  })

  if (!order) {
    return NextResponse.json({ error: 'Pedido não encontrado' }, { status: 404 })
  }

  return NextResponse.json({ status: order.status })
}
