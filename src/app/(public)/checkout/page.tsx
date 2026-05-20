'use client'

import { useSession, signIn } from 'next-auth/react'
import { useCart } from '@/components/CartProvider'
import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

// ─── Step bar ────────────────────────────────────────────────
const STEPS = ['Ingressos', 'Dados', 'Pagamento', 'Confirmação']

function StepBar({ step }: { step: number }) {
  return (
    <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
      {STEPS.map((s, i) => (
        <div key={s} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: i <= step ? 'var(--fg-1)' : 'var(--fg-3)', fontWeight: i === step ? 600 : 400, fontSize: 13 }}>
            <div style={{ width: 22, height: 22, borderRadius: '50%', background: i < step ? 'var(--fdc-leaf)' : i === step ? 'var(--fdc-tangerine)' : 'var(--fdc-cream-deep)', color: i <= step ? 'var(--fdc-cream)' : 'var(--fg-3)', display: 'grid', placeItems: 'center', fontSize: 11, fontWeight: 600 }}>
              {i < step ? '✓' : i + 1}
            </div>
            <span>{s}</span>
          </div>
          {i < STEPS.length - 1 && <div style={{ width: 24, height: 1, background: 'var(--line-2)', flexShrink: 0 }} />}
        </div>
      ))}
    </div>
  )
}

// ─── Embedded auth ────────────────────────────────────────────
type AuthStep = 'email' | 'checking' | 'login' | 'register'

function EmbeddedAuth() {
  const [step, setStep] = useState<AuthStep>('email')
  const [email, setEmail] = useState('')
  const [name, setName] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const passwordRef = useRef<HTMLInputElement>(null)
  const nameRef = useRef<HTMLInputElement>(null)
  const emailRef = useRef<HTMLInputElement>(null)

  const isEmailValid = email.includes('@') && email.includes('.')

  const checkEmail = async () => {
    if (!isEmailValid) {
      emailRef.current?.focus()
      return
    }
    setStep('checking')
    setError('')
    try {
      const res = await fetch('/api/auth/check-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim() }),
      })
      const data = await res.json()
      const next: AuthStep = data.exists ? 'login' : 'register'
      setStep(next)
      setTimeout(() => {
        if (next === 'login') passwordRef.current?.focus()
        else nameRef.current?.focus()
      }, 60)
    } catch {
      setStep('email')
      setError('Erro ao verificar e-mail. Tente novamente.')
    }
  }

  const resetEmail = () => {
    setStep('email')
    setPassword('')
    setName('')
    setError('')
    setTimeout(() => emailRef.current?.focus(), 60)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (step === 'email' || step === 'checking') { checkEmail(); return }
    setLoading(true)
    setError('')
    try {
      if (step === 'register') {
        const res = await fetch('/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: name.trim(), email: email.trim(), password }),
        })
        const data = await res.json()
        if (!res.ok) {
          setError(data.error || 'Erro ao criar conta')
          setLoading(false)
          return
        }
      }
      const result = await signIn('credentials', { email: email.trim(), password, redirect: false })
      if (result?.error) {
        setError(step === 'login' ? 'Senha incorreta. Tente novamente.' : 'Erro ao entrar. Tente novamente.')
      }
    } catch {
      setError('Erro inesperado. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  const inp: React.CSSProperties = {
    width: '100%',
    padding: '12px 16px',
    border: '1.5px solid var(--line-1)',
    borderRadius: 'var(--radius-md)',
    fontSize: 15,
    fontFamily: 'inherit',
    background: 'var(--bg-surface)',
    color: 'var(--fg-1)',
    outline: 'none',
    transition: 'border-color 140ms',
  }

  return (
    <div className="fdc-card" style={{ padding: 24, marginBottom: 20 }}>

      {/* Badge — shown in login/register step */}
      {step === 'login' && (
        <div className="auth-step-enter" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '4px 12px', borderRadius: 999, background: 'rgba(111,168,74,0.14)', color: 'var(--fdc-leaf-deep)', fontSize: 12, fontWeight: 700, marginBottom: 16, letterSpacing: '0.02em' }}>
          ✓ Bem-vindo de volta!
        </div>
      )}
      {step === 'register' && (
        <div className="auth-step-enter" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '4px 12px', borderRadius: 999, background: 'rgba(236,82,18,0.1)', color: 'var(--fdc-tangerine-deep)', fontSize: 12, fontWeight: 700, marginBottom: 16, letterSpacing: '0.02em' }}>
          ✨ Conta nova — rápido e fácil
        </div>
      )}

      {/* Email chip — shown after email is confirmed */}
      {(step === 'login' || step === 'register') && (
        <div className="auth-step-enter" style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px', background: 'var(--bg-sunken)', borderRadius: 10, marginBottom: 18, minWidth: 0 }}>
          <span style={{ fontSize: 14, color: 'var(--fg-1)', fontWeight: 500, flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {email}
          </span>
          <button
            type="button"
            onClick={resetEmail}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--fg-3)', fontSize: 16, lineHeight: 1, padding: '2px 4px', borderRadius: 4, flexShrink: 0 }}
            title="Trocar e-mail"
          >
            ×
          </button>
        </div>
      )}

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

        {/* Email input — only in email/checking step */}
        {(step === 'email' || step === 'checking') && (
          <div>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--fg-1)', marginBottom: 6 }}>
              Qual é o seu e-mail?
            </label>
            <div style={{ display: 'flex', gap: 8 }}>
              <input
                ref={emailRef}
                type="email"
                value={email}
                onChange={(e) => { setEmail(e.target.value); setError('') }}
                onKeyDown={(e) => e.key === 'Enter' && checkEmail()}
                placeholder="voce@email.com"
                autoComplete="email"
                autoFocus
                style={{ ...inp, flex: 1 }}
              />
              <button
                type="button"
                onClick={checkEmail}
                disabled={step === 'checking' || !isEmailValid}
                style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 6, padding: '0 20px', borderRadius: 'var(--radius-md)', background: !isEmailValid ? 'var(--fdc-stone-2)' : 'var(--fdc-tangerine)', color: 'var(--fdc-cream)', border: 'none', fontWeight: 600, fontSize: 15, cursor: !isEmailValid ? 'not-allowed' : 'pointer', minWidth: 52, flexShrink: 0, transition: 'background 140ms' }}
              >
                {step === 'checking'
                  ? <span className="auth-spinner" />
                  : '→'}
              </button>
            </div>
            <p style={{ fontSize: 12, color: 'var(--fg-3)', margin: '8px 0 0' }}>
              Vamos verificar se você já tem uma conta.
            </p>
          </div>
        )}

        {/* Name — register only */}
        {step === 'register' && (
          <div className="auth-step-enter">
            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--fg-1)', marginBottom: 6 }}>
              Nome completo
            </label>
            <input
              ref={nameRef}
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Maria Souza"
              autoComplete="name"
              required
              style={inp}
            />
          </div>
        )}

        {/* Password — login + register */}
        {(step === 'login' || step === 'register') && (
          <div className="auth-step-enter">
            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--fg-1)', marginBottom: 6 }}>
              {step === 'login' ? 'Senha' : 'Crie uma senha'}
            </label>
            <input
              ref={passwordRef}
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              autoComplete={step === 'login' ? 'current-password' : 'new-password'}
              minLength={6}
              required
              style={inp}
            />
            {step === 'register' && (
              <p style={{ fontSize: 12, color: 'var(--fg-3)', margin: '6px 0 0' }}>Mínimo 6 caracteres</p>
            )}
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="auth-step-enter" style={{ padding: '10px 14px', background: 'rgba(216,56,56,0.08)', border: '1px solid rgba(216,56,56,0.18)', borderRadius: 10, color: 'var(--fdc-danger)', fontSize: 13 }}>
            {error}
          </div>
        )}

        {/* Submit button */}
        {(step === 'login' || step === 'register') && (
          <button
            type="submit"
            disabled={loading}
            className="auth-step-enter"
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '14px 24px', borderRadius: 'var(--radius-lg)', background: loading ? 'var(--fdc-stone-2)' : 'var(--fdc-tangerine)', color: 'var(--fdc-cream)', border: 'none', fontWeight: 700, fontSize: 16, cursor: loading ? 'not-allowed' : 'pointer', width: '100%', marginTop: 2, transition: 'background 140ms', fontFamily: 'inherit' }}
          >
            {loading
              ? <><span className="auth-spinner" /> Aguarde…</>
              : step === 'login'
                ? 'Entrar e continuar →'
                : 'Criar conta e continuar →'}
          </button>
        )}
      </form>

      {/* Security note */}
      {step === 'email' && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 14, fontSize: 12, color: 'var(--fg-3)' }}>
          <span>🔒</span>
          <span>Seus dados são protegidos e não compartilhados.</span>
        </div>
      )}
    </div>
  )
}

// ─── Payment option ───────────────────────────────────────────
function PaymentOption({ icon, name, desc, selected }: { icon: string; name: string; desc: string; selected?: boolean }) {
  return (
    <label style={{ display: 'flex', alignItems: 'center', gap: 14, padding: 16, borderRadius: 12, border: `1.5px solid ${selected ? 'var(--fdc-tangerine)' : 'var(--line-2)'}`, background: selected ? 'rgba(236,82,18,0.04)' : 'var(--bg-surface)', cursor: 'pointer' }}>
      <div style={{ width: 22, height: 22, borderRadius: '50%', border: `2px solid ${selected ? 'var(--fdc-tangerine)' : 'var(--line-2)'}`, padding: 3, flexShrink: 0, display: 'grid', placeItems: 'center' }}>
        {selected && <div style={{ width: '100%', height: '100%', borderRadius: '50%', background: 'var(--fdc-tangerine)' }} />}
      </div>
      <div style={{ width: 40, height: 40, borderRadius: 10, background: 'var(--fdc-cream-deep)', display: 'grid', placeItems: 'center', fontSize: 20, flexShrink: 0 }}>
        {icon}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontWeight: 600, fontSize: 15 }}>{name}</div>
        <div style={{ fontSize: 13, color: 'var(--fg-2)' }}>{desc}</div>
      </div>
    </label>
  )
}

// ─── Order summary (right column) ────────────────────────────
function OrderSummary({ items, total }: { items: ReturnType<typeof useCart>['items']; total: number }) {
  const fmt = (cents: number) => 'R$ ' + (cents / 100).toFixed(2).replace('.', ',')
  return (
    <div className="checkout-summary" style={{ position: 'sticky', top: 24 }}>
      <div className="fdc-card" style={{ padding: 24 }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, paddingBottom: 14, borderBottom: '1px solid var(--line-2)', marginBottom: 14 }}>
          <div style={{ width: 52, height: 52, borderRadius: 10, background: 'linear-gradient(135deg, var(--fdc-tangerine-soft), var(--fdc-cream-deep))', flexShrink: 0 }} />
          <div style={{ minWidth: 0 }}>
            <div style={{ fontWeight: 600, fontSize: 15, lineHeight: 1.2, color: 'var(--fg-1)' }}>Arraiá da Escola</div>
            <div style={{ fontSize: 13, color: 'var(--fg-2)', marginTop: 2 }}>Seus ingressos</div>
          </div>
        </div>
        <div style={{ borderBottom: '1px solid var(--line-2)', paddingBottom: 14, marginBottom: 14 }}>
          {items.map((item) => (
            <div key={item.ticketTypeId} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', fontSize: 14 }}>
              <span style={{ color: 'var(--fg-2)' }}>{item.quantity}× {item.name}</span>
              <span style={{ fontWeight: 500, color: 'var(--fg-1)' }}>
                {item.price === 0 ? '—' : fmt(item.price * item.quantity)}
              </span>
            </div>
          ))}
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 14 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
            <span style={{ fontSize: 13, color: 'var(--fg-2)' }}>Subtotal</span>
            <span style={{ fontSize: 14, fontWeight: 500 }}>{fmt(total)}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
            <span style={{ fontSize: 13, color: 'var(--fg-2)' }}>Taxa do serviço <em style={{ color: 'var(--fdc-leaf-deep)', fontStyle: 'normal', marginLeft: 4 }}>· grátis no PIX</em></span>
            <span style={{ fontSize: 14, fontWeight: 500 }}>R$ 0,00</span>
          </div>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', borderTop: '1.5px dashed var(--line-2)', paddingTop: 14 }}>
          <span style={{ fontWeight: 600 }}>Total</span>
          <span style={{ fontSize: 22, fontWeight: 700, letterSpacing: '-0.01em', color: 'var(--fg-1)' }}>{fmt(total)}</span>
        </div>
      </div>
      <div style={{ marginTop: 12, padding: '12px 14px', background: 'var(--fdc-cream-deep)', borderRadius: 12, fontSize: 13, color: 'var(--fg-2)', display: 'flex', gap: 10, alignItems: 'flex-start' }}>
        <span style={{ fontSize: 15 }}>ℹ️</span>
        <span>Você terá 15 minutos para concluir o pagamento depois de avançar.</span>
      </div>
    </div>
  )
}

// ─── Main checkout page ───────────────────────────────────────
export default function CheckoutPage() {
  const { data: session, status } = useSession()
  const { items, total, clearCart } = useCart()
  const router = useRouter()
  const [orderLoading, setOrderLoading] = useState(false)
  const [orderError, setOrderError] = useState('')

  const handleOrder = async () => {
    if (items.length === 0) return
    setOrderLoading(true)
    setOrderError('')
    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items: items.map((i) => ({ ticketTypeId: i.ticketTypeId, quantity: i.quantity })) }),
      })
      const data = await res.json()
      if (!res.ok) { setOrderError(data.error || 'Erro ao criar pedido'); return }
      clearCart()
      router.push(`/pagamento/${data.orderId}`)
    } catch {
      setOrderError('Erro ao processar pedido. Tente novamente.')
    } finally {
      setOrderLoading(false)
    }
  }

  if (items.length === 0) {
    return (
      <div style={{ maxWidth: 480, margin: '0 auto', padding: '80px 24px', textAlign: 'center' }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>🛒</div>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 700, color: 'var(--fg-1)', marginBottom: 12 }}>Carrinho vazio</h1>
        <p style={{ color: 'var(--fg-2)', marginBottom: 24 }}>Selecione seus ingressos antes de continuar.</p>
        <Link href="/evento" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '12px 24px', borderRadius: 'var(--radius-lg)', background: 'var(--fdc-tangerine)', color: 'var(--fdc-cream)', fontWeight: 600, fontSize: 15, textDecoration: 'none' }}>
          Ver ingressos →
        </Link>
      </div>
    )
  }

  const isAuthenticated = status === 'authenticated'

  return (
    <div style={{ background: 'var(--bg-page)', minHeight: '100vh' }}>
      <div className="checkout-outer" style={{ maxWidth: 1100, margin: '0 auto', padding: '32px 40px 80px' }}>

        {/* Step bar */}
        <div style={{ marginBottom: 28 }}>
          <StepBar step={1} />
        </div>

        <div className="checkout-grid" style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 380px', gap: 36, alignItems: 'start' }}>

          {/* LEFT col */}
          <div>
            {/* Title */}
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(24px, 3.5vw, 40px)', fontWeight: 700, letterSpacing: '-0.03em', lineHeight: 1.05, color: 'var(--fg-1)', margin: '0 0 6px' }}>
              {isAuthenticated ? 'Confirme e finalize' : 'Quase lá — identifique-se'}
            </h1>
            <p style={{ color: 'var(--fg-2)', fontSize: 16, margin: '0 0 24px' }}>
              {isAuthenticated
                ? `Tudo certo, ${session.user.name?.split(' ')[0]}! Escolha como pagar.`
                : 'Entre ou crie uma conta rápida para receber seus ingressos por e-mail.'}
            </p>

            {/* Authenticated user info */}
            {isAuthenticated && (
              <div className="fdc-card auth-step-enter" style={{ padding: 20, marginBottom: 20, display: 'flex', alignItems: 'center', gap: 14 }}>
                <div style={{ width: 42, height: 42, borderRadius: '50%', background: 'linear-gradient(135deg, var(--fdc-tangerine-soft), var(--fdc-sun-soft))', display: 'grid', placeItems: 'center', fontSize: 18, fontWeight: 700, color: 'var(--fdc-cream)', flexShrink: 0 }}>
                  {session.user.name?.[0]?.toUpperCase() ?? '?'}
                </div>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontWeight: 600, fontSize: 15, color: 'var(--fg-1)' }}>{session.user.name}</div>
                  <div style={{ fontSize: 13, color: 'var(--fg-2)', marginTop: 2 }}>{session.user.email}</div>
                </div>
                <span style={{ marginLeft: 'auto', fontSize: 11, fontWeight: 700, color: 'var(--fdc-leaf-deep)', background: 'rgba(111,168,74,0.12)', padding: '3px 10px', borderRadius: 999, whiteSpace: 'nowrap', flexShrink: 0 }}>
                  ✓ Identificado
                </span>
              </div>
            )}

            {/* Embedded auth (shown when not authenticated) */}
            {!isAuthenticated && status !== 'loading' && <EmbeddedAuth />}

            {/* Payment method */}
            <div className="fdc-card" style={{ padding: 24, marginBottom: 20 }}>
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 600, letterSpacing: '-0.02em', color: 'var(--fg-1)', margin: '0 0 14px' }}>
                Forma de pagamento
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <PaymentOption icon="🏦" name="PIX" desc="Aprovação instantânea · sem taxa" selected />
                <PaymentOption icon="💳" name="Cartão de crédito" desc="Em até 3× sem juros (em breve)" />
              </div>
            </div>

            {/* Order error */}
            {orderError && (
              <div style={{ padding: '12px 16px', background: 'rgba(216,56,56,0.08)', border: '1px solid rgba(216,56,56,0.2)', borderRadius: 'var(--radius-md)', color: 'var(--fdc-danger)', fontSize: 14, marginBottom: 20 }}>
                {orderError}
              </div>
            )}

            {/* Actions */}
            <div className="checkout-actions" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 }}>
              <Link href="/evento" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '10px 16px', borderRadius: 'var(--radius-md)', background: 'transparent', color: 'var(--fg-2)', fontWeight: 500, fontSize: 14, textDecoration: 'none' }}>
                ← Voltar
              </Link>

              {isAuthenticated && (
                <button
                  onClick={handleOrder}
                  disabled={orderLoading}
                  className="checkout-btn-proceed auth-step-enter"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '14px 32px', borderRadius: 'var(--radius-lg)', background: orderLoading ? 'var(--fdc-stone-2)' : 'var(--fdc-tangerine)', color: 'var(--fdc-cream)', fontWeight: 700, fontSize: 16, border: 'none', cursor: orderLoading ? 'not-allowed' : 'pointer', transition: 'background 140ms', fontFamily: 'inherit' }}
                >
                  {orderLoading ? <><span className="auth-spinner" /> Processando…</> : 'Ir para o pagamento →'}
                </button>
              )}
            </div>
          </div>

          {/* RIGHT col — order summary */}
          <OrderSummary items={items} total={total} />
        </div>
      </div>
    </div>
  )
}
