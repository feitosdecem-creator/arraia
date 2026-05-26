'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export function SyncOrderButton({ orderId }: { orderId: string }) {
  const router = useRouter()
  const [syncing, setSyncing] = useState(false)
  const [msg, setMsg] = useState('')

  const handleSync = async () => {
    setSyncing(true)
    setMsg('')
    try {
      const res = await fetch(`/api/orders/${orderId}/sync`, { method: 'POST' })
      const data = await res.json()
      if (data.status === 'PAID') {
        router.refresh()
        return
      }
      setMsg(data.mpStatus ?? 'Pendente')
    } catch {
      setMsg('Erro')
    } finally {
      setSyncing(false)
    }
  }

  if (msg) {
    return <span style={{ fontSize: 11, color: 'var(--fg-3)' }}>{msg}</span>
  }

  return (
    <button
      onClick={handleSync}
      disabled={syncing}
      style={{
        padding: '4px 10px',
        borderRadius: 6,
        border: '1px solid var(--fdc-tangerine)',
        background: 'transparent',
        color: 'var(--fdc-tangerine)',
        fontSize: 11,
        fontWeight: 600,
        cursor: syncing ? 'not-allowed' : 'pointer',
        fontFamily: 'inherit',
        opacity: syncing ? 0.6 : 1,
        whiteSpace: 'nowrap',
      }}
    >
      {syncing ? 'Verificando…' : 'Sincronizar'}
    </button>
  )
}
