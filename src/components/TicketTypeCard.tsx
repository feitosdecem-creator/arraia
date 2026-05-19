'use client'

import { useCart } from './CartProvider'
import { useState } from 'react'

type TicketTypeCardProps = {
  ticketTypeId: string
  name: string
  description?: string | null
  price: number
  stock: number
  sold: number
}

export function TicketTypeCard({
  ticketTypeId,
  name,
  description,
  price,
  stock,
  sold,
}: TicketTypeCardProps) {
  const { addItem, items } = useCart()
  const [added, setAdded] = useState(false)
  const remaining = stock - sold
  const inCart = items.find((i) => i.ticketTypeId === ticketTypeId)
  const isSoldOut = remaining <= 0

  const handleAdd = () => {
    if (isSoldOut) return
    addItem({
      ticketTypeId,
      name,
      price,
    })
    setAdded(true)
    setTimeout(() => setAdded(false), 1500)
  }

  const priceFormatted = (price / 100).toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  })

  return (
    <div className="bg-white border-2 border-amber-200 rounded-2xl p-6 shadow-md hover:shadow-lg transition-shadow">
      <div className="flex justify-between items-start mb-3">
        <h3 className="text-lg font-bold text-amber-900">{name}</h3>
        <span className="text-2xl font-bold text-red-700">{priceFormatted}</span>
      </div>

      {description && <p className="text-gray-600 text-sm mb-4">{description}</p>}

      <div className="flex items-center justify-between">
        <div className="text-sm">
          {isSoldOut ? (
            <span className="text-red-600 font-semibold">Esgotado</span>
          ) : (
            <span className={`${remaining < 20 ? 'text-red-600 font-semibold' : 'text-gray-500'}`}>
              {remaining < 20 ? `⚠️ Apenas ${remaining} restantes!` : `${remaining} disponíveis`}
            </span>
          )}
        </div>

        {inCart && (
          <span className="text-xs text-amber-700 bg-amber-50 px-2 py-1 rounded-full">
            {inCart.quantity} no carrinho
          </span>
        )}
      </div>

      <button
        onClick={handleAdd}
        disabled={isSoldOut}
        className={`mt-4 w-full py-2 rounded-xl font-semibold transition-all text-sm ${
          isSoldOut
            ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
            : added
            ? 'bg-green-600 text-white'
            : 'bg-amber-500 hover:bg-amber-600 text-white cursor-pointer'
        }`}
      >
        {isSoldOut ? 'Esgotado' : added ? '✓ Adicionado!' : 'Adicionar ao Carrinho'}
      </button>
    </div>
  )
}
