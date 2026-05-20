'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { signOut } from 'next-auth/react'

const links = [
  { href: '/admin/dashboard', label: 'Visão geral', icon: '📊' },
  { href: '/admin/tipos', label: 'Tipos de ingresso', icon: '🎫' },
  { href: '/admin/ingressos', label: 'Ingressos emitidos', icon: '🎟️' },
  { href: '/admin/participantes', label: 'Participantes', icon: '👥' },
  { href: '/admin/validar', label: 'Validar entrada', icon: '📷' },
  { href: '/admin/financeiro', label: 'Financeiro', icon: '💰' },
  { href: '/admin/configuracoes', label: 'Configurações', icon: '⚙️' },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <aside
      className="admin-sidebar"
      style={{
        width: 220,
        background: 'var(--bg-surface)',
        borderRight: '1px solid var(--line-2)',
        minHeight: '100%',
        display: 'flex',
        flexDirection: 'column',
        padding: '24px 14px',
      }}
    >
      {/* Brand / event name */}
      <div
        className="admin-sidebar-brand"
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          padding: '0 8px',
          marginBottom: 28,
        }}
      >
        <div
          style={{
            width: 32,
            height: 32,
            borderRadius: 8,
            background: 'var(--fdc-tangerine)',
            color: 'var(--fdc-cream)',
            display: 'grid',
            placeItems: 'center',
            fontWeight: 700,
            fontSize: 16,
            flexShrink: 0,
          }}
        >
          A
        </div>
        <div>
          <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--fg-1)', lineHeight: 1.1 }}>
            Admin
          </div>
          <div style={{ fontSize: 11, color: 'var(--fg-3)' }}>Arraiá da Escola</div>
        </div>
      </div>

      {/* Nav links */}
      <nav className="admin-sidebar-nav" style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
        {links.map((link) => {
          const isActive =
            pathname === link.href || pathname.startsWith(link.href + '/')
          return (
            <Link
              key={link.href}
              href={link.href}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                padding: '10px 12px',
                borderRadius: 10,
                color: isActive ? 'var(--fg-1)' : 'var(--fg-2)',
                background: isActive ? 'var(--bg-sunken)' : 'transparent',
                fontWeight: isActive ? 600 : 500,
                fontSize: 14,
                textDecoration: 'none',
                transition: 'all var(--dur-fast)',
              }}
            >
              <span style={{ fontSize: 16 }}>{link.icon}</span>
              {link.label}
            </Link>
          )
        })}
      </nav>

      {/* Logout */}
      <div className="admin-sidebar-logout" style={{ paddingTop: 16, borderTop: '1px solid var(--line-2)' }}>
        <button
          onClick={() => signOut({ callbackUrl: '/' })}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            padding: '10px 12px',
            borderRadius: 10,
            background: 'none',
            border: 'none',
            color: 'var(--fg-2)',
            fontWeight: 500,
            fontSize: 14,
            cursor: 'pointer',
            width: '100%',
            transition: 'background var(--dur-fast)',
          }}
        >
          <span>🚪</span>
          Sair
        </button>
      </div>
    </aside>
  )
}
