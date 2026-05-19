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

  return (
    <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md mx-auto">
      <h2 className="text-2xl font-bold text-amber-900 text-center mb-2">Pague com PIX</h2>
      <p className="text-gray-500 text-center text-sm mb-6">
        Escaneie o QR Code ou copie o código
      </p>

      {pixQrCode && (
        <div className="flex justify-center mb-6">
          <div className="p-3 border-2 border-amber-300 rounded-xl">
            <Image
              src={`data:image/png;base64,${pixQrCode}`}
              alt="PIX QR Code"
              width={200}
              height={200}
              className="rounded"
            />
          </div>
        </div>
      )}

      <div className="bg-amber-50 rounded-xl p-4 mb-4">
        <p className="text-xs text-amber-700 font-semibold mb-2 uppercase tracking-wide">
          Copia e Cola
        </p>
        <p className="text-xs text-gray-700 break-all font-mono mb-3 select-all">{pixQrCodeText}</p>
        <button
          onClick={handleCopy}
          className={`w-full py-2 rounded-lg font-semibold text-sm transition-all ${
            copied
              ? 'bg-green-500 text-white'
              : 'bg-amber-500 hover:bg-amber-600 text-white cursor-pointer'
          }`}
        >
          {copied ? '✓ Copiado!' : 'Copiar Código PIX'}
        </button>
      </div>

      <div className="text-center">
        <p className="text-sm text-gray-500 mb-1">Expira em</p>
        <p
          className={`text-3xl font-bold tabular-nums ${
            timeLeft < 120 ? 'text-red-600' : 'text-amber-700'
          }`}
        >
          {timerStr}
        </p>
      </div>

      <div className="mt-4 flex items-center gap-2 text-xs text-gray-500 justify-center">
        <span className="inline-block w-2 h-2 bg-green-500 rounded-full animate-pulse" />
        Aguardando confirmação do pagamento...
      </div>
    </div>
  )
}
