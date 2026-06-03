import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import { generateQrCode } from '@/lib/qrcode'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import Image from 'next/image'

export const dynamic = 'force-dynamic'

type Props = { params: Promise<{ number: string }> }

const METHOD_LABEL: Record<string, string> = {
  pix: 'Pix',
  dinheiro: 'Dinheiro',
  transferencia: 'Transferência',
  outros: 'Outros',
}

function fmtBRL(centavos: number) {
  return (centavos / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

export default async function ReciboPagamentoPage({ params }: Props) {
  const { number } = await params
  const receiptNumber = parseInt(number, 10)

  if (isNaN(receiptNumber)) return notFound()

  const tx = await prisma.raffleTransaction.findUnique({
    where: { receiptNumber },
    include: { student: true },
  })

  if (!tx || tx.type !== 'PAYMENT') return notFound()

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://arraia.feitosdecem.com.br'
  const receiptUrl = `${appUrl}/recibo/${receiptNumber}`
  const qrCode = await generateQrCode(receiptUrl)

  const receiptFormatted = String(receiptNumber).padStart(5, '0')
  const dateFormatted = format(tx.createdAt, "dd/MM/yyyy 'às' HH'h'mm", { locale: ptBR })
  const method = tx.paymentMethod ? (METHOD_LABEL[tx.paymentMethod] ?? tx.paymentMethod) : null

  return (
    <div style={{ background: 'var(--bg-page)', minHeight: '100vh' }}>
      <div style={{ maxWidth: 480, margin: '0 auto', padding: '24px 16px 80px' }}>

        {/* Logo + title */}
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <img src="/logo-navbar.svg" alt="Arraiá nu Quintal" style={{ height: 36, width: 'auto', marginBottom: 16 }} />
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            padding: '6px 16px',
            borderRadius: 999,
            background: 'rgba(111,168,74,0.12)',
            border: '1.5px solid rgba(111,168,74,0.3)',
            marginBottom: 12,
          }}>
            <span style={{ fontSize: 16 }}>✅</span>
            <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--fdc-leaf)', letterSpacing: '-0.01em' }}>
              Pagamento Confirmado
            </span>
          </div>
          <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: 22, fontWeight: 700, letterSpacing: '-0.03em', color: 'var(--fdc-ink)', margin: 0 }}>
            Recibo #{receiptFormatted}
          </h1>
        </div>

        {/* Receipt card */}
        <div style={{
          background: 'var(--bg-surface)',
          borderRadius: 20,
          boxShadow: '0 4px 24px rgba(0,0,0,0.08)',
          overflow: 'hidden',
          border: '1.5px solid var(--line-2)',
        }}>
          {/* Green header band */}
          <div style={{
            background: 'linear-gradient(135deg, var(--fdc-leaf) 0%, #4a9a3a 100%)',
            padding: '20px 24px',
          }}>
            <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', color: 'rgba(255,255,255,0.8)', marginBottom: 4 }}>
              Campanha de Rifas
            </div>
            <div style={{ fontSize: 28, fontWeight: 800, color: 'white', letterSpacing: '-0.03em', lineHeight: 1.1 }}>
              {tx.amountPaid != null ? fmtBRL(tx.amountPaid) : '—'}
            </div>
          </div>

          {/* Perforation */}
          <div style={{ position: 'relative', height: 0 }}>
            <div style={{ position: 'absolute', left: -12, top: -12, width: 24, height: 24, borderRadius: '50%', background: 'var(--bg-page)' }} />
            <div style={{ position: 'absolute', right: -12, top: -12, width: 24, height: 24, borderRadius: '50%', background: 'var(--bg-page)' }} />
            <div style={{ position: 'absolute', left: 18, right: 18, top: -1, borderTop: '1.5px dashed var(--line-2)' }} />
          </div>

          {/* Details */}
          <div style={{ padding: '24px 24px 20px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
              <DetailRow label="Aluno" value={tx.student.name} />
              <DetailRow label="Turma" value={tx.student.classroom} />
              <DetailRow label="Valor" value={tx.amountPaid != null ? fmtBRL(tx.amountPaid) : '—'} highlight />
              {method && <DetailRow label="Método" value={method} />}
              <DetailRow label="Data" value={dateFormatted} />
              {tx.note && <DetailRow label="Observação" value={tx.note} />}
            </div>
          </div>

          {/* QR Perforation */}
          <div style={{ position: 'relative', height: 0 }}>
            <div style={{ position: 'absolute', left: -12, top: -12, width: 24, height: 24, borderRadius: '50%', background: 'var(--bg-page)' }} />
            <div style={{ position: 'absolute', right: -12, top: -12, width: 24, height: 24, borderRadius: '50%', background: 'var(--bg-page)' }} />
            <div style={{ position: 'absolute', left: 18, right: 18, top: -1, borderTop: '1.5px dashed var(--line-2)' }} />
          </div>

          {/* QR code section */}
          <div style={{ padding: '24px 24px 28px', textAlign: 'center', background: 'var(--bg-sunken)' }}>
            <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--fg-3)', marginBottom: 16 }}>
              Verificar autenticidade
            </div>
            <div style={{
              display: 'inline-block',
              padding: 14,
              background: 'white',
              borderRadius: 16,
              border: '2px solid var(--line-2)',
              boxShadow: '0 4px 16px rgba(0,0,0,0.06)',
            }}>
              <Image src={qrCode} alt={`QR Code recibo #${receiptFormatted}`} width={200} height={200} />
            </div>
            <div style={{ marginTop: 12, fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--fg-3)', letterSpacing: '0.02em', wordBreak: 'break-all' }}>
              {receiptUrl}
            </div>
          </div>
        </div>

        <p style={{ textAlign: 'center', fontSize: 12, color: 'var(--fg-3)', marginTop: 28, lineHeight: 1.6 }}>
          Dúvidas? Entre em contato com a escola.
        </p>
      </div>
    </div>
  )
}

function DetailRow({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div style={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      gap: 12,
      padding: '11px 0',
      borderBottom: '1px solid var(--line-2)',
    }}>
      <span style={{ fontSize: 13, color: 'var(--fg-3)', fontWeight: 500 }}>{label}</span>
      <span style={{
        fontSize: highlight ? 16 : 13,
        fontWeight: highlight ? 800 : 600,
        color: highlight ? 'var(--fdc-leaf)' : 'var(--fg-1)',
        textAlign: 'right',
        letterSpacing: highlight ? '-0.01em' : undefined,
      }}>
        {value}
      </span>
    </div>
  )
}
