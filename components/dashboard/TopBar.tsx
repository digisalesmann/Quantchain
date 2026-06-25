'use client'
import React, { useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Bell, HelpCircle, LogOut, Search, Settings, UserCircle } from 'lucide-react'
import ThemeToggle from '../ui/ThemeToggle'
import GlassIcon from '../ui/GlassIcon'
import { Avatar, AvatarFallback } from '../ui/Avatar'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '../ui/DropdownMenu'
import { useSession } from '../../lib/useSession'
import { titleForPath } from './navItems'

export default function TopBar() {
  const pathname = usePathname()
  const router = useRouter()
  const { user, mutate } = useSession()
  const [query, setQuery] = useState('')

  async function handleLogout() {
    await fetch('/api/auth/logout', { method: 'POST' })
    await mutate()
    router.push('/')
  }

  function submitSearch(e: React.FormEvent) {
    e.preventDefault()
    router.push(query.trim() ? `/markets?q=${encodeURIComponent(query.trim())}` : '/markets')
  }

  const initials = (user?.profile?.fullName || user?.email || '?').slice(0, 1).toUpperCase()

  return (
    <header className="sticky top-0 z-20 flex h-16 items-center gap-4 border-b border-border bg-background/80 px-6 backdrop-blur-md">
      <h1 className="text-xl font-semibold tracking-tight">{titleForPath(pathname)}</h1>

      <form onSubmit={submitSearch} className="ml-auto hidden max-w-xs flex-1 items-center sm:flex">
        <div className="relative w-full">
          <GlassIcon icon={Search} size={13} className="absolute left-1.5 top-1/2 -translate-y-1/2" iconClassName="text-muted-foreground" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search assets"
            className="h-9 w-full rounded-full border border-input bg-transparent pl-10 pr-3 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
        </div>
      </form>

      <div className="ml-auto flex items-center gap-1 sm:ml-0">
        <button
          aria-label="Notifications"
          onClick={() => toast.message('No new notifications')}
          className="inline-flex h-9 w-9 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
        >
          <GlassIcon icon={Bell} size={16} />
        </button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              aria-label="Help"
              className="hidden h-9 w-9 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-accent hover:text-foreground sm:inline-flex"
            >
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

        <ThemeToggle />

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
              <Link href="/account/profile"><GlassIcon icon={UserCircle} size={13} /> Account</Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/settings"><GlassIcon icon={Settings} size={13} /> Settings</Link>
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
