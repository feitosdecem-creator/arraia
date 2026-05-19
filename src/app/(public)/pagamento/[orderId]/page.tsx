import { prisma } from '@/lib/prisma'
import { notFound, redirect } from 'next/navigation'
import { PixPayment } from '@/components/PixPayment'

export const dynamic = 'force-dynamic'

type Props = { params: Promise<{ orderId: string }> }

export default async function PagamentoPage({ params }: Props) {
  const { orderId } = await params

  const order = await prisma.order.findUnique({
    where: { id: orderId },
  })

  if (!order) return notFound()

  if (order.status === 'PAID') {
    redirect('/pagamento/sucesso')
  }

  if (!order.pixQrCode || !order.pixQrCodeText || !order.pixExpiresAt) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center">
        <div className="text-5xl mb-4">⚠️</div>
        <h1 className="text-2xl font-bold text-gray-800 mb-2">PIX não disponível</h1>
        <p className="text-gray-500">Ocorreu um erro ao gerar o código PIX. Entre em contato.</p>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-bold text-amber-900 text-center mb-8">Pagamento PIX</h1>
      <PixPayment
        orderId={order.id}
        pixQrCode={order.pixQrCode}
        pixQrCodeText={order.pixQrCodeText}
        expiresAt={order.pixExpiresAt.toISOString()}
      />
    </div>
  )
}
