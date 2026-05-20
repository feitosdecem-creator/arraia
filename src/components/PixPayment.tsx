'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'

type PixPaymentProps = {
  orderId: string
  pixQrCode: string
  pixQrCodeText: string
  expiresAt: string
}

function Step({ n, text }: { n: string; text: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
      <span style={{ width: 22, height: 22, borderRadius: '50%', background: 'var(--fdc-cream-deep)', color: 'var(--fg-1)', fontSize: 12, fontWeight: 600, display: 'grid', placeItems: 'center', flexShrink: 0 }}>
        {n}
      </span>
      <span style={{ fontSize: 14, color: 'var(--fg-2)', lineHeight: 1.5 }}>{text}</span>
    </div>
  )
}

export function PixPayment({ orderId, pixQrCode, pixQrCodeText, expiresAt }: PixPaymentProps) {
  const router = useRouter()
  const [copied, setCopied] = useState(false)
  const [timeLeft, setTimeLeft] = useState(0)
  const [syncing, setSyncing] = useState(false)
  const [syncMsg, setSyncMsg] = useState('')
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    const expires = new Date(expiresAt).getTime()
    const tick = () => {
      const diff = Math.max(0, Math.floor((expires - Date.now()) / 1000))
      setTimeLeft(diff)
      if (diff <= 0 && intervalRef.current) clearInterval(intervalRef.current)
    }
    tick()
    intervalRef.current = setInterval(tick, 1000)
    return () => { if (intervalRef.current) clearInterval(intervalRef.current) }
  }, [expiresAt])

  useEffect(() => {
    pollRef.current = setInterval(async () => {
      try {
        const res = await fetch(`/api/orders/${orderId}/status`)
        const data = await res.json()
        if (data.status === 'PAID') router.push('/pagamento/sucesso')
      } catch { /* ignore */ }
    }, 4000)
    return () => { if (pollRef.current) clearInterval(pollRef.current) }
  }, [orderId, router])

  const handleSync = async () => {
    setSyncing(true)
    setSyncMsg('')
    try {
      const res = await fetch(`/api/orders/${orderId}/sync`, { method: 'POST' })
      const data = await res.json()
      if (data.status === 'PAID') {
        router.push('/pagamento/sucesso')
        return
      }
      setSyncMsg(
        data.mpStatus
          ? `Status no Mercado Pago: ${data.mpStatus}. Aguarde alguns instantes.`
          : 'Pagamento ainda não confirmado. Aguarde e tente novamente.'
      )
    } catch {
      setSyncMsg('Erro ao verificar. Tente novamente.')
    } finally {
      setSyncing(false)
    }
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(pixQrCodeText).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 3000)
    })
  }

  const minutes = Math.floor(timeLeft / 60)
  const seconds = timeLeft % 60
  const timerStr = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
  const isExpiringSoon = timeLeft < 120

  // Truncate code for display: first 28 chars + … + last 6
  const codePreview = pixQrCodeText.length > 36
    ? pixQrCodeText.slice(0, 28) + '…' + pixQrCodeText.slice(-6)
    : pixQrCodeText

  return (
    <div style={{ padding: '8px 0 40px' }}>
      {/* Pending badge */}
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 24 }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '6px 16px', borderRadius: 999, background: 'rgba(244,183,59,0.18)', color: 'var(--fdc-sun-deep)', fontSize: 13, fontWeight: 600 }}>
          <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--fdc-sun-deep)', display: 'inline-block', boxShadow: '0 0 0 4px rgba(244,183,59,0.22)' }} />
          Aguardando pagamento
        </div>
      </div>

      <div className="fdc-card pix-card" style={{ padding: 0, overflow: 'hidden', display: 'grid', gridTemplateColumns: '260px 1fr', alignItems: 'stretch' }}>

        {/* QR Code column */}
        <div className="pix-qr" style={{ padding: 28, borderRight: '1px solid var(--line-2)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 12, background: 'var(--bg-sunken)' }}>
          {pixQrCode ? (
            <div style={{ padding: 10, background: 'white', borderRadius: 12, border: '1px solid var(--line-2)', boxShadow: 'var(--shadow-sm)' }}>
              <Image src={`data:image/png;base64,${pixQrCode}`} alt="PIX QR Code" width={180} height={180} />
            </div>
          ) : (
            <div style={{ width: 200, height: 200, background: 'var(--bg-surface)', borderRadius: 12 }} />
          )}
          <p style={{ fontSize: 12, color: 'var(--fg-3)', textAlign: 'center', margin: 0 }}>
            Escaneie com o app do banco
          </p>
        </div>

        {/* Details column */}
        <div style={{ padding: '32px 28px', display: 'flex', flexDirection: 'column', gap: 20, minWidth: 0 }}>

          {/* Title + timer */}
          <div>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 26, fontWeight: 700, letterSpacing: '-0.02em', color: 'var(--fg-1)', margin: '0 0 6px' }}>
              Pague com PIX
            </h2>
            <p style={{ color: 'var(--fg-2)', fontSize: 14, margin: 0 }}>
              Expira em{' '}
              <strong style={{ color: isExpiringSoon ? 'var(--fdc-danger)' : 'var(--fg-1)', fontFamily: 'var(--font-mono)', fontSize: 16 }}>
                {timerStr}
              </strong>
            </p>
          </div>

          {/* PIX code copy section */}
          <div style={{ background: 'var(--bg-sunken)', borderRadius: 12, padding: 16, border: '1px solid var(--line-2)' }}>
            <p style={{ fontSize: 11, fontWeight: 700, color: 'var(--fg-3)', letterSpacing: '0.08em', textTransform: 'uppercase', margin: '0 0 8px' }}>
              PIX copia e cola
            </p>
            {/* Truncated code preview */}
            <p style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--fg-2)', margin: '0 0 12px', wordBreak: 'break-all', lineHeight: 1.5 }}>
              {codePreview}
            </p>
            {/* Copy button — full width, prominent */}
            <button
              onClick={handleCopy}
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, width: '100%', padding: '12px 20px', borderRadius: 10, border: `1.5px solid ${copied ? 'var(--fdc-leaf)' : 'var(--fdc-tangerine)'}`, background: copied ? 'rgba(111,168,74,0.1)' : 'rgba(236,82,18,0.06)', color: copied ? 'var(--fdc-leaf-deep)' : 'var(--fdc-tangerine-deep)', fontWeight: 700, fontSize: 14, cursor: 'pointer', transition: 'all 140ms', fontFamily: 'inherit' }}
            >
              {copied ? (
                <><span>✓</span> Código copiado!</>
              ) : (
                <><span style={{ fontSize: 16 }}>📋</span> Copiar código PIX</>
              )}
            </button>
          </div>

          {/* Steps */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <Step n="1" text="Abra o app do seu banco" />
            <Step n="2" text="Escolha PIX e escaneie o QR Code ao lado" />
            <Step n="3" text="Confirme — o ingresso chega por e-mail" />
          </div>

          {/* Auto-update note */}
          <div style={{ padding: '12px 14px', background: 'rgba(111,168,74,0.08)', borderRadius: 10, fontSize: 13, color: 'var(--fdc-leaf-deep)', display: 'flex', gap: 8, alignItems: 'center' }}>
            <span>🔒</span>
            <span>Esta página atualiza automaticamente após o pagamento.</span>
          </div>

          {/* Manual sync fallback */}
          <div style={{ borderTop: '1px solid var(--line-2)', paddingTop: 16, display: 'flex', flexDirection: 'column', gap: 8 }}>
            <p style={{ fontSize: 12, color: 'var(--fg-3)', margin: 0 }}>
              Já pagou mas a página não atualizou?
            </p>
            <button
              onClick={handleSync}
              disabled={syncing}
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '10px 16px', borderRadius: 10, border: '1.5px solid var(--line-1)', background: 'var(--bg-surface)', color: syncing ? 'var(--fg-3)' : 'var(--fg-1)', fontWeight: 600, fontSize: 13, cursor: syncing ? 'not-allowed' : 'pointer', transition: 'all 140ms', fontFamily: 'inherit' }}
            >
              {syncing
                ? <><span className="auth-spinner" style={{ borderTopColor: 'var(--fg-2)', borderColor: 'var(--line-2)' }} /> Verificando…</>
                : '🔄 Verificar pagamento'}
            </button>
            {syncMsg && (
              <p style={{ fontSize: 12, color: 'var(--fg-2)', margin: 0, textAlign: 'center' }}>
                {syncMsg}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
