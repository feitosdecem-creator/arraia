import { prisma } from '@/lib/prisma'
import { TicketTypeCard } from '@/components/TicketTypeCard'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { notFound } from 'next/navigation'

export const dynamic = 'force-dynamic'

export default async function EventoPage() {
  const event = await prisma.event.findFirst({
    where: { isActive: true },
    include: {
      ticketTypes: {
        where: { isActive: true },
        orderBy: { sortOrder: 'asc' },
      },
    },
  })

  if (!event) return notFound()

  const eventDate = format(event.date, "EEEE, dd 'de' MMMM 'de' yyyy 'às' HH:mm", {
    locale: ptBR,
  })

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      {/* Event info */}
      <div className="bg-gradient-to-br from-amber-500 to-red-500 text-white rounded-3xl p-8 mb-10 text-center shadow-xl">
        <div className="text-5xl mb-3">🎪</div>
        <h1 className="text-4xl font-extrabold mb-2">{event.name}</h1>
        {event.description && (
          <p className="text-amber-100 max-w-xl mx-auto mb-4">{event.description}</p>
        )}
        <div className="flex flex-col sm:flex-row gap-4 justify-center text-sm">
          <div className="flex items-center gap-2 bg-white/20 rounded-xl px-4 py-2">
            <span>📅</span>
            <span className="capitalize">{eventDate}</span>
          </div>
          <div className="flex items-center gap-2 bg-white/20 rounded-xl px-4 py-2">
            <span>📍</span>
            <span>{event.location}</span>
          </div>
        </div>
      </div>

      {/* Ticket types */}
      <h2 className="text-2xl font-bold text-amber-900 mb-6">Escolha seu ingresso</h2>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {event.ticketTypes.map((tt) => (
          <TicketTypeCard
            key={tt.id}
            ticketTypeId={tt.id}
            name={tt.name}
            description={tt.description}
            price={tt.price}
            stock={tt.stock}
            sold={tt.sold}
          />
        ))}
      </div>

      {event.ticketTypes.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          <p className="text-5xl mb-4">😔</p>
          <p>Nenhum ingresso disponível no momento.</p>
        </div>
      )}
    </div>
  )
}
