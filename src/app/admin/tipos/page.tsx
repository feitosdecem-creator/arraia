import { prisma } from '@/lib/prisma'
import { NewTicketTypeForm } from './NewTicketTypeForm'
import { TicketTypeTable } from './TicketTypeTable'

export const dynamic = 'force-dynamic'

export default async function TiposPage() {
  const event = await prisma.event.findFirst({ where: { isActive: true } })
  const ticketTypes = await prisma.ticketType.findMany({
    where: event ? { eventId: event.id } : {},
    orderBy: { sortOrder: 'asc' },
    include: { _count: { select: { tickets: true } } },
  })

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <div className="fdc-eyebrow" style={{ marginBottom: 4 }}>Ingressos</div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(24px, 3vw, 40px)', fontWeight: 700, letterSpacing: '-0.03em', color: 'var(--fg-1)', margin: 0 }}>
            Tipos de ingresso
          </h1>
        </div>
        {event && <NewTicketTypeForm eventId={event.id} />}
      </div>

      {!event && (
        <div className="fdc-card" style={{ padding: 32, textAlign: 'center', color: 'var(--fg-3)' }}>
          Nenhum evento ativo encontrado.
        </div>
      )}

      <TicketTypeTable ticketTypes={ticketTypes} />
    </div>
  )
}
