'use client'

import { useEffect, useRef, useState } from 'react'

type ScanResult = {
  valid: boolean
  reason?: string
  usedAt?: string
  ticket?: {
    ticketType: { name: string }
    order: { user: { name: string } }
  }
}

export function QrScanner() {
  const scannerRef = useRef<{ clear: () => void } | null>(null)
  const [result, setResult] = useState<ScanResult | null>(null)
  const [scanning, setScanning] = useState(true)
  const [loading, setLoading] = useState(false)
  const divId = 'qr-reader'

  useEffect(() => {
    let html5QrCode: { start: Function; stop: Function; clear: Function } | null = null

    const startScanner = async () => {
      const { Html5Qrcode } = await import('html5-qrcode')
      html5QrCode = new Html5Qrcode(divId)
      scannerRef.current = html5QrCode as unknown as { clear: () => void }

      try {
        await (html5QrCode as unknown as { start: Function }).start(
          { facingMode: 'environment' },
          { fps: 10, qrbox: { width: 250, height: 250 } },
          async (decodedText: string) => {
            if (loading) return
            setLoading(true)
            try {
              await (html5QrCode as unknown as { stop: Function }).stop()
            } catch {
              // ignore
            }
            setScanning(false)

            try {
              const res = await fetch('/api/admin/validate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ code: decodedText }),
              })
              const data = await res.json()
              setResult(data)
            } catch {
              setResult({ valid: false, reason: 'error' })
            } finally {
              setLoading(false)
            }
          },
          undefined
        )
      } catch {
        console.error('Camera not available')
      }
    }

    startScanner()

    return () => {
      if (html5QrCode) {
        try {
          (html5QrCode as unknown as { stop: Function }).stop().catch(() => {})
          ;(html5QrCode as unknown as { clear: Function }).clear()
        } catch {
          // ignore
        }
      }
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const resetScanner = () => {
    setResult(null)
    setScanning(true)
    setLoading(false)
    // Reload to restart scanner
    window.location.reload()
  }

  return (
    <div className="relative w-full max-w-sm mx-auto">
      {scanning && (
        <div className="rounded-2xl overflow-hidden border-4 border-amber-400 shadow-xl">
          <div id={divId} className="w-full" />
        </div>
      )}

      {loading && (
        <div className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-2xl">
          <div className="text-white text-lg font-semibold">Validando...</div>
        </div>
      )}

      {result && (
        <div
          className={`rounded-2xl p-8 text-center shadow-xl border-4 ${
            result.valid
              ? 'bg-green-50 border-green-500'
              : 'bg-red-50 border-red-500'
          }`}
        >
          <div className="text-6xl mb-4">{result.valid ? '✅' : '❌'}</div>
          {result.valid ? (
            <>
              <h2 className="text-2xl font-bold text-green-700 mb-2">Ingresso Válido!</h2>
              {result.ticket && (
                <div className="text-green-800">
                  <p className="font-semibold">{result.ticket.order.user.name}</p>
                  <p className="text-sm">{result.ticket.ticketType.name}</p>
                </div>
              )}
            </>
          ) : (
            <>
              <h2 className="text-2xl font-bold text-red-700 mb-2">Ingresso Inválido</h2>
              <p className="text-red-600 text-sm">
                {result.reason === 'not_found' && 'Ingresso não encontrado'}
                {result.reason === 'already_used' &&
                  `Já utilizado em ${result.usedAt ? new Date(result.usedAt).toLocaleString('pt-BR') : 'data desconhecida'}`}
                {result.reason === 'error' && 'Erro ao validar'}
              </p>
            </>
          )}

          <button
            onClick={resetScanner}
            className="mt-6 bg-amber-500 hover:bg-amber-600 text-white px-6 py-3 rounded-xl font-semibold transition-colors cursor-pointer"
          >
            Escanear Próximo
          </button>
        </div>
      )}
    </div>
  )
}
