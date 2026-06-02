import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.isAdmin) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  const body = await req.json()
  const { studentId, newStudent, type, quantity, amountPaid, note } = body

  if (!type || !quantity || quantity < 1) {
    return NextResponse.json({ error: 'Dados inválidos' }, { status: 400 })
  }
  if (type !== 'DELIVERY' && type !== 'RETURN') {
    return NextResponse.json({ error: 'Tipo inválido' }, { status: 400 })
  }

  let resolvedStudentId = studentId

  // Create student inline if needed
  if (!resolvedStudentId && newStudent) {
    const { name, classroom, guardian } = newStudent
    if (!name?.trim() || !classroom?.trim() || !guardian?.trim()) {
      return NextResponse.json({ error: 'Dados do aluno incompletos' }, { status: 400 })
    }
    const created = await prisma.raffleStudent.create({
      data: { name: name.trim(), classroom: classroom.trim(), guardian: guardian.trim() },
    })
    resolvedStudentId = created.id
  }

  if (!resolvedStudentId) {
    return NextResponse.json({ error: 'Aluno não especificado' }, { status: 400 })
  }

  // For RETURN: validate balance
  if (type === 'RETURN') {
    const transactions = await prisma.raffleTransaction.findMany({
      where: { studentId: resolvedStudentId },
    })
    const delivered = transactions.filter((t) => t.type === 'DELIVERY').reduce((sum, t) => sum + t.quantity, 0)
    const returned = transactions.filter((t) => t.type === 'RETURN').reduce((sum, t) => sum + t.quantity, 0)
    const balance = delivered - returned
    if (quantity > balance) {
      return NextResponse.json({ error: `Devolução maior que o saldo (${balance} bloquinho${balance !== 1 ? 's' : ''})` }, { status: 400 })
    }
  }

  // amountPaid stored in centavos; only relevant for RETURN
  const parsedAmount =
    type === 'RETURN' && typeof amountPaid === 'number' && amountPaid >= 0
      ? Math.round(amountPaid)
      : null

  const transaction = await prisma.raffleTransaction.create({
    data: {
      studentId: resolvedStudentId,
      type,
      quantity,
      amountPaid: parsedAmount,
      note: note?.trim() || null,
      createdBy: session.user.name ?? session.user.id,
    },
  })

  return NextResponse.json({ transaction, studentId: resolvedStudentId }, { status: 201 })
}
