import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import { generateQrCode } from '@/lib/qrcode'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import Image from 'next/image'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

type Props = { params: Promise<{ ticketId: string }> }

function Field({
  label,
  value,
  mono,
}: {
  label: string
  value: string
  mono?: boolean
}) {
  return (
    <div>
      <div
        style={{
          fontSize: 11,
          fontWeight: 500,
          textTransform: 'uppercase' as const,
          letterSpacing: '0.08em',
          color: 'var(--fg-3)',
          marginBottom: 2,
        }}
      >
        {label}
      </div>
      <div
        style={{
          fontWeight: 600,
          fontSize: 14,
          fontFamily: mono ? 'var(--font-mono)' : 'inherit',
          color: 'var(--fg-1)',
          lineHeight: 1.3,
        }}
      >
        {value}
      </div>
    </div>
  )
}

export default async function TicketPage({ params }: Props) {
  const { ticketId } = await params

  const ticket = await prisma.ticket.findUnique({
    where: { id: ticketId },
    include: {
      ticketType: {
        include: { event: true },
      },
      order: {
        include: { user: true },
      },
    },
  })

  if (!ticket) return notFound()

  const qrCode = await generateQrCode(ticket.code)
  const eventDate = format(
    ticket.ticketType.event.date,
    "EEEE, dd 'de' MMMM 'de' yyyy",
    { locale: ptBR }
  )
  const eventTime = format(ticket.ticketType.event.date, 'HH:mm', { locale: ptBR })
  const isUsed = !!ticket.usedAt

  return (
    <div style={{ background: 'var(--bg-page)', minHeight: '100vh' }}>
      <div
        style={{
          maxWidth: 560,
          margin: '0 auto',
          padding: '24px 20px 80px',
        }}
      >
        <Link
          href="/meus-ingressos"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            color: 'var(--fdc-tangerine)',
            textDecoration: 'none',
            fontSize: 14,
            fontWeight: 500,
            marginBottom: 20,
          }}
        >
          ← Meus ingressos
        </Link>

        {/* Success / Used badge */}
        <div style={{ textAlign: 'center', padding: '16px 0 24px' }}>
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: '50%',
              background: isUsed ? 'var(--fdc-sand)' : 'rgba(111,168,74,0.18)',
              color: isUsed ? 'var(--fg-3)' : 'var(--fdc-leaf-deep)',
              display: 'grid',
              placeItems: 'center',
              fontSize: 22,
              margin: '0 auto 12px',
            }}
          >
            {isUsed ? '✕' : '✓'}
          </div>
          <h1
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: 26,
              fontWeight: 700,
              letterSpacing: '-0.02em',
              color: 'var(--fg-1)',
              margin: '0 0 4px',
            }}
          >
            {isUsed ? 'Ingresso utilizado' : 'Ingresso válido'}
          </h1>
          {isUsed && ticket.usedAt && (
            <p style={{ color: 'var(--fg-2)', fontSize: 14 }}>
              Utilizado em {format(ticket.usedAt, "dd/MM/yyyy 'às' HH:mm")}
            </p>
          )}
        </div>

        {/* Ticket stub */}
        <div
          style={{
            background: 'var(--bg-surface)',
            borderRadius: 20,
            boxShadow: 'var(--shadow-lg)',
            overflow: 'hidden',
          }}
        >
          {/* Banner */}
          <div
            style={{
              height: 100,
              background: isUsed
                ? 'linear-gradient(135deg, var(--fdc-stone-2), var(--fdc-stone-1))'
                : 'linear-gradient(135deg, var(--fdc-tangerine) 0%, var(--fdc-sun) 70%, var(--fdc-leaf-soft) 100%)',
              position: 'relative',
            }}
          >
            <div
              style={{
                position: 'absolute',
                inset: 0,
                background: 'linear-gradient(180deg, rgba(56,48,48,0) 30%, rgba(56,48,48,0.5) 100%)',
              }}
            />
            <div
              style={{
                position: 'absolute',
                left: 20,
                bottom: 14,
                color: 'var(--fdc-cream)',
              }}
            >
              <div
                style={{
                  fontSize: 10,
                  fontWeight: 600,
                  textTransform: 'uppercase' as const,
                  letterSpacing: '0.12em',
                  opacity: 0.9,
                }}
              >
                Ingresso digital
              </div>
              <div style={{ fontSize: 18, fontWeight: 700, marginTop: 2, letterSpacing: '-0.01em' }}>
                {ticket.ticketType.event.name}
              </div>
            </div>
          </div>

          {/* Perforation */}
          <div style={{ position: 'relative', height: 0 }}>
            <div
              style={{
                position: 'absolute',
                left: -10,
                top: -10,
                width: 20,
                height: 20,
                borderRadius: '50%',
                background: 'var(--bg-page)',
              }}
            />
            <div
              style={{
                position: 'absolute',
                right: -10,
                top: -10,
                width: 20,
                height: 20,
                borderRadius: '50%',
                background: 'var(--bg-page)',
              }}
            />
            <div
              style={{
                position: 'absolute',
                left: 12,
                right: 12,
                top: -1,
                borderTop: '1.5px dashed var(--line-2)',
              }}
            />
          </div>

          {/* Body */}
          <div style={{ padding: 24 }}>
            <div style={{ marginBottom: 16 }}>
              <div
                style={{
                  fontSize: 11,
                  fontWeight: 500,
                  textTransform: 'uppercase' as const,
                  letterSpacing: '0.08em',
                  color: 'var(--fg-3)',
                  marginBottom: 2,
                }}
              >
                Participante
              </div>
              <div style={{ fontWeight: 700, fontSize: 18, color: 'var(--fg-1)' }}>
                {ticket.order.user.name}
              </div>
            </div>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: 16,
                marginBottom: 16,
              }}
            >
              <Field label="Data" value={eventDate} />
              <Field label="Horário" value={eventTime} />
              <Field label="Local" value={ticket.ticketType.event.location} />
              <Field label="Tipo" value={ticket.ticketType.name} />
            </div>

            <Field label="Código do ingresso" value={ticket.code} mono />
          </div>
        </div>

        {/* Big QR for entrance */}
        <div
          className="fdc-card"
          style={{
            marginTop: 16,
            padding: 24,
            textAlign: 'center',
            opacity: isUsed ? 0.4 : 1,
          }}
        >
          <div
            style={{
              fontSize: 11,
              textTransform: 'uppercase' as const,
              letterSpacing: '0.12em',
              color: 'var(--fg-3)',
              fontWeight: 600,
              marginBottom: 16,
            }}
          >
            Apresente na entrada
          </div>
          <div
            style={{
              display: 'inline-block',
              padding: 12,
              background: 'white',
              borderRadius: 12,
              border: `2px solid ${isUsed ? 'var(--fdc-stone-2)' : 'var(--fdc-sand)'}`,
            }}
          >
            <Image src={qrCode} alt="QR Code" width={180} height={180} />
          </div>
          <div
            style={{
              marginTop: 12,
              fontFamily: 'var(--font-mono)',
              fontSize: 14,
              fontWeight: 600,
              color: 'var(--fg-1)',
              letterSpacing: '0.06em',
            }}
          >
            {ticket.code}
          </div>
        </div>

        {/* Details */}
        <div
          style={{
            marginTop: 16,
            padding: '16px 20px',
            background: 'var(--bg-sunken)',
            borderRadius: 'var(--radius-lg)',
            display: 'flex',
            flexDirection: 'column' as const,
            gap: 10,
          }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              fontSize: 13,
              color: 'var(--fg-2)',
            }}
          >
            <span>E-mail</span>
            <span style={{ color: 'var(--fg-1)', fontWeight: 500 }}>{ticket.order.user.email}</span>
          </div>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              fontSize: 13,
              color: 'var(--fg-2)',
            }}
          >
            <span>Valor pago</span>
            <span style={{ color: 'var(--fg-1)', fontWeight: 500 }}>
              {'R$ ' + (ticket.ticketType.price / 100).toFixed(2).replace('.', ',')}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
