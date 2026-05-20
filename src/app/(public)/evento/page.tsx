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
            backgroundImage: 'url(/Banner.png)',
            backgroundSize: 'cover',
            backgroundPosition: 'center top',
            backgroundColor: 'var(--fdc-tangerine)',
            minHeight: 280,
            display: 'flex',
            alignItems: 'flex-end',
            padding: '40px 40px 36px',
            position: 'relative',
          }}
          className="evento-hero"
        >
          {/* Dark gradient overlay so text stays legible */}
          <div
            aria-hidden
            style={{
              position: 'absolute',
              inset: 0,
              background: 'linear-gradient(to top, rgba(20,12,4,0.72) 0%, rgba(20,12,4,0.18) 55%, rgba(20,12,4,0.05) 100%)',
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

        {/* ── Pricing section ── */}
        <section style={{ marginBottom: 44 }}>

          {/* Section header */}
          <div className="pricing-header">
            <div>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 7, marginBottom: 12, padding: '4px 11px', borderRadius: 999, background: 'rgba(194,120,10,0.08)', border: '1px solid rgba(194,120,10,0.16)' }}>
                <span style={{ width: 5, height: 5, borderRadius: '50%', background: '#c2780a', display: 'inline-block', flexShrink: 0 }} />
                <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase' as const, color: '#a16207' }}>1º Lote</span>
              </div>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(22px, 3vw, 30px)', fontWeight: 700, letterSpacing: '-0.025em', color: 'var(--fg-1)', margin: 0, lineHeight: 1.1 }}>
                Ingressos disponíveis
              </h2>
              <p style={{ fontSize: 14, color: 'var(--fg-3)', margin: '8px 0 0', lineHeight: 1.5 }}>
                Garanta sua vaga — sexta, 19 de junho · 18h30
              </p>
            </div>
            <div style={{ display: 'inline-flex', alignItems: 'center', padding: '6px 14px', borderRadius: 999, background: 'rgba(194,120,10,0.07)', border: '1px solid rgba(194,120,10,0.15)', flexShrink: 0 }}>
              <span style={{ fontSize: 13, fontWeight: 600, color: '#92400e', letterSpacing: '-0.01em' }}>Preço promocional</span>
            </div>
          </div>

          {/* Price cards */}
          <div className="pricing-cards-grid">

            {/* Inteira */}
            <a href="#ingressos" className="pricing-card pricing-card-primary">
              <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--fg-3)', letterSpacing: '-0.01em' }}>Inteira</span>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, margin: '14px 0 6px' }}>
                <span style={{ fontSize: 15, fontWeight: 600, color: 'var(--fg-3)', lineHeight: 1, paddingBottom: 6 }}>R$</span>
                <span style={{ fontFamily: 'var(--font-display)', fontSize: 54, fontWeight: 800, letterSpacing: '-0.04em', color: 'var(--fg-1)', lineHeight: 1 }}>18</span>
              </div>
              <p style={{ fontSize: 13, color: 'var(--fg-3)', margin: '0 0 auto', lineHeight: 1.55, paddingBottom: 20 }}>
                Acesso completo ao evento
              </p>
              <div className="pricing-btn pricing-btn-primary">Selecionar →</div>
            </a>

            {/* Meia-entrada */}
            <a href="#ingressos" className="pricing-card">
              <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--fg-3)', letterSpacing: '-0.01em' }}>Meia-entrada</span>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, margin: '14px 0 6px' }}>
                <span style={{ fontSize: 15, fontWeight: 600, color: 'var(--fg-3)', lineHeight: 1, paddingBottom: 6 }}>R$</span>
                <span style={{ fontFamily: 'var(--font-display)', fontSize: 54, fontWeight: 800, letterSpacing: '-0.04em', color: 'var(--fg-1)', lineHeight: 1 }}>10</span>
              </div>
              <p style={{ fontSize: 13, color: 'var(--fg-3)', margin: '0 0 auto', lineHeight: 1.55, paddingBottom: 20 }}>
                Válido mediante comprovação
              </p>
              <div className="pricing-btn pricing-btn-ghost">Selecionar →</div>
            </a>
          </div>

          {/* Student notice */}
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, padding: '14px 18px', background: 'rgba(74,138,56,0.05)', borderRadius: 14, border: '1px solid rgba(74,138,56,0.13)' }}>
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none" style={{ flexShrink: 0, marginTop: 1 }}>
              <circle cx="9" cy="9" r="9" fill="rgba(74,138,56,0.14)" />
              <path d="M5.5 9l2.5 2.5 5-5" stroke="#3a7527" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <p style={{ margin: 0, fontSize: 13, color: '#2d5a1a', lineHeight: 1.6 }}>
              Alunos da <strong>Quintal Escola Feitos de Cem</strong> têm entrada gratuita — não é necessário adquirir ingresso.
            </p>
          </div>
        </section>

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
                className="evento-inclusions-grid"
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
          <div id="ingressos" className="evento-tickets" style={{ position: 'sticky', top: 24 }}>
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
