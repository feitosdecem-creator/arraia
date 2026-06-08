import { prisma } from '@/lib/prisma'
import { EventSettingsForm } from './EventSettingsForm'

export const dynamic = 'force-dynamic'

export default async function ConfiguracoesPage() {
  const event = await prisma.event.findFirst({ orderBy: { createdAt: 'desc' } })

  return (
    <div>
      <div style={{ marginBottom: 28 }}>
        <div className="fdc-eyebrow" style={{ marginBottom: 4 }}>Painel</div>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(24px, 3vw, 40px)', fontWeight: 700, letterSpacing: '-0.03em', lineHeight: 1.0, color: 'var(--fdc-ink)', margin: 0 }}>
          Configurações
        </h1>
        <p style={{ fontSize: 14, color: 'var(--fg-3)', marginTop: 8 }}>
          Informações do evento exibidas na página pública e nos ingressos.
        </p>
      </div>

      {event ? (
        <EventSettingsForm event={{
          id: event.id,
          name: event.name,
          description: event.description,
          date: event.date.toISOString(),
          location: event.location,
          imageUrl: event.imageUrl,
          isActive: event.isActive,
        }} />
      ) : (
        <div className="fdc-card" style={{ padding: 32, textAlign: 'center', color: 'var(--fg-3)' }}>
          Nenhum evento cadastrado.
        </div>
      )}
    </div>
  )
}
