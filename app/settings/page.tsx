import React from 'react'
import { requireSessionUserId } from '../../lib/session'
import prisma from '../../lib/prisma'
import AccountsCard from '../../components/settings/AccountsCard'
import SettingsMenu from '../../components/settings/SettingsMenu'
import WatchlistSummaryRow from '../../components/settings/WatchlistSummaryRow'
import NotificationPreferences from '../../components/settings/NotificationPreferences'
import Divider from '../../components/ui/Divider'

export default async function SettingsPage() {
  const userId = await requireSessionUserId()

  const [user, preference] = await Promise.all([
    prisma.user.findUnique({ where: { id: userId }, include: { profile: true } }),
    prisma.notificationPreference.upsert({ where: { userId }, create: { userId }, update: {} })
  ])

  if (!user) return null

  return (
    <div className="py-10">
      <h1 className="text-2xl font-semibold tracking-tight">Settings</h1>

      <div className="mt-8 grid grid-cols-1 gap-10 lg:grid-cols-3">
        <div className="lg:col-span-1">
          <AccountsCard email={user.email} fullName={user.profile?.fullName ?? null} />
          <SettingsMenu />
        </div>

        <div className="lg:col-span-2">
          <WatchlistSummaryRow />
          <Divider />
          <NotificationPreferences
            userId={userId}
            initial={{
              accountActivity: preference.accountActivity,
              advancedTransaction: preference.advancedTransaction,
              securityAlerts: preference.securityAlerts,
              news: preference.news,
              offers: preference.offers
            }}
          />
        </div>
      </div>
    </div>
  )
}
