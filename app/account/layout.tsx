import React from 'react'
import { requireSessionUserId } from '../../lib/session'
import AccountHeader from '../../components/account/AccountHeader'
import AccountSidebar from '../../components/account/AccountSidebar'
import AccountMobileNav from '../../components/account/AccountMobileNav'

export default async function AccountLayout({ children }: { children: React.ReactNode }) {
  await requireSessionUserId()

  return (
    <div className="min-h-screen">
      <AccountHeader />
      <AccountSidebar />
      <div className="pt-[81px] md:pl-64">
        <AccountMobileNav />
        <main className="max-w-7xl px-6 pb-16 sm:px-8">{children}</main>
      </div>
    </div>
  )
}
