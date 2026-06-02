'use client'

import { useState, useMemo } from 'react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

// ─── Types ────────────────────────────────────────────────────────────────────

type Transaction = {
  id: string
  type: 'DELIVERY' | 'RETURN' | 'PAYMENT' | 'NOTE'
  quantity: number
  amountPaid: number | null
  note: string | null
  createdBy: string
  createdAt: string
}

export type Student = {
  id: string
  name: string
  classroom: string
  guardian: string
  phone: string | null
  createdAt: string
  delivered: number
  returned: number
  balance: number
  deliveryCount: number
  totalPaid: number
  expected: number
  pending: number
  convRate: number
  transactions: Transaction[]
}

type FilterChip = 'all' | 'active' | 'reinforced' | 'done' | 'pending_payment' | 'top'

type ActiveModal =
  | { type: 'delivery'; student: Student | null }
  | { type: 'return'; student: Student }
  | { type: 'payment'; student: Student }
  | { type: 'note'; student: Student }
  | null

// ─── Status ───────────────────────────────────────────────────────────────────

type StatusKey = 'active' | 'reinforced' | 'done' | 'pending_payment'

function getStatus(s: Student): StatusKey | null {
  if (s.delivered === 0) return null
  if (s.balance > 0 && s.deliveryCount > 1) return 'reinforced'
  if (s.balance > 0) return 'active'
  if (s.balance === 0 && s.pending === 0) return 'done'
  if (s.balance === 0 && s.pending > 0) return 'pending_payment'
  return 'active'
}

const statusConfig: Record<StatusKey, { label: string; color: string; bg: string }> = {
  active:          { label: 'Em circulação',        color: '#92610A', bg: '#FEF3C7' },
  reinforced:      { label: 'Solicitou mais rifas',  color: '#1D4ED8', bg: '#DBEAFE' },
  done:            { label: 'Concluído',             color: '#15803D', bg: '#DCFCE7' },
  pending_payment: { label: 'Pgto. pendente',        color: '#C2410C', bg: '#FFEDD5' },
}

function StatusBadge({ student }: { student: Student }) {
  const key = getStatus(student)
  if (!key) return <span style={{ fontSize: 12, color: '#94A3B8' }}>—</span>
  const cfg = statusConfig[key]
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center',
      padding: '3px 10px', borderRadius: 999,
      fontSize: 11, fontWeight: 600, letterSpacing: '0.01em',
      color: cfg.color, background: cfg.bg,
    }}>
      {cfg.label}
    </span>
  )
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const AVATAR_PALETTES: [string, string][] = [
  ['#7C3D00', '#FED7AA'], ['#064E3B', '#A7F3D0'], ['#1E3A8A', '#BFDBFE'],
  ['#581C87', '#E9D5FF'], ['#7F1D1D', '#FECACA'], ['#3B1F00', '#FDE68A'],
  ['#134E4A', '#99F6E4'], ['#312E81', '#C7D2FE'],
]

function avatarPalette(name: string): [string, string] {
  let h = 0
  for (const c of name) h = (h * 31 + c.charCodeAt(0)) & 0xffff
  return AVATAR_PALETTES[h % AVATAR_PALETTES.length]
}

function initials(name: string): string {
  const p = name.trim().split(/\s+/)
  if (p.length === 1) return p[0].slice(0, 2).toUpperCase()
  return (p[0][0] + p[p.length - 1][0]).toUpperCase()
}

function fmt(centavos: number): string {
  return (centavos / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

function parseReais(str: string): number | null {
  const v = str.trim().replace(',', '.')
  if (!v) return null
  const n = parseFloat(v)
  return isNaN(n) || n < 0 ? null : Math.round(n * 100)
}

// ─── Primitives ───────────────────────────────────────────────────────────────

function Avatar({ name, size = 36 }: { name: string; size?: number }) {
  const [bg, color] = avatarPalette(name)
  return (
    <div style={{
      width: size, height: size, borderRadius: size,
      background: bg, color,
      display: 'grid', placeItems: 'center',
      fontSize: size * 0.34, fontWeight: 700, letterSpacing: '-0.01em',
      flexShrink: 0, userSelect: 'none',
    }}>
      {initials(name)}
    </div>
  )
}

function Bar({ value, total }: { value: number; total: number }) {
  const pct = total > 0 ? Math.min(100, Math.round((value / total) * 100)) : 0
  const color = pct >= 70 ? '#16A34A' : pct >= 40 ? '#D97706' : pct > 0 ? '#DC2626' : '#CBD5E1'
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <div style={{ flex: 1, height: 5, borderRadius: 3, background: '#E2E8F0', overflow: 'hidden' }}>
        <div style={{ width: `${pct}%`, height: '100%', background: color, borderRadius: 3, transition: 'width 0.4s ease' }} />
      </div>
      <span style={{ fontSize: 11, fontWeight: 700, color: '#64748B', minWidth: 30, textAlign: 'right' }}>{pct}%</span>
    </div>
  )
}

function QtyPicker({ value, max, onChange }: { value: number; max: number; onChange: (v: number) => void }) {
  return (
    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
      {Array.from({ length: Math.min(max, 10) }, (_, i) => i + 1).map((n) => (
        <button key={n} type="button" onClick={() => onChange(n)} style={{
          width: 40, height: 40, borderRadius: 10,
          border: `1.5px solid ${value === n ? 'var(--fdc-tangerine)' : '#E2E8F0'}`,
          background: value === n ? 'rgba(236,82,18,0.08)' : 'transparent',
          color: value === n ? 'var(--fdc-tangerine)' : '#64748B',
          fontWeight: 700, fontSize: 14, cursor: 'pointer', fontFamily: 'inherit',
          transition: 'all 0.15s',
        }}>
          {n}
        </button>
      ))}
    </div>
  )
}

function Overlay({ onClose, children }: { onClose: () => void; children: React.ReactNode }) {
  return (
    <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.45)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16, backdropFilter: 'blur(2px)' }}>
      <div onClick={(e) => e.stopPropagation()} style={{ width: '100%', maxWidth: 496, maxHeight: '90vh', overflowY: 'auto', borderRadius: 20 }}>
        {children}
      </div>
    </div>
  )
}

const inp: React.CSSProperties = {
  width: '100%', padding: '10px 13px', borderRadius: 9,
  border: '1px solid #E2E8F0', background: '#F8FAFC',
  color: '#0F172A', fontSize: 14, fontFamily: 'inherit',
  boxSizing: 'border-box', outline: 'none',
  transition: 'border-color 0.15s',
}
const lbl: React.CSSProperties = {
  display: 'block', fontSize: 11, fontWeight: 700,
  color: '#64748B', textTransform: 'uppercase',
  letterSpacing: '0.07em', marginBottom: 6,
}

// ─── MetricRow ────────────────────────────────────────────────────────────────

function MetricRow({ students }: { students: Student[] }) {
  const families   = students.length
  const rifas      = students.reduce((s, st) => s + st.delivered * 30, 0)
  const potencial  = students.reduce((s, st) => s + st.expected, 0)
  const arrecadado = students.reduce((s, st) => s + st.totalPaid, 0)
  const pendente   = students.reduce((s, st) => s + st.pending, 0)
  const convRate   = potencial > 0 ? Math.round((arrecadado / potencial) * 100) : 0
  const rateColor  = convRate >= 70 ? '#15803D' : convRate >= 40 ? '#B45309' : '#DC2626'

  const cards = [
    { label: 'Famílias',           value: String(families),    icon: '👨‍👩‍👧', sub: 'participantes',            vColor: '#0F172A' },
    { label: 'Rifas distribuídas', value: String(rifas),       icon: '🎟️',   sub: `${students.reduce((s,st)=>s+st.delivered,0)} bloquinhos`, vColor: '#0F172A' },
    { label: 'Potencial',          value: fmt(potencial),      icon: '🎯',   sub: 'se todas vendidas',         vColor: '#0F172A' },
    { label: 'Arrecadado',         value: fmt(arrecadado),     icon: '💰',   sub: `${convRate}% do potencial`, vColor: '#15803D' },
    { label: 'Pendente',           value: fmt(pendente),       icon: '⏳',   sub: 'a receber',                 vColor: pendente > 0 ? '#C2410C' : '#64748B' },
    { label: 'Taxa de conversão',  value: `${convRate}%`,      icon: '📈',   sub: convRate >= 70 ? 'Excelente!' : convRate >= 40 ? 'Moderado' : 'Precisa atenção', vColor: rateColor },
  ]

  return (
    <div className="adm-metric-row">
      {cards.map((c) => (
        <div key={c.label} className="adm-card" style={{ padding: '18px 20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
            <span style={{ fontSize: 11, fontWeight: 600, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.07em' }}>{c.label}</span>
            <span style={{ fontSize: 16 }}>{c.icon}</span>
          </div>
          <div style={{ fontSize: 22, fontWeight: 700, color: c.vColor, letterSpacing: '-0.02em', lineHeight: 1.15, fontFamily: 'var(--font-serif)' }}>{c.value}</div>
          <div style={{ fontSize: 11, color: '#94A3B8', marginTop: 4 }}>{c.sub}</div>
        </div>
      ))}
    </div>
  )
}

// ─── RankingSection ───────────────────────────────────────────────────────────

const MEDALS = ['🥇', '🥈', '🥉']

function RankingSection({ students, onOpen }: { students: Student[]; onOpen: (id: string) => void }) {
  const top = useMemo(
    () => [...students].sort((a, b) => b.totalPaid - a.totalPaid).slice(0, 3).filter((s) => s.totalPaid > 0),
    [students]
  )
  if (top.length === 0) return null
  const max = top[0]?.totalPaid ?? 1

  return (
    <div className="adm-card" style={{ padding: '20px 24px', marginBottom: 20 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <span style={{ fontSize: 11, fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.07em' }}>Ranking</span>
        <span style={{ fontSize: 11, color: '#CBD5E1' }}>Top vendedores</span>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {top.map((s, i) => (
          <button key={s.id} onClick={() => onOpen(s.id)} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: 0, background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit', textAlign: 'left', width: '100%' }}>
            <span style={{ fontSize: 20, width: 28, flexShrink: 0 }}>{MEDALS[i]}</span>
            <Avatar name={s.name} size={34} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontWeight: 600, fontSize: 13, color: '#0F172A', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{s.name}</div>
              <div style={{ marginTop: 4 }}>
                <Bar value={s.totalPaid} total={max} />
              </div>
            </div>
            <div style={{ textAlign: 'right', flexShrink: 0 }}>
              <div style={{ fontWeight: 700, fontSize: 13, color: '#15803D' }}>{fmt(s.totalPaid)}</div>
              <div style={{ fontSize: 11, color: '#94A3B8' }}>{s.delivered * 30} rifas</div>
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}

// ─── DrawerPanel ──────────────────────────────────────────────────────────────

const TX_ICON: Record<Transaction['type'], string>  = { DELIVERY: '📦', RETURN: '↩️', PAYMENT: '💰', NOTE: '📝' }
const TX_LABEL: Record<Transaction['type'], string> = { DELIVERY: 'Entrega', RETURN: 'Devolução', PAYMENT: 'Pagamento', NOTE: 'Observação' }

function DrawerPanel({
  student,
  onClose,
  onDelivery,
  onPayment,
  onReturn,
  onNote,
  onRefresh,
}: {
  student: Student | null
  onClose: () => void
  onDelivery: (s: Student) => void
  onPayment: (s: Student) => void
  onReturn: (s: Student) => void
  onNote: (s: Student) => void
  onRefresh: () => Promise<void>
}) {
  const [quickNote, setQuickNote] = useState('')
  const [saving, setSaving] = useState(false)
  const [noteErr, setNoteErr] = useState('')

  const open = !!student

  const saveQuickNote = async () => {
    if (!student || !quickNote.trim()) return
    setSaving(true); setNoteErr('')
    try {
      const res = await fetch('/api/admin/rifas/transactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ studentId: student.id, type: 'NOTE', note: quickNote.trim() }),
      })
      if (!res.ok) { const d = await res.json(); setNoteErr(d.error ?? 'Erro'); return }
      setQuickNote('')
      await onRefresh()
    } catch { setNoteErr('Erro de conexão') } finally { setSaving(false) }
  }

  return (
    <>
      <div className={`adm-drawer-backdrop${open ? ' open' : ''}`} onClick={onClose} />
      <aside className={`adm-drawer${open ? ' open' : ''}`}>
        {student && (
          <>
            {/* Header */}
            <div style={{ padding: '20px 24px 16px', borderBottom: '1px solid #F1F5F9', flexShrink: 0 }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <Avatar name={student.name} size={46} />
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 16, color: '#0F172A', lineHeight: 1.2 }}>{student.name}</div>
                    <div style={{ fontSize: 12, color: '#94A3B8', marginTop: 3 }}>
                      {student.classroom !== '—' && <span>{student.classroom} · </span>}
                      {student.guardian !== '—' && <span>Resp: {student.guardian}</span>}
                      {student.phone && (
                        <span> · <a href={`tel:${student.phone}`} style={{ color: 'var(--fdc-tangerine)', textDecoration: 'none' }}>{student.phone}</a></span>
                      )}
                    </div>
                  </div>
                </div>
                <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: 20, cursor: 'pointer', color: '#CBD5E1', padding: 4, lineHeight: 1, flexShrink: 0 }}>×</button>
              </div>

              {/* Finance tiles */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8, marginTop: 16 }}>
                {[
                  { label: 'Rifas',      value: String(student.delivered * 30) },
                  { label: 'Potencial',  value: fmt(student.expected)  },
                  { label: 'Arrecadado',value: fmt(student.totalPaid)  },
                  { label: 'Pendente',   value: fmt(student.pending)   },
                ].map((m) => (
                  <div key={m.label} style={{ padding: '10px 8px', background: '#F8FAFC', borderRadius: 10, textAlign: 'center', border: '1px solid #F1F5F9' }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: '#0F172A', lineHeight: 1.1 }}>{m.value}</div>
                    <div style={{ fontSize: 10, color: '#94A3B8', marginTop: 3 }}>{m.label}</div>
                  </div>
                ))}
              </div>
              {student.expected > 0 && (
                <div style={{ marginTop: 12 }}>
                  <Bar value={student.totalPaid} total={student.expected} />
                </div>
              )}
            </div>

            {/* Timeline */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '16px 24px' }}>
              <p style={{ margin: '0 0 12px', fontSize: 11, fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.07em' }}>Histórico</p>

              {student.transactions.length === 0 ? (
                <p style={{ fontSize: 13, color: '#94A3B8' }}>Nenhuma movimentação ainda.</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {[...student.transactions].reverse().map((t) => (
                    <div key={t.id} style={{ display: 'flex', gap: 12, padding: '12px 14px', background: '#F8FAFC', borderRadius: 12, border: '1px solid #F1F5F9' }}>
                      <span style={{ fontSize: 16, flexShrink: 0, marginTop: 1 }}>{TX_ICON[t.type]}</span>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontWeight: 600, fontSize: 13, color: '#0F172A' }}>
                          {TX_LABEL[t.type]}
                          {(t.type === 'DELIVERY' || t.type === 'RETURN') && t.quantity > 0 && ` — ${t.quantity} bloquinho${t.quantity !== 1 ? 's' : ''} (${t.quantity * 30} rifas)`}
                          {t.amountPaid != null && t.amountPaid > 0 && (
                            <span style={{ marginLeft: 6, color: '#15803D', fontWeight: 700 }}>{fmt(t.amountPaid)}</span>
                          )}
                        </div>
                        {t.note && <div style={{ fontSize: 12, color: '#64748B', marginTop: 2, wordBreak: 'break-word' }}>{t.note}</div>}
                        <div style={{ fontSize: 11, color: '#CBD5E1', marginTop: 4 }}>
                          {t.createdBy} · {format(new Date(t.createdAt), "dd/MM 'às' HH:mm", { locale: ptBR })}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Quick note */}
              <div style={{ marginTop: 20, paddingTop: 16, borderTop: '1px solid #F1F5F9' }}>
                <p style={{ margin: '0 0 8px', fontSize: 11, fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.07em' }}>Observação rápida</p>
                <div style={{ display: 'flex', gap: 8 }}>
                  <input
                    value={quickNote}
                    onChange={(e) => setQuickNote(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); saveQuickNote() } }}
                    placeholder="Anotação rápida sobre o aluno…"
                    style={{ ...inp, flex: 1, fontSize: 13 }}
                  />
                  <button onClick={saveQuickNote} disabled={saving || !quickNote.trim()} style={{ padding: '10px 14px', borderRadius: 9, border: 'none', background: 'var(--fdc-tangerine)', color: '#fff', fontWeight: 700, fontSize: 13, cursor: 'pointer', fontFamily: 'inherit', opacity: saving || !quickNote.trim() ? 0.45 : 1, whiteSpace: 'nowrap' }}>
                    {saving ? '…' : 'Salvar'}
                  </button>
                </div>
                {noteErr && <p style={{ margin: '6px 0 0', fontSize: 12, color: '#DC2626' }}>{noteErr}</p>}
              </div>
            </div>

            {/* Footer actions */}
            <div style={{ padding: '12px 16px', borderTop: '1px solid #F1F5F9', display: 'flex', gap: 8, flexShrink: 0 }}>
              <button onClick={() => onDelivery(student)} style={footerBtn}>📦 Entregar</button>
              {student.balance > 0 && <button onClick={() => onReturn(student)} style={footerBtn}>↩ Devolver</button>}
              <button onClick={() => onPayment(student)} style={footerBtn}>💰 Pagar</button>
              <button onClick={() => onNote(student)} style={footerBtn}>📝 Nota</button>
            </div>
          </>
        )}
      </aside>
    </>
  )
}

const footerBtn: React.CSSProperties = {
  flex: 1, padding: '10px 0', borderRadius: 9,
  border: '1px solid #E2E8F0', background: '#F8FAFC',
  color: '#334155', fontSize: 11, fontWeight: 700,
  cursor: 'pointer', fontFamily: 'inherit',
  transition: 'background 0.15s',
}

// ─── DeliveryModal ────────────────────────────────────────────────────────────

function DeliveryModal({ students, preStudent, onClose, onSuccess }: {
  students: Student[]
  preStudent: Student | null
  onClose: () => void
  onSuccess: (studentId: string) => void
}) {
  const [studentId, setStudentId] = useState(preStudent?.id ?? '')
  const [isNew, setIsNew]         = useState(false)
  const [newName, setNewName]     = useState('')
  const [newClass, setNewClass]   = useState('')
  const [newGuard, setNewGuard]   = useState('')
  const [newPhone, setNewPhone]   = useState('')
  const [qty, setQty]             = useState(1)
  const [note, setNote]           = useState('')
  const [loading, setLoading]     = useState(false)
  const [error, setError]         = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!isNew && !studentId) { setError('Selecione um aluno'); return }
    if (isNew && (!newName.trim() || !newClass.trim() || !newGuard.trim())) { setError('Preencha nome, turma e responsável'); return }
    setLoading(true); setError('')
    try {
      const res = await fetch('/api/admin/rifas/transactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentId: isNew ? undefined : studentId,
          newStudent: isNew ? { name: newName, classroom: newClass, guardian: newGuard, phone: newPhone || null } : undefined,
          type: 'DELIVERY', quantity: qty, note,
        }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error ?? 'Erro'); return }
      onSuccess(data.studentId)
    } catch { setError('Erro de conexão') } finally { setLoading(false) }
  }

  return (
    <div style={{ background: '#fff', borderRadius: 20, padding: 28, boxShadow: '0 20px 60px rgba(0,0,0,0.12)' }}>
      <ModalHeader title="Nova entrega" onClose={onClose} />

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
        <div>
          <label style={lbl}>Aluno</label>
          {!isNew ? (
            <select value={studentId} onChange={(e) => { if (e.target.value === '__new__') { setIsNew(true); setStudentId('') } else setStudentId(e.target.value) }} style={{ ...inp, appearance: 'none' }}>
              <option value="">Selecionar aluno…</option>
              {students.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
              <option value="__new__">+ Novo aluno</option>
            </select>
          ) : (
            <div style={{ padding: 14, background: '#F8FAFC', borderRadius: 12, border: '1px solid #E2E8F0', display: 'flex', flexDirection: 'column', gap: 9 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 2 }}>
                <span style={{ fontSize: 12, fontWeight: 700, color: '#64748B' }}>Novo aluno</span>
                <button type="button" onClick={() => { setIsNew(false); setStudentId('') }} style={{ background: 'none', border: 'none', fontSize: 12, color: 'var(--fdc-tangerine)', cursor: 'pointer', fontFamily: 'inherit', fontWeight: 600 }}>← Selecionar existente</button>
              </div>
              <input placeholder="Nome completo" value={newName}  onChange={(e) => setNewName(e.target.value)}  style={inp} />
              <input placeholder="Turma"          value={newClass} onChange={(e) => setNewClass(e.target.value)} style={inp} />
              <input placeholder="Responsável"    value={newGuard} onChange={(e) => setNewGuard(e.target.value)} style={inp} />
              <input placeholder="Telefone (opcional)" value={newPhone} onChange={(e) => setNewPhone(e.target.value)} style={inp} inputMode="tel" />
            </div>
          )}
        </div>

        <div>
          <label style={lbl}>Quantidade de bloquinhos</label>
          <QtyPicker value={qty} max={10} onChange={setQty} />
          <div style={{ marginTop: 10, padding: '12px 14px', background: '#F0FDF4', borderRadius: 10, border: '1px solid #BBF7D0' }}>
            <div style={{ fontSize: 13, color: '#14532D', lineHeight: 1.6 }}>
              <strong>{qty}</strong> bloquinho{qty > 1 ? 's' : ''} →{' '}
              <strong>{qty * 30} rifas</strong> →{' '}
              potencial <strong>{fmt(qty * 15000)}</strong>
            </div>
          </div>
        </div>

        <div>
          <label style={lbl}>Observação <span style={{ fontWeight: 400, textTransform: 'none', color: '#94A3B8' }}>(opcional)</span></label>
          <input value={note} onChange={(e) => setNote(e.target.value)} placeholder="Ex: entregue na reunião de pais" style={inp} />
        </div>

        {error && <ErrorMsg msg={error} />}

        <PrimaryBtn loading={loading} label="Confirmar entrega" />
      </form>
    </div>
  )
}

// ─── ReturnModal ──────────────────────────────────────────────────────────────

function ReturnModal({ student, onClose, onSuccess }: { student: Student; onClose: () => void; onSuccess: () => void }) {
  const [qty, setQty]           = useState(1)
  const [amountStr, setAmount]  = useState('')
  const [note, setNote]         = useState('')
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState('')

  const parsed = parseReais(amountStr)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (amountStr.trim() && parsed === null) { setError('Valor inválido'); return }
    setLoading(true); setError('')
    try {
      const res = await fetch('/api/admin/rifas/transactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ studentId: student.id, type: 'RETURN', quantity: qty, amountPaid: parsed, note }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error ?? 'Erro'); return }
      onSuccess()
    } catch { setError('Erro de conexão') } finally { setLoading(false) }
  }

  return (
    <div style={{ background: '#fff', borderRadius: 20, padding: 28, boxShadow: '0 20px 60px rgba(0,0,0,0.12)' }}>
      <ModalHeader title="Registrar devolução" onClose={onClose} />
      <StudentChip student={student} sub={`Saldo: ${student.balance} bloquinho${student.balance !== 1 ? 's' : ''} · Pendente: ${fmt(student.pending)}`} />

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
        <div>
          <label style={lbl}>Bloquinhos devolvidos</label>
          <QtyPicker value={qty} max={student.balance} onChange={setQty} />
        </div>
        <div>
          <label style={lbl}>Valor recebido <span style={{ fontWeight: 400, textTransform: 'none', color: '#94A3B8' }}>(opcional)</span></label>
          <ReaisInput value={amountStr} onChange={setAmount} />
          {parsed !== null && parsed > 0 && <ConfirmLine value={parsed} />}
        </div>
        <div>
          <label style={lbl}>Observação <span style={{ fontWeight: 400, textTransform: 'none', color: '#94A3B8' }}>(opcional)</span></label>
          <input value={note} onChange={(e) => setNote(e.target.value)} placeholder="Ex: devolveu na festa junina" style={inp} />
        </div>
        {error && <ErrorMsg msg={error} />}
        <PrimaryBtn loading={loading} label="Confirmar devolução" />
      </form>
    </div>
  )
}

// ─── PaymentModal ─────────────────────────────────────────────────────────────

function PaymentModal({ student, onClose, onSuccess }: { student: Student; onClose: () => void; onSuccess: () => void }) {
  const [amountStr, setAmount] = useState('')
  const [note, setNote]        = useState('')
  const [loading, setLoading]  = useState(false)
  const [error, setError]      = useState('')

  const parsed = parseReais(amountStr)
  const payAll = () => setAmount((student.pending / 100).toFixed(2).replace('.', ','))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!parsed || parsed < 1) { setError('Informe um valor válido'); return }
    setLoading(true); setError('')
    try {
      const res = await fetch('/api/admin/rifas/transactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ studentId: student.id, type: 'PAYMENT', amountPaid: parsed, note }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error ?? 'Erro'); return }
      onSuccess()
    } catch { setError('Erro de conexão') } finally { setLoading(false) }
  }

  return (
    <div style={{ background: '#fff', borderRadius: 20, padding: 28, boxShadow: '0 20px 60px rgba(0,0,0,0.12)' }}>
      <ModalHeader title="Registrar pagamento" onClose={onClose} />
      <StudentChip student={student} sub={`Pendente: ${fmt(student.pending)} · Já pago: ${fmt(student.totalPaid)}`} />

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
        <div>
          <label style={lbl}>Valor recebido</label>
          <div style={{ display: 'flex', gap: 8 }}>
            <div style={{ flex: 1 }}><ReaisInput value={amountStr} onChange={setAmount} /></div>
            {student.pending > 0 && (
              <button type="button" onClick={payAll} style={{ padding: '10px 14px', borderRadius: 9, border: '1.5px solid #16A34A', background: 'transparent', color: '#15803D', fontWeight: 700, fontSize: 13, cursor: 'pointer', fontFamily: 'inherit', whiteSpace: 'nowrap' }}>
                Pagar tudo
              </button>
            )}
          </div>
          {parsed !== null && parsed > 0 && <ConfirmLine value={parsed} />}
        </div>
        <div>
          <label style={lbl}>Observação <span style={{ fontWeight: 400, textTransform: 'none', color: '#94A3B8' }}>(opcional)</span></label>
          <input value={note} onChange={(e) => setNote(e.target.value)} placeholder="Ex: via Pix" style={inp} />
        </div>
        {error && <ErrorMsg msg={error} />}
        <button type="submit" disabled={loading} style={{ padding: '12px 20px', borderRadius: 10, border: 'none', background: loading ? '#CBD5E1' : '#16A34A', color: '#fff', fontWeight: 700, fontSize: 14, cursor: loading ? 'not-allowed' : 'pointer', fontFamily: 'inherit', transition: 'background 0.15s' }}>
          {loading ? 'Registrando…' : 'Confirmar pagamento'}
        </button>
      </form>
    </div>
  )
}

// ─── NoteModal ────────────────────────────────────────────────────────────────

function NoteModal({ student, onClose, onSuccess }: { student: Student; onClose: () => void; onSuccess: () => void }) {
  const [text, setText]        = useState('')
  const [loading, setLoading]  = useState(false)
  const [error, setError]      = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!text.trim()) { setError('A observação não pode estar vazia'); return }
    setLoading(true); setError('')
    try {
      const res = await fetch('/api/admin/rifas/transactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ studentId: student.id, type: 'NOTE', note: text.trim() }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error ?? 'Erro'); return }
      onSuccess()
    } catch { setError('Erro de conexão') } finally { setLoading(false) }
  }

  return (
    <div style={{ background: '#fff', borderRadius: 20, padding: 28, boxShadow: '0 20px 60px rgba(0,0,0,0.12)' }}>
      <ModalHeader title="Adicionar observação" onClose={onClose} />
      <StudentChip student={student} sub="Anotação CRM — visível no histórico" />

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div>
          <label style={lbl}>Anotação</label>
          <textarea
            value={text} onChange={(e) => setText(e.target.value)} rows={4} autoFocus
            placeholder="Ex: Família pediu prazo até o dia da festa. Já vendeu tudo, vai pagar em mãos."
            style={{ ...inp, resize: 'vertical', lineHeight: 1.5 }}
          />
        </div>
        {error && <ErrorMsg msg={error} />}
        <PrimaryBtn loading={loading} label="Salvar observação" />
      </form>
    </div>
  )
}

// ─── Shared modal helpers ─────────────────────────────────────────────────────

function ModalHeader({ title, onClose }: { title: string; onClose: () => void }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
      <h2 style={{ margin: 0, fontSize: 19, fontWeight: 700, color: '#0F172A', fontFamily: 'var(--font-serif)', letterSpacing: '-0.02em' }}>{title}</h2>
      <button onClick={onClose} style={{ background: '#F1F5F9', border: 'none', width: 30, height: 30, borderRadius: 8, fontSize: 16, cursor: 'pointer', color: '#64748B', display: 'grid', placeItems: 'center', lineHeight: 1 }}>×</button>
    </div>
  )
}

function StudentChip({ student, sub }: { student: Student; sub: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 14px', background: '#F8FAFC', borderRadius: 12, border: '1px solid #E2E8F0', marginBottom: 20 }}>
      <Avatar name={student.name} size={34} />
      <div>
        <div style={{ fontWeight: 600, fontSize: 14, color: '#0F172A' }}>{student.name}</div>
        <div style={{ fontSize: 12, color: '#94A3B8' }}>{sub}</div>
      </div>
    </div>
  )
}

function ReaisInput({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <div style={{ position: 'relative' }}>
      <span style={{ position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)', fontSize: 14, color: '#94A3B8', pointerEvents: 'none', fontWeight: 600 }}>R$</span>
      <input value={value} onChange={(e) => onChange(e.target.value)} placeholder="0,00" inputMode="decimal" style={{ ...inp, paddingLeft: 36 }} />
    </div>
  )
}

function ConfirmLine({ value }: { value: number }) {
  return <p style={{ margin: '5px 0 0', fontSize: 12, color: '#15803D', fontWeight: 600 }}>✓ {fmt(value)} registrado</p>
}

function ErrorMsg({ msg }: { msg: string }) {
  return <p style={{ margin: 0, fontSize: 13, color: '#DC2626', background: '#FEF2F2', padding: '8px 12px', borderRadius: 8 }}>{msg}</p>
}

function PrimaryBtn({ loading, label }: { loading: boolean; label: string }) {
  return (
    <button type="submit" disabled={loading} style={{ padding: '12px 20px', borderRadius: 10, border: 'none', background: loading ? '#CBD5E1' : 'var(--fdc-tangerine)', color: '#fff', fontWeight: 700, fontSize: 14, cursor: loading ? 'not-allowed' : 'pointer', fontFamily: 'inherit', transition: 'background 0.15s' }}>
      {loading ? 'Registrando…' : label}
    </button>
  )
}

// ─── StudentTable (desktop) ───────────────────────────────────────────────────

function StudentTable({ students, onOpen, onDelivery, onPayment, onReturn }: {
  students: Student[]
  onOpen: (id: string) => void
  onDelivery: (s: Student) => void
  onPayment: (s: Student) => void
  onReturn: (s: Student) => void
}) {
  const th: React.CSSProperties = { textAlign: 'left', padding: '10px 16px', fontSize: 11, fontWeight: 600, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.06em', whiteSpace: 'nowrap' }
  const td: React.CSSProperties = { padding: '13px 16px', verticalAlign: 'middle' }

  return (
    <div className="adm-card adm-student-table" style={{ padding: 0, overflow: 'hidden' }}>
      <div className="admin-table-wrap" style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead>
            <tr style={{ background: '#F8FAFC', borderBottom: '1px solid #F1F5F9' }}>
              <th style={{ ...th, minWidth: 180 }}>Aluno</th>
              <th className="adm-col-hide-mobile" style={th}>Turma</th>
              <th style={{ ...th, minWidth: 150 }}>Progresso</th>
              <th className="adm-col-hide-mobile" style={{ ...th, textAlign: 'right' }}>Arrecadado</th>
              <th className="adm-col-hide-mobile" style={{ ...th, textAlign: 'right' }}>Pendente</th>
              <th style={th}>Status</th>
              <th style={th} />
            </tr>
          </thead>
          <tbody>
            {students.map((s, i) => (
              <tr
                key={s.id}
                onClick={() => onOpen(s.id)}
                style={{ borderBottom: i < students.length - 1 ? '1px solid #F8FAFC' : 'none', cursor: 'pointer', transition: 'background 0.1s' }}
                onMouseEnter={(e) => (e.currentTarget.style.background = '#F8FAFC')}
                onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
              >
                <td style={td}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <Avatar name={s.name} size={32} />
                    <span style={{ fontWeight: 600, color: '#0F172A', fontSize: 13 }}>{s.name}</span>
                  </div>
                </td>
                <td className="adm-col-hide-mobile" style={{ ...td, color: '#64748B', fontSize: 12 }}>{s.classroom}</td>
                <td style={td}>
                  <div style={{ minWidth: 130 }}>
                    <Bar value={s.totalPaid} total={s.expected} />
                    <div style={{ fontSize: 11, color: '#94A3B8', marginTop: 3 }}>{s.delivered * 30} rifas · {s.delivered} bloquinho{s.delivered !== 1 ? 's' : ''}</div>
                  </div>
                </td>
                <td className="adm-col-hide-mobile" style={{ ...td, textAlign: 'right', fontFamily: 'var(--font-mono)', fontWeight: 600, color: s.totalPaid > 0 ? '#15803D' : '#CBD5E1' }}>
                  {s.totalPaid > 0 ? fmt(s.totalPaid) : '—'}
                </td>
                <td className="adm-col-hide-mobile" style={{ ...td, textAlign: 'right', fontFamily: 'var(--font-mono)', fontWeight: 600, color: s.pending > 0 ? '#C2410C' : '#CBD5E1' }}>
                  {s.pending > 0 ? fmt(s.pending) : '—'}
                </td>
                <td style={td}><StatusBadge student={s} /></td>
                <td style={{ ...td, whiteSpace: 'nowrap' }} onClick={(e) => e.stopPropagation()}>
                  <div style={{ display: 'flex', gap: 5 }}>
                    <ActionBtn onClick={() => onDelivery(s)} title="Entregar">📦</ActionBtn>
                    {s.balance > 0 && <ActionBtn onClick={() => onReturn(s)} title="Devolver">↩</ActionBtn>}
                    <ActionBtn onClick={() => onPayment(s)} title="Pagamento">💰</ActionBtn>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {students.length === 0 && (
        <div style={{ textAlign: 'center', padding: '48px 24px', color: '#94A3B8', fontSize: 15 }}>Nenhum aluno encontrado.</div>
      )}
    </div>
  )
}

function ActionBtn({ onClick, title, children }: { onClick: () => void; title: string; children: React.ReactNode }) {
  return (
    <button onClick={onClick} title={title} style={{ padding: '5px 10px', borderRadius: 7, border: '1px solid #E2E8F0', background: '#F8FAFC', color: '#64748B', fontSize: 12, cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.15s' }}>
      {children}
    </button>
  )
}

// ─── StudentCardList (mobile) ─────────────────────────────────────────────────

function StudentCardList({ students, onOpen }: { students: Student[]; onOpen: (id: string) => void }) {
  if (students.length === 0) return (
    <div className="adm-student-cards" style={{ justifyContent: 'center', padding: '48px 24px' }}>
      <span style={{ color: '#94A3B8', fontSize: 15 }}>Nenhum aluno encontrado.</span>
    </div>
  )

  return (
    <div className="adm-student-cards">
      {students.map((s) => (
        <button key={s.id} onClick={() => onOpen(s.id)} style={{ display: 'block', width: '100%', textAlign: 'left', background: '#fff', border: '1px solid #F1F5F9', borderRadius: 16, padding: '15px 16px', cursor: 'pointer', fontFamily: 'inherit', boxShadow: '0 1px 4px rgba(0,0,0,0.04)', transition: 'box-shadow 0.15s' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 11 }}>
            <Avatar name={s.name} size={38} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontWeight: 700, fontSize: 14, color: '#0F172A', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{s.name}</div>
              <div style={{ fontSize: 12, color: '#94A3B8', marginTop: 1 }}>{s.delivered * 30} rifas · {s.delivered} bloquinho{s.delivered !== 1 ? 's' : ''}</div>
            </div>
            <StatusBadge student={s} />
          </div>
          <Bar value={s.totalPaid} total={s.expected} />
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8, fontSize: 12 }}>
            <span style={{ color: '#15803D', fontWeight: 600 }}>{fmt(s.totalPaid)} arrecadado</span>
            {s.pending > 0 && <span style={{ color: '#C2410C', fontWeight: 600 }}>{fmt(s.pending)} pendente</span>}
          </div>
        </button>
      ))}
    </div>
  )
}

// ─── RaffleClient (main) ──────────────────────────────────────────────────────

const CHIPS: { key: FilterChip; label: string }[] = [
  { key: 'all',             label: 'Todos'             },
  { key: 'active',          label: 'Em circulação'     },
  { key: 'done',            label: 'Concluídos'        },
  { key: 'pending_payment', label: 'Pgto. pendente'    },
  { key: 'reinforced',      label: 'Solicitou mais'    },
  { key: 'top',             label: 'Top vendedores'    },
]

export function RaffleClient({ students: initial }: { students: Student[] }) {
  const [students, setStudents]     = useState<Student[]>(initial)
  const [modal, setModal]           = useState<ActiveModal>(null)
  const [drawerStudentId, setDrawer] = useState<string | null>(null)
  const [filterName, setFilterName] = useState('')
  const [filterChip, setFilterChip] = useState<FilterChip>('all')

  // drawerStudent is always derived from the students array so it stays fresh after refresh
  const drawerStudent = useMemo(
    () => drawerStudentId ? (students.find((s) => s.id === drawerStudentId) ?? null) : null,
    [drawerStudentId, students]
  )

  const refreshStudents = async () => {
    try {
      const res = await fetch('/api/admin/rifas/students')
      const data = await res.json()
      if (data.students) setStudents(data.students)
    } catch { /* ignore */ }
  }

  const filtered = useMemo(() => {
    let list = students
    if (filterName) {
      const q = filterName.toLowerCase()
      list = list.filter((s) => s.name.toLowerCase().includes(q) || s.guardian.toLowerCase().includes(q))
    }
    if (filterChip === 'top') {
      return [...list].sort((a, b) => b.totalPaid - a.totalPaid).slice(0, 10)
    }
    if (filterChip !== 'all') {
      list = list.filter((s) => getStatus(s) === filterChip)
    }
    return list
  }, [students, filterName, filterChip])

  const closeModal = () => setModal(null)

  const handleSuccess = async (_?: string) => {
    closeModal()
    await refreshStudents()
  }

  const openDelivery = (s: Student | null) => setModal({ type: 'delivery', student: s })
  const openReturn   = (s: Student) => setModal({ type: 'return',   student: s })
  const openPayment  = (s: Student) => setModal({ type: 'payment',  student: s })
  const openNote     = (s: Student) => setModal({ type: 'note',     student: s })

  const chip = (c: (typeof CHIPS)[0]) => {
    const active = filterChip === c.key
    return (
      <button key={c.key} onClick={() => setFilterChip(c.key)} style={{
        padding: '6px 14px', borderRadius: 999,
        border: `1.5px solid ${active ? 'var(--fdc-tangerine)' : '#E2E8F0'}`,
        background: active ? 'rgba(236,82,18,0.07)' : 'transparent',
        color: active ? 'var(--fdc-tangerine)' : '#64748B',
        fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit',
        whiteSpace: 'nowrap', transition: 'all 0.15s',
      }}>
        {c.label}
      </button>
    )
  }

  return (
    <>
      <MetricRow students={students} />
      <RankingSection students={students} onOpen={setDrawer} />

      {/* Toolbar */}
      <div className="adm-toolbar" style={{ marginBottom: 16 }}>
        <input
          placeholder="Buscar por nome ou responsável…"
          value={filterName}
          onChange={(e) => setFilterName(e.target.value)}
          style={{ ...inp, width: 240, flexShrink: 0 }}
        />
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', flex: 1 }}>
          {CHIPS.map(chip)}
        </div>
        <div className="adm-toolbar-actions" style={{ display: 'flex', gap: 8 }}>
          <a href="/admin/rifas/imprimir" target="_blank" rel="noopener noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '9px 14px', borderRadius: 9, border: '1px solid #E2E8F0', background: '#F8FAFC', color: '#64748B', fontSize: 13, fontWeight: 600, textDecoration: 'none' }}>
            🖨 Imprimir
          </a>
          <a href="/api/admin/rifas/export" style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '9px 14px', borderRadius: 9, border: '1px solid #E2E8F0', background: '#F8FAFC', color: '#64748B', fontSize: 13, fontWeight: 600, textDecoration: 'none' }}>
            ⬇ CSV
          </a>
          <button onClick={() => openDelivery(null)} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '9px 20px', borderRadius: 9, border: 'none', background: 'var(--fdc-tangerine)', color: '#fff', fontSize: 14, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>
            + Nova entrega
          </button>
        </div>
      </div>

      <StudentTable
        students={filtered}
        onOpen={setDrawer}
        onDelivery={openDelivery}
        onPayment={openPayment}
        onReturn={openReturn}
      />
      <StudentCardList students={filtered} onOpen={setDrawer} />

      <DrawerPanel
        student={drawerStudent}
        onClose={() => setDrawer(null)}
        onDelivery={openDelivery}
        onPayment={openPayment}
        onReturn={openReturn}
        onNote={openNote}
        onRefresh={refreshStudents}
      />

      {modal?.type === 'delivery' && (
        <Overlay onClose={closeModal}>
          <DeliveryModal students={students} preStudent={modal.student} onClose={closeModal} onSuccess={handleSuccess} />
        </Overlay>
      )}
      {modal?.type === 'return' && (
        <Overlay onClose={closeModal}>
          <ReturnModal student={modal.student} onClose={closeModal} onSuccess={handleSuccess} />
        </Overlay>
      )}
      {modal?.type === 'payment' && (
        <Overlay onClose={closeModal}>
          <PaymentModal student={modal.student} onClose={closeModal} onSuccess={handleSuccess} />
        </Overlay>
      )}
      {modal?.type === 'note' && (
        <Overlay onClose={closeModal}>
          <NoteModal student={modal.student} onClose={closeModal} onSuccess={handleSuccess} />
        </Overlay>
      )}
    </>
  )
}
