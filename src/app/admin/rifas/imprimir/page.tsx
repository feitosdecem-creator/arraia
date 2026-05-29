import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { PrintButton } from './PrintButton'

export const dynamic = 'force-dynamic'

export default async function RiffasPrintPage() {
  const session = await auth()
  if (!session?.user?.isAdmin) redirect('/admin')

  const students = await prisma.raffleStudent.findMany({
    include: { transactions: true },
    orderBy: { name: 'asc' },
  })

  const data = students.map((s) => {
    const delivered = s.transactions.filter((t) => t.type === 'DELIVERY').reduce((sum, t) => sum + t.quantity, 0)
    const returned = s.transactions.filter((t) => t.type === 'RETURN').reduce((sum, t) => sum + t.quantity, 0)
    const balance = delivered - returned
    return { name: s.name, delivered, returned, balance }
  })

  const totalDelivered = data.reduce((sum, s) => sum + s.delivered, 0)
  const totalReturned = data.reduce((sum, s) => sum + s.returned, 0)
  const totalBalance = data.reduce((sum, s) => sum + s.balance, 0)

  const today = new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' })

  return (
    <>
      <style>{`
        @media print {
          .no-print { display: none !important; }
          @page { margin: 1.5cm; }
        }
        * { box-sizing: border-box; }
        body { font-family: Arial, Helvetica, sans-serif; font-size: 13px; color: #111; background: #fff; }
        table { width: 100%; border-collapse: collapse; }
        th, td { border: 1px solid #ccc; padding: 7px 10px; text-align: left; }
        th { background: #f0f0f0; font-weight: 700; font-size: 11px; text-transform: uppercase; letter-spacing: 0.05em; }
        td.num { text-align: center; font-weight: 600; }
        tr:nth-child(even) { background: #fafafa; }
        tfoot td { background: #f0f0f0; font-weight: 700; }
        .balance-zero { color: #2e7d32; }
        .balance-pos { color: #b45309; }
      `}</style>

      {/* Toolbar - hidden when printing */}
      <div className="no-print" style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '16px 24px', borderBottom: '1px solid #e5e5e5', background: '#fff', position: 'sticky', top: 0, zIndex: 10 }}>
        <a href="/admin/rifas" style={{ fontSize: 13, color: '#555', textDecoration: 'none' }}>← Voltar</a>
        <div style={{ flex: 1 }} />
        <span style={{ fontSize: 12, color: '#888' }}>Atualizado em {today}</span>
        <PrintButton />
      </div>

      <div style={{ maxWidth: 900, margin: '0 auto', padding: '28px 24px' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#888', marginBottom: 4 }}>
            Arraiá nu Quintal 2
          </div>
          <h1 style={{ margin: 0, fontSize: 24, fontWeight: 800, letterSpacing: '-0.02em' }}>Controle de Rifas</h1>
          <p style={{ margin: '6px 0 0', fontSize: 12, color: '#666' }}>
            Impresso em {today} · {students.length} alunos · {totalBalance} bloquinho{totalBalance !== 1 ? 's' : ''} em circulação ({totalBalance * 30} rifas estimadas)
          </p>
        </div>

        {/* Table */}
        <table>
          <thead>
            <tr>
              <th style={{ width: 32 }}>#</th>
              <th>Nome</th>
              <th style={{ width: 80 }}>Entregues</th>
              <th style={{ width: 80 }}>Devolvidos</th>
              <th style={{ width: 60 }}>Saldo</th>
              <th style={{ width: 180 }}>Entregue por</th>
              <th style={{ width: 100 }}>Ass.</th>
            </tr>
          </thead>
          <tbody>
            {data.map((s, i) => (
              <tr key={s.name}>
                <td className="num" style={{ color: '#999', fontSize: 11 }}>{i + 1}</td>
                <td style={{ fontWeight: 500 }}>{s.name}</td>
                <td className="num">{s.delivered || '—'}</td>
                <td className="num">{s.returned || '—'}</td>
                <td className={`num ${s.balance === 0 && s.delivered > 0 ? 'balance-zero' : s.balance > 0 ? 'balance-pos' : ''}`}>
                  {s.delivered === 0 ? '—' : s.balance}
                </td>
                <td></td>
                <td></td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr>
              <td colSpan={2} style={{ fontWeight: 700 }}>TOTAL</td>
              <td className="num">{totalDelivered}</td>
              <td className="num">{totalReturned}</td>
              <td className="num">{totalBalance}</td>
              <td colSpan={2}></td>
            </tr>
          </tfoot>
        </table>

        <p style={{ marginTop: 20, fontSize: 11, color: '#888', textAlign: 'right' }}>
          {totalBalance} bloquinho{totalBalance !== 1 ? 's' : ''} em circulação = {totalBalance * 30} rifas estimadas
        </p>
      </div>
    </>
  )
}
