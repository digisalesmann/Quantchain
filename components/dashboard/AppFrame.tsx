'use client'
import React from 'react'
import { usePathname } from 'next/navigation'
import NavBar from '../NavBar'
import Sidebar from './Sidebar'
import MobileTabBar from './MobileTabBar'
import TopBar from './TopBar'
import DashboardFooter from './DashboardFooter'
import { useSession, type SessionResponse } from '../../lib/useSession'

export default function AppFrame({ children, initialSession }: { children: React.ReactNode; initialSession?: SessionResponse }) {
  // With initialSession supplied as SWR fallbackData, `user` is correct from the very
  // first render — don't gate on isLoading, which SWR keeps true until the underlying
  // fetch resolves even when fallbackData already gives us a value.
  const { user } = useSession(initialSession)
  const pathname = usePathname()

  // The /account area is a self-contained sub-app with its own header and sidebar
  // (mirrors how Coinbase's account management lives in a separate shell) — skip the
  // main dashboard chrome entirely and let app/account/layout.tsx supply all of it.
  if (pathname.startsWith('/account') || pathname.startsWith('/onboarding')) {
    return <>{children}</>
  }

  if (user) {
    return (
      <div className="min-h-screen">
        <Sidebar />
        <div className="md:pl-64">
          <TopBar />
          <main className="max-w-7xl px-4 pb-24 sm:px-6 md:pb-10">
            {children}
            <DashboardFooter />
          </main>
        </div>
        <MobileTabBar />
      </div>
    )
  }

  return (
    <>
      <NavBar />
      <main className="container">{children}</main>
    </>
  )
}
