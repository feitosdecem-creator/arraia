'use client'

import dynamic from 'next/dynamic'

const QrScanner = dynamic(
  () => import('@/components/QrScanner').then((m) => m.QrScanner),
  { ssr: false }
)

export default function ValidarPage() {
  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-2">Validar Ingresso</h1>
      <p className="text-gray-500 mb-8">Aponte a câmera para o QR Code do ingresso.</p>

      <div className="max-w-sm mx-auto">
        <QrScanner />
      </div>

      <p className="text-center text-xs text-gray-400 mt-8">
        Permita o acesso à câmera quando solicitado pelo navegador.
      </p>
    </div>
  )
}
