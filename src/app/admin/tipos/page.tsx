import { prisma } from '@/lib/prisma'
import { NewTicketTypeForm } from './NewTicketTypeForm'

export const dynamic = 'force-dynamic'

export default async function TiposPage() {
  const event = await prisma.event.findFirst({ where: { isActive: true } })
  const ticketTypes = await prisma.ticketType.findMany({
    where: event ? { eventId: event.id } : {},
    orderBy: { sortOrder: 'asc' },
    include: { _count: { select: { tickets: true } } },
  })

  const fmt = (n: number) => 'R$ ' + (n / 100).toFixed(2).replace('.', ',')

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

      <div className="fdc-card" style={{ padding: 0, overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
          <thead>
            <tr style={{ background: 'var(--bg-sunken)' }}>
              {['Nome', 'Preço', 'Vendidos', 'Estoque', 'Disponíveis'].map((h) => (
                <th key={h} style={{ textAlign: 'left', padding: '10px 16px', fontSize: 11, fontWeight: 600, color: 'var(--fg-2)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {ticketTypes.map((tt, i) => {
              const available = tt.stock - tt.sold
              return (
                <tr key={tt.id} style={{ borderBottom: i < ticketTypes.length - 1 ? '1px solid var(--line-2)' : 'none' }}>
                  <td style={{ padding: '14px 16px' }}>
                    <div style={{ fontWeight: 600, color: 'var(--fg-1)' }}>{tt.name}</div>
                    {tt.description && <div style={{ fontSize: 12, color: 'var(--fg-3)', marginTop: 2 }}>{tt.description}</div>}
                  </td>
                  <td style={{ padding: '14px 16px', fontWeight: 700, color: tt.price === 0 ? 'var(--fdc-leaf-deep)' : 'var(--fg-1)' }}>
                    {tt.price === 0 ? 'Gratuito' : fmt(tt.price)}
                  </td>
                  <td style={{ padding: '14px 16px', color: 'var(--fg-2)' }}>{tt.sold}</td>
                  <td style={{ padding: '14px 16px', color: 'var(--fg-2)' }}>{tt.stock}</td>
                  <td style={{ padding: '14px 16px' }}>
                    <span style={{
                      display: 'inline-block',
                      padding: '3px 10px',
                      borderRadius: 999,
                      fontSize: 12,
                      fontWeight: 600,
                      background: available <= 0 ? 'rgba(216,56,56,0.1)' : available < 20 ? 'rgba(244,183,59,0.2)' : 'rgba(111,168,74,0.15)',
                      color: available <= 0 ? 'var(--fdc-danger)' : available < 20 ? 'var(--fdc-sun-deep)' : 'var(--fdc-leaf-deep)',
                    }}>
                      {available <= 0 ? 'Esgotado' : available}
                    </span>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
        {ticketTypes.length === 0 && (
          <div style={{ textAlign: 'center', padding: '48px 24px', color: 'var(--fg-3)', fontSize: 15 }}>
            Nenhum tipo de ingresso cadastrado.
          </div>
        )}
      </div>
    </div>
  )
}
