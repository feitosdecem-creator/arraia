'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

type TT = {
  id: string
  name: string
  description: string | null
  price: number
  stock: number
  sold: number
  isActive: boolean
  _count: { tickets: number }
}

const inp: React.CSSProperties = {
  width: '100%',
  padding: '8px 12px',
  border: '1px solid var(--line-2)',
  borderRadius: 'var(--radius-md)',
  fontSize: 14,
  background: 'var(--bg-surface)',
  color: 'var(--fg-1)',
  fontFamily: 'inherit',
  boxSizing: 'border-box',
}

const actionBtn = (variant: 'primary' | 'ghost' | 'danger'): React.CSSProperties => ({
  padding: '5px 14px',
  borderRadius: 8,
  border:
    variant === 'primary'
      ? 'none'
      : variant === 'danger'
      ? '1px solid rgba(216,56,56,0.28)'
      : '1px solid var(--line-2)',
  background:
    variant === 'primary'
      ? 'var(--fdc-tangerine)'
      : variant === 'danger'
      ? 'rgba(216,56,56,0.06)'
      : 'var(--bg-surface)',
  color: variant === 'primary' ? 'white' : variant === 'danger' ? 'var(--fdc-danger)' : 'var(--fg-2)',
  fontSize: 12,
  fontWeight: 600,
  cursor: 'pointer',
  fontFamily: 'inherit',
  whiteSpace: 'nowrap',
})

export function TicketTypeTable({ ticketTypes }: { ticketTypes: TT[] }) {
  const router = useRouter()
  const [editing, setEditing] = useState<string | null>(null)
  const [confirming, setConfirming] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const fmt = (n: number) => 'R$ ' + (n / 100).toFixed(2).replace('.', ',')

  const openEdit = (id: string) => {
    setEditing(id)
    setConfirming(null)
    setError('')
  }

  const handleSave = async (e: React.FormEvent<HTMLFormElement>, id: string) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    const f = e.currentTarget
    const body = {
      name: (f.elements.namedItem('name') as HTMLInputElement).value,
      description: (f.elements.namedItem('description') as HTMLInputElement).value || null,
      price: Math.round(parseFloat((f.elements.namedItem('price') as HTMLInputElement).value) * 100),
      stock: parseInt((f.elements.namedItem('stock') as HTMLInputElement).value),
      isActive: (f.elements.namedItem('isActive') as HTMLInputElement).checked,
    }
    try {
      const res = await fetch(`/api/admin/ticket-types/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      if (!res.ok) {
        const d = await res.json()
        throw new Error(d.error || 'Erro ao salvar')
      }
      setEditing(null)
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao salvar. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    setLoading(true)
    setError('')
    try {
      const res = await fetch(`/api/admin/ticket-types/${id}`, { method: 'DELETE' })
      const d = await res.json()
      if (!res.ok) throw new Error(d.error || 'Erro ao excluir')
      setConfirming(null)
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao excluir.')
      setConfirming(null)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fdc-card" style={{ padding: 0, overflow: 'hidden' }}>
      <div className="admin-table-wrap" style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
          <thead>
            <tr style={{ background: 'var(--bg-sunken)' }}>
              {['Nome', 'Preço', 'Vendidos', 'Estoque', 'Disponíveis', 'Ações'].map((h) => (
                <th key={h} style={{ textAlign: 'left', padding: '10px 16px', fontSize: 11, fontWeight: 600, color: 'var(--fg-2)', textTransform: 'uppercase', letterSpacing: '0.06em', whiteSpace: 'nowrap' }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {ticketTypes.map((tt, i) => {
              const available = tt.stock - tt.sold
              const border = i < ticketTypes.length - 1 ? '1px solid var(--line-2)' : 'none'

              /* ── Editing row ── */
              if (editing === tt.id) {
                return (
                  <tr key={tt.id} style={{ borderBottom: border, background: '#fafaf8' }}>
                    <td colSpan={6} style={{ padding: '20px 16px' }}>
                      <form onSubmit={(e) => handleSave(e, tt.id)}>
                        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: 12, marginBottom: 12 }}>
                          <div>
                            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--fg-2)', marginBottom: 5 }}>Nome *</label>
                            <input name="name" required defaultValue={tt.name} style={inp} />
                          </div>
                          <div>
                            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--fg-2)', marginBottom: 5 }}>Preço (R$) *</label>
                            <input name="price" type="number" step="0.01" min="0" required defaultValue={(tt.price / 100).toFixed(2)} style={inp} />
                          </div>
                          <div>
                            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--fg-2)', marginBottom: 5 }}>Estoque *</label>
                            <input name="stock" type="number" min={tt.sold} required defaultValue={tt.stock} style={inp} />
                            {tt.sold > 0 && <p style={{ fontSize: 11, color: 'var(--fg-3)', margin: '4px 0 0' }}>Mínimo: {tt.sold} (já vendidos)</p>}
                          </div>
                        </div>
                        <div style={{ marginBottom: 12 }}>
                          <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--fg-2)', marginBottom: 5 }}>Descrição</label>
                          <input name="description" defaultValue={tt.description ?? ''} placeholder="Opcional" style={inp} />
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
                          <input name="isActive" id={`active-${tt.id}`} type="checkbox" defaultChecked={tt.isActive} style={{ width: 15, height: 15, accentColor: 'var(--fdc-tangerine)' }} />
                          <label htmlFor={`active-${tt.id}`} style={{ fontSize: 13, color: 'var(--fg-2)', cursor: 'pointer' }}>
                            Visível na página de ingressos
                          </label>
                        </div>
                        {error && <p style={{ color: 'var(--fdc-danger)', fontSize: 13, marginBottom: 10 }}>{error}</p>}
                        <div style={{ display: 'flex', gap: 8 }}>
                          <button type="submit" disabled={loading} style={{ ...actionBtn('primary'), padding: '8px 20px', fontSize: 13, opacity: loading ? 0.7 : 1, cursor: loading ? 'not-allowed' : 'pointer' }}>
                            {loading ? 'Salvando…' : 'Salvar alterações'}
                          </button>
                          <button type="button" onClick={() => { setEditing(null); setError('') }} style={{ ...actionBtn('ghost'), padding: '8px 16px', fontSize: 13 }}>
                            Cancelar
                          </button>
                        </div>
                      </form>
                    </td>
                  </tr>
                )
              }

              /* ── Normal row ── */
              return (
                <tr key={tt.id} style={{ borderBottom: border }}>
                  <td style={{ padding: '14px 16px' }}>
                    <div style={{ fontWeight: 600, color: 'var(--fg-1)', display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                      {tt.name}
                      {!tt.isActive && (
                        <span style={{ fontSize: 10, padding: '2px 7px', borderRadius: 999, background: 'rgba(0,0,0,0.07)', color: 'var(--fg-3)', fontWeight: 700, letterSpacing: '0.04em', textTransform: 'uppercase' }}>
                          Inativo
                        </span>
                      )}
                    </div>
                    {tt.description && <div style={{ fontSize: 12, color: 'var(--fg-3)', marginTop: 2 }}>{tt.description}</div>}
                  </td>
                  <td style={{ padding: '14px 16px', fontWeight: 700, color: tt.price === 0 ? 'var(--fdc-leaf-deep)' : 'var(--fg-1)' }}>
                    {tt.price === 0 ? 'Gratuito' : fmt(tt.price)}
                  </td>
                  <td style={{ padding: '14px 16px', color: 'var(--fg-2)' }}>{tt.sold}</td>
                  <td style={{ padding: '14px 16px', color: 'var(--fg-2)' }}>{tt.stock}</td>
                  <td style={{ padding: '14px 16px' }}>
                    <span style={{
                      display: 'inline-block', padding: '3px 10px', borderRadius: 999, fontSize: 12, fontWeight: 600,
                      background: available <= 0 ? 'rgba(216,56,56,0.1)' : available < 20 ? 'rgba(244,183,59,0.2)' : 'rgba(111,168,74,0.15)',
                      color: available <= 0 ? 'var(--fdc-danger)' : available < 20 ? 'var(--fdc-sun-deep)' : 'var(--fdc-leaf-deep)',
                    }}>
                      {available <= 0 ? 'Esgotado' : available}
                    </span>
                  </td>
                  <td style={{ padding: '14px 16px' }}>
                    {confirming === tt.id ? (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                        <span style={{ fontSize: 12, color: 'var(--fg-2)', whiteSpace: 'nowrap' }}>Excluir mesmo?</span>
                        <button onClick={() => handleDelete(tt.id)} disabled={loading} style={{ ...actionBtn('danger'), background: 'var(--fdc-danger)', color: 'white', border: 'none' }}>
                          {loading ? '…' : 'Sim, excluir'}
                        </button>
                        <button onClick={() => setConfirming(null)} style={actionBtn('ghost')}>
                          Não
                        </button>
                      </div>
                    ) : (
                      <div style={{ display: 'flex', gap: 6 }}>
                        <button onClick={() => openEdit(tt.id)} style={actionBtn('ghost')}>
                          Editar
                        </button>
                        <button
                          onClick={() => { setConfirming(tt.id); setError('') }}
                          disabled={tt._count.tickets > 0}
                          title={tt._count.tickets > 0 ? `Não pode excluir: ${tt._count.tickets} ingresso(s) emitido(s)` : 'Excluir'}
                          style={{
                            ...actionBtn('danger'),
                            opacity: tt._count.tickets > 0 ? 0.4 : 1,
                            cursor: tt._count.tickets > 0 ? 'not-allowed' : 'pointer',
                          }}
                        >
                          Excluir
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* Global error (from delete outside edit mode) */}
      {error && !editing && (
        <p style={{ padding: '12px 16px', color: 'var(--fdc-danger)', fontSize: 13, borderTop: '1px solid var(--line-2)', margin: 0 }}>
          {error}
        </p>
      )}

      {ticketTypes.length === 0 && (
        <div style={{ textAlign: 'center', padding: '48px 24px', color: 'var(--fg-3)', fontSize: 15 }}>
          Nenhum tipo de ingresso cadastrado.
        </div>
      )}
    </div>
  )
}
