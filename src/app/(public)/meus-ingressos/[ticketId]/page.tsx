import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import { generateQrCode } from '@/lib/qrcode'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import Image from 'next/image'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

type Props = { params: Promise<{ ticketId: string }> }

export default async function TicketPage({ params }: Props) {
  const { ticketId } = await params

  const ticket = await prisma.ticket.findUnique({
    where: { id: ticketId },
    include: {
      ticketType: {
        include: { event: true },
      },
      order: {
        include: { user: true },
      },
    },
  })

  if (!ticket) return notFound()

  const qrCode = await generateQrCode(ticket.code)
  const eventDate = format(ticket.ticketType.event.date, "EEEE, dd 'de' MMMM 'de' yyyy 'às' HH:mm", { locale: ptBR })
  const isUsed = !!ticket.usedAt

  return (
    <div className="max-w-sm mx-auto px-4 py-10">
      <Link href="/meus-ingressos" className="text-amber-600 hover:text-amber-800 text-sm mb-6 inline-block">
        ← Voltar
      </Link>

      <div className={`rounded-3xl overflow-hidden shadow-xl border-4 ${isUsed ? 'border-gray-300' : 'border-amber-400'}`}>
        {/* Header */}
        <div className={`p-6 text-center text-white ${isUsed ? 'bg-gray-500' : 'bg-gradient-to-br from-amber-500 to-red-500'}`}>
          <div className="text-4xl mb-2">🎪</div>
          <h1 className="text-xl font-extrabold">{ticket.ticketType.event.name}</h1>
          <p className="text-sm opacity-80 mt-1">{ticket.ticketType.name}</p>
        </div>

        {/* Body */}
        <div className="bg-white p-6">
          {/* Status badge */}
          <div className={`text-center text-sm font-bold px-4 py-2 rounded-full mb-6 ${isUsed ? 'bg-gray-100 text-gray-500' : 'bg-green-100 text-green-700'}`}>
            {isUsed ? `✗ Ingresso utilizado em ${format(ticket.usedAt!, "dd/MM/yyyy 'às' HH:mm")}` : '✓ Ingresso válido'}
          </div>

          {/* QR Code */}
          <div className="flex justify-center mb-6">
            <div className={`p-3 rounded-xl border-2 ${isUsed ? 'border-gray-200 opacity-40 grayscale' : 'border-amber-200'}`}>
              <Image src={qrCode} alt="QR Code" width={180} height={180} />
            </div>
          </div>

          <div className="text-center mb-4">
            <p className="text-xs text-gray-400 mb-1">Código</p>
            <p className="font-mono font-bold text-lg tracking-widest text-gray-800">{ticket.code}</p>
          </div>

          {/* Details */}
          <div className="space-y-3 border-t border-gray-100 pt-4">
            <div>
              <p className="text-xs text-gray-400">Comprador</p>
              <p className="font-semibold text-gray-800">{ticket.order.user.name}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400">Data do Evento</p>
              <p className="font-semibold text-gray-800 capitalize">{eventDate}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400">Local</p>
              <p className="font-semibold text-gray-800">{ticket.ticketType.event.location}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
