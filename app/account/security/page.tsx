import React from 'react'
import Link from 'next/link'
import { Activity, ChevronRight, KeyRound, Link2, Lock, ShieldCheck, Smartphone, SquareAsterisk, type LucideIcon } from 'lucide-react'
import { requireSessionUserId } from '../../../lib/session'
import prisma from '../../../lib/prisma'
import GlassIcon from '../../../components/ui/GlassIcon'
import TwoFactorDialog from '../../../components/account/TwoFactorDialog'
import PasskeysDialog from '../../../components/account/PasskeysDialog'
import LockAccountDialog from '../../../components/account/LockAccountDialog'

export default async function AccountSecurityPage() {
  const userId = await requireSessionUserId()
  const [user, passkeys] = await Promise.all([
    prisma.user.findUnique({ where: { id: userId }, select: { totpEnabled: true, googleId: true } }),
    prisma.webAuthnKey.findMany({ where: { userId }, orderBy: { createdAt: 'desc' }, select: { id: true, createdAt: true, transports: true } })
  ])
  if (!user) return null

  return (
    <div className="py-10">
      <h1 className="text-2xl font-semibold tracking-tight">Security</h1>

      <div className="mt-8 divide-y divide-border border-y border-border">
        <Row href="/account/security/password" icon={SquareAsterisk} label="Password" />
        <TwoFactorDialog userId={userId} initialEnabled={user.totpEnabled} trigger={<Row icon={ShieldCheck} label="2-step verification" />} />
        <PasskeysDialog
          userId={userId}
          initialPasskeys={passkeys.map((p) => ({ id: p.id, createdAt: p.createdAt.toISOString(), transports: p.transports }))}
          trigger={<Row icon={KeyRound} label="Passkeys" />}
        />
        <Row href="/account/activity?tab=log" icon={Activity} label="Account activity" />
        <Row href="/account/activity?tab=sessions" icon={KeyRound} label="Active sessions" />
        <Row href="/account/activity?tab=devices" icon={Smartphone} label="Signed in devices" />
        <Row icon={Link2} label="Connected accounts" value={user.googleId ? 'Google connected' : 'No accounts connected'} />
        <LockAccountDialog userId={userId} trigger={<Row icon={Lock} label="Lock account" destructive />} />
      </div>
    </div>
  )
}

function Row({
  href,
  icon,
  label,
  value,
  destructive
}: {
  href?: string
  icon: LucideIcon
  label: string
  value?: string
  destructive?: boolean
}) {
  const content = (
    <>
      <span className={`flex min-w-0 items-center gap-3 text-sm font-semibold ${destructive ? 'text-destructive' : ''}`}>
        <GlassIcon icon={icon} size={15} iconClassName={destructive ? 'text-destructive' : undefined} />
        {label}
      </span>
      <span className="flex shrink-0 items-center gap-2 text-sm text-muted-foreground">
        {value}
        <GlassIcon icon={ChevronRight} size={13} />
      </span>
    </>
  )

  if (href) {
    return (
      <Link href={href} className="flex items-center justify-between gap-3 py-4 transition-colors hover:bg-accent/50">
        {content}
      </Link>
    )
  }

  return <button className="flex w-full items-center justify-between gap-3 py-4 text-left transition-colors hover:bg-accent/50">{content}</button>
}
