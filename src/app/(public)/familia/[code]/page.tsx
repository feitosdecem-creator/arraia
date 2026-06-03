import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

const BOOKLET_VALUE = 15000

type Props = { params: Promise<{ code: string }> }

function fmtBRL(centavos: number) {
  return (centavos / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

function fmtReceipt(n: number) {
  return String(n).padStart(5, '0')
}

export default async function FamiliaPage({ params }: Props) {
  const { code } = await params

  const student = await prisma.raffleStudent.findUnique({
    where: { code: code.toUpperCase() },
    include: { transactions: { orderBy: { createdAt: 'asc' } } },
  })

  if (!student) return notFound()

  const txs = student.transactions
  const delivered = txs.filter((t) => t.type === 'DELIVERY').reduce((s, t) => s + t.quantity, 0)
  const returned = txs.filter((t) => t.type === 'RETURN').reduce((s, t) => s + t.quantity, 0)
  const totalPaid = txs
    .filter((t) => t.type === 'RETURN' || t.type === 'PAYMENT')
    .reduce((s, t) => s + (t.amountPaid ?? 0), 0)
  const expected = delivered * BOOKLET_VALUE
  const pending = Math.max(0, expected - totalPaid)
  const progressPct = expected > 0 ? Math.min(100, Math.round((totalPaid / expected) * 100)) : 0

  const publicTxs = txs.filter((t) => t.type !== 'NOTE')

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://arraia.feitosdecem.com.br'

  return (
    <div style={{ background: 'var(--bg-page)', minHeight: '100vh' }}>
      <div style={{ maxWidth: 540, margin: '0 auto', padding: '24px 16px 80px' }}>

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div style={{ marginBottom: 14 }}>
            <img src="/logo-navbar.svg" alt="Arraiá nu Quintal" style={{ height: 36, width: 'auto' }} />
          </div>
          <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: 26, fontWeight: 700, letterSpacing: '-0.03em', color: 'var(--fdc-ink)', margin: '0 0 4px' }}>
            {student.name}
          </h1>
          <p style={{ fontSize: 14, color: 'var(--fg-3)', margin: 0, fontWeight: 500 }}>
            Turma {student.classroom} · Responsável: {student.guardian}
          </p>
        </div>

        {/* Metric tiles */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 20 }}>
          <MetricTile label="Rifas entregues" value={String(delivered * 30)} sub={`${delivered} bloquinho${delivered !== 1 ? 's' : ''}`} accent="var(--fdc-tangerine)" />
          <MetricTile label="Valor potencial" value={fmtBRL(expected)} accent="var(--fg-3)" />
          <MetricTile label="Total arrecadado" value={fmtBRL(totalPaid)} accent="var(--fdc-leaf)" />
          <MetricTile label="Pendente" value={fmtBRL(pending)} accent={pending > 0 ? '#e53e3e' : 'var(--fg-3)'} />
        </div>

        {/* Progress bar */}
        {expected > 0 && (
          <div style={{ marginBottom: 28 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
              <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--fg-3)', letterSpacing: '-0.01em' }}>Progresso</span>
              <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--fdc-leaf)' }}>{progressPct}%</span>
            </div>
            <div style={{ height: 8, background: 'var(--line-2)', borderRadius: 999, overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${progressPct}%`, background: progressPct >= 100 ? 'var(--fdc-leaf)' : 'var(--fdc-tangerine)', borderRadius: 999, transition: 'width 0.4s ease' }} />
            </div>
          </div>
        )}

        {/* Timeline */}
        {publicTxs.length > 0 && (
          <div style={{ marginBottom: 28 }}>
            <h2 style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--fg-3)', margin: '0 0 14px' }}>
              Histórico
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              {publicTxs.map((tx) => (
                <TimelineRow
                  key={tx.id}
                  tx={tx}
                  appUrl={appUrl}
                />
              ))}
            </div>
          </div>
        )}

        {publicTxs.length === 0 && (
          <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--fg-3)', fontSize: 14 }}>
            Nenhuma movimentação registrada ainda.
          </div>
        )}

        {/* Footer */}
        <p style={{ textAlign: 'center', fontSize: 12, color: 'var(--fg-3)', marginTop: 32, lineHeight: 1.6 }}>
          Dúvidas? Entre em contato com a escola.
        </p>
      </div>
    </div>
  )
}

function MetricTile({ label, value, sub, accent }: { label: string; value: string; sub?: string; accent: string }) {
  return (
    <div style={{ background: 'var(--bg-surface)', borderRadius: 14, border: '1.5px solid var(--line-2)', padding: '14px 16px' }}>
      <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase' as const, letterSpacing: '0.08em', color: 'var(--fg-3)', marginBottom: 6 }}>
        {label}
      </div>
      <div style={{ fontSize: 20, fontWeight: 800, letterSpacing: '-0.02em', color: accent, lineHeight: 1.1 }}>
        {value}
      </div>
      {sub && <div style={{ fontSize: 11, color: 'var(--fg-3)', marginTop: 3 }}>{sub}</div>}
    </div>
  )
}

type TxRow = {
  id: string
  type: string
  quantity: number
  amountPaid: number | null
  paymentMethod: string | null
  receiptNumber: number | null
  note: string | null
  createdAt: Date
}

const METHOD_LABEL: Record<string, string> = {
  pix: 'Pix',
  dinheiro: 'Dinheiro',
  transferencia: 'Transferência',
  outros: 'Outros',
}

function TimelineRow({ tx, appUrl }: { tx: TxRow; appUrl: string }) {
  const date = format(tx.createdAt, "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })

  if (tx.type === 'DELIVERY') {
    return (
      <div style={rowStyle}>
        <span style={{ ...dotStyle, background: 'var(--fdc-tangerine)' }} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--fg-1)' }}>
            {tx.quantity} bloquinho{tx.quantity !== 1 ? 's' : ''} entregue{tx.quantity !== 1 ? 's' : ''}
          </span>
          <span style={{ fontSize: 12, color: 'var(--fg-3)', marginLeft: 8 }}>{date}</span>
        </div>
      </div>
    )
  }

  if (tx.type === 'RETURN') {
    return (
      <div style={rowStyle}>
        <span style={{ ...dotStyle, background: 'var(--fg-3)' }} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--fg-1)' }}>
            {tx.quantity} bloquinho{tx.quantity !== 1 ? 's' : ''} devolvido{tx.quantity !== 1 ? 's' : ''}
          </span>
          {tx.amountPaid != null && tx.amountPaid > 0 && (
            <span style={{ fontSize: 12, color: 'var(--fdc-leaf)', marginLeft: 8 }}>
              + {(tx.amountPaid / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
            </span>
          )}
          <span style={{ fontSize: 12, color: 'var(--fg-3)', marginLeft: 8 }}>{date}</span>
        </div>
      </div>
    )
  }

  if (tx.type === 'PAYMENT') {
    const method = tx.paymentMethod ? (METHOD_LABEL[tx.paymentMethod] ?? tx.paymentMethod) : null
    const receiptUrl = tx.receiptNumber ? `${appUrl}/recibo/${tx.receiptNumber}` : null
    return (
      <div style={rowStyle}>
        <span style={{ ...dotStyle, background: 'var(--fdc-leaf)' }} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--fg-1)' }}>
            Pagamento de {tx.amountPaid != null ? (tx.amountPaid / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) : '—'}
          </span>
          {method && <span style={{ fontSize: 12, color: 'var(--fg-3)', marginLeft: 8 }}>{method}</span>}
          <span style={{ fontSize: 12, color: 'var(--fg-3)', marginLeft: 8 }}>{date}</span>
          {receiptUrl && tx.receiptNumber && (
            <div style={{ marginTop: 4 }}>
              <Link
                href={`/recibo/${tx.receiptNumber}`}
                style={{ fontSize: 12, color: 'var(--fdc-tangerine)', fontWeight: 600, textDecoration: 'none' }}
              >
                Ver recibo #{String(tx.receiptNumber).padStart(5, '0')} →
              </Link>
            </div>
          )}
        </div>
      </div>
    )
  }

  return null
}

const rowStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'flex-start',
  gap: 10,
  padding: '12px 14px',
  background: 'var(--bg-surface)',
  borderRadius: 10,
  border: '1px solid var(--line-2)',
  marginBottom: 6,
}

const dotStyle: React.CSSProperties = {
  width: 8,
  height: 8,
  borderRadius: '50%',
  flexShrink: 0,
  marginTop: 4,
}
