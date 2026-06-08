'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

type EventData = {
  id: string
  name: string
  description: string | null
  date: string
  location: string
  imageUrl: string | null
  isActive: boolean
}

function toLocalInputValue(iso: string) {
  const d = new Date(iso)
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '11px 14px',
  border: '1px solid var(--line-2)',
  borderRadius: 'var(--radius-md)',
  fontSize: 14,
  background: 'var(--bg-surface)',
  color: 'var(--fg-1)',
  fontFamily: 'inherit',
}

const labelStyle: React.CSSProperties = {
  display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 6, color: 'var(--fg-1)',
}

export function EventSettingsForm({ event }: { event: EventData }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [saved, setSaved] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSaved(false)

    const form = e.currentTarget
    const data = {
      id: event.id,
      name: (form.elements.namedItem('name') as HTMLInputElement).value,
      description: (form.elements.namedItem('description') as HTMLTextAreaElement).value || null,
      date: (form.elements.namedItem('date') as HTMLInputElement).value,
      location: (form.elements.namedItem('location') as HTMLInputElement).value,
      imageUrl: (form.elements.namedItem('imageUrl') as HTMLInputElement).value || null,
      isActive: (form.elements.namedItem('isActive') as HTMLInputElement).checked,
    }

    try {
      const res = await fetch('/api/admin/event', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!res.ok) {
        const body = await res.json().catch(() => null)
        throw new Error(body?.error || 'Erro ao salvar')
      }
      setSaved(true)
      router.refresh()
      setTimeout(() => setSaved(false), 2500)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao salvar. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="fdc-card" style={{ padding: 28, maxWidth: 640, display: 'flex', flexDirection: 'column', gap: 18 }}>
      <div>
        <label style={labelStyle}>Nome do evento *</label>
        <input name="name" required defaultValue={event.name} style={inputStyle} />
      </div>

      <div>
        <label style={labelStyle}>Descrição</label>
        <textarea name="description" defaultValue={event.description ?? ''} rows={3} style={{ ...inputStyle, resize: 'vertical' as const }} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <div>
          <label style={labelStyle}>Data e horário *</label>
          <input name="date" type="datetime-local" required defaultValue={toLocalInputValue(event.date)} style={inputStyle} />
        </div>
        <div>
          <label style={labelStyle}>Local *</label>
          <input name="location" required defaultValue={event.location} style={inputStyle} />
        </div>
      </div>

      <div>
        <label style={labelStyle}>URL da imagem de capa</label>
        <input name="imageUrl" type="url" placeholder="https://…" defaultValue={event.imageUrl ?? ''} style={inputStyle} />
      </div>

      <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', fontSize: 14, fontWeight: 500, color: 'var(--fg-1)' }}>
        <input name="isActive" type="checkbox" defaultChecked={event.isActive} style={{ width: 18, height: 18, accentColor: 'var(--fdc-tangerine)' }} />
        Evento ativo (visível na página pública)
      </label>

      {error && <p style={{ color: 'var(--fdc-danger)', fontSize: 13, margin: 0 }}>{error}</p>}

      <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginTop: 4 }}>
        <button
          type="submit"
          disabled={loading}
          style={{
            padding: '11px 26px',
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
          {loading ? 'Salvando…' : 'Salvar alterações'}
        </button>
        {saved && <span style={{ color: 'var(--fdc-leaf-deep)', fontSize: 13, fontWeight: 600 }}>✓ Salvo com sucesso</span>}
      </div>
    </form>
  )
}
