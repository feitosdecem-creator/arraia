import { NextRequest, NextResponse } from 'next/server'
import { PurchaseCategory } from '@prisma/client'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { serializeItemSummary } from '@/lib/purchases'

export async function GET() {
  const session = await auth()
  if (!session?.user?.isAdmin) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  const items = await prisma.purchaseItem.findMany({
    include: { history: true },
    orderBy: { createdAt: 'desc' },
  })

  return NextResponse.json({ items: items.map(serializeItemSummary) })
}

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.isAdmin) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  const body = await req.json()
  const { name, category, quantity, unit, expectedValue, responsavel, observacao } = body

  if (!name?.trim()) return NextResponse.json({ error: 'Nome do item é obrigatório' }, { status: 400 })
  if (!responsavel?.trim()) return NextResponse.json({ error: 'Responsável é obrigatório' }, { status: 400 })
  if (!category || !Object.values(PurchaseCategory).includes(category)) {
    return NextResponse.json({ error: 'Categoria inválida' }, { status: 400 })
  }
  if (typeof quantity !== 'number' || quantity <= 0) {
    return NextResponse.json({ error: 'Quantidade inválida' }, { status: 400 })
  }
  if (typeof expectedValue !== 'number' || expectedValue < 0) {
    return NextResponse.json({ error: 'Valor previsto inválido' }, { status: 400 })
  }

  const createdBy = session.user.name ?? session.user.id

  const item = await prisma.purchaseItem.create({
    data: {
      name: name.trim(),
      category: category as PurchaseCategory,
      quantity,
      unit: unit?.trim() || 'un',
      expectedValue: Math.round(expectedValue),
      responsavel: responsavel.trim(),
      observacao: observacao?.trim() || null,
      history: {
        create: { description: 'Item criado', createdBy },
      },
    },
    include: { history: true },
  })

  return NextResponse.json({ item: serializeItemSummary(item) }, { status: 201 })
}
