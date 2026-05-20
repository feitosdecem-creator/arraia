'use client'

import { useState } from 'react'

type Props = {
  orderId: string
  ticketId: string
  eventName: string
  appUrl: string
}

export function TicketActions({ orderId, ticketId, eventName, appUrl }: Props) {
  const [emailState, setEmailState] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle')

  const handleResendEmail = async () => {
    setEmailState('sending')
    try {
      const res = await fetch(`/api/orders/${orderId}/resend-email`, { method: 'POST' })
      if (res.ok) {
        setEmailState('sent')
        setTimeout(() => setEmailState('idle'), 4000)
      } else {
        setEmailState('error')
        setTimeout(() => setEmailState('idle'), 3000)
      }
    } catch {
      setEmailState('error')
      setTimeout(() => setEmailState('idle'), 3000)
    }
  }

  const waText = encodeURIComponent(
    `Meu ingresso para ${eventName}:\n${appUrl}/meus-ingressos/${ticketId}`
  )
  const waUrl = `https://wa.me/?text=${waText}`

  const btnBase: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    padding: '13px 16px',
    borderRadius: 12,
    fontWeight: 600,
    fontSize: 14,
    cursor: 'pointer',
    transition: 'all 140ms',
    fontFamily: 'inherit',
    textDecoration: 'none',
    border: '1.5px solid var(--line-1)',
    background: 'var(--bg-surface)',
    color: 'var(--fg-1)',
    flex: '1 1 0',
    minWidth: 0,
  }

  return (
    <div className="ticket-actions-row" style={{ display: 'flex', gap: 10, marginTop: 16 }}>
      <a
        href={`/api/orders/${orderId}/pdf`}
        download
        style={{ ...btnBase, borderColor: 'var(--fdc-tangerine)', color: 'var(--fdc-tangerine-deep)', background: 'rgba(236,82,18,0.06)' }}
      >
        <span style={{ fontSize: 16 }}>📥</span>
        <span>PDF</span>
      </a>

      <a
        href={waUrl}
        target="_blank"
        rel="noopener noreferrer"
        style={{ ...btnBase, borderColor: '#22c55e', color: '#16a34a', background: 'rgba(34,197,94,0.06)' }}
      >
        <span style={{ fontSize: 16 }}>💬</span>
        <span>WhatsApp</span>
      </a>

      <button
        onClick={handleResendEmail}
        disabled={emailState === 'sending' || emailState === 'sent'}
        style={{
          ...btnBase,
          cursor: emailState === 'sending' ? 'not-allowed' : 'pointer',
          opacity: emailState === 'sending' ? 0.7 : 1,
          borderColor: emailState === 'sent' ? 'var(--fdc-leaf)' : emailState === 'error' ? 'var(--fdc-danger)' : 'var(--line-1)',
          color: emailState === 'sent' ? 'var(--fdc-leaf-deep)' : emailState === 'error' ? 'var(--fdc-danger)' : 'var(--fg-1)',
          background: emailState === 'sent' ? 'rgba(111,168,74,0.08)' : 'var(--bg-surface)',
        }}
      >
        {emailState === 'sending' ? (
          <><span className="auth-spinner" style={{ borderTopColor: 'var(--fg-2)', borderColor: 'var(--line-2)' }} /> Enviando…</>
        ) : emailState === 'sent' ? (
          <><span>✓</span> Enviado!</>
        ) : emailState === 'error' ? (
          <><span>✕</span> Erro</>
        ) : (
          <><span style={{ fontSize: 16 }}>📧</span> E-mail</>
        )}
      </button>
    </div>
  )
}
