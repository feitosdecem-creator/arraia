// Edge middleware (Next.js 16 uses proxy.ts instead of middleware.ts).
// First line of defense — redirects before any page or API handler runs.
//
// Protected routes:
//   /admin/*          → requires isAuthenticated + isAdmin; redirects to /entrar
//   /meus-ingressos/* → requires isAuthenticated; redirects to /entrar with callbackUrl
//
// /checkout e /pagamento NÃO são protegidos aqui de propósito:
//   - /checkout tem login embutido na própria página para usuários deslogados
//   - /pagamento/[orderId] é acessível por link (cuid não-adivinhável); a
//     própria página valida posse quando há sessão de outro usuário
//   Proteger essas rotas no edge derrubava compradores em in-app browsers
//   (Instagram/Facebook bloqueiam cookies) num loop /entrar → página em
//   branco → vendas perdidas.
//
// Second line of defense: AdminLayout (src/app/admin/layout.tsx) re-checks isAdmin.
// Third line of defense: each API route calls auth() and checks ownership individually.
import { auth } from '@/lib/auth'
import { NextResponse } from 'next/server'

export default auth((req) => {
  const { pathname } = req.nextUrl
  const isAuthenticated = !!req.auth
  const isAdmin = req.auth?.user?.isAdmin === true

  if (pathname.startsWith('/admin')) {
    if (!isAuthenticated) {
      const url = new URL('/entrar', req.url)
      url.searchParams.set('callbackUrl', pathname)
      return NextResponse.redirect(url)
    }
    if (!isAdmin) return NextResponse.redirect(new URL('/', req.url))
  }

  if (!isAuthenticated && pathname.startsWith('/meus-ingressos')) {
    const url = new URL('/entrar', req.url)
    url.searchParams.set('callbackUrl', pathname)
    return NextResponse.redirect(url)
  }

  return NextResponse.next()
})

export const config = {
  matcher: [
    '/admin/:path*',
    '/meus-ingressos/:path*',
  ],
}
