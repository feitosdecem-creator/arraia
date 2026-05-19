import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const session = await auth()
  if (!session?.user?.isAdmin) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  }

  const [revenueAgg, totalOrders, totalTickets, usedTickets, byType] = await Promise.all([
    prisma.order.aggregate({
      where: { status: 'PAID' },
      _sum: { totalAmount: true },
    }),
    prisma.order.count({ where: { status: 'PAID' } }),
    prisma.ticket.count(),
    prisma.ticket.count({ where: { usedAt: { not: null } } }),
    prisma.ticketType.findMany({
      include: {
        _count: { select: { tickets: true } },
      },
    }),
  ])

  return NextResponse.json({
    totalRevenue: revenueAgg._sum.totalAmount ?? 0,
    totalOrders,
    totalTickets,
    usedTickets,
    byType: byType.map((tt) => ({
      name: tt.name,
      sold: tt.sold,
      stock: tt.stock,
      tickets: tt._count.tickets,
    })),
  })
}
