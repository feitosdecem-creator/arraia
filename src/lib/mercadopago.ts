import { MercadoPagoConfig, Payment } from 'mercadopago'

const client = new MercadoPagoConfig({
  accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN!,
})

export async function createPixPayment(params: {
  orderId: string
  amount: number // cents
  payerEmail: string
  payerName: string
}): Promise<{
  paymentId: string
  qrCodeBase64: string
  qrCodeText: string
  expiresAt: Date
}> {
  const payment = new Payment(client)

  const amountInReais = params.amount / 100

  const result = await payment.create({
    body: {
      transaction_amount: amountInReais,
      description: `Ingressos Arraiá nu Quintal 2 - Pedido ${params.orderId}`,
      payment_method_id: 'pix',
      external_reference: params.orderId,
      payer: {
        email: params.payerEmail,
        first_name: params.payerName.split(' ')[0],
        last_name: params.payerName.split(' ').slice(1).join(' ') || params.payerName.split(' ')[0],
      },
      date_of_expiration: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
    },
  })

  if (!result.id || !result.point_of_interaction?.transaction_data) {
    throw new Error('Failed to create PIX payment')
  }

  const transactionData = result.point_of_interaction.transaction_data
  const expiresAt = new Date(Date.now() + 30 * 60 * 1000)

  return {
    paymentId: String(result.id),
    qrCodeBase64: transactionData.qr_code_base64 ?? '',
    qrCodeText: transactionData.qr_code ?? '',
    expiresAt,
  }
}
