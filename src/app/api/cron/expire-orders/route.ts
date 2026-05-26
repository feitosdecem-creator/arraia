import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { MercadoPagoConfig, Payment } from 'mercadopago'
import { nanoid } from 'nanoid'
import { sendTicketEmail } from '@/lib/email'

const client = new MercadoPagoConfig({
  accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN!,
})

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  }

  try {
    const expiredOrders = await prisma.order.findMany({
      where: {
        status: 'AWAITING_PAYMENT',
        pixExpiresAt: { lt: new Date() },
      },
      include: { items: true },
    })

    if (expiredOrders.length === 0) {
      return NextResponse.json({ expired: 0, recovered: 0 })
    }

    const paymentClient = new Payment(client)
    let expired = 0
    let recovered = 0

    for (const order of expiredOrders) {
      // Check MercadoPago before expiring — the PIX QR may have expired but the
      // payment could still be approved (webhook failed to deliver).
      if (order.mercadoPagoId) {
        try {
          const payment = await paymentClient.get({ id: order.mercadoPagoId })
          if (payment.status === 'approved') {
            // Payment was actually made — recover it instead of expiring
            let alreadyClaimed = false
            await prisma.$transaction(async (tx) => {
              const claimed = await tx.order.updateMany({
                where: { id: order.id, status: { not: 'PAID' } },
                data: { status: 'PAID', paidAt: new Date() },
              })
              if (claimed.count === 0) { alreadyClaimed = true; return }

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

            if (!alreadyClaimed) {
              recovered++
              try { await sendTicketEmail(order.id) } catch (e) {
                console.error('[cron] Failed to send ticket email for', order.id, e)
              }
            }
            continue
          }
        } catch (e) {
          console.error('[cron] MercadoPago check failed for order', order.id, e)
          // If we can't verify, do NOT expire — leave for next cron run
          continue
        }
      }

      // Payment not approved — safe to expire and restore stock
      await prisma.$transaction(async (tx) => {
        for (const item of order.items) {
          await tx.$executeRaw`
            UPDATE ticket_types
            SET sold = GREATEST(0, sold - ${item.quantity})
            WHERE id = ${item.ticketTypeId}
          `
        }
        await tx.order.update({
          where: { id: order.id },
          data: { status: 'EXPIRED' },
        })
      })
      expired++
    }

    return NextResponse.json({ expired, recovered })
  } catch (err) {
    console.error('Cron expire-orders error:', err)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
