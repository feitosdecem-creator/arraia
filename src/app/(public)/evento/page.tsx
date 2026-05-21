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
          </div>
        </div>

        {/* ── Event details strip ── */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: 1,
            background: 'var(--line-2)',
            borderRadius: 'var(--radius-lg)',
            overflow: 'hidden',
            marginBottom: 32,
            border: '1px solid var(--line-2)',
          }}
          className="evento-details-strip"
        >
          {[
            {
              icon: (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="4" width="18" height="18" rx="2" />
                  <line x1="16" y1="2" x2="16" y2="6" />
                  <line x1="8" y1="2" x2="8" y2="6" />
                  <line x1="3" y1="10" x2="21" y2="10" />
                </svg>
              ),
              label: 'Data',
              value: eventDate.charAt(0).toUpperCase() + eventDate.slice(1),
            },
            {
              icon: (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" />
                  <polyline points="12 6 12 12 16 14" />
                </svg>
              ),
              label: 'Horário',
              value: eventTime,
            },
            {
              icon: (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 0118 0z" />
                  <circle cx="12" cy="10" r="3" />
                </svg>
              ),
              label: 'Local',
              value: event.location,
            },
            {
              icon: (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
                  <circle cx="9" cy="7" r="4" />
                  <path d="M23 21v-2a4 4 0 00-3-3.87" />
                  <path d="M16 3.13a4 4 0 010 7.75" />
                </svg>
              ),
              label: 'Organizado por',
              value: 'Quintal Escola Feitos de Cem',
            },
          ].map((item) => (
            <div
              key={item.label}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 14,
                padding: '18px 22px',
                background: 'var(--bg-surface)',
              }}
            >
              <div
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 10,
                  background: 'rgba(232,98,42,0.08)',
                  border: '1px solid rgba(232,98,42,0.14)',
                  display: 'grid',
                  placeItems: 'center',
                  color: 'var(--fdc-tangerine)',
                  flexShrink: 0,
                }}
              >
                {item.icon}
              </div>
              <div>
                <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'var(--fg-3)', marginBottom: 3 }}>
                  {item.label}
                </div>
                <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--fg-1)', lineHeight: 1.3 }}>
                  {item.value}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* ── Pricing section ── */}
        <section style={{ marginBottom: 44 }}>

          {/* Section header */}
          <div className="pricing-header">
            <div>
              <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: 7, padding: '4px 11px', borderRadius: 999, background: 'rgba(194,120,10,0.08)', border: '1px solid rgba(194,120,10,0.16)' }}>
                  <span style={{ width: 5, height: 5, borderRadius: '50%', background: '#c2780a', display: 'inline-block', flexShrink: 0 }} />
                  <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase' as const, color: '#a16207' }}>1º Lote</span>
                </div>
                <div style={{ display: 'inline-flex', alignItems: 'center', padding: '4px 11px', borderRadius: 999, background: 'rgba(194,120,10,0.07)', border: '1px solid rgba(194,120,10,0.15)' }}>
                  <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase' as const, color: '#92400e' }}>Preço promocional</span>
                </div>
              </div>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(22px, 3vw, 30px)', fontWeight: 700, letterSpacing: '-0.025em', color: 'var(--fg-1)', margin: 0, lineHeight: 1.1 }}>
                Ingressos disponíveis
              </h2>
            </div>
          </div>

          {/* Student notice */}
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, padding: '14px 18px', background: 'rgba(74,138,56,0.05)', borderRadius: 14, border: '1px solid rgba(74,138,56,0.13)' }}>
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none" style={{ flexShrink: 0, marginTop: 1 }}>
              <circle cx="9" cy="9" r="9" fill="rgba(74,138,56,0.14)" />
              <path d="M5.5 9l2.5 2.5 5-5" stroke="#3a7527" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <p style={{ margin: 0, fontSize: 13, color: '#2d5a1a', lineHeight: 1.6 }}>
              Crianças do <strong>Quintal</strong> não precisam comprar ingresso — adultos acompanhantes sim.
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
                O maior arraiá da cidade está de volta! Venha curtir com a gente uma festa incrível,
                com quadrilha, comidas típicas e muito mais!
              </p>
              <p style={{ color: 'var(--fg-2)', fontSize: 16, lineHeight: 1.6, margin: '12px 0 0' }}>
                Será uma noite inesquecível para toda a sua família.
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
                O que teremos na festa
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
                  'Barraquinhas com Comidas Típicas',
                  'Quadrilha',
                  'Apresentações',
                  'Sorteios',
                  'Área Kids',
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

            {/* Map */}
            <div style={{ marginTop: 32 }}>
              <h2
                style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: 22,
                  fontWeight: 600,
                  letterSpacing: '-0.02em',
                  color: 'var(--fg-1)',
                  margin: '0 0 12px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                }}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--fdc-tangerine)', flexShrink: 0 }}>
                  <path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 0118 0z" />
                  <circle cx="12" cy="10" r="3" />
                </svg>
                Local
              </h2>
              <div
                style={{
                  borderRadius: 'var(--radius-lg)',
                  overflow: 'hidden',
                  border: '1px solid var(--line-2)',
                }}
              >
                <iframe
                  src="https://www.openstreetmap.org/export/embed.html?bbox=-42.56472%2C-19.46740%2C-42.55872%2C-19.46140&layer=mapnik&marker=-19.46440%2C-42.56172"
                  width="100%"
                  height="260"
                  style={{ border: 0, display: 'block' }}
                  loading="lazy"
                  title="Quintal Escola Feitos de Cem"
                />
              </div>
              <a
                href="https://www.google.com/maps?q=-19.464401340826086,-42.56171931793569"
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  marginTop: 10,
                  fontSize: 13,
                  color: 'var(--fdc-tangerine)',
                  textDecoration: 'none',
                  fontWeight: 500,
                }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6" />
                  <polyline points="15 3 21 3 21 9" />
                  <line x1="10" y1="14" x2="21" y2="3" />
                </svg>
                Abrir no Google Maps
              </a>
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
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="11" width="18" height="11" rx="2" />
                  <path d="M7 11V7a5 5 0 0110 0v4" />
                </svg>
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
