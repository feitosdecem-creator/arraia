import { NextRequest, NextResponse } from 'next/server'
import { createHmac, timingSafeEqual } from 'crypto'
import { prisma } from '@/lib/prisma'
import { MercadoPagoConfig, Payment } from 'mercadopago'
import { nanoid } from 'nanoid'
import { sendTicketEmail } from '@/lib/email'

const client = new MercadoPagoConfig({
  accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN!,
})

function validateSignature(req: NextRequest, rawBody: string): boolean {
  const secret = process.env.MERCADOPAGO_WEBHOOK_SECRET
  if (!secret) return false

  const xSignature = req.headers.get('x-signature') ?? ''
  const xRequestId = req.headers.get('x-request-id') ?? ''
  const dataId = new URL(req.url).searchParams.get('data.id') ?? ''

  const parts = Object.fromEntries(
    xSignature.split(',').map((p) => p.trim().split('=') as [string, string])
  )
  const ts = parts['ts']
  const v1 = parts['v1']
  if (!ts || !v1) return false

  const manifest = `id:${dataId};request-id:${xRequestId};ts:${ts};`
  const expected = createHmac('sha256', secret).update(manifest).digest('hex')

  try {
    return timingSafeEqual(Buffer.from(v1, 'hex'), Buffer.from(expected, 'hex'))
  } catch {
    return false
  }
}

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text()

    if (!validateSignature(req, rawBody)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = JSON.parse(rawBody)
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
