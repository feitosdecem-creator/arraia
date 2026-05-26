import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { createPixPayment } from '@/lib/mercadopago'
import { rateLimitIp } from '@/lib/ratelimit'
import { z } from 'zod'

const schema = z.object({
  items: z
    .array(
      z.object({
        ticketTypeId: z.string(),
        quantity: z.number().int().positive().max(10),
      })
    )
    .min(1),
})

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  }

  const { allowed } = rateLimitIp(req, 'create-order', 3, 10 * 60_000)
  if (!allowed) {
    return NextResponse.json({ error: 'Muitas tentativas. Aguarde alguns minutos.' }, { status: 429 })
  }

  try {
    const body = await req.json()
    const parsed = schema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: 'Dados inválidos' }, { status: 400 })
    }

    const { items } = parsed.data

    const ticketTypes = await prisma.ticketType.findMany({
      where: {
        id: { in: items.map((i) => i.ticketTypeId) },
        isActive: true,
      },
    })

    if (ticketTypes.length !== items.length) {
      return NextResponse.json({ error: 'Tipo de ingresso inválido' }, { status: 400 })
    }

    const totalAmount = items.reduce((sum, item) => {
      const tt = ticketTypes.find((t) => t.id === item.ticketTypeId)!
      return sum + tt.price * item.quantity
    }, 0)

    // Create order and decrement stock atomically
    const order = await prisma.$transaction(async (tx) => {
      for (const item of items) {
        const result = await tx.$executeRaw`
          UPDATE ticket_types
          SET sold = sold + ${item.quantity}
          WHERE id = ${item.ticketTypeId} AND sold + ${item.quantity} <= stock
        `
        if (result === 0) {
          throw new Error('SOLD_OUT')
        }
      }

      return tx.order.create({
        data: {
          userId: session.user.id,
          status: 'PENDING',
          totalAmount,
          items: {
            create: items.map((item) => {
              const tt = ticketTypes.find((t) => t.id === item.ticketTypeId)!
              return {
                ticketTypeId: item.ticketTypeId,
                quantity: item.quantity,
                unitPrice: tt.price,
              }
            }),
          },
        },
      })
    })

    // Create PIX payment — if this fails we must restore stock
    let pixData
    try {
      pixData = await createPixPayment({
        orderId: order.id,
        amount: totalAmount,
        payerEmail: session.user.email,
        payerName: session.user.name,
      })
    } catch (pixErr) {
      console.error('[orders] PIX creation failed, restoring stock:', pixErr)
      // Restore stock and cancel order atomically
      await prisma.$transaction(async (tx) => {
        for (const item of items) {
          await tx.$executeRaw`
            UPDATE ticket_types
            SET sold = GREATEST(0, sold - ${item.quantity})
            WHERE id = ${item.ticketTypeId}
          `
        }
        await tx.order.update({ where: { id: order.id }, data: { status: 'CANCELLED' } })
      })
      return NextResponse.json({ error: 'Erro ao gerar PIX. Tente novamente.' }, { status: 502 })
    }

    // Save PIX data to order
    await prisma.order.update({
      where: { id: order.id },
      data: {
        status: 'AWAITING_PAYMENT',
        mercadoPagoId: pixData.paymentId,
        pixQrCode: pixData.qrCodeBase64,
        pixQrCodeText: pixData.qrCodeText,
        pixExpiresAt: pixData.expiresAt,
      },
    })

    return NextResponse.json({
      orderId: order.id,
      pixQrCode: pixData.qrCodeBase64,
      pixQrCodeText: pixData.qrCodeText,
      expiresAt: pixData.expiresAt,
    })
  } catch (err) {
    if (err instanceof Error && err.message === 'SOLD_OUT') {
      return NextResponse.json({ error: 'Ingressos esgotados' }, { status: 409 })
    }
    console.error('[orders] Error:', err)
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}
