import React from 'react'
import Link from 'next/link'
import { Activity, ShieldCheck, User } from 'lucide-react'
import GlassIcon from '../ui/GlassIcon'
import { Avatar, AvatarFallback } from '../ui/Avatar'

export default function AccountsCard({ email, fullName }: { email: string; fullName: string | null }) {
  const initials = (fullName || email).slice(0, 1).toUpperCase()

  return (
    <div className="rounded-2xl border border-border bg-muted/40 p-6">
      <Avatar className="h-12 w-12">
        <AvatarFallback className="text-base">{initials}</AvatarFallback>
      </Avatar>

      <h2 className="mt-4 text-base font-semibold tracking-tight">Accounts</h2>
      <p className="mt-2 text-sm text-muted-foreground">Manage your personal account settings.</p>

      <div className="mt-4 space-y-3 text-sm text-muted-foreground">
        <Link href="/account/profile" className="flex items-center gap-2.5 transition-colors hover:text-foreground">
          <GlassIcon icon={User} size={13} /> Name, email, account info
        </Link>
        <Link href="/account/security" className="flex items-center gap-2.5 transition-colors hover:text-foreground">
          <GlassIcon icon={ShieldCheck} size={13} /> Password and security
        </Link>
        <Link href="/transactions" className="flex items-center gap-2.5 transition-colors hover:text-foreground">
          <GlassIcon icon={Activity} size={13} /> Activity
        </Link>
      </div>
    </div>
  )
}
