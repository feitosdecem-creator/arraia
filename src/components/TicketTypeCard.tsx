'use client'

import { useCart } from './CartProvider'
import { useState } from 'react'
import Link from 'next/link'

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
  const { addItem, removeItem, updateQuantity, items } = useCart()
  const remaining = stock - sold
  const cartItem = items.find((i) => i.ticketTypeId === ticketTypeId)
  const qty = cartItem?.quantity ?? 0
  const isSoldOut = remaining <= 0

  const priceFormatted =
    price === 0
      ? 'Gratuito'
      : 'R$ ' + (price / 100).toFixed(2).replace('.', ',')

  const handleDec = () => {
    if (qty <= 1) {
      removeItem(ticketTypeId)
    } else {
      updateQuantity(ticketTypeId, qty - 1)
    }
  }

  const handleInc = () => {
    if (isSoldOut) return
    if (qty === 0) {
      addItem({ ticketTypeId, name, price })
    } else {
      updateQuantity(ticketTypeId, qty + 1)
    }
  }

  return (
    <div
      style={{
        padding: '18px 0',
        borderBottom: '1px solid var(--line-2)',
      }}
    >
      {/* Top row: name + price */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          gap: 12,
          alignItems: 'baseline',
          marginBottom: 4,
        }}
      >
        <div style={{ minWidth: 0 }}>
          <div
            style={{
              fontWeight: 600,
              fontSize: 16,
              marginBottom: 2,
              color: 'var(--fg-1)',
            }}
          >
            {name}
          </div>
          {description && (
            <div style={{ fontSize: 13, color: 'var(--fg-2)', lineHeight: 1.4 }}>
              {description}
            </div>
          )}
        </div>
        <div style={{ textAlign: 'right', flexShrink: 0 }}>
          <div
            style={{
              fontWeight: 700,
              fontSize: 17,
              color: price === 0 ? 'var(--fdc-leaf-deep)' : 'var(--fg-1)',
            }}
          >
            {priceFormatted}
          </div>
        </div>
      </div>

      {/* Bottom row: availability + stepper */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginTop: 10,
        }}
      >
        <span
          style={{
            fontSize: 12,
            fontWeight: 500,
            color: isSoldOut
              ? 'var(--fdc-danger)'
              : remaining < 20
              ? 'var(--fdc-sun-deep)'
              : 'var(--fdc-leaf-deep)',
          }}
        >
          {isSoldOut
            ? 'Esgotado'
            : remaining < 20
            ? `⚠ Apenas ${remaining} restantes`
            : `1º lote · até ${remaining} disponíveis`}
        </span>

        {/* Quantity stepper */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <button
            style={{
              width: 32,
              height: 32,
              borderRadius: 999,
              border: '1px solid var(--line-2)',
              background: 'var(--bg-surface)',
              color: qty === 0 ? 'var(--fg-3)' : 'var(--fg-1)',
              display: 'grid',
              placeItems: 'center',
              cursor: qty === 0 ? 'default' : 'pointer',
              fontSize: 18,
              lineHeight: 1,
            }}
            onClick={handleDec}
            disabled={qty === 0}
            aria-label="Diminuir"
          >
            −
          </button>
          <span
            style={{
              minWidth: 16,
              textAlign: 'center',
              fontWeight: 600,
              fontSize: 16,
              color: 'var(--fg-1)',
            }}
          >
            {qty}
          </span>
          <button
            style={{
              width: 32,
              height: 32,
              borderRadius: 999,
              border: `1px solid ${qty > 0 ? 'var(--fdc-tangerine)' : 'var(--line-2)'}`,
              background: 'var(--bg-surface)',
              color: qty > 0 ? 'var(--fdc-tangerine)' : isSoldOut ? 'var(--fg-3)' : 'var(--fg-1)',
              display: 'grid',
              placeItems: 'center',
              cursor: isSoldOut ? 'not-allowed' : 'pointer',
              fontSize: 18,
              lineHeight: 1,
            }}
            onClick={handleInc}
            disabled={isSoldOut}
            aria-label="Aumentar"
          >
            +
          </button>
        </div>
      </div>
    </div>
  )
}

// Also export a CartCheckoutBar for use in the evento page
export function CartCheckoutBar() {
  const { items, total, itemCount } = useCart()

  if (itemCount === 0) return null

  const totalFormatted = 'R$ ' + (total / 100).toFixed(2).replace('.', ',')

  return (
    <div
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        background: 'var(--bg-surface)',
        borderTop: '1px solid var(--line-2)',
        padding: '12px 24px 24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 16,
        zIndex: 40,
        boxShadow: '0 -4px 20px rgba(56,48,48,0.08)',
      }}
    >
      <div>
        <div style={{ fontSize: 11, color: 'var(--fg-3)' }}>
          {itemCount} {itemCount === 1 ? 'ingresso' : 'ingressos'}
        </div>
        <div style={{ fontSize: 20, fontWeight: 700, letterSpacing: '-0.01em' }}>
          {totalFormatted}
        </div>
      </div>
      <Link
        href="/checkout"
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 8,
          padding: '13px 28px',
          borderRadius: 'var(--radius-lg)',
          background: 'var(--fdc-tangerine)',
          color: 'var(--fdc-cream)',
          fontWeight: 700,
          fontSize: 16,
          textDecoration: 'none',
          boxShadow: 'var(--shadow-md)',
        }}
      >
        Continuar para pagamento →
      </Link>
    </div>
  )
}
