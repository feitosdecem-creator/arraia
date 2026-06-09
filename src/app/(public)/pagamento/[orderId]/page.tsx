import { prisma } from '@/lib/prisma'
import { notFound, redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import { PixPayment } from '@/components/PixPayment'

export const dynamic = 'force-dynamic'

type Props = { params: Promise<{ orderId: string }> }

const STEPS = ['Ingressos', 'Dados', 'Pagamento', 'Confirmação']

function StepBar({ step }: { step: number }) {
  return (
    <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
      {STEPS.map((s, i) => (
        <div key={s} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              color: i <= step ? 'var(--fg-1)' : 'var(--fg-3)',
              fontWeight: i === step ? 600 : 400,
              fontSize: 13,
            }}
          >
            <div
              style={{
                width: 22,
                height: 22,
                borderRadius: '50%',
                background:
                  i < step
                    ? 'var(--fdc-leaf)'
                    : i === step
                    ? 'var(--fdc-tangerine)'
                    : 'var(--fdc-cream-deep)',
                color: i <= step ? 'var(--fdc-cream)' : 'var(--fg-3)',
                display: 'grid',
                placeItems: 'center',
                fontSize: 11,
                fontWeight: 600,
              }}
            >
              {i < step ? '✓' : i + 1}
            </div>
            <span>{s}</span>
          </div>
          {i < STEPS.length - 1 && (
            <div style={{ width: 24, height: 1, background: 'var(--line-2)', flexShrink: 0 }} />
          )}
        </div>
      ))}
    </div>
  )
}

export default async function PagamentoPage({ params }: Props) {
  const { orderId } = await params

  const order = await prisma.order.findUnique({
    where: { id: orderId },
  })

  if (!order) return notFound()

  // Quem tem o link (cuid não-adivinhável) pode ver e pagar o pedido.
  // Não exigimos login aqui: in-app browsers (Instagram/Facebook) bloqueiam
  // cookies e a sessão se perdia entre o checkout e esta página, mandando o
  // comprador para uma tela em branco. Só bloqueia se OUTRO usuário logado
  // tentar abrir o pedido de alguém.
  const session = await auth()
  if (session?.user?.id && order.userId !== session.user.id && !session.user.isAdmin) {
    redirect('/meus-ingressos')
  }

  if (order.status === 'PAID') {
    redirect('/pagamento/sucesso')
  }

  if (!order.pixQrCode || !order.pixQrCodeText || !order.pixExpiresAt) {
    return (
      <div
        style={{
          maxWidth: 480,
          margin: '0 auto',
          padding: '80px 24px',
          textAlign: 'center',
        }}
      >
        <div style={{ fontSize: 40, marginBottom: 12 }}>⚠️</div>
        <h1
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: 24,
            fontWeight: 700,
            color: 'var(--fg-1)',
            margin: '0 0 8px',
          }}
        >
          PIX não disponível
        </h1>
        <p style={{ color: 'var(--fg-2)', fontSize: 15 }}>
          Ocorreu um erro ao gerar o código PIX. Entre em contato.
        </p>
      </div>
    )
  }

  return (
    <div style={{ background: 'var(--bg-page)', minHeight: '100vh' }}>
      <div
        className="pagamento-outer"
        style={{
          maxWidth: 1100,
          margin: '0 auto',
          padding: '32px 40px 80px',
        }}
      >
        {/* Step bar */}
        <div style={{ marginBottom: 28 }}>
          <StepBar step={2} />
        </div>

        <h1
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'clamp(24px, 3.5vw, 40px)',
            fontWeight: 700,
            letterSpacing: '-0.03em',
            lineHeight: 1.05,
            color: 'var(--fg-1)',
            margin: '0 0 6px',
          }}
        >
          Pague com PIX para confirmar
        </h1>
        <p style={{ color: 'var(--fg-2)', fontSize: 16, margin: '0 0 28px' }}>
          Abra o app do seu banco, escolha pagar com PIX e escaneie o QR Code abaixo.
        </p>

        <PixPayment
          orderId={order.id}
          pixQrCode={order.pixQrCode}
          pixQrCodeText={order.pixQrCodeText}
          expiresAt={order.pixExpiresAt.toISOString()}
        />
      </div>
    </div>
  )
}
