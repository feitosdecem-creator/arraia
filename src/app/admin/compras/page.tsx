import { prisma } from '@/lib/prisma'
import { serializeItemSummary } from '@/lib/purchases'
import { ComprasClient } from './ComprasClient'

export const dynamic = 'force-dynamic'

export default async function ComprasPage() {
  const items = await prisma.purchaseItem.findMany({
    include: { history: true },
    orderBy: { createdAt: 'desc' },
  })

  const data = items.map(serializeItemSummary)

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 28, gap: 16, flexWrap: 'wrap' }}>
        <div>
          <div className="fdc-eyebrow" style={{ marginBottom: 4 }}>Organização</div>
          <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: 'clamp(24px, 3vw, 40px)', fontWeight: 700, letterSpacing: '-0.03em', lineHeight: 1.0, color: 'var(--fdc-ink)', margin: 0 }}>
            Compras
          </h1>
        </div>
      </div>
      <ComprasClient items={data} />
    </div>
  )
}
