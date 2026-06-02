import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const session = await auth()
  if (!session?.user?.isAdmin) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  const students = await prisma.raffleStudent.findMany({
    include: { transactions: { orderBy: { createdAt: 'asc' } } },
    orderBy: { name: 'asc' },
  })

  const data = students.map((s) => {
    const delivered = s.transactions.filter((t) => t.type === 'DELIVERY').reduce((sum, t) => sum + t.quantity, 0)
    const returned = s.transactions.filter((t) => t.type === 'RETURN').reduce((sum, t) => sum + t.quantity, 0)
    const deliveryCount = s.transactions.filter((t) => t.type === 'DELIVERY').length
    const totalPaid = s.transactions.filter((t) => t.type === 'RETURN').reduce((sum, t) => sum + (t.amountPaid ?? 0), 0)
    return {
      id: s.id,
      name: s.name,
      classroom: s.classroom,
      guardian: s.guardian,
      createdAt: s.createdAt.toISOString(),
      delivered,
      returned,
      balance: delivered - returned,
      deliveryCount,
      totalPaid,
      transactions: s.transactions.map((t) => ({
        id: t.id,
        type: t.type,
        quantity: t.quantity,
        amountPaid: t.amountPaid,
        note: t.note,
        createdBy: t.createdBy,
        createdAt: t.createdAt.toISOString(),
      })),
    }
  })

  return NextResponse.json({ students: data })
}

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.isAdmin) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  const body = await req.json()
  const { name, classroom, guardian } = body

  if (!name?.trim() || !classroom?.trim() || !guardian?.trim()) {
    return NextResponse.json({ error: 'Nome, turma e responsável são obrigatórios' }, { status: 400 })
  }

  const student = await prisma.raffleStudent.create({
    data: { name: name.trim(), classroom: classroom.trim(), guardian: guardian.trim() },
  })

  return NextResponse.json({ student }, { status: 201 })
}
