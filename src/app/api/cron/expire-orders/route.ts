import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  // O Vercel injeta automaticamente Authorization: Bearer {CRON_SECRET}
  // quando chama crons configurados em vercel.json
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
      return NextResponse.json({ expired: 0 })
    }

    for (const order of expiredOrders) {
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
    }

    return NextResponse.json({ expired: expiredOrders.length })
  } catch (err) {
    console.error('Cron expire-orders error:', err)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
