import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

type Props = { params: Promise<{ orderId: string }> }

// Público: quem tem o link do pedido (cuid não-adivinhável) pode consultar o
// status. Exigir sessão aqui quebrava o polling em in-app browsers
// (Instagram/Facebook) que bloqueiam cookies — o comprador nunca via a
// confirmação do pagamento. Só o status é exposto, nenhum dado pessoal.
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
