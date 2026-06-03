import { NextRequest, NextResponse } from 'next/server'
import { customAlphabet } from 'nanoid'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

const NEEDS_QUANTITY = ['DELIVERY', 'RETURN']

const genCode = customAlphabet('0123456789ABCDEFGHJKLMNPQRSTUVWXYZ', 6)

async function generateUniqueCode(): Promise<string> {
  for (let i = 0; i < 10; i++) {
    const code = genCode()
    const existing = await prisma.raffleStudent.findUnique({ where: { code } })
    if (!existing) return code
  }
  throw new Error('Failed to generate unique student code')
}

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.isAdmin) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  const body = await req.json()
  const { studentId, newStudent, type, quantity, amountPaid, paymentMethod, note } = body

  const validTypes = ['DELIVERY', 'RETURN', 'PAYMENT', 'NOTE']
  if (!type || !validTypes.includes(type)) {
    return NextResponse.json({ error: 'Tipo inválido' }, { status: 400 })
  }
  if (NEEDS_QUANTITY.includes(type) && (!quantity || quantity < 1)) {
    return NextResponse.json({ error: 'Quantidade inválida' }, { status: 400 })
  }
  if (type === 'NOTE' && !note?.trim()) {
    return NextResponse.json({ error: 'Observação não pode ser vazia' }, { status: 400 })
  }
  if (type === 'PAYMENT' && (!amountPaid || amountPaid < 1)) {
    return NextResponse.json({ error: 'Valor inválido' }, { status: 400 })
  }

  const parsedAmount =
    (type === 'RETURN' || type === 'PAYMENT') && typeof amountPaid === 'number' && amountPaid >= 0
      ? Math.round(amountPaid)
      : null

  let resolvedStudentId = studentId

  if (!resolvedStudentId && newStudent) {
    const { name, classroom, guardian, phone } = newStudent
    if (!name?.trim() || !classroom?.trim() || !guardian?.trim()) {
      return NextResponse.json({ error: 'Dados do aluno incompletos' }, { status: 400 })
    }
    const code = await generateUniqueCode()
    const created = await prisma.raffleStudent.create({
      data: {
        name: name.trim(),
        classroom: classroom.trim(),
        guardian: guardian.trim(),
        phone: phone?.trim() || null,
        code,
      },
    })
    resolvedStudentId = created.id
  }

  if (!resolvedStudentId) {
    return NextResponse.json({ error: 'Aluno não especificado' }, { status: 400 })
  }

  if (type === 'RETURN') {
    const transactions = await prisma.raffleTransaction.findMany({
      where: { studentId: resolvedStudentId },
    })
    const delivered = transactions.filter((t) => t.type === 'DELIVERY').reduce((s, t) => s + t.quantity, 0)
    const returned = transactions.filter((t) => t.type === 'RETURN').reduce((s, t) => s + t.quantity, 0)
    const balance = delivered - returned
    if (quantity > balance) {
      return NextResponse.json({ error: `Devolução maior que o saldo (${balance} bloquinho${balance !== 1 ? 's' : ''})` }, { status: 400 })
    }
  }

  // Assign sequential receipt number for PAYMENT transactions
  let receiptNumber: number | undefined
  if (type === 'PAYMENT') {
    const agg = await prisma.raffleTransaction.aggregate({ _max: { receiptNumber: true } })
    receiptNumber = (agg._max.receiptNumber ?? 0) + 1
  }

  const transaction = await prisma.raffleTransaction.create({
    data: {
      studentId: resolvedStudentId,
      type,
      quantity: NEEDS_QUANTITY.includes(type) ? quantity : 0,
      amountPaid: parsedAmount,
      paymentMethod: type === 'PAYMENT' && paymentMethod ? paymentMethod.trim() : null,
      receiptNumber,
      note: note?.trim() || null,
      createdBy: session.user.name ?? session.user.id,
    },
  })

  return NextResponse.json({ transaction, studentId: resolvedStudentId }, { status: 201 })
}
