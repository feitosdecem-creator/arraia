import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

type Props = { params: Promise<{ code: string }> }

function fmtBRL(centavos: number) {
  return (centavos / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
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

  const publicTxs = txs.filter((t) => t.type !== 'NOTE')
  const refCode = `RF-${String(delivered * 30).padStart(2, '0')}-${student.code}`

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://arraia.feitosdecem.com.br'

  return (
    <div style={{ background: '#f0ebe0', minHeight: '100vh', fontFamily: 'var(--font-sans)' }}>

      {/* Top nav */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 20px', background: '#f0ebe0' }}>
        <Link href="/" style={{ display: 'grid', placeItems: 'center', width: 36, height: 36, borderRadius: '50%', background: 'rgba(56,48,48,0.08)', color: 'var(--fdc-ink)', textDecoration: 'none', fontSize: 18, fontWeight: 600 }}>
          ←
        </Link>
        <img src="/logo-navbar.svg" alt="Arraiá nu Quintal" style={{ height: 28, width: 'auto' }} />
        <div style={{ width: 36 }} />
      </div>

      {/* Bandeirinhas */}
      <Bandeirinhas />

      <div style={{ maxWidth: 480, margin: '0 auto', padding: '20px 16px 80px' }}>

        {/* Receipt card */}
        <div style={{
          background: '#faf6ee',
          borderRadius: 16,
          boxShadow: '0 8px 32px rgba(56,48,48,0.14)',
          overflow: 'hidden',
          marginBottom: 24,
          position: 'relative',
        }}>
          {/* Stamp */}
          <div style={{
            position: 'absolute', top: 16, right: 16,
            width: 70, height: 70, borderRadius: '50%',
            border: '2.5px dashed var(--fdc-leaf)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexDirection: 'column', textAlign: 'center',
            color: 'var(--fdc-leaf-deep)',
            transform: 'rotate(12deg)',
            zIndex: 2,
          }}>
            <div style={{ fontSize: 8, fontWeight: 800, letterSpacing: '0.06em', lineHeight: 1.3, textTransform: 'uppercase' }}>
              ARRAIÁ<br />2026<br />CONFERIDO
            </div>
          </div>

          {/* Card header */}
          <div style={{ padding: '22px 24px 14px', paddingRight: 90 }}>
            <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--fdc-stone)', marginBottom: 2 }}>
              Arraiá nu Quintal
            </div>
            <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--fdc-stone-1)', marginBottom: 12 }}>
              Recibo de Conferência
            </div>
            <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: 'clamp(20px, 5vw, 26px)', fontWeight: 700, letterSpacing: '-0.02em', color: 'var(--fdc-ink)', margin: '0 0 4px', lineHeight: 1.15 }}>
              {student.name}
            </h1>
            <p style={{ fontSize: 13, color: 'var(--fdc-stone)', margin: 0, fontWeight: 500 }}>
              Turma {student.classroom} · Resp. {student.guardian}
            </p>
          </div>

          {/* Dotted divider */}
          <DottedDivider />

          {/* Metrics ledger */}
          <div style={{ padding: '14px 24px' }}>
            <LedgerRow
              label="Bloquinhos recebidos"
              sub={`${delivered} bloquinho${delivered !== 1 ? 's' : ''} · ${delivered * 30} rifas`}
              value={String(delivered)}
              valueColor="var(--fdc-ink)"
              bold
            />
            <LedgerRow
              label="Total entregue"
              value={fmtBRL(totalPaid)}
              valueColor="var(--fdc-leaf-deep)"
              bold
            />
          </div>

          {/* Dotted divider */}
          <DottedDivider />

          {/* Barcode */}
          <div style={{ padding: '18px 24px 14px' }}>
            <div style={{
              height: 52,
              background: `repeating-linear-gradient(90deg,
                #1a1410 0px,   #1a1410 2px,
                transparent    2px,   transparent  4px,
                #1a1410 4px,   #1a1410 5px,
                transparent    5px,   transparent  8px,
                #1a1410 8px,   #1a1410 11px,
                transparent    11px,  transparent  13px,
                #1a1410 13px,  #1a1410 15px,
                transparent    15px,  transparent  17px,
                #1a1410 17px,  #1a1410 19px,
                transparent    19px,  transparent  22px,
                #1a1410 22px,  #1a1410 23px,
                transparent    23px,  transparent  25px,
                #1a1410 25px,  #1a1410 28px,
                transparent    28px,  transparent  30px,
                #1a1410 30px,  #1a1410 31px,
                transparent    31px,  transparent  34px,
                #1a1410 34px,  #1a1410 37px,
                transparent    37px,  transparent  39px,
                #1a1410 39px,  #1a1410 40px,
                transparent    40px,  transparent  42px,
                #1a1410 42px,  #1a1410 44px,
                transparent    44px,  transparent  47px,
                #1a1410 47px,  #1a1410 48px,
                transparent    48px,  transparent  50px
              )`,
              borderRadius: 3,
            }} />
            <div style={{ textAlign: 'center', marginTop: 8, fontFamily: 'var(--font-mono)', fontSize: 12, letterSpacing: '0.2em', color: 'var(--fdc-stone)', fontWeight: 500 }}>
              {refCode}
            </div>
          </div>
        </div>

        {/* Timeline */}
        {publicTxs.length > 0 && (
          <div>
            <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--fdc-stone)', marginBottom: 16, paddingLeft: 4 }}>
              Histórico
            </div>
            <div style={{ position: 'relative' }}>
              {/* Vertical line */}
              <div style={{
                position: 'absolute', left: 19, top: 20, bottom: 20,
                width: 2, background: 'rgba(56,48,48,0.10)', borderRadius: 2,
              }} />
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {publicTxs.map((tx) => (
                  <TimelineEntry key={tx.id} tx={tx} appUrl={appUrl} />
                ))}
              </div>
            </div>
          </div>
        )}

        {publicTxs.length === 0 && (
          <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--fdc-stone-1)', fontSize: 14 }}>
            Nenhuma movimentação registrada ainda.
          </div>
        )}

      </div>
    </div>
  )
}

function Bandeirinhas() {
  const colors = [
    '#EC5212', '#F4B73B', '#6FA84A', '#77C6B3', '#3658D3', '#FF8787',
    '#EC5212', '#F4B73B', '#6FA84A', '#77C6B3', '#3658D3', '#FF8787',
    '#EC5212', '#F4B73B', '#6FA84A', '#77C6B3', '#3658D3', '#FF8787',
    '#EC5212', '#F4B73B',
  ]
  return (
    <div style={{ display: 'flex', overflow: 'hidden', marginBottom: 4, lineHeight: 0 }}>
      {colors.map((color, i) => (
        <div
          key={i}
          style={{
            flex: 1,
            minWidth: 0,
            height: 32,
            clipPath: 'polygon(0 0, 100% 0, 50% 100%)',
            background: color,
          }}
        />
      ))}
    </div>
  )
}

function DottedDivider() {
  return (
    <div style={{
      margin: '0 24px',
      borderTop: '1.5px dashed rgba(56,48,48,0.15)',
    }} />
  )
}

function LedgerRow({
  label, sub, value, valueColor, bold,
}: {
  label: string; sub?: string; value: string; valueColor: string; bold?: boolean
}) {
  return (
    <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 10 }}>
      <div style={{ flex: '0 0 auto' }}>
        <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase' as const, color: 'var(--fdc-stone)', lineHeight: 1 }}>
          {label}
        </div>
        {sub && <div style={{ fontSize: 11, color: 'var(--fdc-stone-1)', marginTop: 2 }}>{sub}</div>}
      </div>
      <div style={{
        flex: 1,
        borderBottom: '1px dotted rgba(56,48,48,0.2)',
        marginBottom: 3,
        minWidth: 20,
      }} />
      <div style={{
        fontSize: bold ? 18 : 15,
        fontWeight: bold ? 800 : 600,
        color: valueColor,
        letterSpacing: '-0.01em',
        flex: '0 0 auto',
      }}>
        {value}
      </div>
    </div>
  )
}

const METHOD_LABEL: Record<string, string> = {
  pix: 'Pix', dinheiro: 'Dinheiro', transferencia: 'Transferência', outros: 'Outros',
}

const TX_COLORS: Record<string, { bg: string; fg: string }> = {
  DELIVERY: { bg: '#FFF3EC', fg: '#EC5212' },
  RETURN:   { bg: '#F2F2F2', fg: '#707070' },
  PAYMENT:  { bg: '#EFF7E8', fg: '#4e7e2f' },
}

type TxRow = {
  id: string; type: string; quantity: number
  amountPaid: number | null; paymentMethod: string | null
  receiptNumber: number | null; note: string | null; createdAt: Date
}

function TimelineEntry({ tx, appUrl }: { tx: TxRow; appUrl: string }) {
  const colors = TX_COLORS[tx.type] ?? { bg: '#F2F2F2', fg: '#707070' }
  const date = format(tx.createdAt, "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })

  let icon = '📦'
  let mainText = ''
  let subContent: React.ReactNode = null

  if (tx.type === 'DELIVERY') {
    icon = '🎟'
    mainText = `${tx.quantity} bloquinho${tx.quantity !== 1 ? 's' : ''} entregue${tx.quantity !== 1 ? 's' : ''}`
  } else if (tx.type === 'RETURN') {
    icon = '↩'
    mainText = `${tx.quantity} bloquinho${tx.quantity !== 1 ? 's' : ''} devolvido${tx.quantity !== 1 ? 's' : ''}`
  } else if (tx.type === 'PAYMENT') {
    icon = '💰'
    const amt = tx.amountPaid != null ? fmtBRL(tx.amountPaid) : '—'
    const method = tx.paymentMethod ? (METHOD_LABEL[tx.paymentMethod] ?? tx.paymentMethod) : null
    mainText = `Pagamento de ${amt}`
    if (method || tx.receiptNumber) {
      subContent = (
        <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginTop: 4, flexWrap: 'wrap' as const }}>
          {method && <span style={{ fontSize: 12, color: 'var(--fdc-stone)', fontWeight: 500 }}>{method}</span>}
          {tx.receiptNumber && (
            <a
              href={`/recibo/${tx.receiptNumber}`}
              style={{ fontSize: 12, color: 'var(--fdc-tangerine)', fontWeight: 700, textDecoration: 'none' }}
            >
              Ver recibo #{String(tx.receiptNumber).padStart(5, '0')} →
            </a>
          )}
        </div>
      )
    }
  }

  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
      {/* Icon square */}
      <div style={{
        width: 40, height: 40, borderRadius: 12,
        background: colors.bg,
        border: `1.5px solid ${colors.fg}22`,
        display: 'grid', placeItems: 'center',
        fontSize: 18, flexShrink: 0,
        zIndex: 1,
        boxShadow: '0 2px 8px rgba(56,48,48,0.07)',
      }}>
        {icon}
      </div>

      {/* Content */}
      <div style={{
        flex: 1,
        background: '#faf6ee',
        borderRadius: 12,
        border: '1px solid rgba(56,48,48,0.08)',
        padding: '10px 14px',
        boxShadow: '0 2px 6px rgba(56,48,48,0.05)',
      }}>
        <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--fdc-ink)', lineHeight: 1.2 }}>
          {mainText}
        </div>
        <div style={{ fontSize: 12, color: 'var(--fdc-stone)', marginTop: 3 }}>
          {date}
        </div>
        {subContent}
      </div>
    </div>
  )
}
