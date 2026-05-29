import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { Sidebar } from '@/components/admin/Sidebar'
import './admin.css'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth()
  if (!session?.user?.isAdmin) redirect('/')
  return (
    <div
      className="admin-shell"
      style={{
        display: 'flex',
        minHeight: '100vh',
        background: 'var(--adm-bg)',
      }}
    >
      <Sidebar />
      <main
        className="admin-main"
        style={{
          flex: 1,
          overflow: 'auto',
          padding: '36px 40px',
        }}
      >
        {children}
      </main>
    </div>
  )
}
