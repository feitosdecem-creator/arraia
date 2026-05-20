import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { MeusIngressosShell } from '@/components/MeusIngressosShell'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

export const dynamic = 'force-dynamic'

export default async function MeusIngressosPage() {
  const session = await auth()

  if (!session?.user?.id || session.user.id === 'admin') {
    redirect('/entrar?callbackUrl=/meus-ingressos')
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
        eventDateFull: format(event.date, "EEE, dd MMM yyyy", { locale: ptBR }),
        eventTime: format(event.date, 'HH:mm', { locale: ptBR }),
        purchaseDate: format(order.paidAt ?? order.createdAt, 'dd/MM/yyyy', { locale: ptBR }),
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
