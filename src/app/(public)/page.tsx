import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

export const dynamic = 'force-dynamic'

export default async function HomePage() {
  const event = await prisma.event.findFirst({
    where: { isActive: true },
    include: {
      ticketTypes: { where: { isActive: true }, orderBy: { sortOrder: 'asc' } },
    },
  })

  const eventDateLabel = event
    ? format(event.date, "dd 'de' MMMM 'de' yyyy", { locale: ptBR })
    : '21 de junho de 2026'

  const eventTimeLabel = event
    ? format(event.date, "HH:mm", { locale: ptBR })
    : '14:00'

  const eventName = event?.name ?? 'Arraiá da Escola'
  const eventLocation = event?.location ?? 'Pátio da Escola'

  const lowestPrice = event?.ticketTypes.reduce(
    (min, t) => (t.price < min ? t.price : min),
    event?.ticketTypes[0]?.price ?? 0
  )

  const fmt = (n: number) =>
    'R$ ' + (n / 100).toFixed(2).replace('.', ',')

  const inclusions = [
    'Acesso ao evento',
    'Atividades para crianças',
    'Comidas e bebidas à venda',
    'Espaço com cobertura',
  ]

  return (
    <div style={{ background: 'var(--bg-page)', minHeight: '100vh' }}>
      {/* Hero banner */}
      <section
        style={{
          background: 'linear-gradient(135deg, var(--fdc-tangerine) 0%, var(--fdc-sun) 60%, var(--fdc-leaf-soft) 100%)',
          position: 'relative',
          overflow: 'hidden',
          minHeight: 420,
          display: 'flex',
          alignItems: 'center',
        }}
        className="fdc-grain"
      >
        {/* decorative shapes */}
        <div
          aria-hidden
          style={{
            position: 'absolute',
            top: -80,
            right: -80,
            width: 400,
            height: 400,
            borderRadius: '50%',
            background: 'rgba(255,255,255,0.08)',
          }}
        />
        <div
          aria-hidden
          style={{
            position: 'absolute',
            bottom: -120,
            left: -60,
            width: 320,
            height: 320,
            borderRadius: '50%',
            background: 'rgba(56,48,48,0.06)',
          }}
        />

        <div
          style={{
            maxWidth: 'var(--container-max)',
            margin: '0 auto',
            padding: '56px var(--container-pad)',
            width: '100%',
            position: 'relative',
            zIndex: 1,
          }}
        >
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              padding: '5px 12px',
              borderRadius: 'var(--radius-pill)',
              background: 'rgba(255,255,255,0.25)',
              color: 'var(--fdc-cream)',
              fontSize: 12,
              fontWeight: 600,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              marginBottom: 16,
            }}
          >
            Evento presencial
          </div>

          <h1
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'clamp(40px, 6vw, 80px)',
              fontWeight: 700,
              lineHeight: 1.0,
              letterSpacing: '-0.03em',
              color: 'var(--fdc-cream)',
              margin: '0 0 16px',
              maxWidth: 720,
            }}
          >
            {eventName}
          </h1>

          <p
            style={{
              fontSize: 18,
              color: 'rgba(253,250,245,0.88)',
              maxWidth: 560,
              margin: '0 0 32px',
              lineHeight: 1.5,
            }}
          >
            {event?.description ?? 'Uma tarde para reunir as famílias da escola em um encontro simples e acolhedor.'}
          </p>

          {/* Meta chips */}
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: 10,
              marginBottom: 36,
            }}
          >
            {[
              { emoji: '📅', text: `${eventDateLabel} · ${eventTimeLabel}` },
              { emoji: '📍', text: eventLocation },
            ].map((m) => (
              <div
                key={m.text}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '8px 16px',
                  borderRadius: 'var(--radius-pill)',
                  background: 'rgba(255,255,255,0.2)',
                  backdropFilter: 'blur(4px)',
                  color: 'var(--fdc-cream)',
                  fontSize: 14,
                  fontWeight: 500,
                }}
              >
                <span>{m.emoji}</span>
                <span>{m.text}</span>
              </div>
            ))}
          </div>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, alignItems: 'center' }}>
            <Link
              href="/evento"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                padding: '14px 28px',
                borderRadius: 'var(--radius-lg)',
                background: 'var(--fdc-cream)',
                color: 'var(--fdc-tangerine)',
                fontWeight: 700,
                fontSize: 16,
                textDecoration: 'none',
                boxShadow: 'var(--shadow-md)',
                transition: 'all var(--dur-fast)',
              }}
            >
              Comprar ingressos
              <span style={{ fontSize: 18 }}>→</span>
            </Link>
            {lowestPrice != null && (
              <span
                style={{
                  fontSize: 14,
                  color: 'rgba(253,250,245,0.8)',
                  fontWeight: 500,
                }}
              >
                A partir de {fmt(lowestPrice)}
              </span>
            )}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section
        style={{
          maxWidth: 'var(--container-max)',
          margin: '0 auto',
          padding: '72px var(--container-pad)',
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: 48 }}>
          <div className="fdc-eyebrow" style={{ marginBottom: 8 }}>Como funciona</div>
          <h2
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'clamp(32px, 4vw, 56px)',
              fontWeight: 700,
              letterSpacing: '-0.03em',
              lineHeight: 1.0,
              color: 'var(--fg-1)',
              margin: 0,
            }}
          >
            Simples e rápido
          </h2>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
            gap: 20,
          }}
        >
          {[
            {
              n: '01',
              title: 'Escolha seu ingresso',
              desc: 'Selecione entre as opções disponíveis: Inteira, Meia-Entrada ou Criança.',
              accent: 'var(--fdc-tangerine-soft)',
            },
            {
              n: '02',
              title: 'Pague com PIX',
              desc: 'Pagamento rápido e seguro via PIX. Confirmação instantânea, sem taxas.',
              accent: 'var(--fdc-sun-soft)',
            },
            {
              n: '03',
              title: 'Receba por e-mail',
              desc: 'Seus ingressos chegam por e-mail com QR Code para entrada no evento.',
              accent: 'var(--fdc-leaf-soft)',
            },
          ].map((step) => (
            <div
              key={step.n}
              className="fdc-card"
              style={{ padding: 28, position: 'relative', overflow: 'hidden' }}
            >
              <div
                style={{
                  width: 56,
                  height: 56,
                  borderRadius: 'var(--radius-lg)',
                  background: step.accent,
                  display: 'grid',
                  placeItems: 'center',
                  fontSize: 22,
                  fontWeight: 700,
                  color: 'var(--fdc-ink)',
                  marginBottom: 18,
                }}
              >
                {step.n}
              </div>
              <h3
                style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: 20,
                  fontWeight: 600,
                  letterSpacing: '-0.02em',
                  color: 'var(--fg-1)',
                  margin: '0 0 8px',
                }}
              >
                {step.title}
              </h3>
              <p style={{ color: 'var(--fg-2)', fontSize: 15, margin: 0, lineHeight: 1.55 }}>
                {step.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Inclusions */}
      <section
        style={{
          background: 'var(--bg-sunken)',
          padding: '72px var(--container-pad)',
        }}
        className="fdc-grain"
      >
        <div
          style={{
            maxWidth: 'var(--container-max)',
            margin: '0 auto',
          }}
        >
          <div style={{ marginBottom: 40 }}>
            <div className="fdc-eyebrow" style={{ marginBottom: 8 }}>O que está incluso</div>
            <h2
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: 'clamp(28px, 3.5vw, 48px)',
                fontWeight: 700,
                letterSpacing: '-0.03em',
                lineHeight: 1.05,
                color: 'var(--fg-1)',
                margin: 0,
              }}
            >
              Tudo que você precisa
            </h2>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
              gap: 14,
            }}
          >
            {inclusions.map((inc) => (
              <div
                key={inc}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  padding: '16px 20px',
                  background: 'var(--bg-surface)',
                  borderRadius: 'var(--radius-lg)',
                  border: '1px solid var(--line-2)',
                  fontSize: 15,
                  fontWeight: 500,
                  color: 'var(--fg-1)',
                }}
              >
                <span
                  style={{
                    width: 24,
                    height: 24,
                    borderRadius: '50%',
                    background: 'rgba(111,168,74,0.18)',
                    color: 'var(--fdc-leaf-deep)',
                    display: 'grid',
                    placeItems: 'center',
                    fontSize: 12,
                    fontWeight: 700,
                    flexShrink: 0,
                  }}
                >
                  ✓
                </span>
                {inc}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section
        style={{
          maxWidth: 'var(--container-max)',
          margin: '0 auto',
          padding: '80px var(--container-pad)',
          textAlign: 'center',
        }}
      >
        <div className="fdc-eyebrow" style={{ marginBottom: 12 }}>Garanta o seu lugar</div>
        <h2
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'clamp(32px, 4vw, 64px)',
            fontWeight: 700,
            letterSpacing: '-0.03em',
            lineHeight: 1.0,
            color: 'var(--fg-1)',
            margin: '0 0 16px',
          }}
        >
          Vagas limitadas
        </h2>
        <p
          style={{
            fontSize: 18,
            color: 'var(--fg-2)',
            maxWidth: 480,
            margin: '0 auto 36px',
            lineHeight: 1.5,
          }}
        >
          Não fique de fora dessa festa! Garanta o seu ingresso agora.
        </p>

        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: 12,
            justifyContent: 'center',
          }}
        >
          <Link
            href="/evento"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              padding: '14px 32px',
              borderRadius: 'var(--radius-lg)',
              background: 'var(--fdc-tangerine)',
              color: 'var(--fdc-cream)',
              fontWeight: 700,
              fontSize: 16,
              textDecoration: 'none',
              boxShadow: 'var(--shadow-md)',
            }}
          >
            Ver ingressos →
          </Link>
          <Link
            href="/meus-ingressos"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              padding: '14px 28px',
              borderRadius: 'var(--radius-lg)',
              background: 'transparent',
              border: '1.5px solid var(--line-1)',
              color: 'var(--fg-1)',
              fontWeight: 600,
              fontSize: 15,
              textDecoration: 'none',
            }}
          >
            Já tenho ingresso
          </Link>
        </div>
      </section>
    </div>
  )
}
