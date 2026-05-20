import type { NextConfig } from 'next'

const securityHeaders = [
  // Prevent clickjacking
  { key: 'X-Frame-Options', value: 'DENY' },
  // Prevent MIME-type sniffing
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  // No referrer on cross-origin requests
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  // Disable unused browser features
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
  // Force HTTPS for 2 years (enable only after confirming HTTPS is stable)
  { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
  {
    key: 'Content-Security-Policy',
    value: [
      "default-src 'self'",
      // Next.js requires unsafe-inline/unsafe-eval for hydration scripts
      "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
      // Inline styles used throughout the app
      "style-src 'self' 'unsafe-inline'",
      // QR codes are data: URLs; images served from same origin
      "img-src 'self' data: blob:",
      // Custom fonts from /public/fonts
      "font-src 'self'",
      // API calls go to same origin only
      "connect-src 'self'",
      // Stronger than X-Frame-Options
      "frame-ancestors 'none'",
    ].join('; '),
  },
]

const nextConfig: NextConfig = {
  serverExternalPackages: ['@react-pdf/renderer'],
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: securityHeaders,
      },
    ]
  },
}

export default nextConfig
