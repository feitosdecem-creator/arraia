'use client'

import { useSession, signIn } from 'next-auth/react'
import { useCart } from '@/components/CartProvider'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

type AuthMode = 'login' | 'register'

const STEPS = ['Ingressos', 'Dados', 'Pagamento', 'Confirmação']

function StepBar({ step }: { step: number }) {
  return (
    <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
      {STEPS.map((s, i) => (
        <div key={s} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              color: i <= step ? 'var(--fg-1)' : 'var(--fg-3)',
              fontWeight: i === step ? 600 : 400,
              fontSize: 13,
            }}
          >
            <div
              style={{
                width: 22,
                height: 22,
                borderRadius: '50%',
                background:
                  i < step
                    ? 'var(--fdc-leaf)'
                    : i === step
                    ? 'var(--fdc-tangerine)'
                    : 'var(--fdc-cream-deep)',
                color:
                  i <= step ? 'var(--fdc-cream)' : 'var(--fg-3)',
                display: 'grid',
                placeItems: 'center',
                fontSize: 11,
                fontWeight: 600,
              }}
            >
              {i < step ? '✓' : i + 1}
            </div>
            <span>{s}</span>
          </div>
          {i < STEPS.length - 1 && (
            <div
              style={{
                width: 24,
                height: 1,
                background: 'var(--line-2)',
                flexShrink: 0,
              }}
            />
          )}
        </div>
      ))}
    </div>
  )
}

function PaymentOption({
  icon,
  name,
  desc,
  selected,
}: {
  icon: string
  name: string
  desc: string
  selected?: boolean
}) {
  return (
    <label
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 14,
        padding: 16,
        borderRadius: 12,
        border: `1.5px solid ${selected ? 'var(--fdc-tangerine)' : 'var(--line-2)'}`,
        background: selected ? 'rgba(236,82,18,0.04)' : 'var(--bg-surface)',
        cursor: 'pointer',
      }}
    >
      <div
        style={{
          width: 22,
          height: 22,
          borderRadius: '50%',
          border: `2px solid ${selected ? 'var(--fdc-tangerine)' : 'var(--line-2)'}`,
          padding: 3,
          flexShrink: 0,
          display: 'grid',
          placeItems: 'center',
        }}
      >
        {selected && (
          <div
            style={{
              width: '100%',
              height: '100%',
              borderRadius: '50%',
              background: 'var(--fdc-tangerine)',
            }}
          />
        )}
      </div>
      <div
        style={{
          width: 40,
          height: 40,
          borderRadius: 10,
          background: 'var(--fdc-cream-deep)',
          display: 'grid',
          placeItems: 'center',
          fontSize: 20,
          flexShrink: 0,
        }}
      >
        {icon}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontWeight: 600, fontSize: 15 }}>{name}</div>
        <div style={{ fontSize: 13, color: 'var(--fg-2)' }}>{desc}</div>
      </div>
    </label>
  )
}

export default function CheckoutPage() {
  const { data: session, status } = useSession()
  const { items, total, clearCart } = useCart()
  const router = useRouter()
  const [mode, setMode] = useState<AuthMode>('login')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({ name: '', email: '', password: '' })

  const totalFormatted =
    'R$ ' + (total / 100).toFixed(2).replace('.', ',')

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
      <div
        style={{
          maxWidth: 480,
          margin: '0 auto',
          padding: '80px 24px',
          textAlign: 'center',
        }}
      >
        <div style={{ fontSize: 48, marginBottom: 16 }}>🛒</div>
        <h1
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: 28,
            fontWeight: 700,
            color: 'var(--fg-1)',
            marginBottom: 12,
          }}
        >
          Carrinho vazio
        </h1>
        <p style={{ color: 'var(--fg-2)', marginBottom: 24 }}>
          Selecione seus ingressos antes de continuar.
        </p>
        <Link
          href="/evento"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            padding: '12px 24px',
            borderRadius: 'var(--radius-lg)',
            background: 'var(--fdc-tangerine)',
            color: 'var(--fdc-cream)',
            fontWeight: 600,
            fontSize: 15,
            textDecoration: 'none',
          }}
        >
          Ver ingressos →
        </Link>
      </div>
    )
  }

  return (
    <div style={{ background: 'var(--bg-page)', minHeight: '100vh' }}>
      <div
        className="checkout-outer"
        style={{
          maxWidth: 1100,
          margin: '0 auto',
          padding: '32px 40px 80px',
        }}
      >
        {/* Step bar */}
        <div style={{ marginBottom: 28 }}>
          <StepBar step={1} />
        </div>

        <div
          className="checkout-grid"
          style={{
            display: 'grid',
            gridTemplateColumns: 'minmax(0, 1fr) 380px',
            gap: 36,
            alignItems: 'start',
          }}
        >
          {/* LEFT col */}
          <div>
            <h1
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: 'clamp(24px, 3.5vw, 40px)',
                fontWeight: 700,
                letterSpacing: '-0.03em',
                lineHeight: 1.05,
                color: 'var(--fg-1)',
                margin: '0 0 6px',
              }}
            >
              Quase lá — só precisamos dos seus dados
            </h1>
            <p style={{ color: 'var(--fg-2)', fontSize: 16, margin: '0 0 24px' }}>
              Vamos enviar os ingressos para o e-mail abaixo.
            </p>

            {/* Buyer details */}
            <div className="fdc-card" style={{ padding: 24, marginBottom: 20 }}>
              <h3
                style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: 20,
                  fontWeight: 600,
                  letterSpacing: '-0.02em',
                  color: 'var(--fg-1)',
                  margin: '0 0 6px',
                }}
              >
                Comprador
              </h3>
              <p style={{ color: 'var(--fg-2)', fontSize: 13, margin: '0 0 20px' }}>
                Usaremos esses dados para enviar a confirmação.
              </p>

              {status === 'authenticated' ? (
                <div
                  style={{
                    padding: '14px 16px',
                    background: 'var(--bg-sunken)',
                    borderRadius: 'var(--radius-md)',
                    fontSize: 14,
                  }}
                >
                  <div style={{ fontWeight: 600, color: 'var(--fg-1)' }}>{session.user.name}</div>
                  <div style={{ color: 'var(--fg-2)', marginTop: 2 }}>{session.user.email}</div>
                </div>
              ) : (
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: 16,
                  }}
                >
                  {mode === 'register' && (
                    <div style={{ gridColumn: '1 / -1' }}>
                      <label className="fdc-label">Nome completo</label>
                      <input
                        type="text"
                        required
                        value={form.name}
                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                        className="fdc-input"
                        placeholder="Maria Souza"
                      />
                    </div>
                  )}
                  <div style={{ gridColumn: '1 / -1' }}>
                    <label className="fdc-label">E-mail</label>
                    <input
                      type="email"
                      required
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      className="fdc-input"
                      placeholder="voce@email.com"
                    />
                  </div>
                  <div style={{ gridColumn: '1 / -1' }}>
                    <label className="fdc-label">Senha</label>
                    <input
                      type="password"
                      required
                      value={form.password}
                      onChange={(e) => setForm({ ...form, password: e.target.value })}
                      className="fdc-input"
                      placeholder="••••••••"
                      minLength={6}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Payment method */}
            <div className="fdc-card" style={{ padding: 24, marginBottom: 20 }}>
              <h3
                style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: 20,
                  fontWeight: 600,
                  letterSpacing: '-0.02em',
                  color: 'var(--fg-1)',
                  margin: '0 0 14px',
                }}
              >
                Forma de pagamento
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <PaymentOption
                  icon="🏦"
                  name="PIX"
                  desc="Aprovação instantânea · sem taxa"
                  selected
                />
                <PaymentOption
                  icon="💳"
                  name="Cartão de crédito"
                  desc="Em até 3× sem juros (em breve)"
                />
              </div>
            </div>

            {/* Error */}
            {error && (
              <div
                style={{
                  padding: '12px 16px',
                  background: 'rgba(216,56,56,0.08)',
                  border: '1px solid rgba(216,56,56,0.2)',
                  borderRadius: 'var(--radius-md)',
                  color: 'var(--fdc-danger)',
                  fontSize: 14,
                  marginBottom: 20,
                }}
              >
                {error}
              </div>
            )}

            {/* Actions */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginTop: 8,
              }}
            >
              <Link
                href="/evento"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '10px 16px',
                  borderRadius: 'var(--radius-md)',
                  background: 'transparent',
                  color: 'var(--fg-2)',
                  fontWeight: 500,
                  fontSize: 14,
                  textDecoration: 'none',
                  border: 'none',
                  cursor: 'pointer',
                }}
              >
                ← Voltar
              </Link>

              {status === 'authenticated' ? (
                <button
                  onClick={handleOrder}
                  disabled={loading}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 8,
                    padding: '13px 28px',
                    borderRadius: 'var(--radius-lg)',
                    background: loading ? 'var(--fdc-stone-2)' : 'var(--fdc-tangerine)',
                    color: 'var(--fdc-cream)',
                    fontWeight: 700,
                    fontSize: 16,
                    border: 'none',
                    cursor: loading ? 'not-allowed' : 'pointer',
                    transition: 'background var(--dur-fast)',
                  }}
                >
                  {loading ? 'Processando…' : 'Ir para o pagamento →'}
                </button>
              ) : (
                <button
                  onClick={handleAuthSubmit as unknown as React.MouseEventHandler}
                  disabled={loading}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 8,
                    padding: '13px 28px',
                    borderRadius: 'var(--radius-lg)',
                    background: loading ? 'var(--fdc-stone-2)' : 'var(--fdc-tangerine)',
                    color: 'var(--fdc-cream)',
                    fontWeight: 700,
                    fontSize: 16,
                    border: 'none',
                    cursor: loading ? 'not-allowed' : 'pointer',
                  }}
                >
                  {loading ? 'Aguarde…' : mode === 'login' ? 'Entrar e continuar →' : 'Criar conta →'}
                </button>
              )}
            </div>

            {status !== 'authenticated' && (
              <p
                style={{
                  textAlign: 'center',
                  fontSize: 13,
                  color: 'var(--fg-2)',
                  marginTop: 14,
                }}
              >
                {mode === 'login' ? (
                  <>
                    Não tem conta?{' '}
                    <button
                      onClick={() => setMode('register')}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: 'var(--fdc-tangerine)',
                        fontWeight: 600,
                        cursor: 'pointer',
                        fontSize: 13,
                      }}
                    >
                      Criar conta
                    </button>
                  </>
                ) : (
                  <>
                    Já tem conta?{' '}
                    <button
                      onClick={() => setMode('login')}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: 'var(--fdc-tangerine)',
                        fontWeight: 600,
                        cursor: 'pointer',
                        fontSize: 13,
                      }}
                    >
                      Entrar
                    </button>
                  </>
                )}
              </p>
            )}
          </div>

          {/* RIGHT col — order summary */}
          <div className="checkout-summary" style={{ position: 'sticky', top: 24 }}>
            <div className="fdc-card" style={{ padding: 24 }}>
              {/* Event mini header */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: 12,
                  paddingBottom: 14,
                  borderBottom: '1px solid var(--line-2)',
                  marginBottom: 14,
                }}
              >
                <div
                  style={{
                    width: 52,
                    height: 52,
                    borderRadius: 10,
                    background:
                      'linear-gradient(135deg, var(--fdc-tangerine-soft), var(--fdc-cream-deep))',
                    flexShrink: 0,
                  }}
                />
                <div style={{ minWidth: 0 }}>
                  <div
                    style={{
                      fontWeight: 600,
                      fontSize: 15,
                      lineHeight: 1.2,
                      color: 'var(--fg-1)',
                    }}
                  >
                    Arraiá da Escola
                  </div>
                  <div style={{ fontSize: 13, color: 'var(--fg-2)', marginTop: 2 }}>
                    Seus ingressos
                  </div>
                </div>
              </div>

              {/* Items */}
              <div style={{ borderBottom: '1px solid var(--line-2)', paddingBottom: 14, marginBottom: 14 }}>
                {items.map((item) => (
                  <div
                    key={item.ticketTypeId}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      padding: '6px 0',
                      fontSize: 14,
                    }}
                  >
                    <span style={{ color: 'var(--fg-2)' }}>
                      {item.quantity}× {item.name}
                    </span>
                    <span style={{ fontWeight: 500, color: 'var(--fg-1)' }}>
                      {item.price === 0
                        ? '—'
                        : 'R$ ' + ((item.price * item.quantity) / 100).toFixed(2).replace('.', ',')}
                    </span>
                  </div>
                ))}
              </div>

              {/* Fee */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 14 }}>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'baseline',
                  }}
                >
                  <span style={{ fontSize: 13, color: 'var(--fg-2)' }}>Subtotal</span>
                  <span style={{ fontSize: 14, fontWeight: 500 }}>{totalFormatted}</span>
                </div>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'baseline',
                  }}
                >
                  <span style={{ fontSize: 13, color: 'var(--fg-2)' }}>
                    Taxa do serviço{' '}
                    <em
                      style={{
                        color: 'var(--fdc-leaf-deep)',
                        fontStyle: 'normal',
                        marginLeft: 4,
                      }}
                    >
                      · grátis no PIX
                    </em>
                  </span>
                  <span style={{ fontSize: 14, fontWeight: 500 }}>R$ 0,00</span>
                </div>
              </div>

              {/* Total */}
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'baseline',
                  borderTop: '1.5px dashed var(--line-2)',
                  paddingTop: 14,
                }}
              >
                <span style={{ fontWeight: 600 }}>Total</span>
                <span
                  style={{
                    fontSize: 22,
                    fontWeight: 700,
                    letterSpacing: '-0.01em',
                    color: 'var(--fg-1)',
                  }}
                >
                  {totalFormatted}
                </span>
              </div>
            </div>

            {/* Info note */}
            <div
              style={{
                marginTop: 12,
                padding: '12px 14px',
                background: 'var(--fdc-cream-deep)',
                borderRadius: 12,
                fontSize: 13,
                color: 'var(--fg-2)',
                display: 'flex',
                gap: 10,
                alignItems: 'flex-start',
              }}
            >
              <span style={{ fontSize: 15 }}>ℹ️</span>
              <span>Você terá 15 minutos para concluir o pagamento depois de avançar.</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
