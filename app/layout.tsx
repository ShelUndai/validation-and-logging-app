import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { APP_VERSION } from '@/lib/version'

const inter = Inter({ subsets: ['latin'], variable: '--font-sans' })

export const metadata: Metadata = {
  title: 'MOZ Dash',
  description: 'CR Validation Automation Dashboard',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} font-sans antialiased`}>
        {children}
        <footer className="pointer-events-none fixed bottom-2 right-3 z-50 text-[11px] text-muted-foreground/60 select-none">
          {APP_VERSION}
        </footer>
      </body>
    </html>
  )
}
