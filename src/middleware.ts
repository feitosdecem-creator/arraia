import { auth } from '@/lib/auth'
import { NextResponse } from 'next/server'

export default auth((req) => {
  const { pathname } = req.nextUrl
  const session = req.auth

  // Protect admin routes (except /admin/login)
  if (pathname.startsWith('/admin') && pathname !== '/admin/login') {
    if (!session?.user?.isAdmin) {
      return NextResponse.redirect(new URL('/admin/login', req.url))
    }
  }

  // Protect checkout and payment routes
  if (pathname.startsWith('/checkout') || pathname.startsWith('/pagamento')) {
    if (!session?.user) {
      return NextResponse.redirect(new URL('/checkout', req.url))
    }
  }

  return NextResponse.next()
})

export const config = {
  matcher: ['/admin/:path*', '/checkout', '/pagamento/:path*'],
}
