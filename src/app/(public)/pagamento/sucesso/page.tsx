import Link from 'next/link'
import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'

export default async function PagamentoSucessoPage() {
  const session = await auth()
  if (!session?.user?.id) redirect('/')

  return (
    <div className="max-w-md mx-auto px-4 py-20 text-center">
      <div className="text-7xl mb-6">🎉</div>
      <h1 className="text-3xl font-extrabold text-green-700 mb-4">
        Pagamento Confirmado!
      </h1>
      <p className="text-gray-600 mb-2 text-lg">
        Seus ingressos foram enviados por e-mail!
      </p>
      <p className="text-gray-500 text-sm mb-8">
        Verifique sua caixa de entrada (e o spam, se necessário).
        Apresente o QR Code na entrada do evento.
      </p>

      <div className="bg-green-50 border border-green-200 rounded-2xl p-6 mb-8 text-left space-y-2">
        <p className="font-semibold text-green-800">✓ Pagamento processado</p>
        <p className="font-semibold text-green-800">✓ Ingressos gerados</p>
        <p className="font-semibold text-green-800">✓ E-mail enviado</p>
      </div>

      <div className="flex flex-col gap-3">
        <Link
          href="/meus-ingressos"
          className="bg-amber-500 hover:bg-amber-600 text-white font-bold px-8 py-3 rounded-xl transition-colors"
        >
          Ver Meus Ingressos
        </Link>
        <Link
          href="/"
          className="text-gray-500 hover:text-gray-700 text-sm transition-colors"
        >
          Voltar ao início
        </Link>
      </div>
    </div>
  )
}
