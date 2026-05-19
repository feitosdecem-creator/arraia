import { CartProvider } from '@/components/CartProvider'
import { Navbar } from '@/components/Navbar'

function Footer() {
  return (
    <footer className="bg-amber-900 text-amber-200 py-6 mt-auto">
      <div className="max-w-6xl mx-auto px-4 text-center text-sm">
        <p>🎪 Arraiá da Escola 2025 · Todos os direitos reservados</p>
        <p className="text-xs mt-1 opacity-60">Pátio da Escola · 21 de Junho de 2025</p>
      </div>
    </footer>
  )
}

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <CartProvider>
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
    </CartProvider>
  )
}
