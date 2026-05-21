'use client'

import Link from 'next/link'
import { signOut, useSession } from 'next-auth/react'
import { useState, useEffect, useCallback } from 'react'
import { usePathname } from 'next/navigation'

function IconMenu() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <line x1="3" y1="7" x2="21" y2="7" />
      <line x1="3" y1="12" x2="21" y2="12" />
      <line x1="3" y1="17" x2="21" y2="17" />
    </svg>
  )
}

function IconX() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  )
}

function IconTicket() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
    </svg>
  )
}

function IconWallet() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
      <path d="M16 3H8a2 2 0 00-2 2v2h12V5a2 2 0 00-2-2z" />
      <circle cx="17" cy="14" r="1.5" fill="currentColor" stroke="none" />
    </svg>
  )
}

function IconLogout() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" />
      <polyline points="16 17 21 12 16 7" />
      <line x1="21" y1="12" x2="9" y2="12" />
    </svg>
  )
}

function IconChevron() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="9 18 15 12 9 6" />
    </svg>
  )
}

function DrawerNavItem({
  href,
  icon,
  label,
  active,
  onClick,
}: {
  href: string
  icon: React.ReactNode
  label: string
  active?: boolean
  onClick?: () => void
}) {
  return (
    <Link
      href={href}
      className={`drawer-nav-item${active ? ' drawer-nav-item-active' : ''}`}
      onClick={onClick}
    >
      <span className="drawer-nav-icon">{icon}</span>
      <span className="drawer-nav-label">{label}</span>
      <span className="drawer-nav-chevron"><IconChevron /></span>
    </Link>
  )
}

export function Navbar() {
  const { data: session, status } = useSession()
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [drawerClosing, setDrawerClosing] = useState(false)
  const pathname = usePathname()

  useEffect(() => {
    setDrawerOpen(false)
    setDrawerClosing(false)
  }, [pathname])

  useEffect(() => {
    document.body.style.overflow = drawerOpen && !drawerClosing ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [drawerOpen, drawerClosing])

  const closeDrawer = useCallback(() => {
    setDrawerClosing(true)
    setTimeout(() => {
      setDrawerOpen(false)
      setDrawerClosing(false)
    }, 280)
  }, [])

  const openDrawer = () => {
    setDrawerOpen(true)
    setDrawerClosing(false)
  }

  const handleSignOut = useCallback(() => {
    signOut({ redirect: false }).then(() => {
      window.location.href = 'https://arraia.feitosdecem.com.br'
    })
  }, [])

  const initials = session?.user?.name
    ? session.user.name.split(' ').map((n: string) => n[0]).slice(0, 2).join('').toUpperCase()
    : '?'

  const meusIngressosHref = session
    ? '/meus-ingressos'
    : '/entrar?callbackUrl=/meus-ingressos'

  return (
    <>
      <header
        style={{
          background: 'var(--bg-surface)',
          borderBottom: '1px solid var(--line-2)',
          position: 'sticky',
          top: 0,
          zIndex: 50,
        }}
      >
        {/* ── DESKTOP bar ── */}
        <div
          className="navbar-inner navbar-desktop-bar"
          style={{
            maxWidth: 'var(--container-max)',
            margin: '0 auto',
            padding: '0 var(--container-pad)',
            height: 60,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 24,
          }}
        >
          <Link href="/" style={{ display: 'flex', alignItems: 'center', textDecoration: 'none', color: 'var(--fg-1)', flexShrink: 0 }}>
            <img src="/logo-navbar.svg" alt="Arraiá nu Quintal 2" style={{ height: 36, width: 'auto', display: 'block' }} />
          </Link>

          <nav className="navbar-nav" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Link href="/evento" className="navbar-nav-link" style={{ padding: '6px 12px', borderRadius: 8, fontSize: 14, fontWeight: 500, color: 'var(--fg-2)', textDecoration: 'none', transition: 'color 140ms' }}>
              Ingressos
            </Link>

            {status === 'loading' ? (
              <div style={{ width: 148, height: 36, borderRadius: 8, background: 'var(--fdc-cream-deep)' }} />
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                {session && (
                  <>
                    <span style={{ fontSize: 13, color: 'var(--fg-3)' }}>
                      {session.user.name?.split(' ')[0]}
                    </span>
                    <button
                      onClick={handleSignOut}
                      style={{ fontSize: 12, color: 'var(--fg-3)', background: 'none', border: 'none', cursor: 'pointer', padding: '2px 4px', fontFamily: 'inherit' }}
                    >
                      Sair
                    </button>
                    <div style={{ width: 1, height: 16, background: 'var(--line-2)', flexShrink: 0 }} />
                  </>
                )}
                <Link
                  href={meusIngressosHref}
                  style={{
                    display: 'inline-flex', alignItems: 'center', gap: 7,
                    padding: '7px 16px',
                    borderRadius: 8,
                    background: 'var(--fdc-tangerine)',
                    color: 'white',
                    fontSize: 13,
                    fontWeight: 600,
                    textDecoration: 'none',
                    minHeight: 36,
                    transition: 'opacity 140ms',
                  }}
                >
                  <IconWallet />
                  Meus ingressos
                </Link>
              </div>
            )}
          </nav>
        </div>

        {/* ── MOBILE bar ── */}
        <div className="navbar-mobile-bar">
          <Link href="/" style={{ display: 'flex', alignItems: 'center', textDecoration: 'none' }}>
            <img src="/logo-navbar.svg" alt="Arraiá nu Quintal 2" style={{ height: 30, width: 'auto', display: 'block' }} />
          </Link>
          <button onClick={openDrawer} className="mobile-icon-btn" aria-label="Abrir menu" aria-expanded={drawerOpen}>
            <IconMenu />
          </button>
        </div>
      </header>

      {/* ── DRAWER ── */}
      {drawerOpen && (
        <div
          className={`drawer-root${drawerClosing ? ' drawer-closing' : ''}`}
          role="dialog"
          aria-modal="true"
          aria-label="Menu de navegação"
        >
          <div className="drawer-backdrop" onClick={closeDrawer} />

          <nav className="drawer-panel">
            {/* Header */}
            <div className="drawer-header">
              <img src="/logo-navbar.svg" alt="Arraiá nu Quintal 2" style={{ height: 26, width: 'auto' }} />
              <button onClick={closeDrawer} className="drawer-close-btn" aria-label="Fechar menu">
                <IconX />
              </button>
            </div>

            {/* User / guest area */}
            {session ? (
              <div className="drawer-user-area">
                <div className="drawer-avatar">{initials}</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 700, fontSize: 15, color: 'var(--fg-1)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {session.user.name}
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--fg-3)', marginTop: 2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {session.user.email}
                  </div>
                </div>
              </div>
            ) : (
              <div className="drawer-guest-area">
                <p style={{ fontWeight: 700, fontSize: 15, color: 'var(--fg-1)', margin: '0 0 4px' }}>Bem-vindo!</p>
                <p style={{ fontSize: 13, color: 'var(--fg-3)', margin: 0 }}>Entre para acessar seus ingressos.</p>
              </div>
            )}

            <div className="drawer-divider" />

            {/* Main nav */}
            <div className="drawer-nav">
              <DrawerNavItem
                href="/evento"
                icon={<IconTicket />}
                label="Ingressos"
                active={pathname === '/evento'}
                onClick={closeDrawer}
              />
              <DrawerNavItem
                href={meusIngressosHref}
                icon={<IconWallet />}
                label="Meus ingressos"
                active={pathname.startsWith('/meus-ingressos')}
                onClick={closeDrawer}
              />
            </div>

            <div className="drawer-divider" />

            {/* Footer */}
            <div className="drawer-footer">
              {session ? (
                <button
                  className="drawer-signout-btn"
                  onClick={() => { closeDrawer(); handleSignOut() }}
                >
                  <span className="drawer-nav-icon" style={{ color: '#b91c1c' }}><IconLogout /></span>
                  <span>Sair da conta</span>
                </button>
              ) : (
                <Link
                  href="/entrar?callbackUrl=/meus-ingressos"
                  className="drawer-cta-btn"
                  onClick={closeDrawer}
                >
                  Meus ingressos →
                </Link>
              )}
            </div>
          </nav>
        </div>
      )}
    </>
  )
}
