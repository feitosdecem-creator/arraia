import type { Metadata } from 'next'
import './globals.css'
import { SessionProvider } from 'next-auth/react'

export const metadata: Metadata = {
  title: 'Arraiá da Escola 2025',
  description: 'Compre seus ingressos para o maior arraiá da cidade!',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="pt-BR" className="h-full">
      <body className="min-h-full flex flex-col antialiased" style={{ fontFamily: 'var(--font-sans)' }}>
        <SessionProvider>{children}</SessionProvider>
      </body>
    </html>
  )
}
