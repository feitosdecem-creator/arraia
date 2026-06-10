import { NextRequest, NextResponse } from 'next/server'
import { Prisma, PurchaseCategory, PurchaseStatus } from '@prisma/client'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { serializeItem, fmtBRL, formatQty, STATUS_LABELS, PAYMENT_METHOD_LABELS } from '@/lib/purchases'

type Props = { params: Promise<{ id: string }> }

export async function GET(_req: NextRequest, { params }: Props) {
  const session = await auth()
  if (!session?.user?.isAdmin) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  const { id } = await params
  const item = await prisma.purchaseItem.findUnique({ where: { id }, include: { history: true } })
  if (!item) return NextResponse.json({ error: 'Item não encontrado' }, { status: 404 })

  return NextResponse.json({ item: serializeItem(item) })
}

export async function PATCH(req: NextRequest, { params }: Props) {
  const session = await auth()
  if (!session?.user?.isAdmin) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  const { id } = await params
  const current = await prisma.purchaseItem.findUnique({ where: { id } })
  if (!current) return NextResponse.json({ error: 'Item não encontrado' }, { status: 404 })

  const body = await req.json()
  const createdBy = session.user.name ?? session.user.id

  const data: Prisma.PurchaseItemUpdateInput = {}
  const historyEntries: { description: string; createdBy: string }[] = []
  const editedFields: string[] = []

  if (typeof body.name === 'string' && body.name.trim() && body.name.trim() !== current.name) {
    data.name = body.name.trim()
    editedFields.push('nome')
  }
  if (typeof body.category === 'string' && body.category !== current.category) {
    if (!Object.values(PurchaseCategory).includes(body.category)) {
      return NextResponse.json({ error: 'Categoria inválida' }, { status: 400 })
    }
    data.category = body.category as PurchaseCategory
    editedFields.push('categoria')
  }
  const newUnit = typeof body.unit === 'string' && body.unit.trim() ? body.unit.trim() : current.unit
  if (newUnit !== current.unit) {
    data.unit = newUnit
    editedFields.push('unidade')
  }
  if (typeof body.responsavel === 'string' && body.responsavel.trim() && body.responsavel.trim() !== current.responsavel) {
    data.responsavel = body.responsavel.trim()
    editedFields.push('responsável')
  }
  if (typeof body.observacao === 'string' && body.observacao.trim() !== (current.observacao ?? '')) {
    data.observacao = body.observacao.trim() || null
    editedFields.push('observação')
  }
  if (typeof body.quantity === 'number' && body.quantity > 0 && body.quantity !== current.quantity) {
    historyEntries.push({
      description: `Quantidade alterada: ${formatQty(current.quantity, current.unit)} → ${formatQty(body.quantity, newUnit)}`,
      createdBy,
    })
    data.quantity = body.quantity
  }
  if (typeof body.expectedValue === 'number' && body.expectedValue >= 0) {
    const rounded = Math.round(body.expectedValue)
    if (rounded !== current.expectedValue) {
      historyEntries.push({
        description: `Valor previsto alterado: ${fmtBRL(current.expectedValue)} → ${fmtBRL(rounded)}`,
        createdBy,
      })
      data.expectedValue = rounded
    }
  }
  if (editedFields.length > 0) {
    historyEntries.push({ description: `Detalhes atualizados: ${editedFields.join(', ')}`, createdBy })
  }

  // Registrar compra — define valor pago, fornecedor, data, forma de pagamento
  // e comprovante; promove o item para "Comprado" automaticamente.
  const isRegisteringPurchase = typeof body.paidValue === 'number' && body.paidValue >= 0
  if (isRegisteringPurchase) {
    const paidValue = Math.round(body.paidValue)
    const fornecedor = typeof body.fornecedor === 'string' ? (body.fornecedor.trim() || null) : current.fornecedor
    const paymentMethod = typeof body.paymentMethod === 'string' ? (body.paymentMethod.trim() || null) : current.paymentMethod
    let purchaseDate = current.purchaseDate
    if (typeof body.purchaseDate === 'string' && body.purchaseDate) {
      const d = new Date(body.purchaseDate)
      if (!isNaN(d.getTime())) purchaseDate = d
    }
    if (!purchaseDate) purchaseDate = new Date()
    const receiptUrl = typeof body.receiptUrl === 'string' && body.receiptUrl ? body.receiptUrl : current.receiptUrl

    data.paidValue = paidValue
    data.fornecedor = fornecedor
    data.paymentMethod = paymentMethod
    data.purchaseDate = purchaseDate
    data.receiptUrl = receiptUrl

    let msg = `Compra registrada — ${fmtBRL(paidValue)}`
    if (fornecedor) msg += ` em ${fornecedor}`
    if (paymentMethod) msg += ` via ${PAYMENT_METHOD_LABELS[paymentMethod] ?? paymentMethod}`
    if (typeof body.purchaseNote === 'string' && body.purchaseNote.trim()) msg += ` — ${body.purchaseNote.trim()}`
    historyEntries.push({ description: msg, createdBy })

    if (current.status === 'PLANEJADO' || current.status === 'EM_COTACAO') {
      data.status = 'COMPRADO'
      historyEntries.push({
        description: `Status alterado: ${STATUS_LABELS[current.status]} → ${STATUS_LABELS.COMPRADO}`,
        createdBy,
      })
    }
  } else if (typeof body.receiptUrl === 'string' && body.receiptUrl && body.receiptUrl !== current.receiptUrl) {
    data.receiptUrl = body.receiptUrl
    historyEntries.push({ description: 'Comprovante anexado', createdBy })
  }

  // Transição direta de status (ex.: marcar "Em Cotação", "Recebido", "Cancelado")
  if (typeof body.status === 'string' && data.status === undefined && body.status !== current.status) {
    if (!Object.values(PurchaseStatus).includes(body.status)) {
      return NextResponse.json({ error: 'Status inválido' }, { status: 400 })
    }
    data.status = body.status as PurchaseStatus
    historyEntries.push({
      description: `Status alterado: ${STATUS_LABELS[current.status]} → ${STATUS_LABELS[body.status as PurchaseStatus]}`,
      createdBy,
    })
  }

  if (Object.keys(data).length === 0 && historyEntries.length === 0) {
    return NextResponse.json({ error: 'Nada para atualizar' }, { status: 400 })
  }

  const item = await prisma.purchaseItem.update({
    where: { id },
    data: {
      ...data,
      ...(historyEntries.length > 0 ? { history: { create: historyEntries } } : {}),
    },
    include: { history: true },
  })

  return NextResponse.json({ item: serializeItem(item) })
}
