'use client'

import Link from 'next/link'
import { useCart } from './CartProvider'
import { signOut, useSession } from 'next-auth/react'

export function Navbar() {
  const { itemCount } = useCart()
  const { data: session } = useSession()

  return (
    <nav className="bg-amber-600 text-white shadow-md">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
        <Link href="/" className="text-xl font-bold tracking-tight hover:text-amber-100 transition-colors">
          🎪 Arraiá 2025
        </Link>

        <div className="flex items-center gap-4 text-sm font-medium">
          <Link href="/evento" className="hover:text-amber-100 transition-colors">
            Ingressos
          </Link>
          <Link href="/meus-ingressos" className="hover:text-amber-100 transition-colors">
            Meus Ingressos
          </Link>

          <Link href="/carrinho" className="relative hover:text-amber-100 transition-colors">
            <span className="text-lg">🛒</span>
            {itemCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                {itemCount}
              </span>
            )}
          </Link>

          {session ? (
            <div className="flex items-center gap-2">
              <span className="text-amber-100 text-xs hidden sm:inline">
                {session.user.name?.split(' ')[0]}
              </span>
              <button
                onClick={() => signOut({ callbackUrl: '/' })}
                className="bg-amber-700 hover:bg-amber-800 px-3 py-1 rounded-lg transition-colors text-xs"
              >
                Sair
              </button>
            </div>
          ) : (
            <Link
              href="/checkout"
              className="bg-amber-700 hover:bg-amber-800 px-3 py-1 rounded-lg transition-colors text-xs"
            >
              Entrar
            </Link>
          )}
        </div>
      </div>
    </nav>
  )
}
