'use client'

import { useState } from 'react'
import Link from 'next/link'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

type Ticket = {
  id: string
  code: string
  usedAt: string | null
  createdAt: string
  ticketType: {
    name: string
    event: {
      name: string
      date: string
      location: string
    }
  }
}

export default function MeusIngressosPage() {
  const [email, setEmail] = useState('')
  const [tickets, setTickets] = useState<Ticket[] | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setTickets(null)

    try {
      const res = await fetch(`/api/tickets?email=${encodeURIComponent(email)}`)
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || 'Erro ao buscar ingressos')
        return
      }
      setTickets(data.tickets)
    } catch {
      setError('Erro ao buscar ingressos. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold text-amber-900 mb-2">Meus Ingressos</h1>
      <p className="text-gray-500 mb-8">
        Digite o e-mail usado na compra para consultar seus ingressos.
      </p>

      <form onSubmit={handleSearch} className="mb-8">
        <div className="flex gap-3">
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="seu@email.com"
            className="flex-1 border-2 border-amber-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-amber-400"
          />
          <button
            type="submit"
            disabled={loading}
            className="bg-amber-500 hover:bg-amber-600 disabled:bg-gray-300 text-white font-bold px-6 py-3 rounded-xl transition-colors cursor-pointer disabled:cursor-not-allowed"
          >
            {loading ? '...' : 'Buscar'}
          </button>
        </div>
      </form>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-700 mb-6">
          {error}
        </div>
      )}

      {tickets !== null && (
        <div>
          {tickets.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <div className="text-5xl mb-4">🎫</div>
              <p>Nenhum ingresso encontrado para este e-mail.</p>
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-sm text-gray-500">{tickets.length} ingresso(s) encontrado(s)</p>
              {tickets.map((ticket) => {
                const eventDate = format(new Date(ticket.ticketType.event.date), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })
                return (
                  <Link
                    key={ticket.id}
                    href={`/meus-ingressos/${ticket.id}`}
                    className="block bg-white border-2 border-amber-100 hover:border-amber-300 rounded-2xl p-5 shadow-sm transition-all hover:shadow-md"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-bold text-amber-900">{ticket.ticketType.name}</h3>
                        <p className="text-sm text-gray-600">{ticket.ticketType.event.name}</p>
                        <p className="text-xs text-gray-400 mt-1">{eventDate} · {ticket.ticketType.event.location}</p>
                        <p className="text-xs font-mono text-gray-500 mt-1">{ticket.code}</p>
                      </div>
                      <span
                        className={`text-xs font-semibold px-3 py-1 rounded-full ${
                          ticket.usedAt
                            ? 'bg-gray-100 text-gray-500'
                            : 'bg-green-100 text-green-700'
                        }`}
                      >
                        {ticket.usedAt ? 'Usado' : 'Válido'}
                      </span>
                    </div>
                  </Link>
                )
              })}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
