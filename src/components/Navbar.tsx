'use client'

import Link from 'next/link'
import { useCart } from './CartProvider'
import { signOut, useSession } from 'next-auth/react'
import { useState, useEffect, useCallback } from 'react'
import { usePathname } from 'next/navigation'

function IconCart() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
      <line x1="3" y1="6" x2="21" y2="6" />
      <path d="M16 10a4 4 0 01-8 0" />
    </svg>
  )
}

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
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
      <path d="M16 3H8a2 2 0 00-2 2v2h12V5a2 2 0 00-2-2z" />
      <circle cx="17" cy="14" r="1.5" fill="currentColor" stroke="none" />
    </svg>
  )
}

function IconBag() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
      <line x1="3" y1="6" x2="21" y2="6" />
      <path d="M16 10a4 4 0 01-8 0" />
    </svg>
  )
}

function IconUser() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
      <circle cx="12" cy="7" r="4" />
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
  badge,
  onClick,
}: {
  href: string
  icon: React.ReactNode
  label: string
  active?: boolean
  badge?: number
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
      {badge !== undefined && badge > 0 && (
        <span className="drawer-item-badge">{badge > 9 ? '9+' : badge}</span>
      )}
      <span className="drawer-nav-chevron"><IconChevron /></span>
    </Link>
  )
}

export function Navbar() {
  const { itemCount } = useCart()
  const { data: session } = useSession()
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [drawerClosing, setDrawerClosing] = useState(false)
  const pathname = usePathname()

  // Close instantly on route change
  useEffect(() => {
    setDrawerOpen(false)
    setDrawerClosing(false)
  }, [pathname])

  // Lock body scroll while drawer is open
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

  const initials = session?.user?.name
    ? session.user.name.split(' ').map((n: string) => n[0]).slice(0, 2).join('').toUpperCase()
    : '?'

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
        {/* ── DESKTOP bar (hidden on mobile) ── */}
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

          <nav className="navbar-nav" style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <Link href="/evento" className="navbar-nav-link" style={{ padding: '6px 12px', borderRadius: 8, fontSize: 14, fontWeight: 500, color: 'var(--fg-2)', textDecoration: 'none', transition: 'color 140ms' }}>
              Ingressos
            </Link>
            <Link href="/meus-ingressos" className="navbar-nav-link" style={{ padding: '6px 12px', borderRadius: 8, fontSize: 14, fontWeight: 500, color: 'var(--fg-2)', textDecoration: 'none', transition: 'color 140ms' }}>
              Meus Ingressos
            </Link>
            <Link href="/carrinho" className="navbar-nav-link" style={{ position: 'relative', padding: '6px 12px', borderRadius: 8, fontSize: 14, fontWeight: 500, color: 'var(--fg-2)', textDecoration: 'none' }}>
              Carrinho
              {itemCount > 0 && (
                <span style={{ position: 'absolute', top: 2, right: 2, background: 'var(--fdc-tangerine)', color: 'white', fontSize: 10, fontWeight: 700, borderRadius: 999, width: 18, height: 18, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {itemCount}
                </span>
              )}
            </Link>

            {session ? (
              <div className="navbar-auth" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span className="navbar-auth-label" style={{ fontSize: 13, color: 'var(--fg-2)' }}>
                  {session.user.name?.split(' ')[0]}
                </span>
                <button
                  onClick={() => signOut({ callbackUrl: '/' })}
                  style={{ padding: '6px 14px', borderRadius: 8, border: '1px solid var(--line-2)', background: 'transparent', fontSize: 13, fontWeight: 500, color: 'var(--fg-2)', cursor: 'pointer', minHeight: 36 }}
                >
                  Sair
                </button>
              </div>
            ) : (
              <div className="navbar-auth" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Link href="/entrar" style={{ padding: '6px 14px', borderRadius: 8, border: '1px solid var(--line-2)', fontSize: 13, fontWeight: 500, color: 'var(--fg-2)', textDecoration: 'none', minHeight: 36, display: 'inline-flex', alignItems: 'center' }}>
                  Entrar
                </Link>
                <Link href="/evento" className="navbar-cta" style={{ padding: '7px 16px', borderRadius: 8, background: 'var(--fdc-tangerine)', color: 'white', fontSize: 13, fontWeight: 600, textDecoration: 'none', minHeight: 36, display: 'inline-flex', alignItems: 'center' }}>
                  Comprar ingresso
                </Link>
              </div>
            )}
          </nav>
        </div>

        {/* ── MOBILE bar (hidden on desktop) ── */}
        <div className="navbar-mobile-bar">
          <Link href="/" style={{ display: 'flex', alignItems: 'center', textDecoration: 'none' }}>
            <img src="/logo-navbar.svg" alt="Arraiá nu Quintal 2" style={{ height: 30, width: 'auto', display: 'block' }} />
          </Link>

          <div style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Link href="/carrinho" className="mobile-icon-btn" aria-label="Carrinho" style={{ textDecoration: 'none', color: 'var(--fg-1)' }}>
              <IconCart />
              {itemCount > 0 && (
                <span className="mobile-cart-badge">{itemCount > 9 ? '9+' : itemCount}</span>
              )}
            </Link>
            <button onClick={openDrawer} className="mobile-icon-btn" aria-label="Abrir menu" aria-expanded={drawerOpen}>
              <IconMenu />
            </button>
          </div>
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
              />
              <DrawerNavItem
                href="/meus-ingressos"
                icon={<IconWallet />}
                label="Meus ingressos"
                active={pathname.startsWith('/meus-ingressos')}
              />
              <DrawerNavItem
                href="/carrinho"
                icon={<IconBag />}
                label="Carrinho"
                active={pathname === '/carrinho'}
                badge={itemCount}
              />
            </div>

            <div className="drawer-divider" />

            {/* Auth footer */}
            <div className="drawer-footer">
              {session ? (
                <>
                  <DrawerNavItem
                    href="/meus-ingressos"
                    icon={<IconUser />}
                    label="Minha conta"
                    active={false}
                  />
                  <button
                    className="drawer-signout-btn"
                    onClick={() => { closeDrawer(); signOut({ callbackUrl: '/' }) }}
                  >
                    <span className="drawer-nav-icon" style={{ color: '#b91c1c' }}><IconLogout /></span>
                    <span>Sair da conta</span>
                  </button>
                </>
              ) : (
                <>
                  <DrawerNavItem
                    href="/entrar"
                    icon={<IconUser />}
                    label="Entrar na conta"
                    active={pathname === '/entrar'}
                  />
                  <Link href="/evento" className="drawer-cta-btn" onClick={closeDrawer}>
                    Comprar ingresso →
                  </Link>
                </>
              )}
            </div>
          </nav>
        </div>
      )}
    </>
  )
}
