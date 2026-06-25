'use client'
import React, { useState } from 'react'
import { toast } from 'sonner'
import { Check, Megaphone, Newspaper, ShieldAlert, SlidersHorizontal, User, type LucideIcon } from 'lucide-react'
import GlassIcon from '../ui/GlassIcon'
import Switch from '../ui/Switch'

export type NotificationPreferenceData = {
  accountActivity: boolean
  advancedTransaction: boolean
  securityAlerts: boolean
  news: boolean
  offers: boolean
}

const ROWS: { key: keyof NotificationPreferenceData; icon: LucideIcon; title: string; description: string }[] = [
  { key: 'accountActivity', icon: User, title: 'Account Activity', description: 'Account activity such as buys, sells, transfers, and rewards.' },
  { key: 'advancedTransaction', icon: SlidersHorizontal, title: 'Advanced Transaction', description: 'Updates on orders placed from the advanced trading terminal.' },
  { key: 'securityAlerts', icon: ShieldAlert, title: 'Security Alerts', description: 'Important security alerts, like password resets.' }
]

const NEWS_ROWS: { key: keyof NotificationPreferenceData; icon: LucideIcon; title: string; description: string }[] = [
  { key: 'news', icon: Newspaper, title: 'News', description: 'Stay updated with the top crypto news stories.' },
  { key: 'offers', icon: Megaphone, title: 'Offers and Announcements', description: 'Get the latest updates and offers for new products and features.' }
]

export default function NotificationPreferences({ userId, initial }: { userId: string; initial: NotificationPreferenceData }) {
  const [prefs, setPrefs] = useState(initial)
  const [saving, setSaving] = useState<string | null>(null)

  async function toggle(key: keyof NotificationPreferenceData, value: boolean) {
    setPrefs((p) => ({ ...p, [key]: value }))
    setSaving(key)
    try {
      const res = await fetch('/api/settings/notifications', {
        method: 'PATCH',
        body: JSON.stringify({ userId, [key]: value })
      })
      if (!res.ok) {
        setPrefs((p) => ({ ...p, [key]: !value }))
        toast.error('Update failed')
      }
    } finally {
      setSaving(null)
    }
  }

  function PreferenceRow({ row }: { row: (typeof ROWS)[number] }) {
    const enabled = prefs[row.key]
    return (
      <div className="flex items-center justify-between gap-4 border-t border-border py-5 first:border-t-0">
        <div className="flex min-w-0 items-start gap-3">
          <GlassIcon icon={row.icon} size={15} className="mt-0.5 shrink-0" />
          <div className="min-w-0">
            <div className="text-sm font-semibold">{row.title}</div>
            <p className="mt-0.5 text-sm text-muted-foreground">{row.description}</p>
            <div className="mt-1.5 flex items-center gap-1.5 text-xs text-muted-foreground">
              {enabled ? (
                <>
                  <GlassIcon icon={Check} size={9} iconClassName="text-primary" />
                  <span>Enabled &middot; via in-app notifications</span>
                </>
              ) : (
                <span>Disabled</span>
              )}
            </div>
          </div>
        </div>
        <Switch checked={enabled} disabled={saving === row.key} onCheckedChange={(v) => toggle(row.key, v)} className="shrink-0" />
      </div>
    )
  }

  return (
    <div id="notifications">
      <h2 className="text-lg font-semibold tracking-tight">Account</h2>
      <div className="mt-2">
        {ROWS.map((row) => (
          <PreferenceRow key={row.key} row={row} />
        ))}
      </div>

      <h2 className="mt-10 text-lg font-semibold tracking-tight">News &amp; Offers</h2>
      <div className="mt-2">
        {NEWS_ROWS.map((row) => (
          <PreferenceRow key={row.key} row={row} />
        ))}
      </div>
    </div>
  )
}
