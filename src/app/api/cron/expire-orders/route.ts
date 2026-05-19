import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    // Find expired orders
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

    // Process each expired order
    for (const order of expiredOrders) {
      await prisma.$transaction(async (tx) => {
        // Return stock for each item
        for (const item of order.items) {
          await tx.$executeRaw`
            UPDATE ticket_types
            SET sold = GREATEST(0, sold - ${item.quantity})
            WHERE id = ${item.ticketTypeId}
          `
        }

        // Mark order as expired
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
