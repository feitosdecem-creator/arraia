'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export function NewTicketTypeForm({ eventId }: { eventId: string }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [open, setOpen] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const form = e.currentTarget
    const data = {
      eventId,
      name: (form.elements.namedItem('name') as HTMLInputElement).value,
      description: (form.elements.namedItem('description') as HTMLInputElement).value || null,
      price: Math.round(parseFloat((form.elements.namedItem('price') as HTMLInputElement).value) * 100),
      stock: parseInt((form.elements.namedItem('stock') as HTMLInputElement).value),
    }

    try {
      const res = await fetch('/api/admin/ticket-types', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!res.ok) throw new Error('Erro ao criar tipo de ingresso')
      form.reset()
      setOpen(false)
      router.refresh()
    } catch {
      setError('Erro ao criar. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  const inputStyle = {
    width: '100%',
    padding: '10px 14px',
    border: '1px solid var(--line-2)',
    borderRadius: 'var(--radius-md)',
    fontSize: 14,
    background: 'var(--bg-surface)',
    color: 'var(--fg-1)',
    fontFamily: 'inherit',
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 8,
          padding: '10px 20px',
          borderRadius: 'var(--radius-lg)',
          background: 'var(--fdc-tangerine)',
          color: 'var(--fdc-cream)',
          fontWeight: 600,
          fontSize: 14,
          border: 'none',
          cursor: 'pointer',
        }}
      >
        + Novo tipo de ingresso
      </button>
    )
  }

  return (
    <div
      className="fdc-card"
      style={{ padding: 24, marginBottom: 24 }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 600, margin: 0 }}>
          Novo tipo de ingresso
        </h3>
        <button
          onClick={() => setOpen(false)}
          style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 20, color: 'var(--fg-3)' }}
        >
          ×
        </button>
      </div>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <div>
          <label style={{ display: 'block', fontSize: 13, fontWeight: 500, marginBottom: 6 }}>Nome *</label>
          <input name="name" required placeholder="Ex: Ingresso Teste" style={inputStyle} />
        </div>

        <div>
          <label style={{ display: 'block', fontSize: 13, fontWeight: 500, marginBottom: 6 }}>Descrição</label>
          <input name="description" placeholder="Opcional" style={inputStyle} />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
          <div>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 500, marginBottom: 6 }}>Preço (R$) *</label>
            <input
              name="price"
              type="number"
              step="0.01"
              min="0"
              required
              placeholder="0.10"
              style={inputStyle}
            />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 500, marginBottom: 6 }}>Estoque *</label>
            <input
              name="stock"
              type="number"
              min="1"
              required
              placeholder="10"
              style={inputStyle}
            />
          </div>
        </div>

        {error && (
          <p style={{ color: 'var(--fdc-danger)', fontSize: 13, margin: 0 }}>{error}</p>
        )}

        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 4 }}>
          <button
            type="button"
            onClick={() => setOpen(false)}
            style={{
              padding: '10px 20px',
              borderRadius: 'var(--radius-lg)',
              border: '1px solid var(--line-2)',
              background: 'var(--bg-surface)',
              cursor: 'pointer',
              fontSize: 14,
              fontFamily: 'inherit',
            }}
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={loading}
            style={{
              padding: '10px 24px',
              borderRadius: 'var(--radius-lg)',
              background: 'var(--fdc-tangerine)',
              color: 'var(--fdc-cream)',
              border: 'none',
              fontWeight: 600,
              fontSize: 14,
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.7 : 1,
              fontFamily: 'inherit',
            }}
          >
            {loading ? 'Criando…' : 'Criar ingresso'}
          </button>
        </div>
      </form>
    </div>
  )
}
