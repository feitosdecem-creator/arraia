import { prisma } from '@/lib/prisma'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { notFound } from 'next/navigation'
import { TicketTypeCard, CartCheckoutBar } from '@/components/TicketTypeCard'

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

  const eventDate = format(event.date, "EEEE, dd 'de' MMMM 'de' yyyy", { locale: ptBR })
  const eventTime = format(event.date, 'HH:mm', { locale: ptBR })

  return (
    <div style={{ background: 'var(--bg-page)', minHeight: '100vh' }}>
      <div
        style={{
          maxWidth: 'var(--container-max)',
          margin: '0 auto',
          padding: '32px var(--container-pad) 80px',
        }}
      >
        {/* Breadcrumb */}
        <nav
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            fontSize: 13,
            color: 'var(--fg-2)',
            marginBottom: 24,
          }}
        >
          <a href="/" style={{ color: 'inherit', textDecoration: 'none' }}>Eventos</a>
          <span>›</span>
          <span style={{ color: 'var(--fg-1)' }}>{event.name}</span>
        </nav>

        {/* Hero card */}
        <div
          style={{
            borderRadius: 'var(--radius-xl)',
            overflow: 'hidden',
            marginBottom: 40,
            background: 'linear-gradient(135deg, var(--fdc-tangerine) 0%, var(--fdc-sun) 70%, var(--fdc-leaf-soft) 100%)',
            minHeight: 280,
            display: 'flex',
            alignItems: 'flex-end',
            padding: '40px 40px 36px',
            position: 'relative',
          }}
          className="fdc-grain"
        >
          <div
            aria-hidden
            style={{
              position: 'absolute',
              top: -60,
              right: -60,
              width: 300,
              height: 300,
              borderRadius: '50%',
              background: 'rgba(255,255,255,0.1)',
            }}
          />
          <div style={{ position: 'relative', zIndex: 1 }}>
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                padding: '4px 12px',
                borderRadius: 'var(--radius-pill)',
                background: 'rgba(255,255,255,0.22)',
                color: 'var(--fdc-cream)',
                fontSize: 12,
                fontWeight: 600,
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                marginBottom: 12,
              }}
            >
              Evento presencial
            </div>
            <h1
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: 'clamp(28px, 4vw, 52px)',
                fontWeight: 700,
                letterSpacing: '-0.03em',
                lineHeight: 1.0,
                color: 'var(--fdc-cream)',
                margin: '0 0 14px',
              }}
            >
              {event.name}
            </h1>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
              {[
                { emoji: '📅', text: `${eventDate} · ${eventTime}` },
                { emoji: '📍', text: event.location },
              ].map((m) => (
                <div
                  key={m.text}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    padding: '6px 14px',
                    borderRadius: 'var(--radius-pill)',
                    background: 'rgba(255,255,255,0.18)',
                    color: 'var(--fdc-cream)',
                    fontSize: 13,
                    fontWeight: 500,
                  }}
                >
                  <span>{m.emoji}</span>
                  <span>{m.text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Main 2-col layout */}
        <div
          className="evento-grid"
          style={{
            display: 'grid',
            gridTemplateColumns: 'minmax(0, 1fr) 360px',
            gap: 32,
            alignItems: 'start',
          }}
        >
          {/* Left — about */}
          <div>
            <div style={{ marginBottom: 32 }}>
              <h2
                style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: 28,
                  fontWeight: 600,
                  letterSpacing: '-0.02em',
                  color: 'var(--fg-1)',
                  margin: '0 0 12px',
                }}
              >
                Sobre o evento
              </h2>
              <p style={{ color: 'var(--fg-2)', fontSize: 16, lineHeight: 1.6, margin: 0 }}>
                {event.description ??
                  'Reservamos uma tarde para reunir famílias, professores e crianças. O ingresso garante a entrada e ajuda a custear a estrutura — comidas, bebidas e atividades.'}
              </p>
              <p style={{ color: 'var(--fg-2)', fontSize: 16, lineHeight: 1.6, margin: '12px 0 0' }}>
                A entrada é feita pela apresentação do QR Code do ingresso digital, que você recebe
                por e-mail logo após o pagamento.
              </p>
            </div>

            {/* Inclusions */}
            <div
              style={{
                padding: 20,
                background: 'var(--bg-sunken)',
                borderRadius: 'var(--radius-lg)',
              }}
            >
              <div className="fdc-eyebrow" style={{ marginBottom: 14, color: 'var(--fg-2)' }}>
                O que está incluso
              </div>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: 10,
                }}
              >
                {[
                  'Acesso ao evento',
                  'Atividades para crianças',
                  'Comidas e bebidas à venda',
                  'Espaço com cobertura',
                ].map((inc) => (
                  <div
                    key={inc}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 10,
                      fontSize: 14,
                    }}
                  >
                    <span
                      style={{
                        width: 20,
                        height: 20,
                        borderRadius: '50%',
                        background: 'rgba(111,168,74,0.18)',
                        color: 'var(--fdc-leaf-deep)',
                        display: 'grid',
                        placeItems: 'center',
                        fontSize: 10,
                        fontWeight: 700,
                        flexShrink: 0,
                      }}
                    >
                      ✓
                    </span>
                    <span>{inc}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right — tickets sticky */}
          <div className="evento-tickets" style={{ position: 'sticky', top: 24 }}>
            <div
              className="fdc-card"
              style={{ padding: 24 }}
            >
              <h3
                style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: 20,
                  fontWeight: 600,
                  letterSpacing: '-0.02em',
                  color: 'var(--fg-1)',
                  margin: '0 0 4px',
                }}
              >
                Selecione seus ingressos
              </h3>
              <p style={{ color: 'var(--fg-2)', fontSize: 13, margin: '0 0 4px' }}>
                Disponível até{' '}
                <strong style={{ color: 'var(--fg-1)' }}>
                  {format(event.date, "dd/MM/yyyy", { locale: ptBR })}
                </strong>
              </p>

              <div style={{ marginTop: 8 }}>
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
                <div style={{ textAlign: 'center', padding: '24px 0', color: 'var(--fg-3)' }}>
                  <p style={{ fontSize: 15 }}>Nenhum ingresso disponível no momento.</p>
                </div>
              )}

              <div
                style={{
                  marginTop: 14,
                  display: 'flex',
                  justifyContent: 'center',
                  gap: 8,
                  alignItems: 'center',
                  fontSize: 12,
                  color: 'var(--fg-3)',
                }}
              >
                <span>🔒</span>
                <span>Pagamento seguro · PIX</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      <CartCheckoutBar />
    </div>
  )
}
