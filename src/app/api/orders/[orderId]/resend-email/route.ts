import { NextRequest, NextResponse } from 'next/server'
import { sendTicketEmail } from '@/lib/email'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'

type Props = { params: Promise<{ orderId: string }> }

export async function POST(_req: NextRequest, { params }: Props) {
  try {
    const { orderId } = await params
    const session = await auth()

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      select: { userId: true, status: true },
    })

    if (!order) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }

    const isOwner = session?.user?.id === order.userId
    const isAdmin = session?.user?.isAdmin === true

    if (!isOwner && !isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (order.status !== 'PAID') {
      return NextResponse.json({ error: 'Pedido não pago' }, { status: 400 })
    }

    await sendTicketEmail(orderId)

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('Resend email error:', err)
    return NextResponse.json({ error: 'Erro ao reenviar e-mail' }, { status: 500 })
  }
}
