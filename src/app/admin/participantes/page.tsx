import { prisma } from '@/lib/prisma'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

export const dynamic = 'force-dynamic'

export default async function ParticipantesPage() {
  const users = await prisma.user.findMany({
    include: {
      orders: {
        where: { status: 'PAID' },
        include: {
          tickets: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  })

  const usersWithStats = users
    .filter((u) => u.orders.length > 0)
    .map((u) => ({
      ...u,
      totalTickets: u.orders.reduce((sum, o) => sum + o.tickets.length, 0),
      totalSpent: u.orders.reduce((sum, o) => sum + o.totalAmount, 0),
    }))

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Participantes</h1>
      <p className="text-gray-500 mb-6">{usersWithStats.length} comprador(es) registrado(s)</p>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              <th className="text-left px-6 py-3 text-gray-500 font-medium">Nome</th>
              <th className="text-left px-6 py-3 text-gray-500 font-medium">E-mail</th>
              <th className="text-left px-6 py-3 text-gray-500 font-medium">Ingressos</th>
              <th className="text-left px-6 py-3 text-gray-500 font-medium">Total Gasto</th>
              <th className="text-left px-6 py-3 text-gray-500 font-medium">Cadastro</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {usersWithStats.map((user) => (
              <tr key={user.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 font-medium text-gray-900">{user.name}</td>
                <td className="px-6 py-4 text-gray-500">{user.email}</td>
                <td className="px-6 py-4">
                  <span className="font-semibold text-amber-700 bg-amber-50 px-3 py-1 rounded-full text-xs">
                    {user.totalTickets} ingresso(s)
                  </span>
                </td>
                <td className="px-6 py-4 font-semibold text-green-700">
                  {(user.totalSpent / 100).toLocaleString('pt-BR', {
                    style: 'currency',
                    currency: 'BRL',
                  })}
                </td>
                <td className="px-6 py-4 text-xs text-gray-400">
                  {format(user.createdAt, "dd/MM/yyyy", { locale: ptBR })}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {usersWithStats.length === 0 && (
          <p className="text-center text-gray-400 py-10">Nenhum participante ainda.</p>
        )}
      </div>
    </div>
  )
}
