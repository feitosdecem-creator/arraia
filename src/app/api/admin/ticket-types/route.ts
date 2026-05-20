import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(req: Request) {
  const session = await auth()
  if (!session?.user?.isAdmin) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  }

  const body = await req.json()
  const { eventId, name, description, price, stock, sortOrder } = body

  const ticketType = await prisma.ticketType.create({
    data: {
      eventId,
      name,
      description,
      price,
      stock,
      sortOrder: sortOrder ?? 99,
    },
  })

  return NextResponse.json(ticketType, { status: 201 })
}
