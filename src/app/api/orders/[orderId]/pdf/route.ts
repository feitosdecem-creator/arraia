import { NextRequest, NextResponse } from 'next/server'
import { generateTicketsPdf } from '@/lib/pdf'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'
import { rateLimitKey } from '@/lib/ratelimit'

type Props = { params: Promise<{ orderId: string }> }

export async function GET(_req: NextRequest, { params }: Props) {
  try {
    const { orderId } = await params
    const session = await auth()

    const { allowed } = rateLimitKey(`pdf:${orderId}`, 10, 60 * 60_000)
    if (!allowed) {
      return NextResponse.json({ error: 'Muitos downloads. Aguarde 1 hora.' }, { status: 429 })
    }

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      select: { userId: true, status: true },
    })

    if (!order) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }

    const isOwner = session?.user?.id === order.userId
    const isAdmin = session?.user?.isAdmin === true

    if (!isOwner && !isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (order.status !== 'PAID') {
      return NextResponse.json({ error: 'Order not paid' }, { status: 400 })
    }

    const buffer = await generateTicketsPdf(orderId)

    return new NextResponse(buffer as unknown as BodyInit, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="ingressos-${orderId}.pdf"`,
      },
    })
  } catch (err) {
    console.error('PDF generation error:', err)
    return NextResponse.json({ error: 'Erro ao gerar PDF' }, { status: 500 })
  }
}
