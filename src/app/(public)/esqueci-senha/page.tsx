'use client'

import { useState } from 'react'
import Link from 'next/link'

export default function EsqueciSenhaPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim() }),
      })
      setDone(true)
    } catch {
      setError('Erro inesperado. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

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
              Esqueci minha senha
            </h1>
            <p style={{ fontSize: 14, color: 'var(--fg-2)', margin: '0 0 22px', lineHeight: 1.5 }}>
              Informe seu e-mail e enviaremos um link para redefinir sua senha.
            </p>

            {done ? (
              <div style={{
                padding: '14px 16px',
                background: 'rgba(34,197,94,0.08)',
                border: '1px solid rgba(34,197,94,0.22)',
                borderRadius: 10,
                color: '#15803d',
                fontSize: 14,
                lineHeight: 1.5,
              }}>
                Se esse e-mail estiver cadastrado, você receberá um link em instantes.
              </div>
            ) : (
              <form onSubmit={handleSubmit} noValidate style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--fg-1)', marginBottom: 6 }}>
                    E-mail
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => { setEmail(e.target.value); setError('') }}
                    placeholder="voce@email.com"
                    autoComplete="email"
                    autoFocus
                    required
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      border: '1.5px solid var(--line-1)',
                      borderRadius: 12,
                      fontSize: 15,
                      fontFamily: 'inherit',
                      background: 'var(--bg-surface)',
                      color: 'var(--fg-1)',
                      outline: 'none',
                      boxSizing: 'border-box',
                    }}
                  />
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
                    : 'Enviar link →'}
                </button>
              </form>
            )}
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
