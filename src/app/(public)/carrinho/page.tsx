'use client'

import { useCart } from '@/components/CartProvider'
import Link from 'next/link'

export default function CarrinhoPage() {
  const { items, updateQuantity, removeItem, total } = useCart()

  const totalFormatted = (total / 100).toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  })

  if (items.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center">
        <div className="text-6xl mb-4">🛒</div>
        <h1 className="text-3xl font-bold text-amber-900 mb-4">Carrinho vazio</h1>
        <p className="text-gray-500 mb-8">Adicione ingressos para continuar.</p>
        <Link
          href="/evento"
          className="bg-amber-500 hover:bg-amber-600 text-white font-bold px-8 py-3 rounded-xl transition-colors"
        >
          Ver Ingressos
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold text-amber-900 mb-8">Seu Carrinho</h1>

      <div className="space-y-4 mb-8">
        {items.map((item) => {
          const priceFormatted = (item.price / 100).toLocaleString('pt-BR', {
            style: 'currency',
            currency: 'BRL',
          })
          const subtotalFormatted = ((item.price * item.quantity) / 100).toLocaleString('pt-BR', {
            style: 'currency',
            currency: 'BRL',
          })

          return (
            <div
              key={item.ticketTypeId}
              className="bg-white border-2 border-amber-100 rounded-2xl p-5 flex items-center gap-4 shadow-sm"
            >
              <div className="flex-1">
                <h3 className="font-bold text-amber-900">{item.name}</h3>
                <p className="text-sm text-gray-500">{priceFormatted} cada</p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => updateQuantity(item.ticketTypeId, item.quantity - 1)}
                  className="w-8 h-8 bg-amber-100 hover:bg-amber-200 text-amber-800 rounded-lg font-bold text-lg flex items-center justify-center transition-colors cursor-pointer"
                >
                  −
                </button>
                <span className="w-8 text-center font-bold">{item.quantity}</span>
                <button
                  onClick={() => updateQuantity(item.ticketTypeId, item.quantity + 1)}
                  className="w-8 h-8 bg-amber-100 hover:bg-amber-200 text-amber-800 rounded-lg font-bold text-lg flex items-center justify-center transition-colors cursor-pointer"
                >
                  +
                </button>
              </div>

              <div className="text-right min-w-[80px]">
                <p className="font-bold text-red-700">{subtotalFormatted}</p>
                <button
                  onClick={() => removeItem(item.ticketTypeId)}
                  className="text-xs text-gray-400 hover:text-red-500 transition-colors cursor-pointer mt-1"
                >
                  Remover
                </button>
              </div>
            </div>
          )
        })}
      </div>

      <div className="bg-amber-50 rounded-2xl p-6 border border-amber-200">
        <div className="flex justify-between items-center mb-4">
          <span className="text-lg font-semibold text-amber-900">Total</span>
          <span className="text-3xl font-bold text-red-700">{totalFormatted}</span>
        </div>
        <Link
          href="/checkout"
          className="block w-full text-center bg-amber-500 hover:bg-amber-600 text-white font-bold py-4 rounded-xl transition-colors text-lg"
        >
          Finalizar Compra →
        </Link>
        <Link
          href="/evento"
          className="block w-full text-center text-amber-700 hover:text-amber-900 text-sm mt-3 transition-colors"
        >
          ← Continuar comprando
        </Link>
      </div>
    </div>
  )
}
