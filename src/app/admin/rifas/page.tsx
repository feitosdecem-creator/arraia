import { prisma } from '@/lib/prisma'
import { RaffleClient } from './RaffleClient'

export const dynamic = 'force-dynamic'

const BOOKLET_VALUE = 15000 // centavos

export default async function RifasPage() {
  const students = await prisma.raffleStudent.findMany({
    include: { transactions: { orderBy: { createdAt: 'asc' } } },
    orderBy: { name: 'asc' },
  })

  const data = students.map((s) => {
    const txs = s.transactions
    const delivered = txs.filter((t) => t.type === 'DELIVERY').reduce((sum, t) => sum + t.quantity, 0)
    const returned = txs.filter((t) => t.type === 'RETURN').reduce((sum, t) => sum + t.quantity, 0)
    const deliveryCount = txs.filter((t) => t.type === 'DELIVERY').length
    const totalPaid = txs
      .filter((t) => t.type === 'RETURN' || t.type === 'PAYMENT')
      .reduce((sum, t) => sum + (t.amountPaid ?? 0), 0)
    const expected = delivered * BOOKLET_VALUE
    const pending = Math.max(0, expected - totalPaid)
    const convRate = expected > 0 ? Math.round((totalPaid / expected) * 100) : 0

    return {
      id: s.id,
      name: s.name,
      classroom: s.classroom,
      guardian: s.guardian,
      phone: s.phone,
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
          <div className="fdc-eyebrow" style={{ marginBottom: 4 }}>Campanha</div>
          <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: 'clamp(24px, 3vw, 40px)', fontWeight: 700, letterSpacing: '-0.03em', lineHeight: 1.0, color: 'var(--fdc-ink)', margin: 0 }}>
            Rifas
          </h1>
        </div>
      </div>
      <RaffleClient students={data} />
    </div>
  )
}
