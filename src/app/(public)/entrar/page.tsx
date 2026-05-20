'use client'

import { useSession, signIn } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useState, useRef, useEffect, Suspense } from 'react'
import Link from 'next/link'

type Step = 'email' | 'checking' | 'login' | 'register'

function LoginForm() {
  const { status } = useSession()
  const router = useRouter()
  const searchParams = useSearchParams()
  const next = searchParams.get('callbackUrl') || searchParams.get('next') || '/meus-ingressos'

  const [step, setStep] = useState<Step>('email')
  const [email, setEmail] = useState('')
  const [name, setName] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const emailRef = useRef<HTMLInputElement>(null)
  const passwordRef = useRef<HTMLInputElement>(null)
  const nameRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (status === 'authenticated') router.replace(next)
  }, [status, router, next])

  const isEmailValid = email.includes('@') && email.includes('.')

  const checkEmail = async () => {
    if (!isEmailValid) { emailRef.current?.focus(); return }
    setStep('checking')
    setError('')
    try {
      const res = await fetch('/api/auth/check-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim() }),
      })
      const data = await res.json()
      const next: Step = data.exists ? 'login' : 'register'
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
      // on success useEffect above handles redirect
    } catch {
      setError('Erro inesperado. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  const inp: React.CSSProperties = {
    width: '100%', padding: '13px 16px',
    border: '1.5px solid var(--line-1)', borderRadius: 'var(--radius-md)',
    fontSize: 15, fontFamily: 'inherit', background: 'var(--bg-surface)',
    color: 'var(--fg-1)', outline: 'none', transition: 'border-color 140ms',
    boxSizing: 'border-box',
  }

  if (status === 'loading' || status === 'authenticated') {
    return (
      <div style={{ textAlign: 'center', padding: '40px 0' }}>
        <span className="auth-spinner" style={{ borderTopColor: 'var(--fdc-tangerine)', borderColor: 'var(--line-2)', width: 24, height: 24, borderWidth: 3, margin: '0 auto' }} />
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

      {/* Step badge */}
      {step === 'login' && (
        <div className="auth-step-enter" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '4px 12px', borderRadius: 999, background: 'rgba(111,168,74,0.14)', color: 'var(--fdc-leaf-deep)', fontSize: 12, fontWeight: 700, letterSpacing: '0.02em', alignSelf: 'flex-start' }}>
          ✓ Bem-vindo de volta!
        </div>
      )}
      {step === 'register' && (
        <div className="auth-step-enter" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '4px 12px', borderRadius: 999, background: 'rgba(236,82,18,0.1)', color: 'var(--fdc-tangerine-deep)', fontSize: 12, fontWeight: 700, letterSpacing: '0.02em', alignSelf: 'flex-start' }}>
          ✨ Conta nova — rápido e fácil
        </div>
      )}

      {/* Email chip */}
      {(step === 'login' || step === 'register') && (
        <div className="auth-step-enter" style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px', background: 'var(--bg-sunken)', borderRadius: 10 }}>
          <span style={{ fontSize: 14, color: 'var(--fg-1)', fontWeight: 500, flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {email}
          </span>
          <button type="button" onClick={() => { setStep('email'); setPassword(''); setName(''); setError(''); setTimeout(() => emailRef.current?.focus(), 60) }}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--fg-3)', fontSize: 18, lineHeight: 1, padding: '0 2px', flexShrink: 0 }}>
            ×
          </button>
        </div>
      )}

      {/* Email input */}
      {(step === 'email' || step === 'checking') && (
        <div>
          <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--fg-1)', marginBottom: 6 }}>
            E-mail
          </label>
          <div style={{ display: 'flex', gap: 8 }}>
            <input
              ref={emailRef}
              type="email"
              value={email}
              onChange={(e) => { setEmail(e.target.value); setError('') }}
              onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), checkEmail())}
              placeholder="voce@email.com"
              autoComplete="email"
              autoFocus
              style={{ ...inp, flex: 1 }}
            />
            <button
              type="button"
              onClick={checkEmail}
              disabled={step === 'checking' || !isEmailValid}
              style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', padding: '0 20px', borderRadius: 'var(--radius-md)', background: !isEmailValid ? 'var(--fdc-stone-2)' : 'var(--fdc-tangerine)', color: 'white', border: 'none', fontWeight: 700, fontSize: 16, cursor: !isEmailValid ? 'not-allowed' : 'pointer', minWidth: 52, flexShrink: 0, transition: 'background 140ms' }}
            >
              {step === 'checking' ? <span className="auth-spinner" /> : '→'}
            </button>
          </div>
        </div>
      )}

      {/* Name — register only */}
      {step === 'register' && (
        <div className="auth-step-enter">
          <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--fg-1)', marginBottom: 6 }}>
            Nome completo
          </label>
          <input ref={nameRef} type="text" value={name} onChange={(e) => setName(e.target.value)}
            placeholder="Maria Souza" autoComplete="name" required style={inp} />
        </div>
      )}

      {/* Password */}
      {(step === 'login' || step === 'register') && (
        <div className="auth-step-enter">
          <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--fg-1)', marginBottom: 6 }}>
            {step === 'login' ? 'Senha' : 'Crie uma senha'}
          </label>
          <input ref={passwordRef} type="password" value={password} onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••" autoComplete={step === 'login' ? 'current-password' : 'new-password'}
            minLength={6} required style={inp} />
          {step === 'register' && (
            <p style={{ fontSize: 12, color: 'var(--fg-3)', margin: '5px 0 0' }}>Mínimo 6 caracteres</p>
          )}
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="auth-step-enter" style={{ padding: '10px 14px', background: 'rgba(216,56,56,0.08)', border: '1px solid rgba(216,56,56,0.18)', borderRadius: 10, color: 'var(--fdc-danger)', fontSize: 13 }}>
          {error}
        </div>
      )}

      {/* Submit */}
      {(step === 'login' || step === 'register') && (
        <button
          type="submit"
          disabled={loading}
          className="auth-step-enter"
          style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '14px 24px', borderRadius: 'var(--radius-lg)', background: loading ? 'var(--fdc-stone-2)' : 'var(--fdc-tangerine)', color: 'white', border: 'none', fontWeight: 700, fontSize: 15, cursor: loading ? 'not-allowed' : 'pointer', width: '100%', transition: 'background 140ms', fontFamily: 'inherit' }}
        >
          {loading
            ? <><span className="auth-spinner" /> Aguarde…</>
            : step === 'login' ? 'Entrar →' : 'Criar conta →'}
        </button>
      )}

      {/* Security note */}
      {step === 'email' && (
        <p style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--fg-3)', margin: 0 }}>
          <span>🔒</span> Seus dados são protegidos e não compartilhados.
        </p>
      )}
    </form>
  )
}

export default function EntrarPage() {
  return (
    <div style={{ background: 'var(--bg-page)', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px 16px' }}>
      <div style={{ width: '100%', maxWidth: 420 }}>

        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <Link href="/" style={{ display: 'inline-flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
            <div style={{ width: 40, height: 40, borderRadius: 12, background: 'var(--fdc-tangerine)', color: 'white', display: 'grid', placeItems: 'center', fontWeight: 800, fontSize: 18 }}>
              A
            </div>
            <span style={{ fontWeight: 700, fontSize: 17, color: 'var(--fg-1)' }}>Arraiá nu Quintal 2</span>
          </Link>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 26, fontWeight: 800, letterSpacing: '-0.03em', color: 'var(--fg-1)', margin: '20px 0 6px' }}>
            Acesse sua conta
          </h1>
          <p style={{ fontSize: 14, color: 'var(--fg-2)', margin: 0 }}>
            Entre para ver seus ingressos e pedidos.
          </p>
        </div>

        {/* Card */}
        <div className="fdc-card" style={{ padding: '28px 28px' }}>
          <Suspense fallback={<div style={{ height: 80 }} />}>
            <LoginForm />
          </Suspense>
        </div>

        {/* Back link */}
        <p style={{ textAlign: 'center', marginTop: 20, fontSize: 13, color: 'var(--fg-3)' }}>
          <Link href="/evento" style={{ color: 'var(--fdc-tangerine)', textDecoration: 'none', fontWeight: 500 }}>
            ← Ver ingressos disponíveis
          </Link>
        </p>
      </div>
    </div>
  )
}
