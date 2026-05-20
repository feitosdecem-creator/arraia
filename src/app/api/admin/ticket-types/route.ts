import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const createSchema = z.object({
  eventId: z.string().min(1),
  name: z.string().min(1).max(100),
  description: z.string().max(500).nullable().optional(),
  price: z.number().int().min(0),
  stock: z.number().int().min(1),
  sortOrder: z.number().int().min(0).optional(),
})

export async function POST(req: Request) {
  const session = await auth()
  if (!session?.user?.isAdmin) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  }

  const body = await req.json()
  const parsed = createSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Dados inválidos', details: parsed.error.flatten() }, { status: 400 })
  }

  const { eventId, name, description, price, stock, sortOrder } = parsed.data

  const ticketType = await prisma.ticketType.create({
    data: {
      eventId,
      name,
      description: description ?? null,
      price,
      stock,
      sortOrder: sortOrder ?? 99,
    },
  })

  return NextResponse.json(ticketType, { status: 201 })
}
