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

  if (!isAuthenticated) {
    if (
      pathname.startsWith('/meus-ingressos') ||
      pathname.startsWith('/pagamento') ||
      pathname.startsWith('/checkout')
    ) {
      const url = new URL('/entrar', req.url)
      url.searchParams.set('callbackUrl', pathname)
      return NextResponse.redirect(url)
    }
  }

  return NextResponse.next()
})

export const config = {
  matcher: [
    '/admin/:path*',
    '/meus-ingressos/:path*',
    '/pagamento/:path*',
    '/checkout',
  ],
}
