import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session?.user?.isAdmin) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  const { id } = await params
  const body = await req.json()
  const { name, classroom, guardian, phone } = body

  const data: Record<string, string | null> = {}
  if (name?.trim()) data.name = name.trim()
  if (classroom?.trim()) data.classroom = classroom.trim()
  if (guardian?.trim()) data.guardian = guardian.trim()
  if (phone !== undefined) data.phone = phone?.trim() || null

  if (Object.keys(data).length === 0) {
    return NextResponse.json({ error: 'Nenhum campo para atualizar' }, { status: 400 })
  }

  const student = await prisma.raffleStudent.update({ where: { id }, data })
  return NextResponse.json({ student })
}
