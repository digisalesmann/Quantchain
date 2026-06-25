import React from 'react'
import Link from 'next/link'
import { Bell, ChevronRight, Layers, ListChecks, SlidersHorizontal, SunMoon, type LucideIcon } from 'lucide-react'
import GlassIcon from '../ui/GlassIcon'
import ThemeToggle from '../ui/ThemeToggle'

function Row({
  icon,
  title,
  subtitle,
  href,
  right
}: {
  icon: LucideIcon
  title: string
  subtitle: string
  href?: string
  right?: React.ReactNode
}) {
  const content = (
    <>
      <span className="flex min-w-0 items-center gap-3">
        <GlassIcon icon={icon} size={16} />
        <span className="min-w-0">
          <span className="block text-sm font-semibold">{title}</span>
          <span className="block truncate text-xs text-muted-foreground">{subtitle}</span>
        </span>
      </span>
      {right ?? <GlassIcon icon={ChevronRight} size={13} className="shrink-0" />}
    </>
  )

  if (href) {
    return (
      <Link href={href} className="flex items-center justify-between gap-3 py-4 transition-colors hover:text-primary">
        {content}
      </Link>
    )
  }

  return <div className="flex items-center justify-between gap-3 py-4">{content}</div>
}

export default function SettingsMenu() {
  return (
    <div className="mt-6 divide-y divide-border border-y border-border">
      <Row icon={Bell} title="Notifications" subtitle="Push, in-app, email" href="#notifications" />
      <Row icon={Layers} title="API" subtitle="API keys for programmatic access" href="/settings/api" />
      <Row icon={SunMoon} title="Display" subtitle="Appearance" right={<ThemeToggle />} />
      <Row icon={ListChecks} title="Activity" subtitle="Your transaction history" href="/transactions" />
      <Row icon={SlidersHorizontal} title="Advanced trade" subtitle="Trade preferences" href="/trade/advanced" />
    </div>
  )
}
