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
      <span
        style={{
          width: 22,
          height: 22,
          borderRadius: '50%',
          background: 'var(--fdc-cream-deep)',
          color: 'var(--fg-1)',
          fontSize: 12,
          fontWeight: 600,
          display: 'grid',
          placeItems: 'center',
          flexShrink: 0,
        }}
      >
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
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    const expires = new Date(expiresAt).getTime()
    const updateTimer = () => {
      const now = Date.now()
      const diff = Math.max(0, Math.floor((expires - now) / 1000))
      setTimeLeft(diff)
      if (diff <= 0 && intervalRef.current) clearInterval(intervalRef.current)
    }
    updateTimer()
    intervalRef.current = setInterval(updateTimer, 1000)
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [expiresAt])

  useEffect(() => {
    pollRef.current = setInterval(async () => {
      try {
        const res = await fetch(`/api/orders/${orderId}/status`)
        const data = await res.json()
        if (data.status === 'PAID') {
          router.push('/pagamento/sucesso')
        }
      } catch {
        // ignore polling errors
      }
    }, 3000)
    return () => {
      if (pollRef.current) clearInterval(pollRef.current)
    }
  }, [orderId, router])

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

  return (
    <div style={{ background: 'var(--bg-page)', minHeight: '60vh', padding: '8px 0 40px' }}>
      {/* Pending badge */}
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 20 }}>
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            padding: '6px 14px',
            borderRadius: 999,
            background: 'rgba(244,183,59,0.18)',
            color: 'var(--fdc-sun-deep)',
            fontSize: 13,
            fontWeight: 600,
          }}
        >
          <span
            style={{
              width: 8,
              height: 8,
              borderRadius: '50%',
              background: 'var(--fdc-sun-deep)',
              display: 'inline-block',
              boxShadow: '0 0 0 4px rgba(244,183,59,0.22)',
            }}
          />
          Aguardando pagamento
        </div>
      </div>

      <div
        className="fdc-card"
        style={{
          padding: 0,
          overflow: 'hidden',
          display: 'grid',
          gridTemplateColumns: '280px 1fr',
          gap: 0,
          alignItems: 'center',
        }}
      >
        {/* QR Code */}
        <div
          style={{
            padding: 32,
            borderRight: '1px solid var(--line-2)',
            display: 'flex',
            justifyContent: 'center',
          }}
        >
          {pixQrCode ? (
            <div
              style={{
                padding: 10,
                background: 'white',
                borderRadius: 12,
                border: '1px solid var(--line-2)',
              }}
            >
              <Image
                src={`data:image/png;base64,${pixQrCode}`}
                alt="PIX QR Code"
                width={200}
                height={200}
              />
            </div>
          ) : (
            <div
              style={{
                width: 220,
                height: 220,
                background: 'var(--bg-sunken)',
                borderRadius: 12,
              }}
            />
          )}
        </div>

        {/* Details */}
        <div style={{ padding: '32px 32px' }}>
          <h2
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: 28,
              fontWeight: 700,
              letterSpacing: '-0.02em',
              color: 'var(--fg-1)',
              margin: '0 0 6px',
            }}
          >
            Pague com PIX
          </h2>
          <p style={{ color: 'var(--fg-2)', fontSize: 15, margin: '0 0 20px' }}>
            Expira em{' '}
            <strong
              style={{ color: isExpiringSoon ? 'var(--fdc-danger)' : 'var(--fg-1)', fontFamily: 'var(--font-mono)' }}
            >
              {timerStr}
            </strong>
          </p>

          {/* Copy field */}
          <div style={{ marginBottom: 20 }}>
            <label
              style={{
                display: 'block',
                fontSize: 12,
                fontWeight: 600,
                color: 'var(--fg-2)',
                letterSpacing: '0.06em',
                textTransform: 'uppercase',
                marginBottom: 6,
              }}
            >
              PIX copia e cola
            </label>
            <div style={{ display: 'flex', gap: 8 }}>
              <code
                style={{
                  flex: 1,
                  padding: '11px 14px',
                  borderRadius: 10,
                  background: 'var(--bg-sunken)',
                  border: '1px solid var(--line-2)',
                  fontFamily: 'var(--font-mono)',
                  fontSize: 12,
                  color: 'var(--fg-2)',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  display: 'block',
                }}
              >
                {pixQrCodeText}
              </code>
              <button
                onClick={handleCopy}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  padding: '0 16px',
                  borderRadius: 10,
                  border: `1.5px solid ${copied ? 'var(--fdc-leaf)' : 'var(--line-1)'}`,
                  background: copied ? 'rgba(111,168,74,0.1)' : 'var(--bg-surface)',
                  color: copied ? 'var(--fdc-leaf-deep)' : 'var(--fg-1)',
                  fontWeight: 600,
                  fontSize: 13,
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  transition: 'all var(--dur-fast)',
                }}
              >
                {copied ? '✓ Copiado' : '📋 Copiar'}
              </button>
            </div>
          </div>

          {/* Steps */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <Step n="1" text="Abra o app do seu banco" />
            <Step n="2" text="Escolha pagar com PIX e aponte para o QR Code" />
            <Step n="3" text="Confirme — o ingresso chega por e-mail" />
          </div>

          {/* Shield note */}
          <div
            style={{
              marginTop: 20,
              padding: '12px 14px',
              background: 'rgba(111,168,74,0.1)',
              borderRadius: 10,
              fontSize: 13,
              color: 'var(--fdc-leaf-deep)',
              display: 'flex',
              gap: 8,
              alignItems: 'flex-start',
            }}
          >
            <span>🔒</span>
            <span>Quando o pagamento for confirmado, esta página atualiza sozinha.</span>
          </div>
        </div>
      </div>
    </div>
  )
}
