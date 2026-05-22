import { CartProvider } from '@/components/CartProvider'
import { Navbar } from '@/components/Navbar'
import Link from 'next/link'

function AnnouncementBanner() {
  return (
    <div style={{
      background: 'linear-gradient(90deg, #e65c00 0%, #f9d423 100%)',
      padding: '12px 20px',
      textAlign: 'center',
    }}>
      <p style={{
        margin: 0,
        fontSize: 14,
        fontWeight: 600,
        color: '#1a0a00',
        lineHeight: 1.5,
        maxWidth: 780,
        marginInline: 'auto',
      }}>
        📣 <strong>Mudança de data!</strong> Percebemos que no dia anteriormente divulgado teremos jogo do Brasil, e para que todos possam aproveitar cada momento da nossa festa com tranquilidade e alegria, transferimos o nosso Arraiá para o dia <strong>20/06/2026</strong>, a partir de <strong>18h30</strong>! 🎉🇧🇷
      </p>
    </div>
  )
}

function Footer() {
  return (
    <footer className="site-footer">
      {/* Top section */}
      <div className="site-footer-inner">

        {/* Brand column */}
        <div className="footer-brand">
          <Link href="/" style={{ display: 'inline-block', textDecoration: 'none', marginBottom: 16 }}>
            <img
              src="/logo-navbar.svg"
              alt="Arraiá nu Quintal 2"
              style={{ height: 34, width: 'auto', filter: 'brightness(0) invert(1)', opacity: 0.95 }}
            />
          </Link>
          <p style={{ fontSize: 13, color: 'rgba(253,248,240,0.5)', lineHeight: 1.65, margin: 0, maxWidth: 220 }}>
            O maior arraiá do Quintal!<br />
            Sábado, 20 de junho · 17h30
          </p>
          {/* Accent pill */}
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, marginTop: 18, padding: '5px 12px', borderRadius: 999, background: 'rgba(245,168,0,0.14)', border: '1px solid rgba(245,168,0,0.25)' }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#f5c84a', display: 'inline-block', flexShrink: 0 }} />
            <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#f5c84a' }}>
              Quintal Escola Feitos de Cem
            </span>
          </div>
        </div>

        {/* Nav columns */}
        <div className="footer-links">
          <div>
            <p className="footer-col-heading">Ingressos</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <Link href="/evento" className="footer-link">Ver ingressos</Link>
              <Link href="/meus-ingressos" className="footer-link">Meus ingressos</Link>
            </div>
          </div>
          <div>
            <p className="footer-col-heading">Conta</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <Link href="/entrar" className="footer-link">Entrar</Link>
              <Link href="/meus-ingressos" className="footer-link">Meus pedidos</Link>
            </div>
          </div>
          <div>
            <p className="footer-col-heading">Suporte</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <a href="#" className="footer-link">Ajuda</a>
              <a href="#" className="footer-link">Privacidade</a>
            </div>
          </div>
        </div>
      </div>

      {/* Divider */}
      <div style={{ maxWidth: 'var(--container-max)', margin: '0 auto', height: 1, background: 'rgba(253,248,240,0.08)', padding: '0 var(--container-pad)' }} />

      {/* Bottom bar */}
      <div className="site-footer-bottom">
        <span>© 2026 Arraiá nu Quintal 2. Todos os direitos reservados.</span>
        <span style={{ display: 'flex', alignItems: 'center', gap: 6, opacity: 0.45 }}>
          <span>Feito com</span>
          <span style={{ color: '#f5c84a' }}>♥</span>
          <span>pela Escola Feitos de Cem</span>
        </span>
      </div>
    </footer>
  )
}

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <CartProvider>
      <Navbar />
      <AnnouncementBanner />
      <main className="flex-1">{children}</main>
      <Footer />
    </CartProvider>
  )
}
