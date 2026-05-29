import { prisma } from '@/lib/prisma'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { SyncOrderButton } from './SyncOrderButton'

export const dynamic = 'force-dynamic'

function MetricCard({
  label,
  value,
  sub,
  icon,
  iconBg,
  iconColor,
}: {
  label: string
  value: string | number
  sub: string
  icon: string
  iconBg: string
  iconColor: string
}) {
  return (
    <div
      style={{
        background: '#ffffff',
        borderRadius: 20,
        boxShadow: 'var(--adm-card-shadow)',
        padding: '24px 24px 22px',
        display: 'flex',
        flexDirection: 'column',
        gap: 12,
      }}
    >
      <div
        style={{
          width: 44,
          height: 44,
          borderRadius: 999,
          background: iconBg,
          display: 'grid',
          placeItems: 'center',
          fontSize: 18,
          color: iconColor,
          flexShrink: 0,
        }}
      >
        {icon}
      </div>
      <div>
        <div
          style={{
            fontSize: 11,
            fontWeight: 600,
            color: 'var(--fg-3)',
            textTransform: 'uppercase',
            letterSpacing: '0.10em',
            marginBottom: 4,
          }}
        >
          {label}
        </div>
        <div
          style={{
            fontFamily: 'var(--font-serif)',
            fontSize: 36,
            fontWeight: 700,
            letterSpacing: '-0.03em',
            lineHeight: 1,
            color: 'var(--fdc-ink)',
          }}
        >
          {value}
        </div>
        <div style={{ fontSize: 12, color: 'var(--fg-3)', marginTop: 5 }}>{sub}</div>
      </div>
    </div>
  )
}

const statusLabel: Record<string, string> = {
  PAID: 'Pago',
  AWAITING_PAYMENT: 'Aguardando',
  PENDING: 'Pendente',
  EXPIRED: 'Expirado',
  CANCELLED: 'Cancelado',
}

const statusStyle: Record<string, { background: string; color: string }> = {
  PAID:             { background: 'rgba(111,168,74,0.13)', color: '#4E7E2F' },
  AWAITING_PAYMENT: { background: 'rgba(244,183,59,0.18)', color: '#9A6B0F' },
  PENDING:          { background: 'rgba(56,48,48,0.07)',   color: '#707070' },
  EXPIRED:          { background: 'rgba(216,56,56,0.09)',  color: '#B83030' },
  CANCELLED:        { background: 'rgba(216,56,56,0.09)',  color: '#B83030' },
}

export default async function DashboardPage() {
  const [totalRevenue, totalTickets, usedTickets, recentOrders, totalCapacity, pendingOrders] =
    await Promise.all([
      prisma.order.aggregate({ where: { status: 'PAID' }, _sum: { totalAmount: true } }),
      prisma.ticket.count(),
      prisma.ticket.count({ where: { usedAt: { not: null } } }),
      prisma.order.findMany({
        where: { status: { in: ['PAID', 'AWAITING_PAYMENT', 'PENDING', 'EXPIRED'] } },
        orderBy: { createdAt: 'desc' },
        take: 10,
        include: { user: true, items: { include: { ticketType: true } } },
      }),
      prisma.ticketType.aggregate({ _sum: { stock: true } }),
      prisma.order.count({ where: { status: 'AWAITING_PAYMENT' } }),
    ])

  const revenue = totalRevenue._sum.totalAmount ?? 0
  const capacity = totalCapacity._sum.stock ?? 0
  const revenueFormatted = 'R$ ' + (revenue / 100).toLocaleString('pt-BR', { minimumFractionDigits: 2 })
  const soldPct = capacity > 0 ? Math.round((totalTickets / capacity) * 100) : 0
  const today = format(new Date(), "EEE, dd 'de' MMM yyyy", { locale: ptBR })

  return (
    <div>
      {/* ── Header ── */}
      <div
        style={{
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          marginBottom: 32,
          gap: 16,
          flexWrap: 'wrap',
        }}
      >
        <div>
          <div
            style={{
              fontSize: 11,
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.12em',
              color: 'var(--fdc-tangerine)',
              marginBottom: 6,
            }}
          >
            Painel
          </div>
          <h1
            style={{
              fontFamily: 'var(--font-serif)',
              fontSize: 'clamp(26px, 3vw, 42px)',
              fontWeight: 700,
              letterSpacing: '-0.03em',
              lineHeight: 1.0,
              color: 'var(--fdc-ink)',
              margin: 0,
            }}
          >
            Visão geral
          </h1>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, paddingTop: 4 }}>
          <div
            style={{
              padding: '7px 14px',
              borderRadius: 999,
              background: 'rgba(56,48,48,0.06)',
              fontSize: 12,
              color: 'var(--fg-2)',
              fontWeight: 500,
              textTransform: 'capitalize',
            }}
          >
            {today}
          </div>
          <a
            href="/admin/validar"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              padding: '9px 18px',
              borderRadius: 12,
              background: 'var(--fdc-tangerine)',
              color: '#fff',
              fontWeight: 600,
              fontSize: 13,
              textDecoration: 'none',
              letterSpacing: '0.01em',
            }}
          >
            ⊡ Scanner
          </a>
        </div>
      </div>

      {/* ── Hero card ── */}
      <div
        style={{
          background: '#ffffff',
          borderRadius: 24,
          boxShadow: 'var(--adm-card-shadow)',
          marginBottom: 18,
          overflow: 'hidden',
          display: 'flex',
          minHeight: 200,
          position: 'relative',
        }}
      >
        {/* Orange accent strip */}
        <div
          style={{
            position: 'absolute',
            right: 0,
            top: 0,
            bottom: 0,
            width: 6,
            background: 'var(--fdc-tangerine)',
            borderRadius: '0 24px 24px 0',
          }}
        />

        {/* Left — revenue */}
        <div
          style={{
            flex: '0 0 58%',
            padding: '36px 40px',
            borderRight: '1px solid rgba(56,48,48,0.06)',
            background:
              'linear-gradient(135deg, rgba(236,82,18,0.05) 0%, transparent 55%)',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              marginBottom: 10,
            }}
          >
            <div
              style={{
                width: 34,
                height: 34,
                borderRadius: 10,
                background: '#ffffff',
                boxShadow: '0 1px 6px rgba(56,48,48,0.12)',
                display: 'grid',
                placeItems: 'center',
                fontFamily: 'var(--font-serif)',
                fontWeight: 700,
                fontSize: 19,
                color: 'var(--fdc-tangerine)',
                flexShrink: 0,
                letterSpacing: '-0.02em',
              }}
            >
              A
            </div>
            <div
              style={{
                fontSize: 11,
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.12em',
                color: 'var(--fdc-tangerine)',
              }}
            >
              Arraiá nu Quintal 2
            </div>
          </div>
          <div
            style={{
              fontFamily: 'var(--font-serif)',
              fontSize: 'clamp(40px, 5vw, 58px)',
              fontWeight: 700,
              letterSpacing: '-0.04em',
              lineHeight: 1,
              color: 'var(--fdc-ink)',
            }}
          >
            {revenueFormatted}
          </div>
          <div style={{ fontSize: 13, color: 'var(--fg-3)', marginTop: 8 }}>
            em receita confirmada
          </div>

          {/* Progress bar */}
          <div style={{ marginTop: 28 }}>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                fontSize: 11,
                fontWeight: 600,
                color: 'var(--fg-3)',
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                marginBottom: 8,
              }}
            >
              <span>Ingressos vendidos</span>
              <span style={{ color: 'var(--fdc-ink)' }}>
                {totalTickets}
                {capacity > 0 && ` / ${capacity}`}
              </span>
            </div>
            <div
              style={{
                height: 6,
                background: 'rgba(56,48,48,0.08)',
                borderRadius: 999,
                overflow: 'hidden',
              }}
            >
              <div
                style={{
                  height: '100%',
                  width: `${Math.min(soldPct, 100)}%`,
                  background: 'var(--fdc-tangerine)',
                  borderRadius: 999,
                  transition: 'width 600ms var(--ease-out)',
                }}
              />
            </div>
            {capacity > 0 && (
              <div style={{ fontSize: 12, color: 'var(--fg-3)', marginTop: 6 }}>
                {soldPct}% da capacidade total
              </div>
            )}
          </div>
        </div>

        {/* Right — secondary stats */}
        <div
          style={{
            flex: 1,
            padding: '36px 32px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            gap: 0,
          }}
        >
          <div style={{ marginBottom: 20 }}>
            <div
              style={{
                fontSize: 11,
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.10em',
                color: 'var(--fg-3)',
                marginBottom: 6,
              }}
            >
              Check-ins
            </div>
            <div
              style={{
                fontFamily: 'var(--font-serif)',
                fontSize: 38,
                fontWeight: 700,
                letterSpacing: '-0.03em',
                lineHeight: 1,
                color: 'var(--fdc-ink)',
              }}
            >
              {usedTickets}
              <span
                style={{
                  fontSize: 18,
                  color: 'var(--fg-3)',
                  fontWeight: 400,
                  letterSpacing: 0,
                }}
              >
                /{totalTickets}
              </span>
            </div>
            <div style={{ fontSize: 12, color: 'var(--fg-3)', marginTop: 4 }}>
              entradas validadas
            </div>
          </div>

          <div
            style={{
              height: 1,
              background: 'rgba(56,48,48,0.07)',
              marginBottom: 20,
            }}
          />

          <div>
            <div
              style={{
                fontSize: 11,
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.10em',
                color: 'var(--fg-3)',
                marginBottom: 6,
              }}
            >
              Pedidos pagos
            </div>
            <div
              style={{
                fontFamily: 'var(--font-serif)',
                fontSize: 38,
                fontWeight: 700,
                letterSpacing: '-0.03em',
                lineHeight: 1,
                color: 'var(--fdc-ink)',
              }}
            >
              {await prisma.order.count({ where: { status: 'PAID' } })}
            </div>
            <div style={{ fontSize: 12, color: 'var(--fg-3)', marginTop: 4 }}>
              pedidos confirmados
            </div>
          </div>
        </div>
      </div>

      {/* ── Metric cards ── */}
      <div
        className="metrics-grid"
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: 14,
          marginBottom: 28,
        }}
      >
        <MetricCard
          label="Ingressos"
          value={totalTickets}
          sub="entradas emitidas"
          icon="🎫"
          iconBg="rgba(236,82,18,0.10)"
          iconColor="var(--fdc-tangerine)"
        />
        <MetricCard
          label="Receita"
          value={revenueFormatted}
          sub="pedidos pagos"
          icon="◈"
          iconBg="rgba(111,168,74,0.12)"
          iconColor="var(--fdc-leaf-deep)"
        />
        <MetricCard
          label="Check-ins"
          value={`${usedTickets} / ${totalTickets}`}
          sub="entradas validadas"
          icon="⊡"
          iconBg="rgba(54,88,211,0.10)"
          iconColor="var(--fdc-indigo)"
        />
        <MetricCard
          label="Pendentes"
          value={pendingOrders}
          sub="aguardando PIX"
          icon="◷"
          iconBg="rgba(244,183,59,0.18)"
          iconColor="var(--fdc-sun-deep)"
        />
      </div>

      {/* ── Recent orders ── */}
      <div>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 14,
          }}
        >
          <h2
            style={{
              fontFamily: 'var(--font-serif)',
              fontSize: 22,
              fontWeight: 600,
              letterSpacing: '-0.02em',
              color: 'var(--fdc-ink)',
              margin: 0,
            }}
          >
            Pedidos recentes
          </h2>
          <a
            href="/admin/participantes"
            style={{
              fontSize: 13,
              color: 'var(--fdc-tangerine)',
              fontWeight: 600,
              textDecoration: 'none',
              letterSpacing: '0.01em',
            }}
          >
            Ver todos →
          </a>
        </div>

        <div
          style={{
            background: '#ffffff',
            borderRadius: 20,
            boxShadow: 'var(--adm-card-shadow)',
            overflow: 'hidden',
          }}
        >
          <div className="admin-table-wrap" style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
              <thead>
                <tr style={{ background: '#FAF7F2' }}>
                  {['Comprador', 'Ingressos', 'Valor', 'Status', 'Data', ''].map((h) => (
                    <th
                      key={h}
                      style={{
                        textAlign: 'left',
                        padding: '14px 20px',
                        fontSize: 11,
                        fontWeight: 700,
                        color: 'var(--fg-3)',
                        textTransform: 'uppercase',
                        letterSpacing: '0.09em',
                        whiteSpace: 'nowrap',
                        borderBottom: '1px solid rgba(56,48,48,0.06)',
                      }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {recentOrders.map((order, i) => {
                  const sStyle = statusStyle[order.status] ?? statusStyle.PENDING
                  return (
                    <tr
                      key={order.id}
                      style={{
                        borderBottom:
                          i < recentOrders.length - 1
                            ? '1px solid rgba(56,48,48,0.05)'
                            : 'none',
                      }}
                    >
                      <td style={{ padding: '16px 20px', verticalAlign: 'middle' }}>
                        <div style={{ fontWeight: 600, color: 'var(--fdc-ink)', fontSize: 13 }}>
                          {order.user.name}
                        </div>
                        <div style={{ fontSize: 11, color: 'var(--fg-3)', marginTop: 2 }}>
                          {order.user.email}
                        </div>
                      </td>
                      <td
                        style={{
                          padding: '16px 20px',
                          verticalAlign: 'middle',
                          color: 'var(--fg-2)',
                          fontSize: 12,
                        }}
                      >
                        {order.items.map((item) => (
                          <div key={item.id}>
                            {item.quantity}× {item.ticketType.name}
                          </div>
                        ))}
                      </td>
                      <td
                        style={{
                          padding: '16px 20px',
                          verticalAlign: 'middle',
                          fontFamily: 'var(--font-serif)',
                          fontWeight: 600,
                          color: 'var(--fdc-ink)',
                          fontSize: 14,
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {'R$ ' + (order.totalAmount / 100).toFixed(2).replace('.', ',')}
                      </td>
                      <td style={{ padding: '16px 20px', verticalAlign: 'middle' }}>
                        <span
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            padding: '4px 12px',
                            borderRadius: 999,
                            fontSize: 11,
                            fontWeight: 600,
                            ...sStyle,
                          }}
                        >
                          {statusLabel[order.status] ?? order.status}
                        </span>
                      </td>
                      <td
                        style={{
                          padding: '16px 20px',
                          verticalAlign: 'middle',
                          color: 'var(--fg-3)',
                          fontSize: 12,
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {format(order.createdAt, 'dd/MM/yyyy HH:mm', { locale: ptBR })}
                      </td>
                      <td style={{ padding: '16px 20px', verticalAlign: 'middle' }}>
                        {(order.status === 'AWAITING_PAYMENT' ||
                          order.status === 'EXPIRED') && (
                          <SyncOrderButton orderId={order.id} />
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          {recentOrders.length === 0 && (
            <div
              style={{
                textAlign: 'center',
                padding: '56px 24px',
                color: 'var(--fg-3)',
                fontSize: 15,
              }}
            >
              Nenhum pedido ainda.
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
