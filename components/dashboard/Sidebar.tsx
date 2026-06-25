'use client'
import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { MoreHorizontal } from 'lucide-react'
import Logo from '../Logo'
import Switch from '../ui/Switch'
import GlassIcon from '../ui/GlassIcon'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../ui/DropdownMenu'
import { PRIMARY_NAV, SECONDARY_NAV } from './navItems'
import { useAdvancedMode } from '../../lib/useAdvancedMode'
import { cn } from '../../lib/utils'

function isActive(pathname: string, href: string) {
  return href === '/' ? pathname === '/' : pathname.startsWith(href)
}

export default function Sidebar() {
  const pathname = usePathname()
  const { advanced, setAdvanced } = useAdvancedMode()

  return (
    <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col border-r border-border bg-background px-4 py-5 md:flex">
      <Link href="/" className="px-2">
        <Logo withWordmark={false} size={40} />
      </Link>

      <nav className="mt-8 flex flex-col gap-1">
        {PRIMARY_NAV.map((item) => {
          const active = isActive(pathname, item.href)
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors',
                active ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:bg-accent hover:text-foreground'
              )}
            >
              <GlassIcon icon={item.icon} size={16} />
              {item.label}
            </Link>
          )
        })}

        {advanced &&
          SECONDARY_NAV.map((item) => {
            const active = isActive(pathname, item.href)
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors',
                  active ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:bg-accent hover:text-foreground'
                )}
              >
                <GlassIcon icon={item.icon} size={16} />
                {item.label}
              </Link>
            )
          })}

        {!advanced && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground">
                <GlassIcon icon={MoreHorizontal} size={16} />
                See more
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" side="right">
              {SECONDARY_NAV.map((item) => (
                <DropdownMenuItem key={item.href} asChild>
                  <Link href={item.href}>
                    <GlassIcon icon={item.icon} size={13} /> {item.label}
                  </Link>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </nav>

      <div className="mt-auto flex items-center justify-between rounded-xl px-3 py-2.5">
        <span className="text-sm font-medium text-muted-foreground">Advanced</span>
        <Switch checked={advanced} onCheckedChange={setAdvanced} />
      </div>
    </aside>
  )
}
