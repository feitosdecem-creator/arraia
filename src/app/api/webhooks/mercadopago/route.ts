import { NextRequest, NextResponse } from 'next/server'
import { createHmac, timingSafeEqual } from 'crypto'
import { prisma } from '@/lib/prisma'
import { MercadoPagoConfig, Payment } from 'mercadopago'
import { nanoid } from 'nanoid'
import { sendTicketEmail } from '@/lib/email'

const client = new MercadoPagoConfig({
  accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN!,
})

function validateSignature(req: NextRequest): boolean {
  const secret = process.env.MERCADOPAGO_WEBHOOK_SECRET
  if (!secret) {
    // Without a secret we cannot verify authenticity but we must not block payments.
    // Configure MERCADOPAGO_WEBHOOK_SECRET in Vercel env vars to enable signature checks.
    console.warn('[webhook] MERCADOPAGO_WEBHOOK_SECRET not configured — processing without signature check')
    return true
  }

  const xSignature = req.headers.get('x-signature') ?? ''
  const xRequestId = req.headers.get('x-request-id') ?? ''
  const dataId = new URL(req.url).searchParams.get('data.id') ?? ''

  const parts = Object.fromEntries(
    xSignature.split(',').map((p) => p.trim().split('=') as [string, string])
  )
  const ts = parts['ts']
  const v1 = parts['v1']
  if (!ts || !v1) {
    console.warn('[webhook] Missing ts or v1 in x-signature header')
    return false
  }

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
    if (!validateSignature(req)) {
      console.error('[webhook] Signature validation failed')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const { type, data } = body
    console.log(`[webhook] Received type=${type} data=${JSON.stringify(data)}`)

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

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { items: true },
    })

    if (!order) return NextResponse.json({ ok: true })
    if (order.status === 'PAID') return NextResponse.json({ ok: true })

    // Atomically claim the PAID transition inside the transaction.
    // updateMany with the status guard acts as a distributed lock —
    // only one concurrent call (webhook vs sync) succeeds; the other gets count=0.
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

    if (alreadyClaimed) return NextResponse.json({ ok: true })

    try {
      await sendTicketEmail(orderId)
    } catch (emailErr) {
      console.error('[webhook] Failed to send ticket email:', emailErr)
    }

    console.log(`[webhook] Order ${orderId} marked PAID via webhook`)
    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('[webhook] Error:', err)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
