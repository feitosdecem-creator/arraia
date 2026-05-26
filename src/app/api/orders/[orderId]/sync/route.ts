import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { MercadoPagoConfig, Payment } from 'mercadopago'
import { nanoid } from 'nanoid'
import { sendTicketEmail } from '@/lib/email'

const client = new MercadoPagoConfig({
  accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN!,
})

type Props = { params: Promise<{ orderId: string }> }

export async function POST(_req: NextRequest, { params }: Props) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const { orderId } = await params

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { items: true },
    })

    if (!order) {
      return NextResponse.json({ error: 'Pedido não encontrado' }, { status: 404 })
    }

    if (order.userId !== session.user.id && !session.user.isAdmin) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 403 })
    }

    if (order.status === 'PAID') {
      return NextResponse.json({ status: 'PAID' })
    }

    if (!order.mercadoPagoId) {
      return NextResponse.json({ status: order.status })
    }

    const paymentClient = new Payment(client)
    const payment = await paymentClient.get({ id: order.mercadoPagoId })

    if (payment.status !== 'approved') {
      return NextResponse.json({ status: order.status, mpStatus: payment.status })
    }

    // Atomically claim the PAID transition — same pattern as webhook to prevent
    // double-processing when webhook and sync run concurrently.
    let alreadyClaimed = false
    await prisma.$transaction(async (tx) => {
      const claimed = await tx.order.updateMany({
        where: { id: order.id, status: { not: 'PAID' } },
        data: { status: 'PAID', paidAt: new Date() },
      })
      if (claimed.count === 0) {
        alreadyClaimed = true
        return
      }

      const ticketsToCreate: { orderId: string; ticketTypeId: string; code: string }[] = []
      for (const item of order.items) {
        for (let i = 0; i < item.quantity; i++) {
          ticketsToCreate.push({
            orderId: order.id,
            ticketTypeId: item.ticketTypeId,
            code: nanoid(10).toUpperCase(),
          })
        }
      }
      await tx.ticket.createMany({ data: ticketsToCreate })
    })

    if (alreadyClaimed) return NextResponse.json({ status: 'PAID' })

    try {
      await sendTicketEmail(orderId)
    } catch (e) {
      console.error('[sync] Failed to send ticket email:', e)
    }

    return NextResponse.json({ status: 'PAID' })
  } catch (err) {
    console.error('[sync] Error:', err)
    return NextResponse.json({ error: 'Erro ao verificar pagamento' }, { status: 500 })
  }
}
