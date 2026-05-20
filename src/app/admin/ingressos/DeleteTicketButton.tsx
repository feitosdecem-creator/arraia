'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export function DeleteTicketButton({ ticketId, isUsed }: { ticketId: string; isUsed: boolean }) {
  const router = useRouter()
  const [confirming, setConfirming] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  if (isUsed) {
    return (
      <span title="Ingresso já utilizado — não pode ser excluído" style={{ fontSize: 12, color: 'var(--fg-3)', cursor: 'not-allowed', userSelect: 'none' }}>
        —
      </span>
    )
  }

  const handleDelete = async () => {
    setLoading(true)
    setError('')
    try {
      const res = await fetch(`/api/admin/tickets/${ticketId}`, { method: 'DELETE' })
      const d = await res.json()
      if (!res.ok) throw new Error(d.error || 'Erro ao excluir')
      setConfirming(false)
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao excluir.')
      setConfirming(false)
    } finally {
      setLoading(false)
    }
  }

  if (confirming) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
        {error && <span style={{ fontSize: 11, color: 'var(--fdc-danger)' }}>{error}</span>}
        <button
          onClick={handleDelete}
          disabled={loading}
          style={{ padding: '4px 10px', borderRadius: 8, background: 'var(--fdc-danger)', color: 'white', border: 'none', fontSize: 12, fontWeight: 600, cursor: loading ? 'not-allowed' : 'pointer', fontFamily: 'inherit' }}
        >
          {loading ? '…' : 'Confirmar'}
        </button>
        <button
          onClick={() => { setConfirming(false); setError('') }}
          style={{ padding: '4px 10px', borderRadius: 8, border: '1px solid var(--line-2)', background: 'none', fontSize: 12, cursor: 'pointer', fontFamily: 'inherit' }}
        >
          Não
        </button>
      </div>
    )
  }

  return (
    <button
      onClick={() => setConfirming(true)}
      style={{ padding: '4px 12px', borderRadius: 8, border: '1px solid rgba(216,56,56,0.28)', background: 'rgba(216,56,56,0.05)', color: 'var(--fdc-danger)', fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}
    >
      Excluir
    </button>
  )
}
