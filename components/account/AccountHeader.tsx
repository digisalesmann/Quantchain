'use client'
import React from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { HelpCircle, LayoutGrid, LogOut } from 'lucide-react'
import GlassIcon from '../ui/GlassIcon'
import { Avatar, AvatarFallback } from '../ui/Avatar'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '../ui/DropdownMenu'
import { useSession } from '../../lib/useSession'

export default function AccountHeader() {
  const router = useRouter()
  const { user, mutate } = useSession()

  async function handleLogout() {
    await fetch('/api/auth/logout', { method: 'POST' })
    await mutate()
    router.push('/')
  }

  const initials = (user?.profile?.fullName || user?.email || '?').slice(0, 1).toUpperCase()

  return (
    <header className="fixed inset-x-0 top-0 z-30 flex h-[81px] items-center gap-3 border-b border-border bg-background px-6">
      <Link href="/account/profile" className="flex items-center gap-2.5">
        <Image src="/images/QuantChain.png" alt="Quantchain" width={28} height={28} priority />
        <span className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Account</span>
      </Link>

      <div className="ml-auto flex items-center gap-1">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button aria-label="Help" className="inline-flex h-9 w-9 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-accent hover:text-foreground">
              <GlassIcon icon={HelpCircle} size={16} />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuLabel>Help</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/legal/terms">Terms of Service</Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/legal/privacy">Privacy Policy</Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <a href="mailto:support@quantchain.exchange">Contact support</a>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <Link
          href="/"
          aria-label="Back to Quantchain"
          className="inline-flex h-9 w-9 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
        >
          <GlassIcon icon={LayoutGrid} size={16} />
        </Link>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="ml-1 flex items-center rounded-full p-1 transition-colors hover:bg-accent">
              <Avatar>
                <AvatarFallback>{initials}</AvatarFallback>
              </Avatar>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuLabel>{user?.email}</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/">Back to Quantchain</Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onSelect={handleLogout} className="text-destructive">
              <GlassIcon icon={LogOut} size={13} /> Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
