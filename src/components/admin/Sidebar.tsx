'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { signOut } from 'next-auth/react'

const links = [
  { href: '/admin/dashboard', label: 'Dashboard', icon: '📊' },
  { href: '/admin/ingressos', label: 'Ingressos', icon: '🎫' },
  { href: '/admin/participantes', label: 'Participantes', icon: '👥' },
  { href: '/admin/validar', label: 'Validar QR', icon: '📷' },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="w-64 bg-amber-900 text-white min-h-screen flex flex-col">
      <div className="p-6 border-b border-amber-700">
        <h1 className="text-xl font-bold">🎪 Admin</h1>
        <p className="text-amber-300 text-xs mt-1">Arraiá da Escola 2025</p>
      </div>

      <nav className="flex-1 p-4 space-y-1">
        {links.map((link) => {
          const isActive = pathname === link.href || pathname.startsWith(link.href + '/')
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors font-medium text-sm ${
                isActive
                  ? 'bg-amber-600 text-white'
                  : 'text-amber-100 hover:bg-amber-800'
              }`}
            >
              <span>{link.icon}</span>
              {link.label}
            </Link>
          )
        })}
      </nav>

      <div className="p-4 border-t border-amber-700">
        <button
          onClick={() => signOut({ callbackUrl: '/' })}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-amber-200 hover:bg-amber-800 transition-colors text-sm cursor-pointer"
        >
          <span>🚪</span>
          Sair
        </button>
      </div>
    </aside>
  )
}
