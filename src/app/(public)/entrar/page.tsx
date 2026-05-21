'use client'

import { useSession, signIn } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useState, useRef, useEffect, Suspense } from 'react'
import Link from 'next/link'

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden>
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05" />
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
    </svg>
  )
}

function IconMail() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <rect x="2" y="4" width="20" height="16" rx="2" />
      <path d="M2 7l10 7 10-7" />
    </svg>
  )
}

function IconLock() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <rect x="3" y="11" width="18" height="11" rx="2" />
      <path d="M7 11V7a5 5 0 0110 0v4" />
    </svg>
  )
}

function IconUser() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  )
}

function IconEye({ open }: { open: boolean }) {
  return open ? (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  ) : (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24" />
      <line x1="1" y1="1" x2="23" y2="23" />
    </svg>
  )
}

type Step = 'email' | 'checking' | 'login' | 'register'

const INP: React.CSSProperties = {
  width: '100%',
  padding: '12px 16px 12px 42px',
  border: '1.5px solid var(--line-1)',
  borderRadius: 12,
  fontSize: 15,
  fontFamily: 'inherit',
  background: 'var(--bg-surface)',
  color: 'var(--fg-1)',
  outline: 'none',
  transition: 'border-color 140ms',
  boxSizing: 'border-box',
}

function Field({
  label,
  icon,
  trailing,
  children,
}: {
  label: string
  icon: React.ReactNode
  trailing?: React.ReactNode
  children: React.ReactNode
}) {
  return (
    <div>
      <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--fg-1)', marginBottom: 6 }}>
        {label}
      </label>
      <div style={{ position: 'relative' }}>
        <span style={{
          position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)',
          color: 'var(--fg-3)', pointerEvents: 'none', display: 'flex',
        }}>
          {icon}
        </span>
        {children}
        {trailing && (
          <span style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)' }}>
            {trailing}
          </span>
        )}
      </div>
    </div>
  )
}

function LoginForm() {
  const { status, data: session } = useSession()
  const router = useRouter()
  const searchParams = useSearchParams()
  const next = searchParams.get('callbackUrl') || searchParams.get('next') || '/meus-ingressos'

  const [step, setStep] = useState<Step>('email')
  const [email, setEmail] = useState('')
  const [name, setName] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)
  const [error, setError] = useState('')

  const emailRef = useRef<HTMLInputElement>(null)
  const passwordRef = useRef<HTMLInputElement>(null)
  const nameRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (status === 'authenticated') {
      // Admins always go to /admin to avoid loops with /meus-ingressos
      router.replace(session?.user?.isAdmin ? '/admin' : next)
    }
  }, [status, router, next, session])

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
      const nextStep: Step = data.exists ? 'login' : 'register'
      setStep(nextStep)
      setTimeout(() => {
        if (nextStep === 'login') passwordRef.current?.focus()
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
    } catch {
      setError('Erro inesperado. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  const handleGoogle = async () => {
    setGoogleLoading(true)
    await signIn('google', { callbackUrl: next })
  }

  if (status === 'loading' || status === 'authenticated') {
    return (
      <div style={{ textAlign: 'center', padding: '48px 0' }}>
        <span className="auth-spinner" style={{ borderTopColor: 'var(--fdc-tangerine)', borderColor: 'var(--line-2)', width: 28, height: 28, borderWidth: 3, margin: '0 auto' }} />
      </div>
    )
  }

  const isLogin = step === 'login'
  const isRegister = step === 'register'
  const showForm = isLogin || isRegister

  const heading = isLogin ? 'Bem-vindo de volta' : isRegister ? 'Crie sua conta' : 'Acesse sua conta'
  const subheading = isLogin
    ? 'Entre para ver seus ingressos.'
    : isRegister
    ? 'Em segundos você já pode comprar ingressos.'
    : 'Entre ou cadastre-se para comprar seus ingressos.'

  return (
    <form onSubmit={handleSubmit} noValidate>
      <h1 style={{
        fontFamily: 'var(--font-display)',
        fontSize: 26,
        fontWeight: 800,
        letterSpacing: '-0.03em',
        color: 'var(--fg-1)',
        margin: '0 0 6px',
        lineHeight: 1.1,
      }}>
        {heading}
      </h1>
      <p style={{ fontSize: 14, color: 'var(--fg-2)', margin: '0 0 22px', lineHeight: 1.5 }}>
        {subheading}
      </p>

      {/* Google OAuth */}
      <button
        type="button"
        onClick={handleGoogle}
        disabled={googleLoading}
        style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
          width: '100%', padding: '12px 16px',
          borderRadius: 12,
          border: '1.5px solid var(--line-1)',
          background: 'var(--bg-surface)',
          color: 'var(--fg-1)',
          fontSize: 14, fontWeight: 600,
          cursor: googleLoading ? 'not-allowed' : 'pointer',
          fontFamily: 'inherit',
          transition: 'border-color 140ms, background 140ms',
          opacity: googleLoading ? 0.6 : 1,
        }}
      >
        {googleLoading
          ? <span className="auth-spinner" style={{ borderTopColor: '#4285F4', borderColor: 'var(--line-2)', width: 18, height: 18, borderWidth: 2 }} />
          : <GoogleIcon />}
        {isRegister ? 'Cadastrar com Google' : 'Entrar com Google'}
      </button>

      {/* Divider */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, margin: '18px 0' }}>
        <div style={{ flex: 1, height: 1, background: 'var(--line-2)' }} />
        <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--fg-3)' }}>
          ou com e-mail
        </span>
        <div style={{ flex: 1, height: 1, background: 'var(--line-2)' }} />
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

        {/* Email chip (after detection) */}
        {showForm && (
          <div className="auth-step-enter" style={{
            display: 'flex', alignItems: 'center', gap: 8,
            padding: '9px 12px',
            background: 'var(--bg-sunken)',
            borderRadius: 10,
            border: '1px solid var(--line-2)',
          }}>
            <span style={{ color: 'var(--fg-3)', display: 'flex', flexShrink: 0 }}><IconMail /></span>
            <span style={{ fontSize: 14, color: 'var(--fg-1)', fontWeight: 500, flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {email}
            </span>
            <button
              type="button"
              onClick={() => { setStep('email'); setPassword(''); setName(''); setError(''); setTimeout(() => emailRef.current?.focus(), 60) }}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--fg-3)', fontSize: 18, lineHeight: 1, padding: '0 2px', flexShrink: 0 }}
              aria-label="Trocar e-mail"
            >
              ×
            </button>
          </div>
        )}

        {/* Email input */}
        {!showForm && (
          <Field label="E-mail" icon={<IconMail />}>
            <input
              ref={emailRef}
              type="email"
              value={email}
              onChange={(e) => { setEmail(e.target.value); setError('') }}
              onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), checkEmail())}
              placeholder="voce@email.com"
              autoComplete="email"
              autoFocus
              style={INP}
            />
          </Field>
        )}

        {/* Name — register only */}
        {isRegister && (
          <div className="auth-step-enter">
            <Field label="Nome completo" icon={<IconUser />}>
              <input
                ref={nameRef}
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Maria Souza"
                autoComplete="name"
                required
                style={INP}
              />
            </Field>
          </div>
        )}

        {/* Password */}
        {showForm && (
          <div className="auth-step-enter">
            <Field
              label={isRegister ? 'Crie uma senha' : 'Senha'}
              icon={<IconLock />}
              trailing={
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--fg-3)', display: 'flex', padding: 0 }}
                  aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
                >
                  <IconEye open={showPassword} />
                </button>
              }
            >
              <input
                ref={passwordRef}
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={isRegister ? 'Mínimo 8 caracteres' : '••••••••'}
                autoComplete={isRegister ? 'new-password' : 'current-password'}
                minLength={8}
                required
                style={{ ...INP, paddingRight: 42 }}
              />
            </Field>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="auth-step-enter" style={{
            padding: '10px 14px',
            background: 'rgba(216,56,56,0.08)',
            border: '1px solid rgba(216,56,56,0.18)',
            borderRadius: 10,
            color: 'var(--fdc-danger)',
            fontSize: 13,
          }}>
            {error}
          </div>
        )}

        {/* Primary CTA */}
        <button
          type="submit"
          disabled={loading || step === 'checking' || (!showForm && !isEmailValid)}
          style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            padding: '14px 24px',
            borderRadius: 999,
            background: (loading || step === 'checking' || (!showForm && !isEmailValid))
              ? 'var(--fdc-stone-2)'
              : 'var(--fdc-tangerine)',
            color: 'white',
            border: 'none',
            fontWeight: 700, fontSize: 15,
            cursor: (loading || step === 'checking') ? 'not-allowed' : 'pointer',
            width: '100%',
            transition: 'background 140ms',
            fontFamily: 'inherit',
            letterSpacing: '-0.01em',
          }}
        >
          {loading || step === 'checking'
            ? <><span className="auth-spinner" style={{ borderTopColor: 'white', borderColor: 'rgba(255,255,255,0.3)', width: 18, height: 18, borderWidth: 2 }} /> Aguarde…</>
            : showForm
            ? isLogin ? 'Entrar →' : 'Criar conta →'
            : 'Continuar →'}
        </button>

        {/* Toggle login/register */}
        <p style={{ textAlign: 'center', fontSize: 13, color: 'var(--fg-3)', margin: 0 }}>
          {isRegister
            ? <>Já tem conta?{' '}<button type="button" onClick={() => { setStep('email'); setPassword(''); setName(''); setError('') }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--fdc-tangerine)', fontWeight: 600, fontSize: 13, padding: 0, fontFamily: 'inherit' }}>Entrar agora</button></>
            : isLogin
            ? <>Não tem conta?{' '}<button type="button" onClick={() => { setStep('register'); setPassword(''); setError('') }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--fdc-tangerine)', fontWeight: 600, fontSize: 13, padding: 0, fontFamily: 'inherit' }}>Criar agora</button></>
            : null}
        </p>
      </div>
    </form>
  )
}

export default function EntrarPage() {
  return (
    <div style={{ background: 'var(--bg-page)', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>

      {/* Dark event strip */}
      <div style={{
        background: '#1a1410',
        padding: '18px var(--container-pad)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        flexShrink: 0,
      }}>
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
          <img src="/logo-navbar.svg" alt="Arraiá nu Quintal 2" style={{ height: 28, width: 'auto', filter: 'brightness(0) invert(1)', opacity: 0.9 }} />
        </Link>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#f5c84a', display: 'inline-block', animation: 'pulse 2s ease-in-out infinite' }} />
          <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(253,250,245,0.65)' }}>
            Próximo evento
          </span>
        </div>
      </div>

      {/* Form area */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '32px 16px 48px' }}>
        <div style={{ width: '100%', maxWidth: 400 }}>

          {/* Card */}
          <div className="fdc-card" style={{ padding: '32px 28px' }}>
            <Suspense fallback={<div style={{ height: 200 }} />}>
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
    </div>
  )
}
