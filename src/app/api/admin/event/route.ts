import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function PATCH(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.isAdmin) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  const body = await req.json()
  const { id, name, description, date, location, imageUrl, isActive } = body

  if (!id) return NextResponse.json({ error: 'Evento não especificado' }, { status: 400 })
  if (!name?.trim() || !location?.trim() || !date) {
    return NextResponse.json({ error: 'Nome, data e local são obrigatórios' }, { status: 400 })
  }

  const parsedDate = new Date(date)
  if (isNaN(parsedDate.getTime())) {
    return NextResponse.json({ error: 'Data inválida' }, { status: 400 })
  }

  const event = await prisma.event.update({
    where: { id },
    data: {
      name: name.trim(),
      description: description?.trim() || null,
      date: parsedDate,
      location: location.trim(),
      imageUrl: imageUrl?.trim() || null,
      isActive: !!isActive,
    },
  })

  return NextResponse.json({ event })
}
