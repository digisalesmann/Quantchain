'use client'
import React from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { MoreHorizontal, LogOut } from 'lucide-react'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '../ui/DropdownMenu'
import GlassIcon from '../ui/GlassIcon'
import { PRIMARY_NAV, SECONDARY_NAV } from './navItems'
import { useSession } from '../../lib/useSession'
import { cn } from '../../lib/utils'

function isActive(pathname: string, href: string) {
  return href === '/' ? pathname === '/' : pathname.startsWith(href)
}

export default function MobileTabBar() {
  const pathname = usePathname()
  const router = useRouter()
  const { mutate } = useSession()

  async function handleLogout() {
    await fetch('/api/auth/logout', { method: 'POST' })
    await mutate()
    router.push('/')
  }

  return (
    <nav className="fixed inset-x-0 bottom-0 z-30 flex border-t border-border bg-background/95 backdrop-blur-md md:hidden">
      {PRIMARY_NAV.map((item) => {
        const active = isActive(pathname, item.href)
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              'flex min-w-0 flex-1 flex-col items-center gap-1 py-2.5 text-2xs font-medium',
              active ? 'text-primary' : 'text-muted-foreground'
            )}
          >
            <GlassIcon icon={item.icon} size={17} />
            <span className="w-full truncate text-center">{item.shortLabel}</span>
          </Link>
        )
      })}

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button className="flex min-w-0 flex-1 flex-col items-center gap-1 py-2.5 text-2xs font-medium text-muted-foreground">
            <GlassIcon icon={MoreHorizontal} size={17} />
            <span className="w-full truncate text-center">More</span>
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" side="top" className="mb-2">
          {SECONDARY_NAV.map((item) => (
            <DropdownMenuItem key={item.href} asChild>
              <Link href={item.href}>
                <GlassIcon icon={item.icon} size={13} /> {item.label}
              </Link>
            </DropdownMenuItem>
          ))}
          <DropdownMenuSeparator />
          <DropdownMenuItem onSelect={handleLogout} className="text-destructive">
            <GlassIcon icon={LogOut} size={13} /> Sign out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </nav>
  )
}
