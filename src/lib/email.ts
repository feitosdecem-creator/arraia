import { Resend } from 'resend'
import { prisma } from '@/lib/prisma'
import { generateQrCode } from '@/lib/qrcode'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

function getResend() {
  if (!process.env.RESEND_API_KEY) throw new Error('Missing RESEND_API_KEY')
  return new Resend(process.env.RESEND_API_KEY)
}

// Escape user-supplied strings before inserting into HTML
function esc(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

export async function sendTicketEmail(orderId: string): Promise<void> {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      user: true,
      tickets: {
        include: {
          ticketType: {
            include: { event: true },
          },
        },
      },
    },
  })

  if (!order) throw new Error('Order not found')

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://arraia.feitosdecem.com.br'

  const ticketsWithQr = await Promise.all(
    order.tickets.map(async (ticket) => {
      const qrCode = await generateQrCode(ticket.code)
      return { ...ticket, qrCode }
    })
  )

  const event = order.tickets[0]?.ticketType.event
  if (!event) throw new Error('Event not found')

  const eventDate = format(event.date, "EEEE',' dd 'de' MMMM 'de' yyyy 'às' HH:mm", {
    locale: ptBR,
  })
  const eventDateDisplay = eventDate.charAt(0).toUpperCase() + eventDate.slice(1)

  const totalFormatted = (order.totalAmount / 100).toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  })

  const ticketsHtml = ticketsWithQr
    .map(
      (ticket) => `
    <div style="border-radius:16px;overflow:hidden;margin:16px 0;background:#ffffff;border:1px solid #e8e2da;">
      <!-- Ticket header -->
      <div style="background:#1a0f08;padding:20px 24px;">
        <div style="font-size:10px;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:#f5a832;margin-bottom:6px;">
          Ingresso Oficial · Feitos de Cem
        </div>
        <div style="font-size:20px;font-weight:800;color:#faf5ef;line-height:1.1;">
          ${esc(event.name)}
        </div>
        <div style="font-size:12px;color:rgba(250,245,239,0.7);margin-top:6px;">
          ${esc(eventDateDisplay)} · ${esc(event.location)}
        </div>
      </div>
      <!-- Ticket body -->
      <div style="padding:20px 24px;">
        <table style="width:100%;border-collapse:collapse;">
          <tr>
            <td style="padding:0 16px 0 0;vertical-align:top;width:60%;">
              <div style="margin-bottom:14px;">
                <div style="font-size:9px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;color:#9e9087;margin-bottom:3px;">Portador</div>
                <div style="font-size:15px;font-weight:700;color:#1a1512;">${esc(order.user.name)}</div>
              </div>
              <div style="margin-bottom:14px;">
                <div style="font-size:9px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;color:#9e9087;margin-bottom:3px;">Tipo de ingresso</div>
                <div style="display:inline-block;background:rgba(232,98,42,0.09);border:1px solid rgba(232,98,42,0.22);border-radius:6px;padding:4px 10px;font-size:13px;font-weight:700;color:#e8622a;">
                  ${esc(ticket.ticketType.name)}
                </div>
              </div>
              <div>
                <div style="font-size:9px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;color:#9e9087;margin-bottom:3px;">Código</div>
                <div style="font-family:monospace;font-size:14px;font-weight:700;color:#1a1512;letter-spacing:1px;">${esc(ticket.code)}</div>
              </div>
            </td>
            <td style="padding:0;vertical-align:middle;text-align:center;border-left:1px solid #e8e2da;padding-left:16px;">
              <img src="${ticket.qrCode}" alt="QR Code" width="120" height="120"
                   style="display:block;margin:0 auto;border-radius:8px;" />
              <div style="font-size:9px;color:#9e9087;margin-top:6px;">Apresente na entrada</div>
            </td>
          </tr>
        </table>
      </div>
      <!-- CTA -->
      <div style="padding:14px 24px;background:#faf7f2;border-top:1px solid #e8e2da;text-align:center;">
        <a href="${appUrl}/meus-ingressos/${encodeURIComponent(ticket.id)}"
           style="display:inline-block;background:#e8622a;color:#ffffff;padding:10px 24px;border-radius:10px;text-decoration:none;font-weight:700;font-size:14px;">
          Ver ingresso digital →
        </a>
      </div>
    </div>
  `
    )
    .join('')

  const resend = getResend()
  await resend.emails.send({
    from: 'Arraiá nu Quintal 2 <ingressos@feitosdecem.com.br>',
    to: order.user.email,
    subject: `Seus ingressos — ${esc(event.name)}`,
    html: `
      <!DOCTYPE html>
      <html lang="pt-BR">
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width,initial-scale=1">
        <title>Seus ingressos</title>
      </head>
      <body style="font-family:Arial,sans-serif;background:#f5f0eb;margin:0;padding:20px;">
        <div style="max-width:600px;margin:0 auto;">

          <!-- Header -->
          <div style="background:#1a0f08;border-radius:16px;padding:32px 28px;text-align:center;margin-bottom:20px;">
            <div style="font-size:10px;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:#f5a832;margin-bottom:10px;">
              Feitos de Cem
            </div>
            <h1 style="color:#faf5ef;margin:0 0 8px;font-size:26px;font-weight:800;letter-spacing:-0.5px;">
              ${esc(event.name)}
            </h1>
            <p style="color:rgba(250,245,239,0.65);margin:0;font-size:14px;">
              Seu pagamento foi confirmado 🎉
            </p>
          </div>

          <!-- Greeting -->
          <div style="background:#ffffff;border-radius:14px;padding:22px 24px;margin-bottom:16px;border:1px solid #e8e2da;">
            <p style="margin:0 0 6px;font-size:16px;font-weight:700;color:#1a1512;">
              Olá, ${esc(order.user.name)}!
            </p>
            <p style="margin:0;font-size:14px;color:#6b5f56;line-height:1.6;">
              Seus ingressos para o <strong>${esc(event.name)}</strong> estão prontos.
              Apresente o QR Code na entrada do evento.
            </p>
            <p style="margin:12px 0 0;font-size:13px;color:#9e9087;">
              Total pago: <strong style="color:#1a1512;">${totalFormatted}</strong>
            </p>
          </div>

          <!-- Tickets -->
          <h2 style="font-size:13px;font-weight:700;letter-spacing:1px;text-transform:uppercase;color:#9e9087;margin:0 0 8px;">
            ${order.tickets.length} ingresso${order.tickets.length !== 1 ? 's' : ''}
          </h2>
          ${ticketsHtml}

          <!-- Footer -->
          <div style="text-align:center;margin-top:28px;padding:16px;font-size:12px;color:#b8a898;line-height:1.6;">
            <p style="margin:0 0 4px;">Dúvidas? Fale com a organização do evento.</p>
            <p style="margin:0;color:#c8b8a8;font-weight:700;letter-spacing:0.5px;">FEITOS DE CEM</p>
          </div>

        </div>
      </body>
      </html>
    `,
  })
}

export async function sendPasswordResetEmail(email: string, name: string, token: string): Promise<void> {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://arraia.feitosdecem.com.br'
  const resetUrl = `${appUrl}/redefinir-senha?token=${encodeURIComponent(token)}`
  const resend = getResend()
  await resend.emails.send({
    from: 'Arraiá nu Quintal 2 <ingressos@feitosdecem.com.br>',
    to: email,
    subject: 'Redefinir senha — Arraiá nu Quintal 2',
    html: `
      <!DOCTYPE html>
      <html lang="pt-BR">
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width,initial-scale=1">
        <title>Redefinir senha</title>
      </head>
      <body style="font-family:Arial,sans-serif;background:#f5f0eb;margin:0;padding:20px;">
        <div style="max-width:600px;margin:0 auto;">

          <!-- Header -->
          <div style="background:#1a0f08;border-radius:16px;padding:32px 28px;text-align:center;margin-bottom:20px;">
            <div style="font-size:10px;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:#f5a832;margin-bottom:10px;">
              Feitos de Cem
            </div>
            <h1 style="color:#faf5ef;margin:0 0 8px;font-size:26px;font-weight:800;letter-spacing:-0.5px;">
              Arraiá nu Quintal 2
            </h1>
            <p style="color:rgba(250,245,239,0.65);margin:0;font-size:14px;">
              Redefinição de senha
            </p>
          </div>

          <!-- Card -->
          <div style="background:#ffffff;border-radius:14px;padding:28px 24px;margin-bottom:16px;border:1px solid #e8e2da;">
            <p style="margin:0 0 8px;font-size:16px;font-weight:700;color:#1a1512;">
              Olá, ${esc(name)}!
            </p>
            <p style="margin:0 0 20px;font-size:14px;color:#6b5f56;line-height:1.6;">
              Recebemos uma solicitação para redefinir a senha da sua conta.
              Clique no botão abaixo para criar uma nova senha.
            </p>
            <div style="text-align:center;margin-bottom:20px;">
              <a href="${resetUrl}"
                 style="display:inline-block;background:#e8622a;color:#ffffff;padding:14px 32px;border-radius:10px;text-decoration:none;font-weight:700;font-size:15px;">
                Redefinir minha senha →
              </a>
            </div>
            <p style="margin:0;font-size:12px;color:#9e9087;line-height:1.6;">
              Este link expira em <strong>1 hora</strong>. Se você não solicitou a redefinição de senha, pode ignorar este e-mail com segurança.
            </p>
          </div>

          <!-- Footer -->
          <div style="text-align:center;margin-top:28px;padding:16px;font-size:12px;color:#b8a898;line-height:1.6;">
            <p style="margin:0 0 4px;">Dúvidas? Fale com a organização do evento.</p>
            <p style="margin:0;color:#c8b8a8;font-weight:700;letter-spacing:0.5px;">FEITOS DE CEM</p>
          </div>

        </div>
      </body>
      </html>
    `,
  })
}
