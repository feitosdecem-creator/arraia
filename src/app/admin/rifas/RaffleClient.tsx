'use client'

import { useState, useMemo } from 'react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

type Transaction = {
  id: string
  type: 'DELIVERY' | 'RETURN'
  quantity: number
  note: string | null
  createdBy: string
  createdAt: string
}

export type Student = {
  id: string
  name: string
  classroom: string
  guardian: string
  createdAt: string
  delivered: number
  returned: number
  balance: number
  deliveryCount: number
  transactions: Transaction[]
}

type Modal =
  | { type: 'delivery'; student: Student | null }
  | { type: 'return'; student: Student }
  | { type: 'detail'; student: Student }
  | null

function getStatus(s: Student): 'done' | 'active' | 'reinforced' | null {
  if (s.delivered === 0) return null
  if (s.balance === 0) return 'done'
  if (s.deliveryCount > 1) return 'reinforced'
  return 'active'
}

const statusConfig = {
  done:       { label: 'Em dia',           dot: '🟢', color: 'var(--fdc-leaf-deep)',  bg: 'rgba(111,168,74,0.15)' },
  active:     { label: 'Em circulação',    dot: '🟡', color: 'var(--fdc-sun-deep)',   bg: 'rgba(244,183,59,0.2)' },
  reinforced: { label: 'Recebeu reforço',  dot: '🔵', color: 'var(--fdc-indigo, #3658D3)',   bg: 'rgba(54,88,211,0.12)' },
}

function StatusBadge({ student }: { student: Student }) {
  const s = getStatus(student)
  if (!s) return <span style={{ fontSize: 12, color: 'var(--fg-3)' }}>—</span>
  const cfg = statusConfig[s]
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '3px 10px', borderRadius: 999, fontSize: 11, fontWeight: 600, color: cfg.color, background: cfg.bg }}>
      {cfg.dot} {cfg.label}
    </span>
  )
}

function MetricCard({ icon, label, value, sub, accentBg }: { icon: string; label: string; value: string | number; sub?: string; accentBg: string }) {
  return (
    <div className="fdc-card" style={{ padding: 20, flex: 1, minWidth: 140 }}>
      <div style={{ width: 38, height: 38, borderRadius: 10, background: accentBg, display: 'grid', placeItems: 'center', fontSize: 18, marginBottom: 14 }}>{icon}</div>
      <div style={{ color: 'var(--fg-2)', fontSize: 13 }}>{label}</div>
      <div style={{ fontSize: 28, fontWeight: 700, letterSpacing: '-0.02em', color: 'var(--fg-1)', marginTop: 2 }}>{value}</div>
      {sub && <div style={{ fontSize: 11, color: 'var(--fg-3)', marginTop: 4 }}>{sub}</div>}
    </div>
  )
}

function QtyPicker({ value, max, onChange }: { value: number; max: number; onChange: (v: number) => void }) {
  const options = Array.from({ length: Math.min(max, 10) }, (_, i) => i + 1)
  return (
    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
      {options.map((n) => (
        <button
          key={n}
          type="button"
          onClick={() => onChange(n)}
          style={{
            width: 38, height: 38, borderRadius: 8, border: `1.5px solid ${value === n ? 'var(--fdc-tangerine)' : 'var(--line-2)'}`,
            background: value === n ? 'rgba(236,82,18,0.08)' : 'transparent',
            color: value === n ? 'var(--fdc-tangerine)' : 'var(--fg-2)',
            fontWeight: 700, fontSize: 14, cursor: 'pointer', fontFamily: 'inherit',
          }}
        >
          {n}
        </button>
      ))}
    </div>
  )
}

function Overlay({ onClose, children }: { onClose: () => void; children: React.ReactNode }) {
  return (
    <div
      onClick={onClose}
      style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}
    >
      <div onClick={(e) => e.stopPropagation()} style={{ width: '100%', maxWidth: 480, maxHeight: '90vh', overflowY: 'auto' }}>
        {children}
      </div>
    </div>
  )
}

function DeliveryModal({ students, preStudent, onClose, onSuccess }: {
  students: Student[]
  preStudent: Student | null
  onClose: () => void
  onSuccess: (studentId: string) => void
}) {
  const [studentId, setStudentId] = useState(preStudent?.id ?? '')
  const [isNew, setIsNew] = useState(false)
  const [newName, setNewName] = useState('')
  const [newClassroom, setNewClassroom] = useState('')
  const [newGuardian, setNewGuardian] = useState('')
  const [qty, setQty] = useState(1)
  const [note, setNote] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!isNew && !studentId) { setError('Selecione um aluno'); return }
    if (isNew && (!newName.trim() || !newClassroom.trim() || !newGuardian.trim())) { setError('Preencha todos os campos do aluno'); return }

    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/admin/rifas/transactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentId: isNew ? undefined : studentId,
          newStudent: isNew ? { name: newName, classroom: newClassroom, guardian: newGuardian } : undefined,
          type: 'DELIVERY',
          quantity: qty,
          note,
        }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error ?? 'Erro ao registrar'); return }
      onSuccess(data.studentId)
    } catch {
      setError('Erro de conexão')
    } finally {
      setLoading(false)
    }
  }

  const inputStyle: React.CSSProperties = { width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid var(--line-2)', background: 'var(--bg-surface)', color: 'var(--fg-1)', fontSize: 14, fontFamily: 'inherit', boxSizing: 'border-box' }
  const labelStyle: React.CSSProperties = { display: 'block', fontSize: 11, fontWeight: 700, color: 'var(--fg-2)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }

  return (
    <div className="fdc-card" style={{ padding: 28 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h2 style={{ margin: 0, fontSize: 20, fontWeight: 700, color: 'var(--fg-1)', fontFamily: 'var(--font-display)' }}>Nova entrega</h2>
        <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: 20, cursor: 'pointer', color: 'var(--fg-3)', lineHeight: 1 }}>×</button>
      </div>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
        <div>
          <label style={labelStyle}>Aluno</label>
          {!isNew ? (
            <select
              value={studentId}
              onChange={(e) => {
                if (e.target.value === '__new__') {
                  setIsNew(true)
                  setStudentId('')
                } else {
                  setStudentId(e.target.value)
                }
              }}
              style={{ ...inputStyle, appearance: 'none' }}
            >
              <option value="">Selecionar aluno…</option>
              {students.map((s) => (
                <option key={s.id} value={s.id}>{s.name} — {s.classroom}</option>
              ))}
              <option value="__new__">+ Novo aluno</option>
            </select>
          ) : null}

          {isNew && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 10, padding: 14, background: 'var(--bg-sunken)', borderRadius: 10, border: '1px solid var(--line-2)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--fg-2)' }}>Novo aluno</span>
                <button type="button" onClick={() => { setIsNew(false); setStudentId('') }} style={{ background: 'none', border: 'none', fontSize: 12, color: 'var(--fdc-tangerine)', cursor: 'pointer', fontFamily: 'inherit' }}>← Selecionar existente</button>
              </div>
              <input placeholder="Nome do aluno" value={newName} onChange={(e) => setNewName(e.target.value)} style={inputStyle} />
              <input placeholder="Turma (ex: Mirtilo)" value={newClassroom} onChange={(e) => setNewClassroom(e.target.value)} style={inputStyle} />
              <input placeholder="Responsável" value={newGuardian} onChange={(e) => setNewGuardian(e.target.value)} style={inputStyle} />
            </div>
          )}
        </div>

        <div>
          <label style={labelStyle}>Bloquinhos</label>
          <QtyPicker value={qty} max={10} onChange={setQty} />
          <p style={{ margin: '6px 0 0', fontSize: 12, color: 'var(--fg-3)' }}>{qty * 30} rifas no total</p>
        </div>

        <div>
          <label style={labelStyle}>Observação <span style={{ fontWeight: 400, textTransform: 'none' }}>(opcional)</span></label>
          <input value={note} onChange={(e) => setNote(e.target.value)} placeholder="Ex: entregue na reunião" style={inputStyle} />
        </div>

        {error && <p style={{ margin: 0, fontSize: 13, color: 'var(--fdc-danger)' }}>{error}</p>}

        <button
          type="submit"
          disabled={loading}
          style={{ padding: '12px 20px', borderRadius: 10, border: 'none', background: loading ? 'var(--fdc-stone-2)' : 'var(--fdc-tangerine)', color: 'var(--fdc-cream)', fontWeight: 700, fontSize: 14, cursor: loading ? 'not-allowed' : 'pointer', fontFamily: 'inherit' }}
        >
          {loading ? 'Registrando…' : 'Registrar entrega'}
        </button>
      </form>
    </div>
  )
}

function ReturnModal({ student, onClose, onSuccess }: { student: Student; onClose: () => void; onSuccess: () => void }) {
  const [qty, setQty] = useState(1)
  const [note, setNote] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/admin/rifas/transactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ studentId: student.id, type: 'RETURN', quantity: qty, note }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error ?? 'Erro ao registrar'); return }
      onSuccess()
    } catch {
      setError('Erro de conexão')
    } finally {
      setLoading(false)
    }
  }

  const inputStyle: React.CSSProperties = { width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid var(--line-2)', background: 'var(--bg-surface)', color: 'var(--fg-1)', fontSize: 14, fontFamily: 'inherit', boxSizing: 'border-box' }
  const labelStyle: React.CSSProperties = { display: 'block', fontSize: 11, fontWeight: 700, color: 'var(--fg-2)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }

  return (
    <div className="fdc-card" style={{ padding: 28 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h2 style={{ margin: 0, fontSize: 20, fontWeight: 700, color: 'var(--fg-1)', fontFamily: 'var(--font-display)' }}>Registrar devolução</h2>
        <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: 20, cursor: 'pointer', color: 'var(--fg-3)', lineHeight: 1 }}>×</button>
      </div>

      <div style={{ padding: '12px 16px', background: 'var(--bg-sunken)', borderRadius: 10, marginBottom: 18 }}>
        <div style={{ fontWeight: 600, fontSize: 15, color: 'var(--fg-1)' }}>{student.name}</div>
        <div style={{ fontSize: 12, color: 'var(--fg-3)', marginTop: 2 }}>{student.classroom} · Saldo: {student.balance} bloquinho{student.balance !== 1 ? 's' : ''}</div>
      </div>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
        <div>
          <label style={labelStyle}>Bloquinhos devolvidos</label>
          <QtyPicker value={qty} max={student.balance} onChange={setQty} />
        </div>

        <div>
          <label style={labelStyle}>Observação <span style={{ fontWeight: 400, textTransform: 'none' }}>(opcional)</span></label>
          <input value={note} onChange={(e) => setNote(e.target.value)} placeholder="Ex: devolveu na festa" style={inputStyle} />
        </div>

        {error && <p style={{ margin: 0, fontSize: 13, color: 'var(--fdc-danger)' }}>{error}</p>}

        <button
          type="submit"
          disabled={loading}
          style={{ padding: '12px 20px', borderRadius: 10, border: 'none', background: loading ? 'var(--fdc-stone-2)' : 'var(--fdc-tangerine)', color: 'var(--fdc-cream)', fontWeight: 700, fontSize: 14, cursor: loading ? 'not-allowed' : 'pointer', fontFamily: 'inherit' }}
        >
          {loading ? 'Registrando…' : 'Confirmar devolução'}
        </button>
      </form>
    </div>
  )
}

function DetailModal({ student, onClose, onReturn }: { student: Student; onClose: () => void; onReturn: () => void }) {
  return (
    <div className="fdc-card" style={{ padding: 28 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
        <div>
          <h2 style={{ margin: 0, fontSize: 20, fontWeight: 700, color: 'var(--fg-1)', fontFamily: 'var(--font-display)' }}>{student.name}</h2>
          <div style={{ fontSize: 13, color: 'var(--fg-3)', marginTop: 2 }}>{student.classroom} · {student.guardian}</div>
        </div>
        <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: 20, cursor: 'pointer', color: 'var(--fg-3)', lineHeight: 1 }}>×</button>
      </div>

      {/* Summary */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, marginBottom: 24 }}>
        {[
          { label: 'Entregues', value: student.delivered, color: 'var(--fdc-tangerine)' },
          { label: 'Devolvidos', value: student.returned, color: 'var(--fdc-leaf-deep)' },
          { label: 'Saldo', value: student.balance, color: student.balance > 0 ? 'var(--fdc-sun-deep)' : 'var(--fg-3)' },
        ].map((m) => (
          <div key={m.label} style={{ padding: '12px 14px', background: 'var(--bg-sunken)', borderRadius: 10, textAlign: 'center' }}>
            <div style={{ fontSize: 22, fontWeight: 700, color: m.color }}>{m.value}</div>
            <div style={{ fontSize: 11, color: 'var(--fg-3)', marginTop: 2 }}>{m.label}</div>
          </div>
        ))}
      </div>

      {/* History */}
      <div style={{ marginBottom: 20 }}>
        <p style={{ fontSize: 11, fontWeight: 700, color: 'var(--fg-3)', textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 12px' }}>Histórico</p>
        {student.transactions.length === 0 ? (
          <p style={{ fontSize: 13, color: 'var(--fg-3)', margin: 0 }}>Nenhuma movimentação.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {student.transactions.map((t) => (
              <div key={t.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px', background: 'var(--bg-sunken)', borderRadius: 8 }}>
                <span style={{ fontSize: 16 }}>{t.type === 'DELIVERY' ? '📦' : '↩️'}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--fg-1)' }}>
                    {t.type === 'DELIVERY' ? 'Entrega' : 'Devolução'} de {t.quantity} bloquinho{t.quantity !== 1 ? 's' : ''}
                  </div>
                  {t.note && <div style={{ fontSize: 12, color: 'var(--fg-3)' }}>{t.note}</div>}
                </div>
                <div style={{ fontSize: 11, color: 'var(--fg-3)', whiteSpace: 'nowrap' }}>
                  {format(new Date(t.createdAt), 'dd/MM · HH:mm', { locale: ptBR })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {student.balance > 0 && (
        <button
          onClick={onReturn}
          style={{ width: '100%', padding: '12px 20px', borderRadius: 10, border: '1.5px solid var(--fdc-tangerine)', background: 'transparent', color: 'var(--fdc-tangerine)', fontWeight: 700, fontSize: 14, cursor: 'pointer', fontFamily: 'inherit' }}
        >
          Registrar devolução
        </button>
      )}
    </div>
  )
}

export function RaffleClient({ students: initial }: { students: Student[] }) {
  const [students, setStudents] = useState<Student[]>(initial)
  const [modal, setModal] = useState<Modal>(null)
  const [filterName, setFilterName] = useState('')
  const [filterClass, setFilterClass] = useState('')
  const [filterStatus, setFilterStatus] = useState('')

  const classrooms = useMemo(() => [...new Set(students.map((s) => s.classroom))].sort(), [students])

  const filtered = useMemo(() => {
    return students.filter((s) => {
      if (filterName && !s.name.toLowerCase().includes(filterName.toLowerCase())) return false
      if (filterClass && s.classroom !== filterClass) return false
      if (filterStatus) {
        const st = getStatus(s)
        if (filterStatus === 'none' && st !== null) return false
        if (filterStatus !== 'none' && st !== filterStatus) return false
      }
      return true
    })
  }, [students, filterName, filterClass, filterStatus])

  const metrics = useMemo(() => {
    const totalDelivered = students.reduce((sum, s) => sum + s.delivered, 0)
    const totalReturned = students.reduce((sum, s) => sum + s.returned, 0)
    const totalBalance = students.reduce((sum, s) => sum + s.balance, 0)
    return { families: students.length, delivered: totalDelivered, returned: totalReturned, balance: totalBalance }
  }, [students])

  const refreshStudents = async () => {
    try {
      const res = await fetch('/api/admin/rifas/students')
      const data = await res.json()
      if (data.students) setStudents(data.students)
    } catch { /* ignore */ }
  }

  const closeModal = () => setModal(null)

  const handleDeliverySuccess = async (_studentId: string) => {
    closeModal()
    await refreshStudents()
  }

  const handleReturnSuccess = async () => {
    closeModal()
    await refreshStudents()
  }

  const thStyle: React.CSSProperties = { textAlign: 'left', padding: '10px 16px', fontSize: 11, fontWeight: 600, color: 'var(--fg-2)', textTransform: 'uppercase', letterSpacing: '0.06em', whiteSpace: 'nowrap' }
  const tdStyle: React.CSSProperties = { padding: '12px 16px', verticalAlign: 'middle' }

  return (
    <>
      {/* Metrics */}
      <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', marginBottom: 28 }}>
        <MetricCard icon="👨‍👩‍👧" label="Famílias" value={metrics.families} accentBg="rgba(236,82,18,0.12)" />
        <MetricCard icon="📦" label="Bloquinhos entregues" value={metrics.delivered} sub={`${metrics.delivered * 30} rifas`} accentBg="rgba(244,183,59,0.22)" />
        <MetricCard icon="↩️" label="Bloquinhos devolvidos" value={metrics.returned} accentBg="rgba(111,168,74,0.18)" />
        <MetricCard icon="🔄" label="Em circulação" value={metrics.balance} sub={`${metrics.balance * 30} rifas estimadas`} accentBg="rgba(54,88,211,0.14)" />
      </div>

      {/* Toolbar */}
      <div className="adm-toolbar">
        <input
          placeholder="Buscar por nome…"
          value={filterName}
          onChange={(e) => setFilterName(e.target.value)}
          style={{ padding: '9px 14px', borderRadius: 8, border: '1px solid var(--line-2)', background: 'var(--bg-surface)', color: 'var(--fg-1)', fontSize: 14, fontFamily: 'inherit', width: 200 }}
        />
        <select
          value={filterClass}
          onChange={(e) => setFilterClass(e.target.value)}
          style={{ padding: '9px 14px', borderRadius: 8, border: '1px solid var(--line-2)', background: 'var(--bg-surface)', color: 'var(--fg-1)', fontSize: 14, fontFamily: 'inherit', appearance: 'none' }}
        >
          <option value="">Todas as turmas</option>
          {classrooms.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          style={{ padding: '9px 14px', borderRadius: 8, border: '1px solid var(--line-2)', background: 'var(--bg-surface)', color: 'var(--fg-1)', fontSize: 14, fontFamily: 'inherit', appearance: 'none' }}
        >
          <option value="">Todos os status</option>
          <option value="active">🟡 Em circulação</option>
          <option value="reinforced">🔵 Recebeu reforço</option>
          <option value="done">🟢 Em dia</option>
          <option value="none">Sem entregas</option>
        </select>
        <div style={{ flex: 1 }} />
        <div className="adm-toolbar-actions" style={{ display: 'flex', gap: 8 }}>
          <a
            href="/admin/rifas/imprimir"
            target="_blank"
            rel="noopener noreferrer"
            style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '9px 16px', borderRadius: 8, border: '1px solid var(--line-2)', background: 'var(--bg-surface)', color: 'var(--fg-2)', fontSize: 13, fontWeight: 600, textDecoration: 'none' }}
          >
            🖨 Imprimir
          </a>
          <a
            href="/api/admin/rifas/export"
            style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '9px 16px', borderRadius: 8, border: '1px solid var(--line-2)', background: 'var(--bg-surface)', color: 'var(--fg-2)', fontSize: 13, fontWeight: 600, textDecoration: 'none' }}
          >
            ⬇ CSV
          </a>
          <button
            onClick={() => setModal({ type: 'delivery', student: null })}
            style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '9px 18px', borderRadius: 8, border: 'none', background: 'var(--fdc-tangerine)', color: 'var(--fdc-cream)', fontSize: 14, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}
          >
            + Nova entrega
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="fdc-card" style={{ padding: 0, overflow: 'hidden' }}>
        <div className="admin-table-wrap" style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ background: 'var(--bg-sunken)' }}>
                <th style={{ ...thStyle, minWidth: 140 }}>Aluno</th>
                <th className="adm-col-hide-mobile" style={thStyle}>Turma</th>
                <th className="adm-col-hide-mobile" style={thStyle}>Responsável</th>
                <th style={{ ...thStyle, textAlign: 'center' }}>Entregues</th>
                <th className="adm-col-hide-mobile" style={{ ...thStyle, textAlign: 'center' }}>Devolvidos</th>
                <th style={{ ...thStyle, textAlign: 'center' }}>Saldo</th>
                <th style={thStyle}>Status</th>
                <th style={thStyle} />
              </tr>
            </thead>
            <tbody>
              {filtered.map((s, i) => (
                <tr key={s.id} style={{ borderBottom: i < filtered.length - 1 ? '1px solid var(--line-2)' : 'none' }}>
                  <td style={{ ...tdStyle, whiteSpace: 'nowrap' }}>
                    <button
                      onClick={() => setModal({ type: 'detail', student: s })}
                      style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', fontFamily: 'inherit', textAlign: 'left' }}
                    >
                      <span style={{ fontWeight: 600, color: 'var(--fdc-tangerine)', fontSize: 13 }}>{s.name}</span>
                    </button>
                  </td>
                  <td className="adm-col-hide-mobile" style={{ ...tdStyle, color: 'var(--fg-2)' }}>{s.classroom}</td>
                  <td className="adm-col-hide-mobile" style={{ ...tdStyle, color: 'var(--fg-2)' }}>{s.guardian}</td>
                  <td style={{ ...tdStyle, textAlign: 'center', fontWeight: 600, color: 'var(--fg-1)', fontFamily: 'var(--font-mono)' }}>{s.delivered}</td>
                  <td className="adm-col-hide-mobile" style={{ ...tdStyle, textAlign: 'center', fontWeight: 600, color: 'var(--fdc-leaf-deep)', fontFamily: 'var(--font-mono)' }}>{s.returned}</td>
                  <td style={{ ...tdStyle, textAlign: 'center', fontWeight: 700, color: s.balance > 0 ? 'var(--fdc-sun-deep)' : 'var(--fg-3)', fontFamily: 'var(--font-mono)' }}>{s.balance}</td>
                  <td style={tdStyle}><StatusBadge student={s} /></td>
                  <td style={{ ...tdStyle, whiteSpace: 'nowrap' }}>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <button
                        onClick={() => setModal({ type: 'delivery', student: s })}
                        title="Entregar bloquinho"
                        style={{ padding: '4px 10px', borderRadius: 6, border: '1px solid var(--line-2)', background: 'transparent', color: 'var(--fg-2)', fontSize: 11, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}
                      >
                        + Entregar
                      </button>
                      {s.balance > 0 && (
                        <button
                          onClick={() => setModal({ type: 'return', student: s })}
                          title="Registrar devolução"
                          style={{ padding: '4px 10px', borderRadius: 6, border: '1px solid var(--line-2)', background: 'transparent', color: 'var(--fg-2)', fontSize: 11, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}
                        >
                          ↩ Devolver
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filtered.length === 0 && (
          <div style={{ textAlign: 'center', padding: '48px 24px', color: 'var(--fg-3)', fontSize: 15 }}>
            {students.length === 0 ? 'Nenhum aluno cadastrado. Clique em "+ Nova entrega" para começar.' : 'Nenhum aluno encontrado com os filtros aplicados.'}
          </div>
        )}
      </div>

      {/* Modals */}
      {modal?.type === 'delivery' && (
        <Overlay onClose={closeModal}>
          <DeliveryModal
            students={students}
            preStudent={modal.student}
            onClose={closeModal}
            onSuccess={handleDeliverySuccess}
          />
        </Overlay>
      )}

      {modal?.type === 'return' && (
        <Overlay onClose={closeModal}>
          <ReturnModal
            student={modal.student}
            onClose={closeModal}
            onSuccess={handleReturnSuccess}
          />
        </Overlay>
      )}

      {modal?.type === 'detail' && (
        <Overlay onClose={closeModal}>
          <DetailModal
            student={students.find((s) => s.id === modal.student.id) ?? modal.student}
            onClose={closeModal}
            onReturn={() => setModal({ type: 'return', student: students.find((s) => s.id === modal.student.id) ?? modal.student })}
          />
        </Overlay>
      )}
    </>
  )
}
