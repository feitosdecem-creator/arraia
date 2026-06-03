import { NextRequest, NextResponse } from 'next/server'
import { Prisma } from '@prisma/client'
import { customAlphabet } from 'nanoid'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

const BOOKLET_VALUE = 15000 // centavos (R$150)

const genCode = customAlphabet('0123456789ABCDEFGHJKLMNPQRSTUVWXYZ', 6)

async function generateUniqueCode(): Promise<string> {
  for (let i = 0; i < 10; i++) {
    const code = genCode()
    const existing = await prisma.raffleStudent.findUnique({ where: { code } })
    if (!existing) return code
  }
  throw new Error('Failed to generate unique student code')
}

type StudentWithTx = Prisma.RaffleStudentGetPayload<{ include: { transactions: true } }>

function computeStudent(s: StudentWithTx) {
  const txs = s.transactions
  const delivered = txs.filter((t) => t.type === 'DELIVERY').reduce((sum, t) => sum + t.quantity, 0)
  const returned = txs.filter((t) => t.type === 'RETURN').reduce((sum, t) => sum + t.quantity, 0)
  const deliveryCount = txs.filter((t) => t.type === 'DELIVERY').length
  const totalPaid =
    txs.filter((t) => t.type === 'RETURN' || t.type === 'PAYMENT').reduce((sum, t) => sum + (t.amountPaid ?? 0), 0)
  const expected = delivered * BOOKLET_VALUE
  const pending = Math.max(0, expected - totalPaid)
  const convRate = expected > 0 ? Math.round((totalPaid / expected) * 100) : 0

  return {
    id: s.id,
    name: s.name,
    classroom: s.classroom,
    guardian: s.guardian,
    phone: s.phone,
    code: s.code,
    createdAt: s.createdAt.toISOString(),
    delivered,
    returned,
    balance: delivered - returned,
    deliveryCount,
    totalPaid,
    expected,
    pending,
    convRate,
    transactions: txs.map((t) => ({
      id: t.id,
      type: t.type as 'DELIVERY' | 'RETURN' | 'PAYMENT' | 'NOTE',
      quantity: t.quantity,
      amountPaid: t.amountPaid,
      paymentMethod: t.paymentMethod,
      receiptNumber: t.receiptNumber,
      note: t.note,
      createdBy: t.createdBy,
      createdAt: t.createdAt.toISOString(),
    })),
  }
}

export async function GET() {
  const session = await auth()
  if (!session?.user?.isAdmin) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  const students = await prisma.raffleStudent.findMany({
    include: { transactions: { orderBy: { createdAt: 'asc' } } },
    orderBy: { name: 'asc' },
  })

  return NextResponse.json({ students: students.map(computeStudent) })
}

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.isAdmin) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  const body = await req.json()
  const { name, classroom, guardian, phone } = body

  if (!name?.trim() || !classroom?.trim() || !guardian?.trim()) {
    return NextResponse.json({ error: 'Nome, turma e responsável são obrigatórios' }, { status: 400 })
  }

  const code = await generateUniqueCode()

  const student = await prisma.raffleStudent.create({
    data: {
      name: name.trim(),
      classroom: classroom.trim(),
      guardian: guardian.trim(),
      phone: phone?.trim() || null,
      code,
    },
  })

  return NextResponse.json({ student }, { status: 201 })
}
