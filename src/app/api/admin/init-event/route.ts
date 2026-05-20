import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

const SECRET = 'd80e683b60d1c7d8dc79817185ee9132'

export async function GET(req: NextRequest) {
  if (req.nextUrl.searchParams.get('secret') !== SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const event = await prisma.event.findFirst({ where: { isActive: true } })
  if (!event) return NextResponse.json({ error: 'No active event' }, { status: 404 })

  await prisma.event.update({
    where: { id: event.id },
    data: {
      date: new Date('2026-06-19T21:30:00.000Z'), // 18:30 BRT = 21:30 UTC
      location: 'Quintal Escola Feitos de Cem',
    },
  })

  const types = await prisma.ticketType.findMany({ where: { eventId: event.id } })
  const updated: string[] = []
  for (const tt of types) {
    const n = tt.name.toLowerCase()
    if (n.includes('inteira') || n.includes('adulto')) {
      await prisma.ticketType.update({ where: { id: tt.id }, data: { price: 1800 } })
      updated.push(`${tt.name} → R$ 18,00`)
    } else if (n.includes('meia') || n.includes('estudante')) {
      await prisma.ticketType.update({ where: { id: tt.id }, data: { price: 1000 } })
      updated.push(`${tt.name} → R$ 10,00`)
    }
  }

  return NextResponse.json({
    ok: true,
    event: event.name,
    date: '19/06/2026 às 18:30',
    location: 'Quintal Escola Feitos de Cem',
    tickets: updated,
  })
}
