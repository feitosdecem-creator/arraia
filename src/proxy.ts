import { auth } from '@/lib/auth'
import { NextResponse } from 'next/server'

export default auth((req) => {
  const { pathname } = req.nextUrl
  const session = req.auth

  if (pathname.startsWith('/admin') && pathname !== '/admin/login') {
    if (!session?.user?.isAdmin) {
      return NextResponse.redirect(new URL('/admin/login', req.url))
    }
  }

  if (pathname.startsWith('/pagamento')) {
    if (!session?.user) {
      return NextResponse.redirect(new URL('/checkout', req.url))
    }
  }

  return NextResponse.next()
})

export const config = {
  matcher: ['/admin/:path*', '/pagamento/:path*'],
}
