'use client'

import { useState, useMemo } from 'react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

// ─── Types ────────────────────────────────────────────────────────────────────

export type PurchaseCategory = 'ALIMENTACAO' | 'BEBIDAS' | 'DECORACAO' | 'BRINCADEIRAS' | 'ESTRUTURA' | 'LIMPEZA' | 'OUTROS'
export type PurchaseStatus = 'PLANEJADO' | 'EM_COTACAO' | 'COMPRADO' | 'RECEBIDO' | 'CANCELADO'

export type HistoryEntry = {
  id: string
  description: string
  createdBy: string
  createdAt: string
}

export type Item = {
  id: string
  name: string
  category: PurchaseCategory
  quantity: number
  unit: string
  expectedValue: number
  paidValue: number | null
  responsavel: string
  observacao: string | null
  status: PurchaseStatus
  fornecedor: string | null
  purchaseDate: string | null
  paymentMethod: string | null
  hasReceipt: boolean
  createdAt: string
  updatedAt: string
  history: HistoryEntry[]
}

export type FullItem = Omit<Item, 'hasReceipt'> & { receiptUrl: string | null }

type ActiveModal =
  | { type: 'new' }
  | { type: 'edit'; item: FullItem }
  | { type: 'register'; item: FullItem }
  | null

// ─── Constants ────────────────────────────────────────────────────────────────

const CATEGORY_LABELS: Record<PurchaseCategory, string> = {
  ALIMENTACAO: 'Alimentação',
  BEBIDAS: 'Bebidas',
  DECORACAO: 'Decoração',
  BRINCADEIRAS: 'Brincadeiras',
  ESTRUTURA: 'Estrutura',
  LIMPEZA: 'Limpeza',
  OUTROS: 'Outros',
}

const CATEGORY_ICONS: Record<PurchaseCategory, string> = {
  ALIMENTACAO: '🍔',
  BEBIDAS: '🥤',
  DECORACAO: '🎈',
  BRINCADEIRAS: '🎮',
  ESTRUTURA: '🏗️',
  LIMPEZA: '🧹',
  OUTROS: '📦',
}

const STATUS_LABELS: Record<PurchaseStatus, string> = {
  PLANEJADO: 'Planejado',
  EM_COTACAO: 'Em Cotação',
  COMPRADO: 'Comprado',
  RECEBIDO: 'Recebido',
  CANCELADO: 'Cancelado',
}

const STATUS_COLORS: Record<PurchaseStatus, { color: string; bg: string }> = {
  PLANEJADO: { color: '#64748B', bg: '#F1F5F9' },
  EM_COTACAO: { color: '#92610A', bg: '#FEF3C7' },
  COMPRADO: { color: '#1D4ED8', bg: '#DBEAFE' },
  RECEBIDO: { color: '#15803D', bg: '#DCFCE7' },
  CANCELADO: { color: '#B91C1C', bg: '#FEE2E2' },
}

const PAYMENT_METHOD_LABELS: Record<string, string> = {
  pix: 'Pix',
  dinheiro: 'Dinheiro',
  cartao: 'Cartão',
  transferencia: 'Transferência',
  boleto: 'Boleto',
  outros: 'Outros',
}

const CATEGORY_OPTIONS = Object.keys(CATEGORY_LABELS) as PurchaseCategory[]

const STATUS_FILTER_CHIPS: { key: PurchaseStatus | 'all'; label: string }[] = [
  { key: 'all', label: 'Todos' },
  { key: 'PLANEJADO', label: 'Planejado' },
  { key: 'EM_COTACAO', label: 'Em Cotação' },
  { key: 'COMPRADO', label: 'Comprado' },
  { key: 'RECEBIDO', label: 'Recebido' },
  { key: 'CANCELADO', label: 'Cancelado' },
]

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fmtBRL(centavos: number): string {
  return (centavos / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

function formatQty(q: number, unit: string): string {
  const formatted = Number.isInteger(q) ? String(q) : q.toLocaleString('pt-BR', { maximumFractionDigits: 2 })
  return `${formatted} ${unit}`
}

function parseReais(str: string): number | null {
  const v = str.trim().replace(',', '.')
  if (!v) return null
  const n = parseFloat(v)
  return isNaN(n) || n < 0 ? null : Math.round(n * 100)
}

function compressImage(file: File, maxDim = 1280, quality = 0.72): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onerror = () => reject(new Error('Erro ao ler arquivo'))
    reader.onload = () => {
      const img = new Image()
      img.onerror = () => reject(new Error('Erro ao carregar imagem'))
      img.onload = () => {
        let { width, height } = img
        if (width > maxDim || height > maxDim) {
          const ratio = Math.min(maxDim / width, maxDim / height)
          width = Math.round(width * ratio)
          height = Math.round(height * ratio)
        }
        const canvas = document.createElement('canvas')
        canvas.width = width
        canvas.height = height
        const ctx = canvas.getContext('2d')
        if (!ctx) { reject(new Error('Canvas indisponível')); return }
        ctx.drawImage(img, 0, 0, width, height)
        resolve(canvas.toDataURL('image/jpeg', quality))
      }
      img.src = reader.result as string
    }
    reader.readAsDataURL(file)
  })
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

// ─── Primitives ───────────────────────────────────────────────────────────────

function Overlay({ onClose, children }: { onClose: () => void; children: React.ReactNode }) {
  return (
    <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.45)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16, backdropFilter: 'blur(2px)' }}>
      <div onClick={(e) => e.stopPropagation()} style={{ width: '100%', maxWidth: 520, maxHeight: '90vh', overflowY: 'auto', borderRadius: 20 }}>
        {children}
      </div>
    </div>
  )
}

function ModalHeader({ title, onClose }: { title: string; onClose: () => void }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
      <h2 style={{ margin: 0, fontSize: 19, fontWeight: 700, color: '#0F172A', fontFamily: 'var(--font-serif)', letterSpacing: '-0.02em' }}>{title}</h2>
      <button onClick={onClose} style={{ background: '#F1F5F9', border: 'none', width: 30, height: 30, borderRadius: 8, fontSize: 16, cursor: 'pointer', color: '#64748B', display: 'grid', placeItems: 'center', lineHeight: 1 }}>×</button>
    </div>
  )
}

function ErrorMsg({ msg }: { msg: string }) {
  return <p style={{ margin: 0, fontSize: 13, color: '#DC2626', background: '#FEF2F2', padding: '8px 12px', borderRadius: 8 }}>{msg}</p>
}

function PrimaryBtn({ loading, label, loadingLabel = 'Salvando…' }: { loading: boolean; label: string; loadingLabel?: string }) {
  return (
    <button type="submit" disabled={loading} style={{ padding: '12px 20px', borderRadius: 10, border: 'none', background: loading ? '#CBD5E1' : 'var(--fdc-tangerine)', color: '#fff', fontWeight: 700, fontSize: 14, cursor: loading ? 'not-allowed' : 'pointer', fontFamily: 'inherit', transition: 'background 0.15s' }}>
      {loading ? loadingLabel : label}
    </button>
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
  return <p style={{ margin: '5px 0 0', fontSize: 12, color: '#15803D', fontWeight: 600 }}>✓ {fmtBRL(value)} registrado</p>
}

function StatusBadge({ status }: { status: PurchaseStatus }) {
  const cfg = STATUS_COLORS[status]
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center',
      padding: '3px 10px', borderRadius: 999,
      fontSize: 11, fontWeight: 600, letterSpacing: '0.01em',
      color: cfg.color, background: cfg.bg, whiteSpace: 'nowrap',
    }}>
      {STATUS_LABELS[status]}
    </span>
  )
}

function CategoryTag({ category }: { category: PurchaseCategory }) {
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 12, color: '#64748B', fontWeight: 600 }}>
      <span>{CATEGORY_ICONS[category]}</span>
      <span>{CATEGORY_LABELS[category]}</span>
    </span>
  )
}

// ─── MetricRow ────────────────────────────────────────────────────────────────

function MetricRow({ items }: { items: Item[] }) {
  const active = items.filter((i) => i.status !== 'CANCELADO')
  const bought = items.filter((i) => i.status === 'COMPRADO' || i.status === 'RECEBIDO')
  const pending = items.filter((i) => i.status === 'PLANEJADO' || i.status === 'EM_COTACAO')
  const spent = bought.reduce((s, i) => s + (i.paidValue ?? 0), 0)

  const lastPurchase = [...bought]
    .filter((i) => i.purchaseDate)
    .sort((a, b) => new Date(b.purchaseDate as string).getTime() - new Date(a.purchaseDate as string).getTime())[0] ?? null

  const topCategory = (() => {
    const totals = new Map<PurchaseCategory, number>()
    for (const i of bought) {
      if (i.paidValue) totals.set(i.category, (totals.get(i.category) ?? 0) + i.paidValue)
    }
    let top: { category: PurchaseCategory; total: number } | null = null
    for (const [category, total] of totals) {
      if (!top || total > top.total) top = { category, total }
    }
    return top
  })()

  const cards: { label: string; value: string; icon: string; sub: string; vColor?: string; valueStyle?: React.CSSProperties }[] = [
    { label: 'Itens planejados', value: String(active.length), icon: '📋', sub: 'ativos no total' },
    { label: 'Itens comprados', value: String(bought.length), icon: '✅', sub: 'comprado ou recebido', vColor: '#15803D' },
    { label: 'Itens pendentes', value: String(pending.length), icon: '⏳', sub: 'planejado / em cotação', vColor: pending.length > 0 ? '#C2410C' : '#64748B' },
    { label: 'Valor gasto', value: fmtBRL(spent), icon: '💸', sub: 'total já pago', vColor: '#C2410C' },
    {
      label: 'Última compra',
      value: lastPurchase ? lastPurchase.name : '—',
      icon: '🛒',
      sub: lastPurchase?.purchaseDate ? format(new Date(lastPurchase.purchaseDate), "dd/MM/yyyy", { locale: ptBR }) : 'nenhuma ainda',
      valueStyle: { fontSize: 16, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },
    },
    {
      label: 'Maior gasto',
      value: topCategory ? CATEGORY_LABELS[topCategory.category] : '—',
      icon: topCategory ? CATEGORY_ICONS[topCategory.category] : '📊',
      sub: topCategory ? fmtBRL(topCategory.total) : 'nenhum gasto ainda',
      valueStyle: { fontSize: 16 },
    },
  ]

  return (
    <div className="adm-metric-row">
      {cards.map((c) => (
        <div key={c.label} className="adm-card" style={{ padding: '18px 20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
            <span style={{ fontSize: 11, fontWeight: 600, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.07em' }}>{c.label}</span>
            <span style={{ fontSize: 16 }}>{c.icon}</span>
          </div>
          <div style={{ fontSize: 22, fontWeight: 700, color: c.vColor ?? '#0F172A', letterSpacing: '-0.02em', lineHeight: 1.15, fontFamily: 'var(--font-serif)', ...c.valueStyle }}>{c.value}</div>
          <div style={{ fontSize: 11, color: '#94A3B8', marginTop: 4 }}>{c.sub}</div>
        </div>
      ))}
    </div>
  )
}

// ─── ItemCard / ItemCardList (mobile-first) ────────────────────────────────────

function ItemCard({ item, onOpen }: { item: Item; onOpen: (id: string) => void }) {
  return (
    <button
      onClick={() => onOpen(item.id)}
      style={{ display: 'block', width: '100%', textAlign: 'left', background: '#fff', border: '1px solid #F1F5F9', borderRadius: 16, padding: '15px 16px', cursor: 'pointer', fontFamily: 'inherit', boxShadow: '0 1px 4px rgba(0,0,0,0.04)', transition: 'box-shadow 0.15s' }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8, marginBottom: 10 }}>
        <div style={{ minWidth: 0, flex: 1 }}>
          <div style={{ fontWeight: 700, fontSize: 14, color: '#0F172A', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.name}</div>
          <div style={{ marginTop: 4 }}><CategoryTag category={item.category} /></div>
        </div>
        <StatusBadge status={item.status} />
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: '#94A3B8', marginBottom: 10 }}>
        <span>{formatQty(item.quantity, item.unit)}</span>
        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '60%' }}>{item.responsavel}</span>
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', paddingTop: 10, borderTop: '1px solid #F1F5F9' }}>
        <div>
          <div style={{ fontSize: 10, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 2 }}>Previsto</div>
          <div style={{ fontWeight: 600, fontSize: 13, color: '#0F172A' }}>{fmtBRL(item.expectedValue)}</div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: 10, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 2 }}>Pago</div>
          <div style={{ fontWeight: 700, fontSize: 13, color: item.paidValue != null ? '#15803D' : '#CBD5E1' }}>{item.paidValue != null ? fmtBRL(item.paidValue) : '—'}</div>
        </div>
      </div>
    </button>
  )
}

function ItemCardList({ items, onOpen }: { items: Item[]; onOpen: (id: string) => void }) {
  if (items.length === 0) {
    return (
      <div className="adm-card" style={{ textAlign: 'center', padding: '48px 24px', color: '#94A3B8', fontSize: 15 }}>
        Nenhum item encontrado.
      </div>
    )
  }
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 12 }}>
      {items.map((item) => <ItemCard key={item.id} item={item} onOpen={onOpen} />)}
    </div>
  )
}

// ─── DrawerPanel ──────────────────────────────────────────────────────────────

const sectionTitle: React.CSSProperties = { margin: '0 0 12px', fontSize: 11, fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.07em' }

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}>
      <span style={{ color: '#94A3B8' }}>{label}</span>
      <span style={{ fontWeight: 600, color: '#0F172A', textAlign: 'right' }}>{value}</span>
    </div>
  )
}

const footerBtn: React.CSSProperties = {
  flex: 1, padding: '10px 0', borderRadius: 9,
  border: '1px solid #E2E8F0', background: '#F8FAFC',
  color: '#334155', fontSize: 11, fontWeight: 700,
  cursor: 'pointer', fontFamily: 'inherit',
  transition: 'background 0.15s', minWidth: 90,
}

const accentBtn: React.CSSProperties = {
  border: '1px solid var(--fdc-tangerine)',
  background: 'rgba(236,82,18,0.08)',
  color: 'var(--fdc-tangerine)',
}

function DrawerPanel({
  item,
  open,
  loading,
  onClose,
  onEdit,
  onRegister,
  onStatusChange,
  statusChanging,
}: {
  item: FullItem | null
  open: boolean
  loading: boolean
  onClose: () => void
  onEdit: (item: FullItem) => void
  onRegister: (item: FullItem) => void
  onStatusChange: (item: FullItem, status: PurchaseStatus) => void
  statusChanging: boolean
}) {
  const btnStyle = (extra?: React.CSSProperties): React.CSSProperties => ({
    ...footerBtn, ...extra,
    opacity: statusChanging ? 0.5 : 1,
    cursor: statusChanging ? 'not-allowed' : 'pointer',
  })

  return (
    <>
      <div className={`adm-drawer-backdrop${open ? ' open' : ''}`} onClick={onClose} />
      <aside className={`adm-drawer${open ? ' open' : ''}`}>
        {loading && (
          <div style={{ flex: 1, display: 'grid', placeItems: 'center' }}>
            <span style={{ color: '#94A3B8', fontSize: 14 }}>Carregando…</span>
          </div>
        )}
        {!loading && item && (
          <>
            {/* Header */}
            <div style={{ padding: '20px 24px 16px', borderBottom: '1px solid #F1F5F9', flexShrink: 0 }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontWeight: 700, fontSize: 17, color: '#0F172A', lineHeight: 1.25, wordBreak: 'break-word' }}>{item.name}</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 6, flexWrap: 'wrap' }}>
                    <CategoryTag category={item.category} />
                    <StatusBadge status={item.status} />
                  </div>
                </div>
                <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: 20, cursor: 'pointer', color: '#CBD5E1', padding: 4, lineHeight: 1, flexShrink: 0 }}>×</button>
              </div>

              {/* Tiles */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8, marginTop: 16 }}>
                {[
                  { label: 'Quantidade', value: formatQty(item.quantity, item.unit) },
                  { label: 'Responsável', value: item.responsavel },
                  { label: 'Valor previsto', value: fmtBRL(item.expectedValue) },
                  { label: 'Valor pago', value: item.paidValue != null ? fmtBRL(item.paidValue) : '—' },
                ].map((m) => (
                  <div key={m.label} style={{ padding: '10px 12px', background: '#F8FAFC', borderRadius: 10, border: '1px solid #F1F5F9' }}>
                    <div style={{ fontSize: 10, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 3 }}>{m.label}</div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: '#0F172A', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{m.value}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Body (scrollable) */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '16px 24px' }}>
              {/* Purchase details (if registered) */}
              {(item.fornecedor || item.purchaseDate || item.paymentMethod) && (
                <div style={{ marginBottom: 20 }}>
                  <p style={sectionTitle}>Compra</p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8, padding: '12px 14px', background: '#F8FAFC', borderRadius: 12, border: '1px solid #F1F5F9', fontSize: 13 }}>
                    {item.fornecedor && <Row label="Fornecedor" value={item.fornecedor} />}
                    {item.purchaseDate && <Row label="Data" value={format(new Date(item.purchaseDate), 'dd/MM/yyyy', { locale: ptBR })} />}
                    {item.paymentMethod && <Row label="Forma de pagamento" value={PAYMENT_METHOD_LABELS[item.paymentMethod] ?? item.paymentMethod} />}
                  </div>
                </div>
              )}

              {/* Receipt */}
              {item.receiptUrl && (
                <div style={{ marginBottom: 20 }}>
                  <p style={sectionTitle}>Comprovante</p>
                  <a href={item.receiptUrl} target="_blank" rel="noopener noreferrer">
                    <img src={item.receiptUrl} alt="Comprovante" style={{ width: '100%', borderRadius: 12, border: '1px solid #F1F5F9', display: 'block' }} />
                  </a>
                </div>
              )}

              {/* Observação */}
              {item.observacao && (
                <div style={{ marginBottom: 20 }}>
                  <p style={sectionTitle}>Observação</p>
                  <p style={{ margin: 0, fontSize: 13, color: '#334155', lineHeight: 1.6, background: '#F8FAFC', borderRadius: 12, border: '1px solid #F1F5F9', padding: '12px 14px' }}>{item.observacao}</p>
                </div>
              )}

              {/* Histórico */}
              <div>
                <p style={sectionTitle}>Histórico</p>
                {item.history.length === 0 ? (
                  <p style={{ fontSize: 13, color: '#94A3B8' }}>Nenhum registro ainda.</p>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {[...item.history].reverse().map((h) => (
                      <div key={h.id} style={{ display: 'flex', gap: 12, padding: '12px 14px', background: '#F8FAFC', borderRadius: 12, border: '1px solid #F1F5F9' }}>
                        <span style={{ fontSize: 16, flexShrink: 0, marginTop: 1 }}>📝</span>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontWeight: 600, fontSize: 13, color: '#0F172A' }}>{h.description}</div>
                          <div style={{ fontSize: 11, color: '#CBD5E1', marginTop: 4 }}>
                            {h.createdBy} · {format(new Date(h.createdAt), "dd/MM 'às' HH:mm", { locale: ptBR })}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Footer actions */}
            <div style={{ padding: '12px 16px', borderTop: '1px solid #F1F5F9', display: 'flex', gap: 8, flexShrink: 0, flexWrap: 'wrap' }}>
              <button onClick={() => onEdit(item)} style={footerBtn}>✏️ Editar</button>
              {item.status === 'PLANEJADO' && (
                <>
                  <button onClick={() => onStatusChange(item, 'EM_COTACAO')} disabled={statusChanging} style={btnStyle()}>🔍 Em Cotação</button>
                  <button onClick={() => onRegister(item)} style={{ ...footerBtn, ...accentBtn }}>🛒 Registrar Compra</button>
                  <button onClick={() => onStatusChange(item, 'CANCELADO')} disabled={statusChanging} style={btnStyle({ color: '#B91C1C' })}>🗑 Cancelar</button>
                </>
              )}
              {item.status === 'EM_COTACAO' && (
                <>
                  <button onClick={() => onStatusChange(item, 'PLANEJADO')} disabled={statusChanging} style={btnStyle()}>↩ Planejado</button>
                  <button onClick={() => onRegister(item)} style={{ ...footerBtn, ...accentBtn }}>🛒 Registrar Compra</button>
                  <button onClick={() => onStatusChange(item, 'CANCELADO')} disabled={statusChanging} style={btnStyle({ color: '#B91C1C' })}>🗑 Cancelar</button>
                </>
              )}
              {item.status === 'COMPRADO' && (
                <>
                  <button onClick={() => onStatusChange(item, 'RECEBIDO')} disabled={statusChanging} style={btnStyle(accentBtn)}>📦 Marcar Recebido</button>
                  <button onClick={() => onRegister(item)} style={footerBtn}>🧾 Editar compra</button>
                </>
              )}
              {item.status === 'RECEBIDO' && (
                <button onClick={() => onRegister(item)} style={footerBtn}>🧾 Editar compra</button>
              )}
              {item.status === 'CANCELADO' && (
                <button onClick={() => onStatusChange(item, 'PLANEJADO')} disabled={statusChanging} style={btnStyle()}>↺ Reativar</button>
              )}
            </div>
          </>
        )}
      </aside>
    </>
  )
}

// ─── NewItemModal ─────────────────────────────────────────────────────────────

function NewItemModal({ onClose, onSuccess }: { onClose: () => void; onSuccess: () => void }) {
  const [name, setName] = useState('')
  const [category, setCategory] = useState<PurchaseCategory>('OUTROS')
  const [quantity, setQuantity] = useState('1')
  const [unit, setUnit] = useState('un')
  const [expectedStr, setExpectedStr] = useState('')
  const [responsavel, setResponsavel] = useState('')
  const [observacao, setObservacao] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const qty = parseFloat(quantity.replace(',', '.'))
    const expected = parseReais(expectedStr) ?? 0
    if (!name.trim()) { setError('Informe o nome do item'); return }
    if (!responsavel.trim()) { setError('Informe o responsável'); return }
    if (isNaN(qty) || qty <= 0) { setError('Quantidade inválida'); return }
    setLoading(true); setError('')
    try {
      const res = await fetch('/api/admin/compras/items', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(), category, quantity: qty, unit: unit.trim() || 'un',
          expectedValue: expected, responsavel: responsavel.trim(), observacao: observacao.trim() || null,
        }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error ?? 'Erro'); return }
      onSuccess()
    } catch { setError('Erro de conexão') } finally { setLoading(false) }
  }

  return (
    <div style={{ background: '#fff', borderRadius: 20, padding: 28, boxShadow: '0 20px 60px rgba(0,0,0,0.12)' }}>
      <ModalHeader title="Novo item" onClose={onClose} />
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div>
          <label style={lbl}>Nome do item</label>
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Ex: Carvão para churrasco" style={inp} autoFocus />
        </div>
        <div>
          <label style={lbl}>Categoria</label>
          <select value={category} onChange={(e) => setCategory(e.target.value as PurchaseCategory)} style={{ ...inp, appearance: 'none' }}>
            {CATEGORY_OPTIONS.map((c) => <option key={c} value={c}>{CATEGORY_ICONS[c]} {CATEGORY_LABELS[c]}</option>)}
          </select>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <div>
            <label style={lbl}>Quantidade</label>
            <input value={quantity} onChange={(e) => setQuantity(e.target.value)} inputMode="decimal" style={inp} />
          </div>
          <div>
            <label style={lbl}>Unidade</label>
            <input value={unit} onChange={(e) => setUnit(e.target.value)} placeholder="un, kg, pacote…" style={inp} />
          </div>
        </div>
        <div>
          <label style={lbl}>Valor previsto</label>
          <ReaisInput value={expectedStr} onChange={setExpectedStr} />
        </div>
        <div>
          <label style={lbl}>Responsável</label>
          <input value={responsavel} onChange={(e) => setResponsavel(e.target.value)} placeholder="Nome de quem vai providenciar" style={inp} />
        </div>
        <div>
          <label style={lbl}>Observação <span style={{ fontWeight: 400, textTransform: 'none', color: '#94A3B8' }}>(opcional)</span></label>
          <textarea value={observacao} onChange={(e) => setObservacao(e.target.value)} rows={3} style={{ ...inp, resize: 'vertical', lineHeight: 1.5 }} />
        </div>
        {error && <ErrorMsg msg={error} />}
        <PrimaryBtn loading={loading} label="Adicionar item" />
      </form>
    </div>
  )
}

// ─── EditItemModal ────────────────────────────────────────────────────────────

function EditItemModal({ item, onClose, onSuccess }: { item: FullItem; onClose: () => void; onSuccess: () => void }) {
  const [name, setName] = useState(item.name)
  const [category, setCategory] = useState<PurchaseCategory>(item.category)
  const [quantity, setQuantity] = useState(String(item.quantity))
  const [unit, setUnit] = useState(item.unit)
  const [expectedStr, setExpectedStr] = useState((item.expectedValue / 100).toFixed(2).replace('.', ','))
  const [responsavel, setResponsavel] = useState(item.responsavel)
  const [observacao, setObservacao] = useState(item.observacao ?? '')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const qty = parseFloat(quantity.replace(',', '.'))
    const expected = parseReais(expectedStr)
    if (!name.trim()) { setError('Informe o nome do item'); return }
    if (!responsavel.trim()) { setError('Informe o responsável'); return }
    if (isNaN(qty) || qty <= 0) { setError('Quantidade inválida'); return }
    if (expected === null) { setError('Valor previsto inválido'); return }
    setLoading(true); setError('')
    try {
      const res = await fetch(`/api/admin/compras/items/${item.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(), category, quantity: qty, unit: unit.trim() || 'un',
          expectedValue: expected, responsavel: responsavel.trim(), observacao: observacao.trim(),
        }),
      })
      const data = await res.json()
      if (!res.ok) {
        if (data.error === 'Nada para atualizar') { onSuccess(); return }
        setError(data.error ?? 'Erro'); return
      }
      onSuccess()
    } catch { setError('Erro de conexão') } finally { setLoading(false) }
  }

  return (
    <div style={{ background: '#fff', borderRadius: 20, padding: 28, boxShadow: '0 20px 60px rgba(0,0,0,0.12)' }}>
      <ModalHeader title="Editar item" onClose={onClose} />
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div>
          <label style={lbl}>Nome do item</label>
          <input value={name} onChange={(e) => setName(e.target.value)} style={inp} autoFocus />
        </div>
        <div>
          <label style={lbl}>Categoria</label>
          <select value={category} onChange={(e) => setCategory(e.target.value as PurchaseCategory)} style={{ ...inp, appearance: 'none' }}>
            {CATEGORY_OPTIONS.map((c) => <option key={c} value={c}>{CATEGORY_ICONS[c]} {CATEGORY_LABELS[c]}</option>)}
          </select>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <div>
            <label style={lbl}>Quantidade</label>
            <input value={quantity} onChange={(e) => setQuantity(e.target.value)} inputMode="decimal" style={inp} />
          </div>
          <div>
            <label style={lbl}>Unidade</label>
            <input value={unit} onChange={(e) => setUnit(e.target.value)} placeholder="un, kg, pacote…" style={inp} />
          </div>
        </div>
        <div>
          <label style={lbl}>Valor previsto</label>
          <ReaisInput value={expectedStr} onChange={setExpectedStr} />
        </div>
        <div>
          <label style={lbl}>Responsável</label>
          <input value={responsavel} onChange={(e) => setResponsavel(e.target.value)} style={inp} />
        </div>
        <div>
          <label style={lbl}>Observação <span style={{ fontWeight: 400, textTransform: 'none', color: '#94A3B8' }}>(opcional)</span></label>
          <textarea value={observacao} onChange={(e) => setObservacao(e.target.value)} rows={3} style={{ ...inp, resize: 'vertical', lineHeight: 1.5 }} />
        </div>
        {error && <ErrorMsg msg={error} />}
        <PrimaryBtn loading={loading} label="Salvar alterações" />
      </form>
    </div>
  )
}

// ─── RegisterPurchaseModal ────────────────────────────────────────────────────

function RegisterPurchaseModal({ item, onClose, onSuccess }: { item: FullItem; onClose: () => void; onSuccess: () => void }) {
  const initialPaid = item.paidValue ?? item.expectedValue
  const [paidStr, setPaidStr] = useState((initialPaid / 100).toFixed(2).replace('.', ','))
  const [fornecedor, setFornecedor] = useState(item.fornecedor ?? '')
  const [purchaseDate, setPurchaseDate] = useState(item.purchaseDate ? item.purchaseDate.slice(0, 10) : new Date().toISOString().slice(0, 10))
  const [paymentMethod, setPaymentMethod] = useState(item.paymentMethod ?? '')
  const [purchaseNote, setPurchaseNote] = useState('')
  const [receiptPreview, setReceiptPreview] = useState<string | null>(item.receiptUrl)
  const [receiptChanged, setReceiptChanged] = useState(false)
  const [compressing, setCompressing] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const parsed = parseReais(paidStr)

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setCompressing(true); setError('')
    try {
      const dataUrl = await compressImage(file)
      setReceiptPreview(dataUrl)
      setReceiptChanged(true)
    } catch {
      setError('Não foi possível processar a imagem')
    } finally {
      setCompressing(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (parsed === null) { setError('Informe um valor pago válido'); return }
    setLoading(true); setError('')
    try {
      const res = await fetch(`/api/admin/compras/items/${item.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          paidValue: parsed,
          fornecedor: fornecedor.trim(),
          purchaseDate,
          paymentMethod: paymentMethod || null,
          purchaseNote: purchaseNote.trim(),
          ...(receiptChanged ? { receiptUrl: receiptPreview } : {}),
        }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error ?? 'Erro'); return }
      onSuccess()
    } catch { setError('Erro de conexão') } finally { setLoading(false) }
  }

  return (
    <div style={{ background: '#fff', borderRadius: 20, padding: 28, boxShadow: '0 20px 60px rgba(0,0,0,0.12)' }}>
      <ModalHeader title="Registrar compra" onClose={onClose} />
      <div style={{ padding: '12px 14px', background: '#F8FAFC', borderRadius: 12, border: '1px solid #E2E8F0', marginBottom: 20 }}>
        <div style={{ fontWeight: 600, fontSize: 14, color: '#0F172A' }}>{item.name}</div>
        <div style={{ fontSize: 12, color: '#94A3B8', marginTop: 2 }}>{formatQty(item.quantity, item.unit)} · Previsto: {fmtBRL(item.expectedValue)}</div>
      </div>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div>
          <label style={lbl}>Valor pago</label>
          <ReaisInput value={paidStr} onChange={setPaidStr} />
          {parsed !== null && parsed > 0 && <ConfirmLine value={parsed} />}
        </div>
        <div>
          <label style={lbl}>Fornecedor <span style={{ fontWeight: 400, textTransform: 'none', color: '#94A3B8' }}>(opcional)</span></label>
          <input value={fornecedor} onChange={(e) => setFornecedor(e.target.value)} placeholder="Ex: Atacadão" style={inp} />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <div>
            <label style={lbl}>Data da compra</label>
            <input type="date" value={purchaseDate} onChange={(e) => setPurchaseDate(e.target.value)} style={inp} />
          </div>
          <div>
            <label style={lbl}>Forma de pagamento</label>
            <select value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)} style={{ ...inp, appearance: 'none' }}>
              <option value="">Selecionar…</option>
              {Object.entries(PAYMENT_METHOD_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
            </select>
          </div>
        </div>
        <div>
          <label style={lbl}>Comprovante <span style={{ fontWeight: 400, textTransform: 'none', color: '#94A3B8' }}>(opcional)</span></label>
          {receiptPreview && (
            <img src={receiptPreview} alt="Comprovante" style={{ width: '100%', maxHeight: 200, objectFit: 'cover', borderRadius: 12, border: '1px solid #E2E8F0', marginBottom: 8 }} />
          )}
          <input type="file" accept="image/*" capture="environment" onChange={handleFile} style={{ ...inp, padding: '8px 10px' }} />
          {compressing && <p style={{ margin: '6px 0 0', fontSize: 12, color: '#94A3B8' }}>Processando imagem…</p>}
        </div>
        <div>
          <label style={lbl}>Observação <span style={{ fontWeight: 400, textTransform: 'none', color: '#94A3B8' }}>(opcional)</span></label>
          <input value={purchaseNote} onChange={(e) => setPurchaseNote(e.target.value)} placeholder="Ex: comprado com desconto à vista" style={inp} />
        </div>
        {error && <ErrorMsg msg={error} />}
        <PrimaryBtn loading={loading || compressing} label="Confirmar compra" />
      </form>
    </div>
  )
}

// ─── ComprasClient (main) ──────────────────────────────────────────────────────

export function ComprasClient({ items: initial }: { items: Item[] }) {
  const [items, setItems] = useState<Item[]>(initial)
  const [modal, setModal] = useState<ActiveModal>(null)
  const [drawerItemId, setDrawerItemId] = useState<string | null>(null)
  const [drawerItem, setDrawerItem] = useState<FullItem | null>(null)
  const [drawerLoading, setDrawerLoading] = useState(false)
  const [statusChanging, setStatusChanging] = useState(false)

  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<PurchaseStatus | 'all'>('all')
  const [categoryFilter, setCategoryFilter] = useState<PurchaseCategory | 'all'>('all')
  const [responsavelFilter, setResponsavelFilter] = useState('all')

  const responsaveis = useMemo(() => {
    const set = new Set<string>()
    for (const i of items) set.add(i.responsavel)
    return [...set].sort((a, b) => a.localeCompare(b, 'pt-BR'))
  }, [items])

  const filtered = useMemo(() => {
    let list = items
    if (search) {
      const q = search.toLowerCase()
      list = list.filter((i) => i.name.toLowerCase().includes(q) || i.responsavel.toLowerCase().includes(q))
    }
    if (statusFilter !== 'all') list = list.filter((i) => i.status === statusFilter)
    if (categoryFilter !== 'all') list = list.filter((i) => i.category === categoryFilter)
    if (responsavelFilter !== 'all') list = list.filter((i) => i.responsavel === responsavelFilter)
    return list
  }, [items, search, statusFilter, categoryFilter, responsavelFilter])

  const refreshItems = async () => {
    try {
      const res = await fetch('/api/admin/compras/items')
      const data = await res.json()
      if (data.items) setItems(data.items)
    } catch { /* ignore */ }
  }

  const fetchFullItem = async (id: string): Promise<FullItem | null> => {
    try {
      const res = await fetch(`/api/admin/compras/items/${id}`)
      const data = await res.json()
      if (!res.ok) return null
      return data.item as FullItem
    } catch { return null }
  }

  const openDrawer = async (id: string) => {
    setDrawerItemId(id)
    setDrawerItem(null)
    setDrawerLoading(true)
    const full = await fetchFullItem(id)
    setDrawerItem(full)
    setDrawerLoading(false)
  }

  const closeDrawer = () => {
    setDrawerItemId(null)
    setDrawerItem(null)
  }

  const refreshDrawer = async () => {
    if (!drawerItemId) return
    const full = await fetchFullItem(drawerItemId)
    if (full) setDrawerItem(full)
  }

  const closeModal = () => setModal(null)

  const handleModalSuccess = async () => {
    closeModal()
    await Promise.all([refreshItems(), refreshDrawer()])
  }

  const handleStatusChange = async (item: FullItem, status: PurchaseStatus) => {
    setStatusChanging(true)
    try {
      const res = await fetch(`/api/admin/compras/items/${item.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      })
      if (res.ok) await Promise.all([refreshItems(), refreshDrawer()])
    } catch { /* ignore */ } finally {
      setStatusChanging(false)
    }
  }

  const chip = (c: { key: PurchaseStatus | 'all'; label: string }) => {
    const active = statusFilter === c.key
    return (
      <button key={c.key} onClick={() => setStatusFilter(c.key)} style={{
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
      <MetricRow items={items} />

      {/* Toolbar */}
      <div className="adm-toolbar" style={{ marginBottom: 16 }}>
        <input
          placeholder="Buscar por item ou responsável…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ ...inp, width: 220, flexShrink: 0 }}
        />
        <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value as PurchaseCategory | 'all')} style={{ ...inp, appearance: 'none', width: 'auto', flexShrink: 0 }}>
          <option value="all">Todas categorias</option>
          {CATEGORY_OPTIONS.map((c) => <option key={c} value={c}>{CATEGORY_ICONS[c]} {CATEGORY_LABELS[c]}</option>)}
        </select>
        <select value={responsavelFilter} onChange={(e) => setResponsavelFilter(e.target.value)} style={{ ...inp, appearance: 'none', width: 'auto', flexShrink: 0 }}>
          <option value="all">Todos responsáveis</option>
          {responsaveis.map((r) => <option key={r} value={r}>{r}</option>)}
        </select>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', flex: 1 }}>
          {STATUS_FILTER_CHIPS.map(chip)}
        </div>
        <div className="adm-toolbar-actions" style={{ display: 'flex', gap: 8 }}>
          <button onClick={() => setModal({ type: 'new' })} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '9px 20px', borderRadius: 9, border: 'none', background: 'var(--fdc-tangerine)', color: '#fff', fontSize: 14, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>
            + Novo item
          </button>
        </div>
      </div>

      <ItemCardList items={filtered} onOpen={openDrawer} />

      <DrawerPanel
        item={drawerItem}
        open={!!drawerItemId}
        loading={drawerLoading}
        onClose={closeDrawer}
        onEdit={(item) => setModal({ type: 'edit', item })}
        onRegister={(item) => setModal({ type: 'register', item })}
        onStatusChange={handleStatusChange}
        statusChanging={statusChanging}
      />

      {modal?.type === 'new' && (
        <Overlay onClose={closeModal}>
          <NewItemModal onClose={closeModal} onSuccess={async () => { closeModal(); await refreshItems() }} />
        </Overlay>
      )}
      {modal?.type === 'edit' && (
        <Overlay onClose={closeModal}>
          <EditItemModal item={modal.item} onClose={closeModal} onSuccess={handleModalSuccess} />
        </Overlay>
      )}
      {modal?.type === 'register' && (
        <Overlay onClose={closeModal}>
          <RegisterPurchaseModal item={modal.item} onClose={closeModal} onSuccess={handleModalSuccess} />
        </Overlay>
      )}
    </>
  )
}
