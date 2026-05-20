import { prisma } from '@/lib/prisma'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

export const dynamic = 'force-dynamic'

function Sparkline({ color }: { color: string }) {
  const pts = '0,18 8,15 16,17 24,12 32,14 40,8 48,11 56,5 64,9 72,3'
  return (
    <svg viewBox="0 0 72 22" style={{ width: '100%', height: 22, marginTop: 10, display: 'block' }}>
      <polyline
        points={pts}
        fill="none"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function MetricCard({
  label,
  value,
  hint,
  icon,
  accentBg,
  sparkColor,
}: {
  label: string
  value: string | number
  hint: string
  icon: string
  accentBg: string
  sparkColor: string
}) {
  return (
    <div
      className="fdc-card"
      style={{ padding: 20 }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
        <div
          style={{
            width: 38,
            height: 38,
            borderRadius: 10,
            background: accentBg,
            display: 'grid',
            placeItems: 'center',
            fontSize: 18,
          }}
        >
          {icon}
        </div>
        <span
          style={{
            fontSize: 12,
            color: 'var(--fdc-leaf-deep)',
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            gap: 2,
          }}
        >
          ↑ {hint}
        </span>
      </div>
      <div style={{ color: 'var(--fg-2)', fontSize: 13 }}>{label}</div>
      <div
        style={{
          fontSize: 28,
          fontWeight: 700,
          letterSpacing: '-0.02em',
          color: 'var(--fg-1)',
          marginTop: 2,
        }}
      >
        {value}
      </div>
      <Sparkline color={sparkColor} />
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
  PAID: { background: 'rgba(111,168,74,0.15)', color: 'var(--fdc-leaf-deep)' },
  AWAITING_PAYMENT: { background: 'rgba(244,183,59,0.2)', color: 'var(--fdc-sun-deep)' },
  PENDING: { background: 'var(--fdc-sand)', color: 'var(--fg-2)' },
  EXPIRED: { background: 'rgba(216,56,56,0.1)', color: 'var(--fdc-danger)' },
  CANCELLED: { background: 'rgba(216,56,56,0.1)', color: 'var(--fdc-danger)' },
}

export default async function DashboardPage() {
  const [totalRevenue, totalOrders, totalTickets, usedTickets, recentOrders] = await Promise.all([
    prisma.order.aggregate({
      where: { status: 'PAID' },
      _sum: { totalAmount: true },
    }),
    prisma.order.count({ where: { status: 'PAID' } }),
    prisma.ticket.count(),
    prisma.ticket.count({ where: { usedAt: { not: null } } }),
    prisma.order.findMany({
      where: { status: { in: ['PAID', 'AWAITING_PAYMENT', 'PENDING'] } },
      orderBy: { createdAt: 'desc' },
      take: 10,
      include: {
        user: true,
        items: { include: { ticketType: true } },
      },
    }),
  ])

  const revenue = totalRevenue._sum.totalAmount ?? 0
  const revenueFormatted = 'R$ ' + (revenue / 100).toFixed(2).replace('.', ',')
  const pendingOrders = await prisma.order.count({ where: { status: 'AWAITING_PAYMENT' } })

  return (
    <div>
      {/* Page header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'flex-end',
          justifyContent: 'space-between',
          marginBottom: 28,
          gap: 16,
          flexWrap: 'wrap',
        }}
      >
        <div>
          <div className="fdc-eyebrow" style={{ marginBottom: 4 }}>
            Painel
          </div>
          <h1
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'clamp(24px, 3vw, 40px)',
              fontWeight: 700,
              letterSpacing: '-0.03em',
              lineHeight: 1.0,
              color: 'var(--fg-1)',
              margin: 0,
            }}
          >
            Visão geral
          </h1>
        </div>
        <a
          href="/admin/validar"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            padding: '11px 20px',
            borderRadius: 'var(--radius-lg)',
            background: 'var(--fdc-tangerine)',
            color: 'var(--fdc-cream)',
            fontWeight: 600,
            fontSize: 14,
            textDecoration: 'none',
          }}
        >
          📷 Abrir scanner
        </a>
      </div>

      {/* Metrics grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: 14,
          marginBottom: 28,
        }}
      >
        <MetricCard
          label="Ingressos vendidos"
          value={totalTickets}
          hint="total"
          icon="🎫"
          accentBg="rgba(236,82,18,0.12)"
          sparkColor="var(--fdc-tangerine)"
        />
        <MetricCard
          label="Receita"
          value={revenueFormatted}
          hint="pagos"
          icon="💰"
          accentBg="rgba(111,168,74,0.18)"
          sparkColor="var(--fdc-leaf)"
        />
        <MetricCard
          label="Check-ins"
          value={`${usedTickets}/${totalTickets}`}
          hint="entradas"
          icon="✅"
          accentBg="rgba(54,88,211,0.14)"
          sparkColor="var(--fdc-indigo)"
        />
        <MetricCard
          label="Pendentes"
          value={pendingOrders}
          hint="aguardando"
          icon="⏱"
          accentBg="rgba(244,183,59,0.22)"
          sparkColor="var(--fdc-sun-deep)"
        />
      </div>

      {/* Orders table */}
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
              fontFamily: 'var(--font-display)',
              fontSize: 22,
              fontWeight: 600,
              letterSpacing: '-0.02em',
              color: 'var(--fg-1)',
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
            }}
          >
            Ver todos →
          </a>
        </div>

        <div
          className="fdc-card"
          style={{ padding: 0, overflow: 'hidden' }}
        >
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
              <thead>
                <tr style={{ background: 'var(--bg-sunken)' }}>
                  {['Comprador', 'Ingressos', 'Valor', 'Status', 'Data'].map((h) => (
                    <th
                      key={h}
                      style={{
                        textAlign: 'left',
                        padding: '10px 16px',
                        fontSize: 11,
                        fontWeight: 600,
                        color: 'var(--fg-2)',
                        textTransform: 'uppercase',
                        letterSpacing: '0.06em',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {recentOrders.map((order, i) => {
                  const styleForStatus = statusStyle[order.status] ?? statusStyle.PENDING
                  return (
                    <tr
                      key={order.id}
                      style={{
                        borderBottom:
                          i < recentOrders.length - 1 ? '1px solid var(--line-2)' : 'none',
                      }}
                    >
                      <td style={{ padding: '12px 16px', verticalAlign: 'middle' }}>
                        <div style={{ fontWeight: 500, color: 'var(--fg-1)' }}>
                          {order.user.name}
                        </div>
                        <div style={{ fontSize: 12, color: 'var(--fg-3)' }}>{order.user.email}</div>
                      </td>
                      <td style={{ padding: '12px 16px', verticalAlign: 'middle', color: 'var(--fg-2)' }}>
                        {order.items.map((item) => (
                          <div key={item.id} style={{ fontSize: 12 }}>
                            {item.quantity}× {item.ticketType.name}
                          </div>
                        ))}
                      </td>
                      <td
                        style={{
                          padding: '12px 16px',
                          verticalAlign: 'middle',
                          fontWeight: 600,
                          color: 'var(--fg-1)',
                          fontFamily: 'var(--font-mono)',
                          fontSize: 13,
                        }}
                      >
                        {'R$ ' + (order.totalAmount / 100).toFixed(2).replace('.', ',')}
                      </td>
                      <td style={{ padding: '12px 16px', verticalAlign: 'middle' }}>
                        <span
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 5,
                            padding: '3px 10px',
                            borderRadius: 999,
                            fontSize: 11,
                            fontWeight: 600,
                            ...styleForStatus,
                          }}
                        >
                          {statusLabel[order.status] ?? order.status}
                        </span>
                      </td>
                      <td
                        style={{
                          padding: '12px 16px',
                          verticalAlign: 'middle',
                          color: 'var(--fg-3)',
                          fontSize: 12,
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {format(order.createdAt, 'dd/MM/yyyy HH:mm', { locale: ptBR })}
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
                padding: '48px 24px',
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
