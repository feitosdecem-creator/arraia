import { NextRequest, NextResponse } from 'next/server'
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
    const { orderId } = await params

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { items: true },
    })

    if (!order) {
      return NextResponse.json({ error: 'Pedido não encontrado' }, { status: 404 })
    }

    // Already paid — nothing to do
    if (order.status === 'PAID') {
      return NextResponse.json({ status: 'PAID' })
    }

    if (!order.mercadoPagoId) {
      return NextResponse.json({ status: order.status })
    }

    // Query Mercado Pago directly
    const paymentClient = new Payment(client)
    const payment = await paymentClient.get({ id: order.mercadoPagoId })

    if (payment.status !== 'approved') {
      return NextResponse.json({ status: order.status, mpStatus: payment.status })
    }

    // Payment approved — create tickets and mark order as paid
    await prisma.$transaction(async (tx) => {
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
      await tx.order.update({
        where: { id: order.id },
        data: { status: 'PAID', paidAt: new Date() },
      })
    })

    try {
      await sendTicketEmail(orderId)
    } catch (e) {
      console.error('Failed to send ticket email on sync:', e)
    }

    return NextResponse.json({ status: 'PAID' })
  } catch (err) {
    console.error('Sync error:', err)
    return NextResponse.json({ error: 'Erro ao verificar pagamento' }, { status: 500 })
  }
}
