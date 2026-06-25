import './globals.css'
import React from 'react'
import { Inter, JetBrains_Mono } from 'next/font/google'
import AppFrame from '../components/dashboard/AppFrame'
import ThemeProvider from '../components/ui/ThemeProvider'
import AppToaster from '../components/ui/AppToaster'
import MarketSocketProvider from '../components/MarketSocketProvider'
import SplashScreen from '../components/SplashScreen'
import { getSessionPayload } from '../lib/session'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter', display: 'swap' })
const mono = JetBrains_Mono({ subsets: ['latin'], variable: '--font-mono', display: 'swap' })

export const metadata = {
  title: 'Quantchain - Buy, sell, and manage crypto',
  description: 'A premium, multi-chain cryptocurrency exchange.',
}

const THEME_SCRIPT = `
(function () {
  try {
    var stored = localStorage.getItem('theme');
    var theme = stored || 'dark';
    if (theme === 'dark') document.documentElement.classList.add('dark');
  } catch (e) {}
})();
`

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const initialSession = await getSessionPayload()

  return (
    <html lang="en" className={`${inter.variable} ${mono.variable}`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_SCRIPT }} />
      </head>
      <body className="min-h-screen bg-background font-sans text-foreground">
        <ThemeProvider>
          <SplashScreen />
          <MarketSocketProvider />
          <AppFrame initialSession={initialSession}>{children}</AppFrame>
          <AppToaster />
        </ThemeProvider>
      </body>
    </html>
  )
}
