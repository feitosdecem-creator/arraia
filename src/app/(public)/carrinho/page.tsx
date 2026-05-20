'use client'

import { useCart } from '@/components/CartProvider'
import Link from 'next/link'

export default function CarrinhoPage() {
  const { items, updateQuantity, removeItem, total } = useCart()

  const fmt = (cents: number) =>
    'R$ ' + (cents / 100).toFixed(2).replace('.', ',')

  if (items.length === 0) {
    return (
      <div style={{ background: 'var(--bg-page)', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 24px' }}>
        <div style={{ textAlign: 'center', maxWidth: 400 }}>
          <div style={{ fontSize: 52, marginBottom: 20 }}>🛒</div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 700, color: 'var(--fg-1)', margin: '0 0 10px', letterSpacing: '-0.02em' }}>
            Carrinho vazio
          </h1>
          <p style={{ color: 'var(--fg-2)', fontSize: 15, margin: '0 0 28px' }}>
            Selecione seus ingressos antes de continuar.
          </p>
          <Link
            href="/evento"
            style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '12px 28px', borderRadius: 'var(--radius-lg)', background: 'var(--fdc-tangerine)', color: 'var(--fdc-cream)', fontWeight: 700, fontSize: 15, textDecoration: 'none' }}
          >
            Ver ingressos →
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div style={{ background: 'var(--bg-page)', minHeight: '100vh' }}>
      <div style={{ maxWidth: 680, margin: '0 auto', padding: '40px 24px 80px' }}>

        {/* Header */}
        <div style={{ marginBottom: 28 }}>
          <div className="fdc-eyebrow" style={{ marginBottom: 4 }}>Resumo</div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(26px, 4vw, 36px)', fontWeight: 700, letterSpacing: '-0.03em', color: 'var(--fg-1)', margin: 0 }}>
            Seu carrinho
          </h1>
        </div>

        {/* Items */}
        <div className="fdc-card" style={{ padding: 0, overflow: 'hidden', marginBottom: 20 }}>
          {items.map((item, i) => (
            <div
              key={item.ticketTypeId}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 16,
                padding: '18px 20px',
                borderBottom: i < items.length - 1 ? '1px solid var(--line-2)' : 'none',
              }}
            >
              {/* Icon */}
              <div style={{ width: 40, height: 40, borderRadius: 10, background: 'var(--fdc-cream-deep)', display: 'grid', placeItems: 'center', fontSize: 18, flexShrink: 0 }}>
                🎟
              </div>

              {/* Name + unit price */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 600, fontSize: 15, color: 'var(--fg-1)', marginBottom: 2 }}>
                  {item.name}
                </div>
                <div style={{ fontSize: 13, color: 'var(--fg-3)' }}>
                  {item.price === 0 ? 'Gratuito' : fmt(item.price) + ' por ingresso'}
                </div>
              </div>

              {/* Stepper */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <button
                  onClick={() => updateQuantity(item.ticketTypeId, item.quantity - 1)}
                  style={{ width: 32, height: 32, borderRadius: '50%', border: '1px solid var(--line-2)', background: 'var(--bg-surface)', color: 'var(--fg-2)', fontSize: 18, display: 'grid', placeItems: 'center', cursor: 'pointer', fontFamily: 'inherit' }}
                >
                  −
                </button>
                <span style={{ fontWeight: 700, fontSize: 15, minWidth: 18, textAlign: 'center', color: 'var(--fg-1)' }}>
                  {item.quantity}
                </span>
                <button
                  onClick={() => updateQuantity(item.ticketTypeId, item.quantity + 1)}
                  style={{ width: 32, height: 32, borderRadius: '50%', border: '1px solid var(--line-2)', background: 'var(--bg-surface)', color: 'var(--fg-2)', fontSize: 18, display: 'grid', placeItems: 'center', cursor: 'pointer', fontFamily: 'inherit' }}
                >
                  +
                </button>
              </div>

              {/* Subtotal + remove */}
              <div style={{ textAlign: 'right', minWidth: 72, flexShrink: 0 }}>
                <div style={{ fontWeight: 700, fontSize: 15, color: 'var(--fg-1)' }}>
                  {item.price === 0 ? '—' : fmt(item.price * item.quantity)}
                </div>
                <button
                  onClick={() => removeItem(item.ticketTypeId)}
                  style={{ fontSize: 12, color: 'var(--fg-3)', background: 'none', border: 'none', cursor: 'pointer', padding: '2px 0', fontFamily: 'inherit', marginTop: 2 }}
                >
                  Remover
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Total + CTA */}
        <div className="fdc-card" style={{ padding: 24 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 6 }}>
            <span style={{ fontSize: 14, color: 'var(--fg-2)' }}>Subtotal</span>
            <span style={{ fontSize: 15, fontWeight: 500, color: 'var(--fg-1)' }}>{fmt(total)}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 20 }}>
            <span style={{ fontSize: 14, color: 'var(--fg-2)' }}>
              Taxa de serviço <em style={{ color: 'var(--fdc-leaf-deep)', fontStyle: 'normal' }}>· grátis no PIX</em>
            </span>
            <span style={{ fontSize: 15, fontWeight: 500, color: 'var(--fg-1)' }}>R$ 0,00</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', borderTop: '1.5px dashed var(--line-2)', paddingTop: 16, marginBottom: 20 }}>
            <span style={{ fontWeight: 600, fontSize: 16 }}>Total</span>
            <span style={{ fontSize: 26, fontWeight: 700, letterSpacing: '-0.02em', color: 'var(--fg-1)' }}>{fmt(total)}</span>
          </div>

          <Link
            href="/checkout"
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, width: '100%', padding: '15px 24px', borderRadius: 'var(--radius-lg)', background: 'var(--fdc-tangerine)', color: 'var(--fdc-cream)', fontWeight: 700, fontSize: 16, textDecoration: 'none', textAlign: 'center', boxSizing: 'border-box' }}
          >
            Finalizar compra →
          </Link>

          <Link
            href="/evento"
            style={{ display: 'block', textAlign: 'center', marginTop: 14, fontSize: 14, color: 'var(--fg-2)', textDecoration: 'none' }}
          >
            ← Continuar comprando
          </Link>
        </div>
      </div>
    </div>
  )
}
