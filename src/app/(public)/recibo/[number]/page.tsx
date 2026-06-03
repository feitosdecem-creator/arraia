import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import { generateQrCode } from '@/lib/qrcode'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import Image from 'next/image'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

type Props = { params: Promise<{ number: string }> }

const METHOD_LABEL: Record<string, string> = {
  pix: 'Pix',
  dinheiro: 'Dinheiro',
  transferencia: 'Transferência',
  outros: 'Outros',
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
  const amountFormatted = tx.amountPaid != null
    ? (tx.amountPaid / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
    : '—'

  return (
    <div style={{ background: 'var(--bg-page)', minHeight: '100vh' }}>
      <div style={{ maxWidth: 480, margin: '0 auto', padding: '32px 16px 80px' }}>

        {/* Back link */}
        <Link
          href={`/familia/${tx.student.code}`}
          style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: 'var(--fg-3)', textDecoration: 'none', fontSize: 14, fontWeight: 500, marginBottom: 28, letterSpacing: '-0.01em' }}
        >
          ← Histórico da família
        </Link>

        {/* Success header */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          {/* Success mark circle */}
          <div style={{
            width: 72, height: 72, borderRadius: '50%',
            background: 'var(--fdc-leaf)',
            display: 'grid', placeItems: 'center',
            margin: '0 auto 16px',
            boxShadow: '0 8px 24px rgba(111,168,74,0.35)',
          }}>
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="var(--fdc-cream)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>
          <h1 style={{ fontFamily: 'var(--font-sans)', fontSize: 26, fontWeight: 700, letterSpacing: '-0.025em', color: 'var(--fg-1)', margin: '0 0 6px' }}>
            Pagamento confirmado
          </h1>
          <p style={{ fontSize: 14, color: 'var(--fg-2)', margin: 0 }}>
            Recibo <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 600, color: 'var(--fg-1)' }}>#{receiptFormatted}</span>
          </p>
        </div>

        {/* Boarding-pass card */}
        <div style={{
          background: 'var(--bg-surface)',
          borderRadius: 20,
          boxShadow: '0 18px 32px rgba(56,48,48,0.12)',
          overflow: 'hidden',
        }}>

          {/* Green header band */}
          <div style={{
            background: 'linear-gradient(135deg, var(--fdc-leaf) 0%, #4e7e2f 100%)',
            padding: '24px 28px',
            position: 'relative',
          }}>
            <div style={{ position: 'absolute', top: 16, right: 20, opacity: 0.18 }}>
              <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5">
                <rect x="3" y="3" width="18" height="18" rx="2" /><path d="M3 9h18M9 3v18" />
              </svg>
            </div>
            <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase' as const, letterSpacing: '0.12em', color: 'rgba(253,250,245,0.75)', marginBottom: 6 }}>
              Campanha de Rifas · Arraiá nu Quintal
            </div>
            <div style={{ fontSize: 32, fontWeight: 800, color: 'var(--fdc-cream)', letterSpacing: '-0.03em', lineHeight: 1 }}>
              {amountFormatted}
            </div>
          </div>

          {/* Perforation */}
          <div style={{ position: 'relative', height: 0 }}>
            <div style={{ position: 'absolute', left: -10, top: -10, width: 20, height: 20, borderRadius: '50%', background: 'var(--bg-page)' }} />
            <div style={{ position: 'absolute', right: -10, top: -10, width: 20, height: 20, borderRadius: '50%', background: 'var(--bg-page)' }} />
            <div style={{ position: 'absolute', left: 14, right: 14, top: -1, borderTop: '1.5px dashed rgba(56,48,48,0.14)' }} />
          </div>

          {/* Fields grid */}
          <div style={{ padding: '28px 28px 24px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '18px 24px' }}>
              <Field label="Aluno" value={tx.student.name} span />
              <Field label="Turma" value={tx.student.classroom} />
              <Field label="Valor" value={amountFormatted} accent />
              {method && <Field label="Forma de pagamento" value={method} />}
              <Field label="Data" value={dateFormatted} />
              <Field label="Nº do recibo" value={`#${receiptFormatted}`} mono />
              {tx.note && <Field label="Observação" value={tx.note} span />}
            </div>
          </div>

          {/* QR perforation */}
          <div style={{ position: 'relative', height: 0 }}>
            <div style={{ position: 'absolute', left: -10, top: -10, width: 20, height: 20, borderRadius: '50%', background: 'var(--bg-page)' }} />
            <div style={{ position: 'absolute', right: -10, top: -10, width: 20, height: 20, borderRadius: '50%', background: 'var(--bg-page)' }} />
            <div style={{ position: 'absolute', left: 14, right: 14, top: -1, borderTop: '1.5px dashed rgba(56,48,48,0.14)' }} />
          </div>

          {/* QR section */}
          <div style={{ padding: '24px 28px 32px', textAlign: 'center', background: 'var(--bg-sunken)' }}>
            <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase' as const, letterSpacing: '0.12em', color: 'var(--fg-3)', marginBottom: 16 }}>
              Verificar autenticidade
            </div>
            <div style={{
              display: 'inline-block',
              padding: 12,
              background: 'white',
              borderRadius: 14,
              border: '1px solid rgba(56,48,48,0.10)',
              boxShadow: '0 4px 12px rgba(56,48,48,0.08)',
            }}>
              <Image src={qrCode} alt={`QR Code recibo #${receiptFormatted}`} width={180} height={180} />
            </div>
            <div style={{ marginTop: 12, fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--fg-3)', letterSpacing: '0.01em' }}>
              {receiptUrl}
            </div>
          </div>
        </div>

        <p style={{ textAlign: 'center', fontSize: 13, color: 'var(--fg-3)', marginTop: 32, lineHeight: 1.6 }}>
          Dúvidas? Entre em contato com a escola.
        </p>
      </div>
    </div>
  )
}

function Field({
  label, value, span, accent, mono,
}: {
  label: string; value: string; span?: boolean; accent?: boolean; mono?: boolean
}) {
  return (
    <div style={span ? { gridColumn: '1 / -1' } : {}}>
      <div style={{
        fontSize: 11, fontWeight: 600,
        textTransform: 'uppercase' as const,
        letterSpacing: '0.08em',
        color: 'var(--fg-3)',
        marginBottom: 4,
      }}>
        {label}
      </div>
      <div style={{
        fontWeight: accent ? 800 : 600,
        fontSize: accent ? 20 : 15,
        fontFamily: mono ? 'var(--font-mono)' : 'inherit',
        color: accent ? 'var(--fdc-leaf-deep)' : 'var(--fg-1)',
        letterSpacing: accent ? '-0.02em' : undefined,
        lineHeight: 1.2,
      }}>
        {value}
      </div>
    </div>
  )
}
