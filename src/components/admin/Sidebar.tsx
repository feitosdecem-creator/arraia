'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { signOut } from 'next-auth/react'

const links = [
  { href: '/admin/dashboard',    label: 'Visão geral',        icon: '◈' },
  { href: '/admin/tipos',        label: 'Tipos de ingresso',  icon: '▧' },
  { href: '/admin/ingressos',    label: 'Ingressos emitidos', icon: '≡' },
  { href: '/admin/participantes',label: 'Participantes',      icon: '◯' },
  { href: '/admin/rifas',        label: 'Rifas',              icon: '⬡' },
  { href: '/admin/validar',      label: 'Validar entrada',    icon: '⊡' },
  { href: '/admin/financeiro',   label: 'Financeiro',         icon: '◇' },
  { href: '/admin/configuracoes',label: 'Configurações',      icon: '⊙' },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <aside
      className="admin-sidebar"
      style={{
        width: 'var(--adm-sidebar-width)',
        minHeight: '100%',
        display: 'flex',
        flexDirection: 'column',
        padding: '24px 14px',
        flexShrink: 0,
      }}
    >
      {/* Brand */}
      <div
        className="admin-sidebar-brand"
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          padding: '4px 8px',
          marginBottom: 28,
        }}
      >
        <div
          style={{
            width: 40,
            height: 40,
            borderRadius: 12,
            background: 'var(--fdc-tangerine)',
            color: 'var(--fdc-cream)',
            display: 'grid',
            placeItems: 'center',
            fontFamily: 'var(--font-serif)',
            fontWeight: 700,
            fontSize: 22,
            flexShrink: 0,
            letterSpacing: '-0.02em',
          }}
        >
          A
        </div>
        <div className="adm-brand-text">
          <div
            style={{
              fontFamily: 'var(--font-display)',
              fontWeight: 700,
              fontSize: 15,
              color: 'var(--adm-sidebar-text-active)',
              lineHeight: 1.2,
              letterSpacing: '-0.01em',
            }}
          >
            Arraiá
          </div>
          <div
            style={{
              fontSize: 11,
              color: 'var(--adm-sidebar-text)',
              lineHeight: 1.2,
              marginTop: 1,
            }}
          >
            nu Quintal 2
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav
        className="admin-sidebar-nav"
        style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 3 }}
      >
        {links.map((link) => {
          const isActive = pathname === link.href || pathname.startsWith(link.href + '/')
          return (
            <Link
              key={link.href}
              href={link.href}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                padding: '10px 14px',
                borderRadius: 12,
                color: isActive
                  ? 'var(--adm-sidebar-text-active)'
                  : 'var(--adm-sidebar-text)',
                background: isActive ? 'var(--adm-sidebar-active-bg)' : 'transparent',
                fontWeight: isActive ? 600 : 400,
                fontSize: 13,
                textDecoration: 'none',
                transition: 'background 180ms, color 180ms',
                letterSpacing: '0.01em',
              }}
              onMouseEnter={(e) => {
                if (!isActive) (e.currentTarget as HTMLElement).style.background = 'var(--adm-sidebar-hover-bg)'
              }}
              onMouseLeave={(e) => {
                if (!isActive) (e.currentTarget as HTMLElement).style.background = 'transparent'
              }}
            >
              <span
                style={{
                  fontSize: 15,
                  opacity: isActive ? 1 : 0.7,
                  fontFamily: 'system-ui',
                  lineHeight: 1,
                  flexShrink: 0,
                }}
              >
                {link.icon}
              </span>
              <span className="adm-nav-label">{link.label}</span>
            </Link>
          )
        })}
      </nav>

      {/* Logout */}
      <div
        className="admin-sidebar-logout"
        style={{ paddingTop: 16, borderTop: '1px solid var(--adm-sidebar-sep)' }}
      >
        <button
          onClick={() => signOut({ callbackUrl: '/' })}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            padding: '10px 14px',
            borderRadius: 12,
            background: 'none',
            border: 'none',
            color: 'rgba(253, 250, 245, 0.45)',
            fontWeight: 400,
            fontSize: 13,
            cursor: 'pointer',
            width: '100%',
            transition: 'color 180ms, background 180ms',
            fontFamily: 'inherit',
            letterSpacing: '0.01em',
          }}
          onMouseEnter={(e) => {
            const el = e.currentTarget as HTMLElement
            el.style.background = 'var(--adm-sidebar-hover-bg)'
            el.style.color = 'var(--adm-sidebar-text)'
          }}
          onMouseLeave={(e) => {
            const el = e.currentTarget as HTMLElement
            el.style.background = 'transparent'
            el.style.color = 'rgba(253, 250, 245, 0.45)'
          }}
        >
          <span style={{ fontSize: 15, opacity: 0.6, fontFamily: 'system-ui' }}>←</span>
          <span className="adm-nav-label">Sair</span>
        </button>
      </div>
    </aside>
  )
}
