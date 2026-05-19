import { StatsCard } from '@/components/admin/StatsCard'
import { prisma } from '@/lib/prisma'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

export const dynamic = 'force-dynamic'

export default async function DashboardPage() {
  const [totalRevenue, totalOrders, totalTickets, usedTickets, recentOrders] = await Promise.all([
    prisma.order.aggregate({
      where: { status: 'PAID' },
      _sum: { totalAmount: true },
    }),
    prisma.order.count({ where: { status: 'PAID' } }),
    prisma.ticket.count(),
    prisma.ticket.count({ where: { usedAt: { not: null } } }),
    prisma.order.findMany({
      where: { status: { in: ['PAID', 'AWAITING_PAYMENT', 'PENDING'] } },
      orderBy: { createdAt: 'desc' },
      take: 10,
      include: {
        user: true,
        items: { include: { ticketType: true } },
      },
    }),
  ])

  const revenue = totalRevenue._sum.totalAmount ?? 0
  const revenueFormatted = (revenue / 100).toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  })

  const statusLabel: Record<string, string> = {
    PAID: 'Pago',
    AWAITING_PAYMENT: 'Aguardando',
    PENDING: 'Pendente',
    EXPIRED: 'Expirado',
    CANCELLED: 'Cancelado',
  }

  const statusColor: Record<string, string> = {
    PAID: 'bg-green-100 text-green-700',
    AWAITING_PAYMENT: 'bg-yellow-100 text-yellow-700',
    PENDING: 'bg-gray-100 text-gray-600',
    EXPIRED: 'bg-red-100 text-red-600',
    CANCELLED: 'bg-red-100 text-red-600',
  }

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Dashboard</h1>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        <StatsCard
          title="Receita Total"
          value={revenueFormatted}
          icon="💰"
          subtitle="Pedidos pagos"
          color="green"
        />
        <StatsCard
          title="Pedidos Pagos"
          value={totalOrders}
          icon="🛒"
          color="amber"
        />
        <StatsCard
          title="Ingressos Gerados"
          value={totalTickets}
          icon="🎫"
          color="blue"
        />
        <StatsCard
          title="Ingressos Usados"
          value={usedTickets}
          icon="✅"
          subtitle={`${totalTickets > 0 ? Math.round((usedTickets / totalTickets) * 100) : 0}% do total`}
          color="red"
        />
      </div>

      <div>
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Pedidos Recentes</h2>
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="text-left px-6 py-3 text-gray-500 font-medium">Comprador</th>
                <th className="text-left px-6 py-3 text-gray-500 font-medium">Ingressos</th>
                <th className="text-left px-6 py-3 text-gray-500 font-medium">Valor</th>
                <th className="text-left px-6 py-3 text-gray-500 font-medium">Status</th>
                <th className="text-left px-6 py-3 text-gray-500 font-medium">Data</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {recentOrders.map((order) => (
                <tr key={order.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <p className="font-medium text-gray-900">{order.user.name}</p>
                    <p className="text-xs text-gray-400">{order.user.email}</p>
                  </td>
                  <td className="px-6 py-4 text-gray-600">
                    {order.items.map((item) => (
                      <div key={item.id} className="text-xs">
                        {item.quantity}× {item.ticketType.name}
                      </div>
                    ))}
                  </td>
                  <td className="px-6 py-4 font-semibold text-gray-900">
                    {(order.totalAmount / 100).toLocaleString('pt-BR', {
                      style: 'currency',
                      currency: 'BRL',
                    })}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`text-xs font-semibold px-3 py-1 rounded-full ${statusColor[order.status] ?? 'bg-gray-100 text-gray-600'}`}>
                      {statusLabel[order.status] ?? order.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-500 text-xs">
                    {format(order.createdAt, "dd/MM/yyyy HH:mm", { locale: ptBR })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {recentOrders.length === 0 && (
            <p className="text-center text-gray-400 py-10">Nenhum pedido ainda.</p>
          )}
        </div>
      </div>
    </div>
  )
}
