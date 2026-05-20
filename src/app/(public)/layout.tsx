import { CartProvider } from '@/components/CartProvider'
import { Navbar } from '@/components/Navbar'

function Footer() {
  return (
    <footer
      style={{
        background: 'var(--fdc-ink)',
        color: 'var(--fdc-cream)',
        padding: '48px var(--container-pad)',
        marginTop: 'auto',
      }}
    >
      <div
        style={{
          maxWidth: 'var(--container-max)',
          margin: '0 auto',
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          gap: 32,
        }}
      >
        {/* Brand */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: 8,
                background: 'var(--fdc-tangerine)',
                display: 'grid',
                placeItems: 'center',
                fontWeight: 700,
                fontSize: 16,
                color: 'var(--fdc-cream)',
              }}
            >
              A
            </div>
            <span style={{ fontWeight: 600, fontSize: 15, color: 'var(--fdc-cream)' }}>
              ingressos.app
            </span>
          </div>
          <p
            style={{
              fontSize: 13,
              color: 'rgba(253,250,245,0.55)',
              maxWidth: 240,
              lineHeight: 1.5,
              margin: 0,
            }}
          >
            Arraiá nu Quintal 2 · Pátio da Escola
          </p>
        </div>

        {/* Links */}
        <div style={{ display: 'flex', gap: 40, flexWrap: 'wrap' }}>
          <div>
            <div
              style={{
                fontSize: 11,
                fontWeight: 600,
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                color: 'rgba(253,250,245,0.45)',
                marginBottom: 10,
              }}
            >
              Ingressos
            </div>
            {['Ver ingressos', 'Meus ingressos'].map((label) => (
              <div key={label} style={{ marginBottom: 6 }}>
                <a
                  href={label === 'Ver ingressos' ? '/evento' : '/meus-ingressos'}
                  style={{
                    fontSize: 14,
                    color: 'rgba(253,250,245,0.7)',
                    textDecoration: 'none',
                  }}
                >
                  {label}
                </a>
              </div>
            ))}
          </div>
          <div>
            <div
              style={{
                fontSize: 11,
                fontWeight: 600,
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                color: 'rgba(253,250,245,0.45)',
                marginBottom: 10,
              }}
            >
              Suporte
            </div>
            {['Ajuda', 'Política de privacidade'].map((label) => (
              <div key={label} style={{ marginBottom: 6 }}>
                <a
                  href="#"
                  style={{
                    fontSize: 14,
                    color: 'rgba(253,250,245,0.7)',
                    textDecoration: 'none',
                  }}
                >
                  {label}
                </a>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div
        style={{
          maxWidth: 'var(--container-max)',
          margin: '32px auto 0',
          paddingTop: 20,
          borderTop: '1px solid rgba(253,250,245,0.1)',
          fontSize: 12,
          color: 'rgba(253,250,245,0.4)',
          textAlign: 'center',
        }}
      >
        © 2026 Arraiá nu Quintal 2 · Todos os direitos reservados
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
