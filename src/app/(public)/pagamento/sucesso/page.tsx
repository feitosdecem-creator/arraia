import Link from 'next/link'
import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { CartClearer } from '@/components/CartClearer'

export default async function PagamentoSucessoPage() {
  const session = await auth()
  if (!session?.user?.id) redirect('/')

  const firstName = session.user.name?.split(' ')[0] ?? 'você'

  return (
    <>
      <CartClearer />

      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes circlePop {
          0%   { opacity: 0; transform: scale(0.6); }
          65%  { transform: scale(1.1); }
          100% { opacity: 1; transform: scale(1); }
        }
        @keyframes checkDraw {
          from { stroke-dashoffset: 60; opacity: 0; }
          to   { stroke-dashoffset: 0;  opacity: 1; }
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50%       { opacity: 0.4; }
        }

        .s-icon  { animation: circlePop 0.55s cubic-bezier(0.34,1.56,0.64,1) 0.05s both; }
        .s-hero  { animation: fadeUp 0.5s ease 0.2s  both; }
        .s-rcpt  { animation: fadeUp 0.5s ease 0.35s both; }
        .s-tckt  { animation: fadeUp 0.5s ease 0.48s both; }
        .s-cta   { animation: fadeUp 0.5s ease 0.58s both; }

        .s-btn-primary {
          transition: background 150ms, transform 100ms, box-shadow 150ms;
        }
        .s-btn-primary:hover {
          background: #3d6824 !important;
          transform: translateY(-1px);
          box-shadow: 0 6px 20px rgba(62,104,36,0.28);
        }
        .s-btn-primary:active { transform: translateY(0); }

        .s-btn-ghost {
          transition: background 150ms, color 150ms;
        }
        .s-btn-ghost:hover {
          background: var(--fdc-cream-deep) !important;
          color: var(--fdc-ink) !important;
        }

        .s-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 14px 0;
          border-bottom: 1px solid rgba(56,48,48,0.07);
        }
        .s-row:last-child { border-bottom: none; }

        .s-dot-pulse { animation: pulse 2s ease-in-out infinite; }
      `}</style>

      <div style={{ background: 'var(--bg-page)', minHeight: '100vh', paddingBottom: 80 }}>
        <div style={{ maxWidth: 500, margin: '0 auto', padding: '52px 20px 0' }}>

          {/* ── ÍCONE DE SUCESSO ── */}
          <div className="s-icon" style={{ display: 'flex', justifyContent: 'center', marginBottom: 30 }}>
            <div style={{
              width: 76, height: 76,
              borderRadius: '50%',
              background: 'linear-gradient(145deg, #6FA84A 0%, #4E7E2F 100%)',
              display: 'grid', placeItems: 'center',
              boxShadow: '0 12px 36px rgba(78,126,47,0.28), 0 3px 10px rgba(78,126,47,0.16)',
            }}>
              <svg width="34" height="34" viewBox="0 0 36 36" fill="none">
                <path
                  d="M8 18.5l7.5 7.5 12.5-14"
                  stroke="white"
                  strokeWidth="3.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeDasharray="60"
                  style={{ animation: 'checkDraw 0.4s ease 0.52s both' }}
                />
              </svg>
            </div>
          </div>

          {/* ── HERO ── */}
          <div className="s-hero" style={{ textAlign: 'center', marginBottom: 36 }}>
            <h1 style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'clamp(38px, 9vw, 54px)',
              fontWeight: 800,
              letterSpacing: '-0.04em',
              lineHeight: 1.0,
              color: 'var(--fdc-ink-deep)',
              margin: '0 0 14px',
            }}>
              Tudo certo, {firstName}!
            </h1>
            <p style={{
              fontSize: 16,
              color: 'var(--fg-2)',
              lineHeight: 1.6,
              margin: '0 auto 10px',
              maxWidth: 340,
            }}>
              Seu pagamento foi confirmado e seus ingressos já estão prontos.
            </p>
            <p style={{ fontSize: 13, color: 'var(--fg-3)', margin: 0 }}>
              Enviamos uma cópia para{' '}
              <span style={{ color: 'var(--fg-2)', fontWeight: 500 }}>{session.user.email}</span>
            </p>
          </div>

          {/* ── RECEIPT CARD ── */}
          <div className="s-rcpt" style={{
            background: 'var(--bg-surface)',
            borderRadius: 18,
            border: '1px solid rgba(56,48,48,0.08)',
            boxShadow: '0 2px 20px rgba(56,48,48,0.05)',
            overflow: 'hidden',
            marginBottom: 14,
          }}>
            {/* Header do card */}
            <div style={{
              padding: '16px 22px',
              borderBottom: '1px solid rgba(56,48,48,0.07)',
              display: 'flex', alignItems: 'center', gap: 12,
            }}>
              <div style={{
                width: 34, height: 34, borderRadius: 9,
                background: 'rgba(111,168,74,0.1)',
                border: '1px solid rgba(111,168,74,0.18)',
                display: 'grid', placeItems: 'center', flexShrink: 0,
              }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#4E7E2F" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--fdc-ink)' }}>Compra confirmada</div>
                <div style={{ fontSize: 12, color: 'var(--fg-3)', marginTop: 1 }}>Arraiá nu Quintal 2</div>
              </div>
              <span style={{
                fontSize: 11, fontWeight: 700, letterSpacing: '0.05em',
                textTransform: 'uppercase', color: '#4E7E2F',
                background: 'rgba(111,168,74,0.1)',
                border: '1px solid rgba(111,168,74,0.18)',
                padding: '4px 10px', borderRadius: 999, whiteSpace: 'nowrap',
              }}>
                Pago
              </span>
            </div>

            {/* Linhas do receipt */}
            <div style={{ padding: '2px 22px 4px' }}>
              <div className="s-row">
                <span style={{ fontSize: 13, color: 'var(--fg-3)' }}>Comprador</span>
                <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--fg-1)' }}>{session.user.name}</span>
              </div>
              <div className="s-row">
                <span style={{ fontSize: 13, color: 'var(--fg-3)' }}>Pagamento</span>
                <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--fg-1)', display: 'flex', alignItems: 'center', gap: 6 }}>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                    <rect x="2" y="7" width="20" height="14" rx="2" />
                    <path d="M16 3H8a2 2 0 00-2 2v2h12V5a2 2 0 00-2-2z" />
                  </svg>
                  PIX
                </span>
              </div>
              <div className="s-row">
                <span style={{ fontSize: 13, color: 'var(--fg-3)' }}>E-mail</span>
                <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--fg-2)', maxWidth: 200, textAlign: 'right', wordBreak: 'break-all' }}>
                  {session.user.email}
                </span>
              </div>
              <div className="s-row">
                <span style={{ fontSize: 13, color: 'var(--fg-3)' }}>Ingressos enviados</span>
                <span style={{ fontSize: 13, fontWeight: 600, color: '#4E7E2F', display: 'flex', alignItems: 'center', gap: 5 }}>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#4E7E2F" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  Enviado
                </span>
              </div>
            </div>
          </div>

          {/* ── MINI TICKET ── */}
          <div className="s-tckt" style={{
            borderRadius: 18,
            overflow: 'hidden',
            marginBottom: 28,
            boxShadow: '0 12px 40px rgba(26,20,16,0.32)',
            position: 'relative',
            backgroundImage: 'url(/Banner.png)',
            backgroundSize: 'cover',
            backgroundPosition: 'center top',
          }}>
            {/* Overlay escuro para legibilidade */}
            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(160deg, rgba(14,8,2,0.78) 0%, rgba(14,8,2,0.88) 100%)', pointerEvents: 'none' }} />

            {/* Topo do ticket */}
            <div style={{ padding: '22px 24px 16px', position: 'relative', zIndex: 1 }}>
              <div style={{
                fontSize: 9, fontWeight: 700, letterSpacing: '0.16em',
                textTransform: 'uppercase', color: 'var(--fdc-sun)',
                marginBottom: 7,
              }}>
                Feitos de Cem · Ingresso Digital
              </div>
              <div style={{
                fontFamily: 'var(--font-display)',
                fontSize: 21, fontWeight: 800,
                color: '#FDFAF5',
                letterSpacing: '-0.03em', lineHeight: 1.1,
                marginBottom: 6,
              }}>
                Arraiá nu Quintal 2
              </div>
              <div style={{ fontSize: 13, color: 'rgba(253,250,245,0.5)' }}>
                Sáb, 20 de junho · 17h30 · Quintal FDC
              </div>
            </div>

            {/* Linha de corte */}
            <div style={{ display: 'flex', alignItems: 'center', padding: '0', overflow: 'hidden', position: 'relative', zIndex: 1 }}>
              <div style={{ width: 18, height: 18, borderRadius: '50%', background: 'var(--bg-page)', flexShrink: 0, position: 'relative', zIndex: 2 }} />
              <div style={{ flex: 1, borderTop: '1.5px dashed rgba(253,250,245,0.22)', margin: '0 6px', position: 'relative', zIndex: 2 }} />
              <div style={{ width: 18, height: 18, borderRadius: '50%', background: 'var(--bg-page)', flexShrink: 0, position: 'relative', zIndex: 2 }} />
            </div>

            {/* Base do ticket */}
            <div style={{
              padding: '16px 24px 20px',
              display: 'flex', alignItems: 'center',
              justifyContent: 'space-between', gap: 12,
              position: 'relative', zIndex: 1,
            }}>
              <div>
                <div style={{
                  fontSize: 10, fontWeight: 700, letterSpacing: '0.1em',
                  textTransform: 'uppercase', color: 'rgba(253,250,245,0.4)',
                  marginBottom: 4,
                }}>
                  Portador
                </div>
                <div style={{ fontSize: 15, fontWeight: 700, color: '#FDFAF5' }}>
                  {session.user.name}
                </div>
              </div>
              <span style={{
                display: 'inline-flex', alignItems: 'center', gap: 6,
                fontSize: 11, fontWeight: 700, letterSpacing: '0.06em',
                textTransform: 'uppercase', color: '#6FA84A',
                background: 'rgba(111,168,74,0.14)',
                border: '1px solid rgba(111,168,74,0.22)',
                padding: '6px 13px', borderRadius: 999, flexShrink: 0,
              }}>
                <span className="s-dot-pulse" style={{ width: 6, height: 6, borderRadius: '50%', background: '#6FA84A', display: 'inline-block' }} />
                Confirmado
              </span>
            </div>
          </div>

          {/* ── CTAs ── */}
          <div className="s-cta" style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <Link
              href="/meus-ingressos"
              className="s-btn-primary"
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                padding: '15px 24px',
                borderRadius: 13,
                background: '#4E7E2F',
                color: '#FDFAF5',
                fontFamily: 'var(--font-sans)',
                fontWeight: 700, fontSize: 15,
                textDecoration: 'none',
              }}
            >
              Ver meus ingressos
            </Link>
            <Link
              href="/"
              className="s-btn-ghost"
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                padding: '13px 24px',
                borderRadius: 13,
                background: 'transparent',
                color: 'var(--fg-3)',
                fontFamily: 'var(--font-sans)',
                fontWeight: 500, fontSize: 14,
                textDecoration: 'none',
              }}
            >
              Voltar ao início
            </Link>
          </div>

          {/* ── Rodapé mínimo ── */}
          <p style={{ textAlign: 'center', fontSize: 12, color: 'var(--fg-3)', marginTop: 32, lineHeight: 1.7 }}>
            Dúvidas? Fale com a organização do evento.
            <br />
            <span style={{ fontWeight: 600, color: 'var(--fg-2)' }}>Feitos de Cem</span>
          </p>

        </div>
      </div>
    </>
  )
}
