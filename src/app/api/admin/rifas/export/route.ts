import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const session = await auth()
  if (!session?.user?.isAdmin) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  const students = await prisma.raffleStudent.findMany({
    include: { transactions: true },
    orderBy: { name: 'asc' },
  })

  const rows = students.map((s) => {
    const delivered = s.transactions.filter((t) => t.type === 'DELIVERY').reduce((sum, t) => sum + t.quantity, 0)
    const returned = s.transactions.filter((t) => t.type === 'RETURN').reduce((sum, t) => sum + t.quantity, 0)
    const balance = delivered - returned
    const status = delivered === 0 ? 'Sem entregas' : balance === 0 ? 'Em dia' : 'Em circulação'
    return [s.name, s.classroom, s.guardian, delivered, returned, balance, balance * 30, status]
  })

  const header = ['Nome', 'Turma', 'Responsável', 'Bloquinhos Entregues', 'Bloquinhos Devolvidos', 'Em Circulação', 'Rifas Estimadas', 'Status']
  const csv = [header, ...rows].map((row) => row.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(',')).join('\n')

  return new NextResponse(csv, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="rifas-${new Date().toISOString().slice(0, 10)}.csv"`,
    },
  })
}
