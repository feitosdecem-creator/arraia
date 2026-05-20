import { Resend } from 'resend'
import { prisma } from '@/lib/prisma'
import { generateQrCode } from '@/lib/qrcode'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

function getResend() {
  if (!process.env.RESEND_API_KEY) throw new Error('Missing RESEND_API_KEY')
  return new Resend(process.env.RESEND_API_KEY)
}

export async function sendTicketEmail(orderId: string): Promise<void> {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      user: true,
      tickets: {
        include: {
          ticketType: {
            include: {
              event: true,
            },
          },
        },
      },
    },
  })

  if (!order) throw new Error('Order not found')

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'

  // Generate QR codes for each ticket
  const ticketsWithQr = await Promise.all(
    order.tickets.map(async (ticket) => {
      const qrCode = await generateQrCode(ticket.code)
      return { ...ticket, qrCode }
    })
  )

  const event = order.tickets[0]?.ticketType.event
  if (!event) throw new Error('Event not found')

  const eventDate = format(event.date, "dd 'de' MMMM 'de' yyyy 'às' HH:mm", {
    locale: ptBR,
  })

  const ticketsHtml = ticketsWithQr
    .map(
      (ticket) => `
    <div style="border: 2px solid #f59e0b; border-radius: 12px; padding: 20px; margin: 16px 0; background: #fffbeb;">
      <h3 style="color: #92400e; margin: 0 0 8px 0;">${ticket.ticketType.name}</h3>
      <p style="color: #78350f; margin: 4px 0;"><strong>Código:</strong> ${ticket.code}</p>
      <p style="color: #78350f; margin: 4px 0;"><strong>Evento:</strong> ${event.name}</p>
      <p style="color: #78350f; margin: 4px 0;"><strong>Data:</strong> ${eventDate}</p>
      <p style="color: #78350f; margin: 4px 0;"><strong>Local:</strong> ${event.location}</p>
      <div style="text-align: center; margin: 16px 0;">
        <img src="${ticket.qrCode}" alt="QR Code" style="width: 200px; height: 200px;" />
      </div>
      <div style="text-align: center;">
        <a href="${appUrl}/meus-ingressos/${ticket.id}"
           style="background: #f59e0b; color: white; padding: 10px 20px; border-radius: 6px; text-decoration: none; display: inline-block;">
          Ver Ingresso
        </a>
      </div>
    </div>
  `
    )
    .join('')

  const totalFormatted = (order.totalAmount / 100).toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  })

  const resend = getResend()
  await resend.emails.send({
    from: 'Arraiá nu Quintal 2 <ingressos@arraia.escola.com>',
    to: order.user.email,
    subject: `Seus ingressos - ${event.name}`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Seus Ingressos</title>
      </head>
      <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #f9fafb;">
        <div style="background: linear-gradient(135deg, #f59e0b, #dc2626); padding: 30px; border-radius: 12px; text-align: center; margin-bottom: 24px;">
          <h1 style="color: white; margin: 0; font-size: 28px;">🎪 Arraiá nu Quintal 2</h1>
          <p style="color: #fef3c7; margin: 8px 0 0 0;">Seus ingressos chegaram!</p>
        </div>

        <div style="background: white; border-radius: 12px; padding: 24px; margin-bottom: 16px;">
          <h2 style="color: #1f2937; margin: 0 0 8px 0;">Olá, ${order.user.name}!</h2>
          <p style="color: #6b7280;">
            Seu pagamento foi confirmado. Abaixo estão seus ingressos para o ${event.name}.
          </p>
          <p style="color: #6b7280;"><strong>Total pago:</strong> ${totalFormatted}</p>
        </div>

        <h2 style="color: #92400e; margin: 0 0 8px 0;">Seus Ingressos (${order.tickets.length})</h2>
        ${ticketsHtml}

        <div style="text-align: center; margin-top: 24px; color: #9ca3af; font-size: 12px;">
          <p>Apresente o QR Code na entrada do evento.</p>
          <p>Arraiá nu Quintal 2</p>
        </div>
      </body>
      </html>
    `,
  })
}
