'use client'

import { useState } from 'react'
import Link from 'next/link'
import { signOut } from 'next-auth/react'

type MiniTicket = {
  id: string
  code: string
  typeName: string
  usedAt: string | null
}

type OrderData = {
  id: string
  isUpcoming: boolean
  eventName: string
  eventLocation: string
  eventDateFull: string
  eventTime: string
  purchaseDate: string
  totalAmount: number
  ticketTypes: string[]
  validCount: number
  tickets: MiniTicket[]
}

type Props = {
  userName: string
  userEmail: string
  orders: OrderData[]
}

function QrPlaceholder() {
  return (
    <svg width="36" height="36" viewBox="0 0 36 36" fill="none" aria-hidden>
      <rect x="1" y="1" width="13" height="13" rx="2" fill="#2a2015"/>
      <rect x="3.5" y="3.5" width="8" height="8" rx="1" fill="white"/>
      <rect x="5.5" y="5.5" width="4" height="4" fill="#2a2015"/>
      <rect x="22" y="1" width="13" height="13" rx="2" fill="#2a2015"/>
      <rect x="24.5" y="3.5" width="8" height="8" rx="1" fill="white"/>
      <rect x="26.5" y="5.5" width="4" height="4" fill="#2a2015"/>
      <rect x="1" y="22" width="13" height="13" rx="2" fill="#2a2015"/>
      <rect x="3.5" y="24.5" width="8" height="8" rx="1" fill="white"/>
      <rect x="5.5" y="26.5" width="4" height="4" fill="#2a2015"/>
      <rect x="22" y="22" width="4" height="4" fill="#2a2015"/>
      <rect x="28" y="22" width="4" height="4" fill="#2a2015"/>
      <rect x="32" y="22" width="3" height="4" fill="#2a2015"/>
      <rect x="22" y="28" width="4" height="4" fill="#2a2015"/>
      <rect x="28" y="32" width="4" height="3" fill="#2a2015"/>
      <rect x="32" y="28" width="3" height="4" fill="#2a2015"/>
    </svg>
  )
}

function NavIcon({ type }: { type: string }) {
  if (type === 'tickets') return (
    <svg width="15" height="15" viewBox="0 0 15 15" fill="none"><path d="M1.5 4.5a1 1 0 011-1h10a1 1 0 011 1V6a1.5 1.5 0 000 3v1.5a1 1 0 01-1 1h-10a1 1 0 01-1-1V9A1.5 1.5 0 000 7.5a1.5 1.5 0 001.5-1.5V4.5z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round"/></svg>
  )
  if (type === 'orders') return (
    <svg width="15" height="15" viewBox="0 0 15 15" fill="none"><rect x="1.5" y="2.5" width="12" height="10" rx="1.5" stroke="currentColor" strokeWidth="1.4"/><path d="M4.5 6.5h6M4.5 9.5h4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/></svg>
  )
  if (type === 'heart') return (
    <svg width="15" height="15" viewBox="0 0 15 15" fill="none"><path d="M7.5 12.5S1.5 9 1.5 5a3 3 0 016-0 3 3 0 016 0c0 4-6 7.5-6 7.5z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round"/></svg>
  )
  if (type === 'user') return (
    <svg width="15" height="15" viewBox="0 0 15 15" fill="none"><circle cx="7.5" cy="5" r="2.5" stroke="currentColor" strokeWidth="1.4"/><path d="M2 13c0-2.5 2.5-4 5.5-4s5.5 1.5 5.5 4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/></svg>
  )
  if (type === 'bell') return (
    <svg width="15" height="15" viewBox="0 0 15 15" fill="none"><path d="M7.5 1.5a4 4 0 014 4c0 2 .5 3 1.5 4h-11c1-1 1.5-2 1.5-4a4 4 0 014-4z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round"/><path d="M6 13.5a1.5 1.5 0 003 0" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/></svg>
  )
  if (type === 'logout') return (
    <svg width="15" height="15" viewBox="0 0 15 15" fill="none"><path d="M9.5 7.5H2.5m0 0l3-3m-3 3l3 3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/><path d="M7.5 2.5H12a1 1 0 011 1v8a1 1 0 01-1 1H7.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/></svg>
  )
  return null
}

function EventCard({ order, onShare, shared }: { order: OrderData; onShare: () => void; shared: boolean }) {
  const totalFmt = 'R$ ' + (order.totalAmount / 100).toFixed(2).replace('.', ',')
  const displayTags = order.tickets.slice(0, 6)
  const extraTags = order.tickets.length - 6

  return (
    <div className="mi-event-card">
      <div className="mi-event-card-top">

        {/* Banner */}
        <div className="mi-event-banner">
          <div style={{ position: 'absolute', inset: 0, background: order.isUpcoming ? 'linear-gradient(145deg, #e8622a 0%, #f2883a 55%, #f5a832 100%)' : 'linear-gradient(145deg, #9ca3af 0%, #6b7280 100%)' }} />
          <div style={{ position: 'absolute', top: -30, right: -30, width: 110, height: 110, borderRadius: '50%', background: 'rgba(255,255,255,0.09)', pointerEvents: 'none' }} />
          <div style={{ position: 'absolute', bottom: -15, left: -15, width: 70, height: 70, borderRadius: '50%', background: 'rgba(255,255,255,0.07)', pointerEvents: 'none' }} />
          {/* Ticket count chip */}
          <div style={{ position: 'absolute', bottom: 12, right: 12, background: 'rgba(255,255,255,0.92)', borderRadius: 999, display: 'flex', alignItems: 'center', gap: 4, padding: '4px 10px', fontSize: 12, fontWeight: 700, color: '#1a1512', backdropFilter: 'blur(8px)' }}>
            <span style={{ fontSize: 10 }}>🎟</span> {order.tickets.length}
          </div>
          {/* Event name on banner */}
          <div style={{ position: 'absolute', bottom: 44, left: 16, right: 16 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: 'rgba(255,255,255,0.85)', lineHeight: 1.3, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' as const }}>
              {order.eventName}
            </div>
          </div>
        </div>

        {/* Info column */}
        <div className="mi-event-info">
          {/* Top row: meta + confirmed badge */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8, marginBottom: 12 }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4, minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><rect x="1" y="2" width="10" height="9" rx="1.5" stroke="#9e9087" strokeWidth="1.2"/><path d="M4 1v2M8 1v2M1 5h10" stroke="#9e9087" strokeWidth="1.2" strokeLinecap="round"/></svg>
                <span style={{ fontSize: 12, color: '#9e9087' }}>{order.eventDateFull} · {order.eventTime}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M6 1a3.5 3.5 0 013.5 3.5C9.5 7.5 6 11 6 11S2.5 7.5 2.5 4.5A3.5 3.5 0 016 1z" stroke="#9e9087" strokeWidth="1.2"/><circle cx="6" cy="4.5" r="1.2" fill="#9e9087"/></svg>
                <span style={{ fontSize: 12, color: '#9e9087', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{order.eventLocation}</span>
              </div>
            </div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '4px 10px', borderRadius: 999, background: 'rgba(111,168,74,0.12)', flexShrink: 0 }}>
              <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M1.5 5l2.5 2.5 5-5" stroke="#4a7c29" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
              <span style={{ fontSize: 11, fontWeight: 700, color: '#4a7c29', letterSpacing: '0.02em' }}>Confirmado</span>
            </div>
          </div>

          {/* Ticket type tags */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5, marginBottom: 14 }}>
            {displayTags.map((t, i) => (
              <span key={i} style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '3px 9px', borderRadius: 6, background: '#f5f0eb', border: '1px solid #e8e2da', fontSize: 11, fontWeight: 600, color: '#6b5f56' }}>
                <span style={{ fontSize: 9 }}>▣</span> {t.typeName}
              </span>
            ))}
            {extraTags > 0 && (
              <span style={{ padding: '3px 9px', borderRadius: 6, background: '#f5f0eb', border: '1px solid #e8e2da', fontSize: 11, fontWeight: 600, color: '#9e9087' }}>
                +{extraTags}
              </span>
            )}
          </div>

          {/* Count + total */}
          <p style={{ fontSize: 13, color: '#6b5f56', margin: '0 0 16px', fontWeight: 500 }}>
            {order.validCount} ingresso{order.validCount !== 1 ? 's' : ''} válido{order.validCount !== 1 ? 's' : ''} · {totalFmt}
          </p>

          {/* Action buttons */}
          <div className="mi-event-actions">
            <Link
              href={`/meus-ingressos/${order.tickets[0]?.id ?? ''}`}
              style={{ display: 'inline-flex', alignItems: 'center', gap: 7, padding: '9px 18px', borderRadius: 10, background: '#e8622a', color: 'white', fontSize: 13, fontWeight: 700, textDecoration: 'none', transition: 'background 140ms', letterSpacing: '-0.01em' }}
            >
              <span style={{ fontSize: 14 }}>🎟</span> Ver ingressos
            </Link>
            <button
              onClick={onShare}
              style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '8px 14px', borderRadius: 10, border: '1.5px solid #e8e2da', background: 'transparent', fontSize: 13, fontWeight: 600, color: shared ? '#4a7c29' : '#6b5f56', cursor: 'pointer', transition: 'all 140ms', fontFamily: 'inherit' }}
            >
              {shared ? (
                <><span>✓</span> Copiado!</>
              ) : (
                <><svg width="13" height="13" viewBox="0 0 13 13" fill="none"><circle cx="10" cy="2.5" r="1.5" stroke="currentColor" strokeWidth="1.3"/><circle cx="10" cy="10.5" r="1.5" stroke="currentColor" strokeWidth="1.3"/><circle cx="2.5" cy="6.5" r="1.5" stroke="currentColor" strokeWidth="1.3"/><path d="M8.5 3.3l-4.5 2.3M8.5 9.7L4 7.4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/></svg> Compartilhar</>
              )}
            </button>
            <a
              href={`/api/orders/${order.id}/pdf`}
              download
              style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '8px 14px', borderRadius: 10, border: '1.5px solid #e8e2da', background: 'transparent', fontSize: 13, fontWeight: 600, color: '#6b5f56', textDecoration: 'none', transition: 'all 140ms' }}
            >
              <svg width="13" height="13" viewBox="0 0 13 13" fill="none"><rect x="1.5" y="1.5" width="10" height="10" rx="1.5" stroke="currentColor" strokeWidth="1.3"/><path d="M4 6.5h5M4 4.5h3M4 8.5h3.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/></svg>
              Carteira
            </a>
          </div>
        </div>
      </div>

      {/* Mini tickets */}
      {order.tickets.length > 0 && (
        <div className="mi-event-tickets-section">
          <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#b8a898', margin: '0 0 10px' }}>
            Seus ingressos deste evento
          </p>
          <div className="mi-mini-tickets">
            {order.tickets.map((t) => (
              <Link key={t.id} href={`/meus-ingressos/${t.id}`} style={{ textDecoration: 'none' }}>
                <div className={`mi-mini-ticket${t.usedAt ? ' mi-mini-ticket--used' : ''}`}>
                  <div style={{ background: t.usedAt ? '#f0ebe4' : '#fdf5ef', borderRadius: 8, padding: 5, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, opacity: t.usedAt ? 0.5 : 1 }}>
                    <QrPlaceholder />
                  </div>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: t.usedAt ? '#b8a898' : '#9e9087', marginBottom: 2 }}>
                      {t.typeName}
                    </div>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: 12, fontWeight: 600, color: t.usedAt ? '#b8a898' : '#1a1512', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {t.code}
                    </div>
                    {t.usedAt && (
                      <div style={{ fontSize: 10, color: '#b8a898', marginTop: 1 }}>Utilizado</div>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export function MeusIngressosShell({ userName, userEmail, orders }: Props) {
  const [activeTab, setActiveTab] = useState<'upcoming' | 'past'>('upcoming')
  const [sharedId, setSharedId] = useState<string | null>(null)

  const upcoming = orders.filter((o) => o.isUpcoming)
  const past = orders.filter((o) => !o.isUpcoming)
  const displayed = activeTab === 'upcoming' ? upcoming : past
  const totalTickets = orders.reduce((sum, o) => sum + o.tickets.length, 0)
  const initials = userName.split(' ').filter(Boolean).map((w) => w[0]).slice(0, 2).join('').toUpperCase()

  const handleShare = async (orderId: string, eventName: string) => {
    const url = `${window.location.origin}/meus-ingressos`
    try {
      if (navigator.share) {
        await navigator.share({ title: `Meus ingressos — ${eventName}`, url })
      } else {
        await navigator.clipboard.writeText(url)
      }
    } catch { /* user cancelled */ }
    setSharedId(orderId)
    setTimeout(() => setSharedId(null), 2000)
  }

  const NAV_ITEMS = [
    { type: 'tickets', label: 'Meus ingressos', active: true, badge: totalTickets || null },
    { type: 'orders', label: 'Compras', active: false, badge: null },
    { type: 'heart', label: 'Favoritos', active: false, badge: null },
    { type: 'user', label: 'Meus dados', active: false, badge: null },
    { type: 'bell', label: 'Notificações', active: false, badge: null },
  ]

  return (
    <div className="mi-page">

      {/* ── Sidebar ── */}
      <aside className="mi-sidebar">
        {/* User card */}
        <div style={{ padding: '2px 8px 18px', borderBottom: '1px solid #f0ebe4', marginBottom: 10 }}>
          <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#c4ae9e', margin: '0 0 10px' }}>Olá</p>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 38, height: 38, borderRadius: '50%', background: 'linear-gradient(135deg, #e8622a, #f5a832)', color: 'white', display: 'grid', placeItems: 'center', fontSize: 13, fontWeight: 800, flexShrink: 0, letterSpacing: '0.02em' }}>
              {initials}
            </div>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#1a1512', lineHeight: 1.3, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {userName}
              </div>
              <div style={{ fontSize: 11, color: '#b8a898', lineHeight: 1.3, marginTop: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {userEmail}
              </div>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 1 }}>
          {NAV_ITEMS.map(({ type, label, active, badge }) => (
            <div key={label} className={`mi-nav-item${active ? ' mi-nav-item--active' : ''}`} style={{ opacity: active ? 1 : 0.75 }}>
              <NavIcon type={type} />
              <span style={{ flex: 1 }}>{label}</span>
              {badge != null && (
                <span style={{ background: active ? '#e8622a' : '#ede7df', color: active ? 'white' : '#9e9087', fontSize: 10, fontWeight: 700, borderRadius: 999, minWidth: 18, height: 18, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 5px' }}>
                  {badge}
                </span>
              )}
            </div>
          ))}
        </nav>

        {/* Logout */}
        <button
          onClick={() => signOut({ callbackUrl: '/' })}
          className="mi-nav-item"
          style={{ width: '100%', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit', color: '#c0846a !important', marginTop: 4 }}
        >
          <NavIcon type="logout" />
          <span>Sair</span>
        </button>
      </aside>

      {/* ── Content ── */}
      <div className="mi-content">

        {/* Mobile header */}
        <div className="mi-mobile-header">
          <div>
            <p style={{ fontSize: 12, color: '#9e9087', margin: 0, lineHeight: 1 }}>Olá, {userName.split(' ')[0]}</p>
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 800, color: '#1a1512', margin: '3px 0 0', letterSpacing: '-0.02em', lineHeight: 1.1 }}>Meus ingressos</h1>
          </div>
          <button style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, color: '#6b5f56' }}>
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M10 2a5 5 0 015 5c0 2.5.6 3.7 1.8 5H3.2C4.4 10.7 5 9.5 5 7a5 5 0 015-5z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/><path d="M7.5 17a2.5 2.5 0 005 0" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
          </button>
        </div>

        {/* Desktop header */}
        <div className="mi-desktop-header">
          <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#c0846a', margin: '0 0 5px' }}>
            Sua área pessoal
          </p>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(22px, 2.5vw, 30px)', fontWeight: 800, letterSpacing: '-0.03em', color: '#1a1512', margin: '0 0 5px', lineHeight: 1.15 }}>
            Meus ingressos
          </h1>
          <p style={{ fontSize: 14, color: '#9e9087', margin: 0 }}>
            Aqui ficam todos os eventos que você participa.
          </p>
        </div>

        {/* Tabs */}
        <div className="mi-tabs">
          {([
            { key: 'upcoming', label: 'Próximos', count: upcoming.length },
            { key: 'past', label: 'Passados', count: past.length },
          ] as const).map(({ key, label, count }) => (
            <button
              key={key}
              className={`mi-tab${activeTab === key ? ' mi-tab--active' : ''}`}
              onClick={() => setActiveTab(key)}
            >
              {label}
              <span className={`mi-tab-badge${activeTab === key ? ' mi-tab-badge--active' : ''}`}>
                {count}
              </span>
            </button>
          ))}
        </div>

        {/* Cards */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {displayed.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '56px 20px', background: 'white', borderRadius: 20, border: '1px solid #ede7df' }}>
              <div style={{ fontSize: 40, marginBottom: 12 }}>🎟️</div>
              <p style={{ fontSize: 15, fontWeight: 700, color: '#1a1512', margin: '0 0 5px' }}>
                {activeTab === 'upcoming' ? 'Nenhum ingresso futuro' : 'Nenhum evento passado'}
              </p>
              <p style={{ fontSize: 13, color: '#9e9087', margin: '0 0 20px' }}>
                {activeTab === 'upcoming' ? 'Compre ingressos para o próximo evento!' : 'Seus eventos passados aparecem aqui.'}
              </p>
              {activeTab === 'upcoming' && (
                <Link href="/evento" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '10px 20px', borderRadius: 10, background: '#e8622a', color: 'white', fontSize: 14, fontWeight: 700, textDecoration: 'none' }}>
                  Ver eventos
                </Link>
              )}
            </div>
          ) : (
            displayed.map((order) => (
              <EventCard
                key={order.id}
                order={order}
                onShare={() => handleShare(order.id, order.eventName)}
                shared={sharedId === order.id}
              />
            ))
          )}
        </div>

        {/* Explore CTA */}
        <div className="mi-explore-cta">
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{ width: 42, height: 42, borderRadius: 12, background: '#f0ebe4', display: 'grid', placeItems: 'center', flexShrink: 0 }}>
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><circle cx="8" cy="8" r="5.5" stroke="#9e9087" strokeWidth="1.5"/><path d="M12.5 12.5L16 16" stroke="#9e9087" strokeWidth="1.5" strokeLinecap="round"/></svg>
            </div>
            <div>
              <p style={{ fontSize: 14, fontWeight: 700, color: '#1a1512', margin: 0, lineHeight: 1.3 }}>Procurando outros eventos?</p>
              <p style={{ fontSize: 13, color: '#9e9087', margin: 0 }}>Veja o que está acontecendo perto de você.</p>
            </div>
          </div>
          <Link
            href="/evento"
            style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '9px 18px', borderRadius: 10, border: '1.5px solid #e8e2da', background: 'white', color: '#1a1512', fontSize: 13, fontWeight: 700, textDecoration: 'none', whiteSpace: 'nowrap', flexShrink: 0 }}
          >
            Explorar eventos →
          </Link>
        </div>
      </div>

      {/* ── Mobile bottom nav ── */}
      <nav className="mi-mobile-nav">
        {([
          { icon: '◎', label: 'Explorar', href: '/evento', active: false },
          { icon: '🎟', label: 'Ingressos', href: '/meus-ingressos', active: true },
          { icon: '♡', label: 'Favoritos', href: '#', active: false },
          { icon: '◌', label: 'Perfil', href: '#', active: false },
        ] as const).map(({ icon, label, href, active }) => (
          <Link
            key={label}
            href={href}
            style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 2, textDecoration: 'none', color: active ? '#e8622a' : '#9e9087', fontSize: 10, fontWeight: active ? 700 : 500, padding: '4px 0', transition: 'color 120ms' }}
          >
            <span style={{ fontSize: active ? 22 : 20 }}>{icon}</span>
            {label}
          </Link>
        ))}
      </nav>
    </div>
  )
}
