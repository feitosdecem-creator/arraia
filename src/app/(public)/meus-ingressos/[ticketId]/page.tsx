import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import { generateQrCode } from '@/lib/qrcode'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import Image from 'next/image'
import Link from 'next/link'
import { TicketActions } from '@/components/TicketActions'

export const dynamic = 'force-dynamic'

type Props = { params: Promise<{ ticketId: string }> }

export default async function TicketPage({ params }: Props) {
  const { ticketId } = await params

  const ticket = await prisma.ticket.findUnique({
    where: { id: ticketId },
    include: {
      ticketType: {
        include: { event: true },
      },
      order: {
        include: {
          user: true,
          tickets: {
            include: { ticketType: true },
            orderBy: { createdAt: 'asc' },
          },
        },
      },
    },
  })

  if (!ticket) return notFound()

  const qrCode = await generateQrCode(ticket.code)
  const { event } = ticket.ticketType
  const { order } = ticket

  const eventDateFull = format(event.date, "EEEE, dd 'de' MMMM 'de' yyyy", { locale: ptBR })
  const eventDateShort = format(event.date, "dd/MM/yyyy", { locale: ptBR })
  const eventTime = format(event.date, 'HH:mm', { locale: ptBR })
  const purchaseDate = order.paidAt
    ? format(order.paidAt, "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })
    : format(order.createdAt, "dd/MM/yyyy", { locale: ptBR })
  const totalFormatted = 'R$ ' + (order.totalAmount / 100).toFixed(2).replace('.', ',')

  const isUsed = !!ticket.usedAt
  const otherTickets = order.tickets.filter((t) => t.id !== ticketId)
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://arraia.feitosdecem.com.br'

  // Capitalize event date
  const eventDateDisplay = eventDateFull.charAt(0).toUpperCase() + eventDateFull.slice(1)

  return (
    <div style={{ background: 'var(--bg-page)', minHeight: '100vh' }}>
      <div style={{ maxWidth: 540, margin: '0 auto', padding: '24px 16px 80px' }}>

        {/* Back link */}
        <Link
          href="/meus-ingressos"
          style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: 'var(--fg-3)', textDecoration: 'none', fontSize: 14, fontWeight: 500, marginBottom: 24, letterSpacing: '-0.01em' }}
        >
          ← Meus ingressos
        </Link>

        {/* Success header */}
        <div className="ticket-appear" style={{ textAlign: 'center', marginBottom: 28 }}>
          <div style={{ fontSize: 48, marginBottom: 10, lineHeight: 1 }}>
            {isUsed ? '🎟️' : '🎉'}
          </div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 800, letterSpacing: '-0.03em', color: 'var(--fg-1)', margin: '0 0 6px' }}>
            {isUsed ? 'Ingresso utilizado' : 'Seu ingresso está pronto!'}
          </h1>
          <p style={{ fontSize: 15, color: 'var(--fg-2)', margin: 0 }}>
            {isUsed
              ? `Utilizado em ${format(ticket.usedAt!, "dd/MM/yyyy 'às' HH:mm")}`
              : `Apresente o QR Code na entrada do evento`}
          </p>
        </div>

        {/* ── BOARDING PASS TICKET ── */}
        <div
          className="ticket-appear ticket-appear-delay-1"
          style={{
            background: 'var(--bg-surface)',
            borderRadius: 24,
            boxShadow: isUsed
              ? 'var(--shadow-md)'
              : '0 8px 40px rgba(236,82,18,0.18), var(--shadow-lg)',
            overflow: 'hidden',
            opacity: isUsed ? 0.7 : 1,
          }}
        >
          {/* Gradient Header */}
          <div
            style={{
              padding: '28px 24px 24px',
              background: isUsed
                ? 'linear-gradient(135deg, #9ca3af 0%, #6b7280 100%)'
                : 'linear-gradient(135deg, var(--fdc-tangerine) 0%, #f97316 40%, var(--fdc-sun) 80%, #fbbf24 100%)',
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            {/* Decorative circles */}
            <div style={{ position: 'absolute', top: -30, right: -30, width: 120, height: 120, borderRadius: '50%', background: 'rgba(255,255,255,0.07)', pointerEvents: 'none' }} />
            <div style={{ position: 'absolute', bottom: -20, right: 60, width: 80, height: 80, borderRadius: '50%', background: 'rgba(255,255,255,0.06)', pointerEvents: 'none' }} />
            <div style={{ position: 'absolute', top: 10, right: 100, width: 40, height: 40, borderRadius: '50%', background: 'rgba(255,255,255,0.09)', pointerEvents: 'none' }} />

            {/* Badge */}
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '4px 10px', borderRadius: 999, background: 'rgba(255,255,255,0.2)', marginBottom: 14 }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'white', display: 'inline-block' }} />
              <span style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.95)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                Ingresso Digital
              </span>
            </div>

            {/* Event name */}
            <div style={{ color: 'white' }}>
              <div style={{ fontSize: 22, fontWeight: 800, letterSpacing: '-0.02em', lineHeight: 1.2, marginBottom: 4, textShadow: '0 1px 4px rgba(0,0,0,0.18)' }}>
                {event.name}
              </div>
              <div style={{ fontSize: 14, fontWeight: 600, opacity: 0.9 }}>
                {ticket.ticketType.name}
              </div>
            </div>
          </div>

          {/* Perforation */}
          <div style={{ position: 'relative', height: 0 }}>
            <div style={{ position: 'absolute', left: -12, top: -12, width: 24, height: 24, borderRadius: '50%', background: 'var(--bg-page)' }} />
            <div style={{ position: 'absolute', right: -12, top: -12, width: 24, height: 24, borderRadius: '50%', background: 'var(--bg-page)' }} />
            <div style={{ position: 'absolute', left: 18, right: 18, top: -1, borderTop: '1.5px dashed var(--line-2)' }} />
          </div>

          {/* Ticket Body */}
          <div style={{ padding: '24px 24px 20px' }}>
            {/* Participant */}
            <div style={{ marginBottom: 20 }}>
              <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--fg-3)', marginBottom: 3 }}>
                Participante
              </div>
              <div style={{ fontSize: 22, fontWeight: 800, letterSpacing: '-0.02em', color: 'var(--fg-1)', lineHeight: 1.2 }}>
                {order.user.name}
              </div>
            </div>

            {/* Info grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px 20px', marginBottom: 20 }}>
              <InfoField label="Data" value={eventDateDisplay} />
              <InfoField label="Horário" value={eventTime} />
              <InfoField label="Local" value={event.location} />
              <InfoField label="Tipo" value={ticket.ticketType.name} />
            </div>

            {/* Code */}
            <div style={{ background: 'var(--bg-sunken)', borderRadius: 10, padding: '10px 14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
              <div>
                <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--fg-3)', marginBottom: 2 }}>
                  Código
                </div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 15, fontWeight: 700, color: 'var(--fg-1)', letterSpacing: '0.06em' }}>
                  {ticket.code}
                </div>
              </div>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: isUsed ? 'var(--fg-3)' : 'var(--fdc-leaf)', boxShadow: isUsed ? 'none' : '0 0 0 4px rgba(111,168,74,0.2)', flexShrink: 0 }} />
            </div>
          </div>

          {/* QR Perforation */}
          <div style={{ position: 'relative', height: 0 }}>
            <div style={{ position: 'absolute', left: -12, top: -12, width: 24, height: 24, borderRadius: '50%', background: 'var(--bg-page)' }} />
            <div style={{ position: 'absolute', right: -12, top: -12, width: 24, height: 24, borderRadius: '50%', background: 'var(--bg-page)' }} />
            <div style={{ position: 'absolute', left: 18, right: 18, top: -1, borderTop: '1.5px dashed var(--line-2)' }} />
          </div>

          {/* QR Section */}
          <div style={{ padding: '24px 24px 28px', textAlign: 'center', background: 'var(--bg-sunken)' }}>
            <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--fg-3)', marginBottom: 16 }}>
              Apresente na entrada
            </div>
            <div
              className={isUsed ? '' : 'qr-glow'}
              style={{
                display: 'inline-block',
                padding: 14,
                background: 'white',
                borderRadius: 16,
                border: `2px solid ${isUsed ? 'var(--line-2)' : 'var(--fdc-sand)'}`,
                boxShadow: isUsed ? 'none' : '0 4px 24px rgba(236,82,18,0.14)',
              }}
            >
              <Image src={qrCode} alt="QR Code" width={200} height={200} />
            </div>
            <div style={{ marginTop: 14, fontFamily: 'var(--font-mono)', fontSize: 15, fontWeight: 700, color: 'var(--fg-1)', letterSpacing: '0.08em' }}>
              {ticket.code}
            </div>
            {isUsed && ticket.usedAt && (
              <div style={{ marginTop: 8, fontSize: 12, color: 'var(--fg-3)', fontWeight: 500 }}>
                Utilizado em {format(ticket.usedAt, "dd/MM/yyyy 'às' HH:mm")}
              </div>
            )}
          </div>
        </div>

        {/* Action buttons */}
        <div className="ticket-appear ticket-appear-delay-2">
          <TicketActions
            orderId={order.id}
            ticketId={ticketId}
            eventName={event.name}
            appUrl={appUrl}
          />
        </div>

        {/* Other tickets from same order */}
        {otherTickets.length > 0 && (
          <div className="ticket-appear ticket-appear-delay-3" style={{ marginTop: 32 }}>
            <h2 style={{ fontSize: 13, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--fg-3)', margin: '0 0 12px' }}>
              Outros ingressos deste pedido
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {otherTickets.map((t) => (
                <Link
                  key={t.id}
                  href={`/meus-ingressos/${t.id}`}
                  style={{ textDecoration: 'none' }}
                >
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '14px 16px',
                    background: 'var(--bg-surface)',
                    borderRadius: 14,
                    border: '1.5px solid var(--line-2)',
                    transition: 'border-color 140ms',
                    gap: 12,
                  }}>
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--fg-1)', marginBottom: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {t.ticketType.name}
                      </div>
                      <div style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--fg-3)', letterSpacing: '0.04em' }}>
                        {t.code}
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
                      {t.usedAt && (
                        <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--fg-3)', background: 'var(--bg-sunken)', padding: '3px 8px', borderRadius: 999 }}>
                          Utilizado
                        </span>
                      )}
                      <span style={{ color: 'var(--fg-3)', fontSize: 16, lineHeight: 1 }}>›</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Order summary */}
        <div className="ticket-appear ticket-appear-delay-3" style={{ marginTop: 28 }}>
          <h2 style={{ fontSize: 13, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--fg-3)', margin: '0 0 12px' }}>
            Resumo do pedido
          </h2>
          <div style={{ background: 'var(--bg-surface)', borderRadius: 16, border: '1.5px solid var(--line-2)', overflow: 'hidden' }}>
            <OrderRow label="Pedido" value={`#${order.id.slice(-8).toUpperCase()}`} />
            <OrderRow label="Data de compra" value={purchaseDate} />
            <OrderRow label="Forma de pagamento" value="PIX" />
            <OrderRow label="Ingressos" value={`${order.tickets.length}x ${ticket.ticketType.name}`} />
            <div style={{ borderTop: '1.5px solid var(--line-2)', padding: '14px 18px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--fg-1)' }}>Total pago</span>
              <span style={{ fontSize: 18, fontWeight: 800, color: 'var(--fdc-tangerine-deep)', letterSpacing: '-0.01em' }}>{totalFormatted}</span>
            </div>
          </div>
        </div>

        {/* Footer note */}
        <p style={{ textAlign: 'center', fontSize: 12, color: 'var(--fg-3)', marginTop: 32 }}>
          Dúvidas? Fale com a organização do evento.
        </p>
      </div>
    </div>
  )
}

function InfoField({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase' as const, letterSpacing: '0.1em', color: 'var(--fg-3)', marginBottom: 3 }}>
        {label}
      </div>
      <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--fg-1)', lineHeight: 1.3 }}>
        {value}
      </div>
    </div>
  )
}

function OrderRow({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ padding: '12px 18px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, borderBottom: '1px solid var(--line-2)' }}>
      <span style={{ fontSize: 13, color: 'var(--fg-2)' }}>{label}</span>
      <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--fg-1)', textAlign: 'right' }}>{value}</span>
    </div>
  )
}
