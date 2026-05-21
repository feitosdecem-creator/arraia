import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { MeusIngressosShell } from '@/components/MeusIngressosShell'

export const dynamic = 'force-dynamic'

export default async function MeusIngressosPage() {
  const session = await auth()

  if (!session?.user?.id) {
    redirect('/entrar?callbackUrl=/meus-ingressos')
  }
  if (session.user.id === 'admin') {
    redirect('/admin')
  }

  const orders = await prisma.order.findMany({
    where: { userId: session.user.id, status: 'PAID' },
    include: {
      tickets: {
        include: {
          ticketType: { include: { event: true } },
        },
        orderBy: { createdAt: 'asc' },
      },
    },
    orderBy: { paidAt: 'desc' },
  })

  const now = new Date()

  const serialized = orders
    .map((order) => {
      const event = order.tickets[0]?.ticketType.event
      if (!event) return null

      const isUpcoming = event.date >= now
      const validCount = order.tickets.filter((t) => !t.usedAt).length
      const ticketTypes = [...new Set(order.tickets.map((t) => t.ticketType.name))]

      return {
        id: order.id,
        isUpcoming,
        eventName: event.name,
        eventLocation: event.location,
        eventDateFull: new Intl.DateTimeFormat('pt-BR', { timeZone: 'America/Sao_Paulo', weekday: 'short', day: '2-digit', month: 'short', year: 'numeric' }).format(event.date),
        eventTime: new Intl.DateTimeFormat('pt-BR', { timeZone: 'America/Sao_Paulo', hour: '2-digit', minute: '2-digit', hour12: false }).format(event.date),
        purchaseDate: new Intl.DateTimeFormat('pt-BR', { timeZone: 'America/Sao_Paulo', day: '2-digit', month: '2-digit', year: 'numeric' }).format(order.paidAt ?? order.createdAt),
        totalAmount: order.totalAmount,
        ticketTypes,
        validCount,
        tickets: order.tickets.map((t) => ({
          id: t.id,
          code: t.code,
          typeName: t.ticketType.name,
          usedAt: t.usedAt ? t.usedAt.toISOString() : null,
        })),
      }
    })
    .filter(Boolean) as Parameters<typeof MeusIngressosShell>[0]['orders']

  return (
    <MeusIngressosShell
      userName={session.user.name ?? 'Usuário'}
      userEmail={session.user.email ?? ''}
      orders={serialized}
    />
  )
}
