import Link from 'next/link'

export default function HomePage() {
  return (
    <div>
      {/* Hero */}
      <section className="relative bg-gradient-to-br from-amber-500 via-red-500 to-amber-600 text-white overflow-hidden">
        <div className="absolute inset-0 opacity-10 text-9xl flex flex-wrap gap-8 p-8 overflow-hidden select-none pointer-events-none">
          {Array.from({ length: 20 }).map((_, i) => (
            <span key={i}>🎪</span>
          ))}
        </div>
        <div className="relative max-w-4xl mx-auto px-4 py-20 text-center">
          <div className="text-6xl mb-4">🎪</div>
          <h1 className="text-5xl font-extrabold tracking-tight mb-4 drop-shadow-lg">
            Arraiá da Escola 2025
          </h1>
          <p className="text-xl text-amber-100 mb-2">
            21 de Junho de 2025 · Pátio da Escola
          </p>
          <p className="text-amber-200 mb-8 max-w-xl mx-auto">
            O maior arraiá da cidade! Forró, quadrilha, comidas típicas e muito mais.
            Uma noite inesquecível para toda a família.
          </p>
          <Link
            href="/evento"
            className="inline-block bg-white text-amber-700 font-bold px-8 py-4 rounded-2xl text-lg shadow-lg hover:bg-amber-50 transition-all hover:scale-105"
          >
            Comprar Ingressos
          </Link>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-5xl mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-center text-amber-900 mb-12">
          Como funciona?
        </h2>
        <div className="grid md:grid-cols-3 gap-8">
          <div className="text-center p-6 bg-amber-50 rounded-2xl border border-amber-100">
            <div className="text-5xl mb-4">🎫</div>
            <h3 className="text-xl font-bold text-amber-900 mb-2">1. Escolha seu ingresso</h3>
            <p className="text-gray-600 text-sm">
              Selecione entre as opções disponíveis: Inteira, Meia-Entrada ou Criança.
            </p>
          </div>
          <div className="text-center p-6 bg-red-50 rounded-2xl border border-red-100">
            <div className="text-5xl mb-4">💰</div>
            <h3 className="text-xl font-bold text-red-900 mb-2">2. Pague com PIX</h3>
            <p className="text-gray-600 text-sm">
              Pagamento rápido e seguro via PIX. Confirmação em segundos.
            </p>
          </div>
          <div className="text-center p-6 bg-green-50 rounded-2xl border border-green-100">
            <div className="text-5xl mb-4">📱</div>
            <h3 className="text-xl font-bold text-green-900 mb-2">3. Receba por e-mail</h3>
            <p className="text-gray-600 text-sm">
              Seus ingressos são enviados por e-mail com QR Code para entrada no evento.
            </p>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-amber-100 py-12">
        <div className="max-w-2xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-amber-900 mb-4">Garanta já o seu!</h2>
          <p className="text-amber-700 mb-6">
            Vagas limitadas. Não fique de fora dessa festa!
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/evento"
              className="bg-amber-600 hover:bg-amber-700 text-white font-bold px-8 py-3 rounded-xl transition-colors"
            >
              Ver Ingressos
            </Link>
            <Link
              href="/meus-ingressos"
              className="bg-white hover:bg-amber-50 text-amber-800 font-semibold px-8 py-3 rounded-xl border border-amber-300 transition-colors"
            >
              Já tenho ingresso
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
