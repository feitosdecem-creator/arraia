import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const updateSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  description: z.string().max(500).nullable().optional(),
  price: z.number().int().min(0).optional(),
  stock: z.number().int().min(0).optional(),
  isActive: z.boolean().optional(),
})

type Params = { params: Promise<{ id: string }> }

export async function PATCH(req: Request, { params }: Params) {
  const session = await auth()
  if (!session?.user?.isAdmin) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  }

  const { id } = await params
  const body = await req.json()
  const parsed = updateSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Dados inválidos', details: parsed.error.flatten() }, { status: 400 })
  }

  const { name, description, price, stock, isActive } = parsed.data

  const tt = await prisma.ticketType.findUnique({ where: { id } })
  if (!tt) return NextResponse.json({ error: 'Não encontrado' }, { status: 404 })

  if (typeof stock === 'number' && stock < tt.sold) {
    return NextResponse.json(
      { error: `Estoque não pode ser menor que os já vendidos (${tt.sold})` },
      { status: 400 },
    )
  }

  const updated = await prisma.ticketType.update({
    where: { id },
    data: {
      ...(name !== undefined && { name }),
      ...(description !== undefined && { description }),
      ...(price !== undefined && { price }),
      ...(stock !== undefined && { stock }),
      ...(isActive !== undefined && { isActive }),
    },
  })

  return NextResponse.json(updated)
}

export async function DELETE(_req: Request, { params }: Params) {
  const session = await auth()
  if (!session?.user?.isAdmin) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  }

  const { id } = await params

  const tt = await prisma.ticketType.findUnique({
    where: { id },
    include: { _count: { select: { tickets: true } } },
  })
  if (!tt) return NextResponse.json({ error: 'Não encontrado' }, { status: 404 })

  if (tt._count.tickets > 0) {
    return NextResponse.json(
      { error: `Não é possível excluir: ${tt._count.tickets} ingresso(s) já emitido(s).` },
      { status: 400 },
    )
  }

  await prisma.ticketType.delete({ where: { id } })
  return NextResponse.json({ ok: true })
}
