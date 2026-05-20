import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  if (searchParams.get('secret') !== 'd80e683b60d1c7d8dc79817185ee9132') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const event = await prisma.event.findFirst({ where: { isActive: true } })
  if (!event) return NextResponse.json({ error: 'No active event' }, { status: 404 })

  const updated = await prisma.event.update({
    where: { id: event.id },
    data: { name: 'Arraiá nu Quintal 2' },
  })

  return NextResponse.json({ ok: true, name: updated.name })
}
