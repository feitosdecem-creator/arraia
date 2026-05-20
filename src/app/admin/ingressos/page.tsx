import { prisma } from '@/lib/prisma'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { DeleteTicketButton } from './DeleteTicketButton'

export const dynamic = 'force-dynamic'

type SearchParams = Promise<{ status?: string; type?: string }>

export default async function IngressosPage({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams
  const statusFilter = params.status
  const typeFilter = params.type

  const tickets = await prisma.ticket.findMany({
    where: {
      ...(statusFilter === 'used' ? { usedAt: { not: null } } : {}),
      ...(statusFilter === 'unused' ? { usedAt: null } : {}),
      ...(typeFilter ? { ticketTypeId: typeFilter } : {}),
    },
    orderBy: { createdAt: 'desc' },
    include: {
      ticketType: true,
      order: { include: { user: true } },
    },
  })

  const ticketTypes = await prisma.ticketType.findMany({ orderBy: { sortOrder: 'asc' } })

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Ingressos</h1>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-6">
        <a
          href="/admin/ingressos"
          className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${!statusFilter && !typeFilter ? 'bg-amber-600 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'}`}
        >
          Todos ({tickets.length})
        </a>
        <a
          href="/admin/ingressos?status=unused"
          className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${statusFilter === 'unused' ? 'bg-green-600 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'}`}
        >
          Válidos
        </a>
        <a
          href="/admin/ingressos?status=used"
          className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${statusFilter === 'used' ? 'bg-gray-600 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'}`}
        >
          Usados
        </a>
        {ticketTypes.map((tt) => (
          <a
            key={tt.id}
            href={`/admin/ingressos?type=${tt.id}`}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${typeFilter === tt.id ? 'bg-amber-600 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'}`}
          >
            {tt.name}
          </a>
        ))}
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="admin-table-wrap" style={{ overflowX: 'auto' }}>
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              <th className="text-left px-6 py-3 text-gray-500 font-medium">Código</th>
              <th className="text-left px-6 py-3 text-gray-500 font-medium">Comprador</th>
              <th className="text-left px-6 py-3 text-gray-500 font-medium">Tipo</th>
              <th className="text-left px-6 py-3 text-gray-500 font-medium">Status</th>
              <th className="text-left px-6 py-3 text-gray-500 font-medium">Emitido em</th>
              <th className="text-left px-6 py-3 text-gray-500 font-medium">Validado por</th>
              <th className="text-left px-6 py-3 text-gray-500 font-medium">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {tickets.map((ticket) => (
              <tr key={ticket.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 font-mono text-xs text-gray-700 font-bold">
                  {ticket.code}
                </td>
                <td className="px-6 py-4">
                  <p className="font-medium text-gray-900">{ticket.order.user.name}</p>
                  <p className="text-xs text-gray-400">{ticket.order.user.email}</p>
                </td>
                <td className="px-6 py-4 text-gray-700">{ticket.ticketType.name}</td>
                <td className="px-6 py-4">
                  {ticket.usedAt ? (
                    <span className="text-xs font-semibold px-3 py-1 rounded-full bg-gray-100 text-gray-500">
                      Usado
                    </span>
                  ) : (
                    <span className="text-xs font-semibold px-3 py-1 rounded-full bg-green-100 text-green-700">
                      Válido
                    </span>
                  )}
                </td>
                <td className="px-6 py-4 text-xs text-gray-500">
                  {format(ticket.createdAt, "dd/MM/yyyy HH:mm", { locale: ptBR })}
                </td>
                <td className="px-6 py-4 text-xs text-gray-500">
                  {ticket.validatedBy
                    ? <span className="font-mono">{ticket.validatedBy === 'admin' ? 'Admin' : ticket.validatedBy.slice(0, 8)}</span>
                    : <span className="text-gray-300">—</span>
                  }
                </td>
                <td className="px-6 py-4">
                  <DeleteTicketButton ticketId={ticket.id} isUsed={!!ticket.usedAt} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        </div>
        {tickets.length === 0 && (
          <p className="text-center text-gray-400 py-10">Nenhum ingresso encontrado.</p>
        )}
      </div>
    </div>
  )
}
