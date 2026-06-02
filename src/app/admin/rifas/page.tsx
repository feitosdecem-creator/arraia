import { prisma } from '@/lib/prisma'
import { RaffleClient } from './RaffleClient'

export const dynamic = 'force-dynamic'

export default async function RifasPage() {
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
        type: t.type as 'DELIVERY' | 'RETURN',
        quantity: t.quantity,
        amountPaid: t.amountPaid,
        note: t.note,
        createdBy: t.createdBy,
        createdAt: t.createdAt.toISOString(),
      })),
    }
  })

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 28, gap: 16, flexWrap: 'wrap' }}>
        <div>
          <div className="fdc-eyebrow" style={{ marginBottom: 4 }}>Controle</div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(24px, 3vw, 40px)', fontWeight: 700, letterSpacing: '-0.03em', lineHeight: 1.0, color: 'var(--fg-1)', margin: 0 }}>
            Rifas
          </h1>
        </div>
      </div>
      <RaffleClient students={data} />
    </div>
  )
}
