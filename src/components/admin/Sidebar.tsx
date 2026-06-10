'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { signOut } from 'next-auth/react'

function IconGrid() {
  return (
    <svg viewBox="0 0 18 18" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="2" width="5.5" height="5.5" rx="1.5"/>
      <rect x="10.5" y="2" width="5.5" height="5.5" rx="1.5"/>
      <rect x="2" y="10.5" width="5.5" height="5.5" rx="1.5"/>
      <rect x="10.5" y="10.5" width="5.5" height="5.5" rx="1.5"/>
    </svg>
  )
}

function IconTag() {
  return (
    <svg viewBox="0 0 18 18" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1.5 1.5h5.8l9.2 9.2a1.5 1.5 0 0 1 0 2.1l-3.7 3.7a1.5 1.5 0 0 1-2.1 0L1.5 7.3V1.5z"/>
      <circle cx="5.5" cy="5.5" r="1.2" fill="currentColor" stroke="none"/>
    </svg>
  )
}

function IconTicket() {
  return (
    <svg viewBox="0 0 18 18" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="1.5" y="4.5" width="15" height="9" rx="2"/>
      <path d="M7 4.5v9" strokeDasharray="1.8 1.8"/>
      <line x1="9.5" y1="8" x2="14" y2="8"/>
      <line x1="9.5" y1="10.5" x2="12.5" y2="10.5"/>
    </svg>
  )
}

function IconUsers() {
  return (
    <svg viewBox="0 0 18 18" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="6.5" cy="5.5" r="2.5"/>
      <path d="M1 15.5c0-3.04 2.46-5.5 5.5-5.5S12 12.46 12 15.5"/>
      <path d="M12.5 8a2.5 2.5 0 1 0 0-5"/>
      <path d="M17 15.5c0-2.68-1.56-4.97-3.75-6.03"/>
    </svg>
  )
}

function IconRaffle() {
  return (
    <svg viewBox="0 0 18 18" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="1.5" y="5" width="15" height="8" rx="2"/>
      <path d="M6.5 5V13"/>
      <path d="M3 9h2.5"/>
      <path d="M8.5 7.5h5"/>
      <path d="M8.5 10.5h3.5"/>
      <path d="M5.5 2.5L6.5 5M12.5 2.5L11.5 5"/>
    </svg>
  )
}

function IconScan() {
  return (
    <svg viewBox="0 0 18 18" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1.5 6V3a1.5 1.5 0 0 1 1.5-1.5h3"/>
      <path d="M16.5 6V3A1.5 1.5 0 0 0 15 1.5h-3"/>
      <path d="M1.5 12v3A1.5 1.5 0 0 0 3 16.5h3"/>
      <path d="M16.5 12v3A1.5 1.5 0 0 1 15 16.5h-3"/>
      <line x1="1.5" y1="9" x2="16.5" y2="9" strokeWidth="2"/>
    </svg>
  )
}

function IconCart() {
  return (
    <svg viewBox="0 0 18 18" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="6.5" cy="15.5" r="1"/>
      <circle cx="13" cy="15.5" r="1"/>
      <path d="M1.5 1.5h2l1.8 9.4a1.5 1.5 0 0 0 1.48 1.23h6.4a1.5 1.5 0 0 0 1.47-1.18L16 5H4.2"/>
    </svg>
  )
}

function IconChart() {
  return (
    <svg viewBox="0 0 18 18" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="1.5" y1="16" x2="16.5" y2="16"/>
      <rect x="3" y="10" width="3" height="6" rx="1"/>
      <rect x="7.5" y="6" width="3" height="10" rx="1"/>
      <rect x="12" y="2.5" width="3" height="13.5" rx="1"/>
    </svg>
  )
}

function IconSettings() {
  return (
    <svg viewBox="0 0 18 18" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="9" cy="9" r="2.5"/>
      <path d="M9 1.5v2M9 14.5v2M1.5 9h2M14.5 9h2M3.7 3.7l1.4 1.4M12.9 12.9l1.4 1.4M3.7 14.3l1.4-1.4M12.9 5.1l1.4-1.4"/>
    </svg>
  )
}

function IconLogout() {
  return (
    <svg viewBox="0 0 18 18" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M7 2H3a1 1 0 0 0-1 1v12a1 1 0 0 0 1 1h4"/>
      <path d="M12.5 12.5L16 9l-3.5-3.5"/>
      <line x1="16" y1="9" x2="7" y2="9"/>
    </svg>
  )
}

const links = [
  { href: '/admin/dashboard',     label: 'Visão geral',        Icon: IconGrid     },
  { href: '/admin/tipos',         label: 'Tipos de ingresso',  Icon: IconTag      },
  { href: '/admin/ingressos',     label: 'Ingressos emitidos', Icon: IconTicket   },
  { href: '/admin/participantes', label: 'Participantes',      Icon: IconUsers    },
  { href: '/admin/rifas',         label: 'Rifas',              Icon: IconRaffle   },
  { href: '/admin/compras',       label: 'Compras',            Icon: IconCart     },
  { href: '/admin/validar',       label: 'Validar entrada',    Icon: IconScan     },
  { href: '/admin/financeiro',    label: 'Financeiro',         Icon: IconChart    },
  { href: '/admin/configuracoes', label: 'Configurações',      Icon: IconSettings },
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
        {links.map(({ href, label, Icon }) => {
          const isActive = pathname === href || pathname.startsWith(href + '/')
          return (
            <Link
              key={href}
              href={href}
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
                if (!isActive)
                  (e.currentTarget as HTMLElement).style.background =
                    'var(--adm-sidebar-hover-bg)'
              }}
              onMouseLeave={(e) => {
                if (!isActive)
                  (e.currentTarget as HTMLElement).style.background = 'transparent'
              }}
            >
              <span
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  opacity: isActive ? 1 : 0.65,
                  flexShrink: 0,
                }}
              >
                <Icon />
              </span>
              <span className="adm-nav-label">{label}</span>
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
          <span
            style={{ display: 'flex', alignItems: 'center', opacity: 0.55, flexShrink: 0 }}
          >
            <IconLogout />
          </span>
          <span className="adm-nav-label">Sair</span>
        </button>
      </div>
    </aside>
  )
}
