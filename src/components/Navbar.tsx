'use client'

import Link from 'next/link'
import { useCart } from './CartProvider'
import { signOut, useSession } from 'next-auth/react'

export function Navbar() {
  const { itemCount } = useCart()
  const { data: session } = useSession()

  return (
    <header
      style={{
        background: 'var(--bg-surface)',
        borderBottom: '1px solid var(--line-2)',
        position: 'sticky',
        top: 0,
        zIndex: 50,
      }}
    >
      <div
        style={{
          maxWidth: 'var(--container-max)',
          margin: '0 auto',
          padding: '0 var(--container-pad)',
          height: 60,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 24,
        }}
      >
        {/* Brand */}
        <Link
          href="/"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            textDecoration: 'none',
            color: 'var(--fg-1)',
          }}
        >
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: 8,
              background: 'var(--fdc-tangerine)',
              color: 'var(--fdc-cream)',
              display: 'grid',
              placeItems: 'center',
              fontWeight: 700,
              fontSize: 16,
            }}
          >
            A
          </div>
          <span style={{ fontWeight: 600, fontSize: 15 }}>ingressos.app</span>
        </Link>

        {/* Nav links */}
        <nav style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <Link
            href="/evento"
            style={{
              padding: '6px 12px',
              borderRadius: 8,
              fontSize: 14,
              fontWeight: 500,
              color: 'var(--fg-2)',
              textDecoration: 'none',
              transition: 'color 140ms',
            }}
          >
            Ingressos
          </Link>
          <Link
            href="/meus-ingressos"
            style={{
              padding: '6px 12px',
              borderRadius: 8,
              fontSize: 14,
              fontWeight: 500,
              color: 'var(--fg-2)',
              textDecoration: 'none',
              transition: 'color 140ms',
            }}
          >
            Meus Ingressos
          </Link>

          {/* Cart */}
          <Link
            href="/carrinho"
            style={{
              position: 'relative',
              padding: '6px 12px',
              borderRadius: 8,
              fontSize: 14,
              fontWeight: 500,
              color: 'var(--fg-2)',
              textDecoration: 'none',
            }}
          >
            Carrinho
            {itemCount > 0 && (
              <span
                style={{
                  position: 'absolute',
                  top: 2,
                  right: 2,
                  background: 'var(--fdc-tangerine)',
                  color: 'white',
                  fontSize: 10,
                  fontWeight: 700,
                  borderRadius: 999,
                  width: 18,
                  height: 18,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {itemCount}
              </span>
            )}
          </Link>

          {session ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 13, color: 'var(--fg-2)' }}>
                {session.user.name?.split(' ')[0]}
              </span>
              <button
                onClick={() => signOut({ callbackUrl: '/' })}
                style={{
                  padding: '6px 14px',
                  borderRadius: 8,
                  border: '1px solid var(--line-2)',
                  background: 'transparent',
                  fontSize: 13,
                  fontWeight: 500,
                  color: 'var(--fg-2)',
                  cursor: 'pointer',
                }}
              >
                Sair
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Link
                href="/checkout"
                style={{
                  padding: '6px 14px',
                  borderRadius: 8,
                  border: '1px solid var(--line-2)',
                  fontSize: 13,
                  fontWeight: 500,
                  color: 'var(--fg-2)',
                  textDecoration: 'none',
                }}
              >
                Entrar
              </Link>
              <Link
                href="/evento"
                style={{
                  padding: '7px 16px',
                  borderRadius: 8,
                  background: 'var(--fdc-tangerine)',
                  color: 'white',
                  fontSize: 13,
                  fontWeight: 600,
                  textDecoration: 'none',
                }}
              >
                Comprar ingresso
              </Link>
            </div>
          )}
        </nav>
      </div>
    </header>
  )
}
