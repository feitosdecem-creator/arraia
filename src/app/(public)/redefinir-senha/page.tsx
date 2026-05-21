'use client'

import { useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'

function IconLock() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <rect x="3" y="11" width="18" height="11" rx="2" />
      <path d="M7 11V7a5 5 0 0110 0v4" />
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

const INP: React.CSSProperties = {
  width: '100%',
  padding: '12px 42px 12px 42px',
  border: '1.5px solid var(--line-1)',
  borderRadius: 12,
  fontSize: 15,
  fontFamily: 'inherit',
  background: 'var(--bg-surface)',
  color: 'var(--fg-1)',
  outline: 'none',
  boxSizing: 'border-box',
}

function ResetForm() {
  const searchParams = useSearchParams()
  const token = searchParams.get('token')

  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)
  const [error, setError] = useState('')

  if (!token) {
    return (
      <div style={{ textAlign: 'center' }}>
        <p style={{ color: 'var(--fdc-danger)', fontSize: 14, marginBottom: 16 }}>
          Link inválido.
        </p>
        <Link href="/esqueci-senha" style={{ color: 'var(--fdc-tangerine)', fontWeight: 600, fontSize: 14, textDecoration: 'none' }}>
          Solicitar novo link →
        </Link>
      </div>
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (password.length < 8) { setError('A senha deve ter pelo menos 8 caracteres.'); return }
    if (password !== confirm) { setError('As senhas não coincidem.'); return }
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error || 'Erro ao redefinir. Tente novamente.'); return }
      setDone(true)
    } catch {
      setError('Erro inesperado. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  if (done) {
    return (
      <div style={{ textAlign: 'center' }}>
        <div style={{
          padding: '14px 16px',
          background: 'rgba(34,197,94,0.08)',
          border: '1px solid rgba(34,197,94,0.22)',
          borderRadius: 10,
          color: '#15803d',
          fontSize: 14,
          lineHeight: 1.5,
          marginBottom: 20,
        }}>
          Senha redefinida com sucesso!
        </div>
        <Link href="/entrar" style={{ color: 'var(--fdc-tangerine)', fontWeight: 600, fontSize: 14, textDecoration: 'none' }}>
          Ir para o login →
        </Link>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} noValidate style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      {/* New password */}
      <div>
        <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--fg-1)', marginBottom: 6 }}>
          Nova senha
        </label>
        <div style={{ position: 'relative' }}>
          <span style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--fg-3)', pointerEvents: 'none', display: 'flex' }}>
            <IconLock />
          </span>
          <input
            type={showPassword ? 'text' : 'password'}
            value={password}
            onChange={(e) => { setPassword(e.target.value); setError('') }}
            placeholder="Mínimo 8 caracteres"
            autoComplete="new-password"
            autoFocus
            required
            style={INP}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--fg-3)', display: 'flex', padding: 0 }}
            aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
          >
            <IconEye open={showPassword} />
          </button>
        </div>
      </div>

      {/* Confirm password */}
      <div>
        <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--fg-1)', marginBottom: 6 }}>
          Confirmar senha
        </label>
        <div style={{ position: 'relative' }}>
          <span style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--fg-3)', pointerEvents: 'none', display: 'flex' }}>
            <IconLock />
          </span>
          <input
            type={showConfirm ? 'text' : 'password'}
            value={confirm}
            onChange={(e) => { setConfirm(e.target.value); setError('') }}
            placeholder="Repita a nova senha"
            autoComplete="new-password"
            required
            style={INP}
          />
          <button
            type="button"
            onClick={() => setShowConfirm(!showConfirm)}
            style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--fg-3)', display: 'flex', padding: 0 }}
            aria-label={showConfirm ? 'Ocultar senha' : 'Mostrar senha'}
          >
            <IconEye open={showConfirm} />
          </button>
        </div>
      </div>

      {error && (
        <div style={{
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

      <button
        type="submit"
        disabled={loading}
        style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
          padding: '14px 24px',
          borderRadius: 999,
          background: loading ? 'var(--fdc-stone-2)' : 'var(--fdc-tangerine)',
          color: 'white',
          border: 'none',
          fontWeight: 700, fontSize: 15,
          cursor: loading ? 'not-allowed' : 'pointer',
          width: '100%',
          fontFamily: 'inherit',
          letterSpacing: '-0.01em',
        }}
      >
        {loading
          ? <><span className="auth-spinner" style={{ borderTopColor: 'white', borderColor: 'rgba(255,255,255,0.3)', width: 18, height: 18, borderWidth: 2 }} /> Aguarde…</>
          : 'Redefinir senha →'}
      </button>
    </form>
  )
}

export default function RedefinirSenhaPage() {
  return (
    <div style={{ background: 'var(--bg-page)', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '32px 16px 48px' }}>
        <div style={{ width: '100%', maxWidth: 400 }}>
          <div className="fdc-card" style={{ padding: '32px 28px' }}>
            <h1 style={{
              fontFamily: 'var(--font-display)',
              fontSize: 26,
              fontWeight: 800,
              letterSpacing: '-0.03em',
              color: 'var(--fg-1)',
              margin: '0 0 6px',
              lineHeight: 1.1,
            }}>
              Redefinir senha
            </h1>
            <p style={{ fontSize: 14, color: 'var(--fg-2)', margin: '0 0 22px', lineHeight: 1.5 }}>
              Escolha uma nova senha para sua conta.
            </p>
            <Suspense fallback={<div style={{ height: 120 }} />}>
              <ResetForm />
            </Suspense>
          </div>
          <p style={{ textAlign: 'center', marginTop: 20, fontSize: 13, color: 'var(--fg-3)' }}>
            <Link href="/entrar" style={{ color: 'var(--fdc-tangerine)', textDecoration: 'none', fontWeight: 500 }}>
              ← Voltar para o login
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
