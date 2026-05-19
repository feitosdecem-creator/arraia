import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { MercadoPagoConfig, Payment } from 'mercadopago'
import { nanoid } from 'nanoid'
import { sendTicketEmail } from '@/lib/email'

const client = new MercadoPagoConfig({
  accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN!,
})

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { type, data } = body

    if (type !== 'payment') {
      return NextResponse.json({ ok: true })
    }

    const paymentId = data?.id
    if (!paymentId) return NextResponse.json({ ok: true })

    // Fetch payment from Mercado Pago
    const paymentClient = new Payment(client)
    const payment = await paymentClient.get({ id: String(paymentId) })

    if (payment.status !== 'approved') {
      return NextResponse.json({ ok: true })
    }

    const orderId = payment.external_reference
    if (!orderId) return NextResponse.json({ ok: true })

    // Find order
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        items: true,
      },
    })

    if (!order) return NextResponse.json({ ok: true })

    // Idempotent: already paid
    if (order.status === 'PAID') {
      return NextResponse.json({ ok: true })
    }

    // Create tickets and mark order as paid
    await prisma.$transaction(async (tx) => {
      // Generate one ticket per item × quantity
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
        data: {
          status: 'PAID',
          paidAt: new Date(),
        },
      })
    })

    // Send email (outside transaction)
    try {
      await sendTicketEmail(orderId)
    } catch (emailErr) {
      console.error('Failed to send ticket email:', emailErr)
    }

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('Webhook error:', err)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
