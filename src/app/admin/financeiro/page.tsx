import { prisma } from '@/lib/prisma'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

export const dynamic = 'force-dynamic'

function fmtBRL(centavos: number) {
  return 'R$ ' + (centavos / 100).toLocaleString('pt-BR', { minimumFractionDigits: 2 })
}

const METHOD_LABEL: Record<string, string> = {
  pix: 'Pix',
  dinheiro: 'Dinheiro',
  transferencia: 'Transferência',
  outros: 'Outros',
}

function MetricCard({ label, value, sub, accent }: { label: string; value: string; sub?: string; accent?: string }) {
  return (
    <div style={{ background: '#ffffff', borderRadius: 20, boxShadow: 'var(--adm-card-shadow)', padding: '22px 24px' }}>
      <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--fg-3)', textTransform: 'uppercase', letterSpacing: '0.10em', marginBottom: 8 }}>
        {label}
      </div>
      <div style={{ fontFamily: 'var(--font-serif)', fontSize: 32, fontWeight: 700, letterSpacing: '-0.03em', lineHeight: 1, color: accent ?? 'var(--fdc-ink)' }}>
        {value}
      </div>
      {sub && <div style={{ fontSize: 12, color: 'var(--fg-3)', marginTop: 6 }}>{sub}</div>}
    </div>
  )
}

type Movement = {
  id: string
  date: Date
  source: 'Ingressos' | 'Rifas'
  description: string
  method: string | null
  amount: number
}

export default async function FinanceiroPage() {
  const [ticketRevenue, paidOrdersCount, rafflePayments, raffleReturns, recentOrders] = await Promise.all([
    prisma.order.aggregate({ where: { status: 'PAID' }, _sum: { totalAmount: true } }),
    prisma.order.count({ where: { status: 'PAID' } }),
    prisma.raffleTransaction.findMany({
      where: { type: 'PAYMENT' },
      include: { student: true },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.raffleTransaction.findMany({
      where: { type: 'RETURN', amountPaid: { not: null, gt: 0 } },
      include: { student: true },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.order.findMany({
      where: { status: 'PAID' },
      include: { user: true },
      orderBy: { paidAt: 'desc' },
      take: 8,
    }),
  ])

  const ticketTotal = ticketRevenue._sum.totalAmount ?? 0
  const raffleTotal = [...rafflePayments, ...raffleReturns].reduce((s, t) => s + (t.amountPaid ?? 0), 0)
  const grandTotal = ticketTotal + raffleTotal

  // Breakdown by payment method (rifas)
  const methodTotals = new Map<string, number>()
  for (const t of [...rafflePayments, ...raffleReturns]) {
    const key = t.paymentMethod ?? 'outros'
    methodTotals.set(key, (methodTotals.get(key) ?? 0) + (t.amountPaid ?? 0))
  }
  const methodBreakdown = [...methodTotals.entries()]
    .map(([method, total]) => ({ method, label: METHOD_LABEL[method] ?? method, total }))
    .sort((a, b) => b.total - a.total)

  // Combined recent movements
  const movements: Movement[] = [
    ...recentOrders.map((o): Movement => ({
      id: o.id,
      date: o.paidAt ?? o.createdAt,
      source: 'Ingressos',
      description: o.user.name,
      method: 'PIX',
      amount: o.totalAmount,
    })),
    ...rafflePayments.slice(0, 8).map((t): Movement => ({
      id: t.id,
      date: t.createdAt,
      source: 'Rifas',
      description: `Pagamento — ${t.student.name}`,
      method: t.paymentMethod ? (METHOD_LABEL[t.paymentMethod] ?? t.paymentMethod) : null,
      amount: t.amountPaid ?? 0,
    })),
    ...raffleReturns.slice(0, 8).map((t): Movement => ({
      id: t.id,
      date: t.createdAt,
      source: 'Rifas',
      description: `Devolução com pagamento — ${t.student.name}`,
      method: t.paymentMethod ? (METHOD_LABEL[t.paymentMethod] ?? t.paymentMethod) : null,
      amount: t.amountPaid ?? 0,
    })),
  ]
    .sort((a, b) => b.date.getTime() - a.date.getTime())
    .slice(0, 12)

  const ticketPct = grandTotal > 0 ? Math.round((ticketTotal / grandTotal) * 100) : 0
  const rafflePct = grandTotal > 0 ? 100 - ticketPct : 0

  return (
    <div>
      <div style={{ marginBottom: 28 }}>
        <div className="fdc-eyebrow" style={{ marginBottom: 4 }}>Painel</div>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(24px, 3vw, 40px)', fontWeight: 700, letterSpacing: '-0.03em', lineHeight: 1.0, color: 'var(--fdc-ink)', margin: 0 }}>
          Financeiro
        </h1>
        <p style={{ fontSize: 14, color: 'var(--fg-3)', marginTop: 8 }}>
          Receita consolidada de ingressos e campanha de rifas.
        </p>
      </div>

      {/* Metric cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 28 }}>
        <MetricCard label="Receita total" value={fmtBRL(grandTotal)} sub="Ingressos + rifas" accent="var(--fdc-tangerine)" />
        <MetricCard label="Ingressos" value={fmtBRL(ticketTotal)} sub={`${paidOrdersCount} pedido${paidOrdersCount !== 1 ? 's' : ''} pago${paidOrdersCount !== 1 ? 's' : ''}`} />
        <MetricCard label="Rifas" value={fmtBRL(raffleTotal)} sub={`${rafflePayments.length + raffleReturns.length} pagamento${(rafflePayments.length + raffleReturns.length) !== 1 ? 's' : ''}`} accent="var(--fdc-leaf-deep)" />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.3fr 1fr', gap: 18, alignItems: 'start' }} className="fin-grid">
        {/* Recent movements */}
        <div style={{ background: '#ffffff', borderRadius: 20, boxShadow: 'var(--adm-card-shadow)', overflow: 'hidden' }}>
          <div style={{ padding: '20px 24px 14px' }}>
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 17, fontWeight: 700, letterSpacing: '-0.01em', margin: 0, color: 'var(--fdc-ink)' }}>
              Movimentações recentes
            </h3>
          </div>
          <div>
            {movements.length === 0 && (
              <div style={{ padding: '32px 24px', textAlign: 'center', color: 'var(--fg-3)', fontSize: 14 }}>
                Nenhuma movimentação registrada ainda.
              </div>
            )}
            {movements.map((m) => (
              <div key={`${m.source}-${m.id}`} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '13px 24px', borderTop: '1px solid rgba(56,48,48,0.06)' }}>
                <div style={{
                  width: 34, height: 34, borderRadius: 10, flexShrink: 0,
                  display: 'grid', placeItems: 'center', fontSize: 15,
                  background: m.source === 'Ingressos' ? 'rgba(54,88,211,0.10)' : 'rgba(111,168,74,0.13)',
                  color: m.source === 'Ingressos' ? 'var(--fdc-indigo)' : 'var(--fdc-leaf-deep)',
                }}>
                  {m.source === 'Ingressos' ? '🎟' : '🎫'}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13.5, fontWeight: 600, color: 'var(--fg-1)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {m.description}
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--fg-3)', marginTop: 1 }}>
                    {m.source}{m.method ? ` · ${m.method}` : ''} · {format(m.date, "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                  </div>
                </div>
                <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--fdc-leaf-deep)', flexShrink: 0 }}>
                  + {fmtBRL(m.amount)}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Side column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          {/* Source split */}
          <div style={{ background: '#ffffff', borderRadius: 20, boxShadow: 'var(--adm-card-shadow)', padding: 24 }}>
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 16, fontWeight: 700, letterSpacing: '-0.01em', margin: '0 0 16px', color: 'var(--fdc-ink)' }}>
              Origem da receita
            </h3>
            <div style={{ display: 'flex', height: 10, borderRadius: 999, overflow: 'hidden', marginBottom: 14 }}>
              <div style={{ width: `${ticketPct}%`, background: 'var(--fdc-indigo)' }} />
              <div style={{ width: `${rafflePct}%`, background: 'var(--fdc-leaf)' }} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <SplitRow color="var(--fdc-indigo)" label="Ingressos" pct={ticketPct} value={fmtBRL(ticketTotal)} />
              <SplitRow color="var(--fdc-leaf)" label="Rifas" pct={rafflePct} value={fmtBRL(raffleTotal)} />
            </div>
          </div>

          {/* Payment method breakdown */}
          <div style={{ background: '#ffffff', borderRadius: 20, boxShadow: 'var(--adm-card-shadow)', padding: 24 }}>
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 16, fontWeight: 700, letterSpacing: '-0.01em', margin: '0 0 16px', color: 'var(--fdc-ink)' }}>
              Rifas por forma de pagamento
            </h3>
            {methodBreakdown.length === 0 && (
              <div style={{ fontSize: 13, color: 'var(--fg-3)' }}>Nenhum pagamento registrado ainda.</div>
            )}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {methodBreakdown.map((m) => {
                const pct = raffleTotal > 0 ? Math.round((m.total / raffleTotal) * 100) : 0
                return (
                  <div key={m.method}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 5 }}>
                      <span style={{ fontWeight: 600, color: 'var(--fg-1)' }}>{m.label}</span>
                      <span style={{ color: 'var(--fg-3)' }}>{fmtBRL(m.total)} · {pct}%</span>
                    </div>
                    <div style={{ height: 7, borderRadius: 999, background: 'rgba(56,48,48,0.07)', overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: `${pct}%`, background: 'var(--fdc-tangerine)', borderRadius: 999 }} />
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 980px) {
          .fin-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  )
}

function SplitRow({ color, label, pct, value }: { color: string; label: string; pct: number; value: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 13 }}>
      <span style={{ width: 10, height: 10, borderRadius: 3, background: color, flexShrink: 0 }} />
      <span style={{ fontWeight: 600, color: 'var(--fg-1)', flex: 1 }}>{label}</span>
      <span style={{ color: 'var(--fg-3)' }}>{pct}%</span>
      <span style={{ fontWeight: 700, color: 'var(--fg-1)', minWidth: 90, textAlign: 'right' }}>{value}</span>
    </div>
  )
}
