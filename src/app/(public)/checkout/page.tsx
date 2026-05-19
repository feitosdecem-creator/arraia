'use client'

import { useSession, signIn } from 'next-auth/react'
import { useCart } from '@/components/CartProvider'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

type AuthMode = 'login' | 'register'

export default function CheckoutPage() {
  const { data: session, status } = useSession()
  const { items, total, clearCart } = useCart()
  const router = useRouter()
  const [mode, setMode] = useState<AuthMode>('login')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({ name: '', email: '', password: '' })

  const totalFormatted = (total / 100).toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  })

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      if (mode === 'register') {
        const res = await fetch('/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: form.name, email: form.email, password: form.password }),
        })
        const data = await res.json()
        if (!res.ok) {
          setError(data.error || 'Erro ao criar conta')
          setLoading(false)
          return
        }
      }

      const result = await signIn('credentials', {
        email: form.email,
        password: form.password,
        redirect: false,
      })

      if (result?.error) {
        setError('Email ou senha inválidos')
      }
    } catch {
      setError('Erro ao entrar. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  const handleOrder = async () => {
    if (items.length === 0) return
    setLoading(true)
    setError('')

    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: items.map((i) => ({
            ticketTypeId: i.ticketTypeId,
            quantity: i.quantity,
          })),
        }),
      })

      const data = await res.json()
      if (!res.ok) {
        setError(data.error || 'Erro ao criar pedido')
        return
      }

      clearCart()
      router.push(`/pagamento/${data.orderId}`)
    } catch {
      setError('Erro ao processar pedido. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  if (items.length === 0) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center">
        <div className="text-6xl mb-4">🛒</div>
        <h1 className="text-2xl font-bold text-amber-900 mb-4">Carrinho vazio</h1>
        <Link href="/evento" className="text-amber-600 hover:text-amber-800 font-medium">
          Ver ingressos →
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold text-amber-900 mb-8">Checkout</h1>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Order summary */}
        <div>
          <h2 className="text-xl font-semibold text-amber-900 mb-4">Resumo do Pedido</h2>
          <div className="bg-amber-50 rounded-2xl p-5 space-y-3 border border-amber-200">
            {items.map((item) => (
              <div key={item.ticketTypeId} className="flex justify-between text-sm">
                <span className="text-gray-700">
                  {item.name} × {item.quantity}
                </span>
                <span className="font-semibold text-gray-900">
                  {((item.price * item.quantity) / 100).toLocaleString('pt-BR', {
                    style: 'currency',
                    currency: 'BRL',
                  })}
                </span>
              </div>
            ))}
            <div className="border-t border-amber-200 pt-3 flex justify-between font-bold">
              <span className="text-amber-900">Total</span>
              <span className="text-red-700 text-lg">{totalFormatted}</span>
            </div>
          </div>
        </div>

        {/* Auth or confirm */}
        <div>
          {status === 'authenticated' ? (
            <div>
              <h2 className="text-xl font-semibold text-amber-900 mb-4">Confirmar Compra</h2>
              <div className="bg-white border border-amber-200 rounded-2xl p-5 mb-4">
                <p className="text-sm text-gray-600 mb-1">Comprando como:</p>
                <p className="font-semibold">{session.user.name}</p>
                <p className="text-sm text-gray-500">{session.user.email}</p>
              </div>
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-3 mb-4 text-red-700 text-sm">
                  {error}
                </div>
              )}
              <button
                onClick={handleOrder}
                disabled={loading}
                className="w-full bg-amber-500 hover:bg-amber-600 disabled:bg-gray-300 text-white font-bold py-4 rounded-xl transition-colors text-lg cursor-pointer disabled:cursor-not-allowed"
              >
                {loading ? 'Processando...' : 'Gerar PIX →'}
              </button>
              <p className="text-xs text-center text-gray-400 mt-2">
                Você será redirecionado para a página de pagamento PIX
              </p>
            </div>
          ) : (
            <div>
              <h2 className="text-xl font-semibold text-amber-900 mb-4">
                {mode === 'login' ? 'Entrar na conta' : 'Criar conta'}
              </h2>
              <form onSubmit={handleAuthSubmit} className="space-y-4">
                {mode === 'register' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Nome</label>
                    <input
                      type="text"
                      required
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-amber-400"
                      placeholder="Seu nome completo"
                    />
                  </div>
                )}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">E-mail</label>
                  <input
                    type="email"
                    required
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-amber-400"
                    placeholder="seu@email.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Senha</label>
                  <input
                    type="password"
                    required
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-amber-400"
                    placeholder="••••••••"
                    minLength={6}
                  />
                </div>

                {error && (
                  <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-red-700 text-sm">
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-amber-500 hover:bg-amber-600 disabled:bg-gray-300 text-white font-bold py-3 rounded-xl transition-colors cursor-pointer disabled:cursor-not-allowed"
                >
                  {loading ? 'Aguarde...' : mode === 'login' ? 'Entrar' : 'Criar conta'}
                </button>
              </form>

              <div className="mt-4 text-center text-sm text-gray-600">
                {mode === 'login' ? (
                  <>
                    Não tem conta?{' '}
                    <button
                      onClick={() => setMode('register')}
                      className="text-amber-700 font-semibold hover:underline cursor-pointer"
                    >
                      Criar conta
                    </button>
                  </>
                ) : (
                  <>
                    Já tem conta?{' '}
                    <button
                      onClick={() => setMode('login')}
                      className="text-amber-700 font-semibold hover:underline cursor-pointer"
                    >
                      Entrar
                    </button>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
