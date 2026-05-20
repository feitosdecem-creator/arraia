import { Sidebar } from '@/components/admin/Sidebar'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="admin-shell"
      style={{
        display: 'flex',
        minHeight: '100vh',
        background: 'var(--fdc-cream-deep)',
      }}
    >
      <Sidebar />
      <main
        className="admin-main"
        style={{
          flex: 1,
          overflow: 'auto',
          padding: '28px 32px',
        }}
      >
        {children}
      </main>
    </div>
  )
}
