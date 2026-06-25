'use client'
import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import GlassIcon from '../ui/GlassIcon'
import { ACCOUNT_NAV } from './accountNav'
import { cn } from '../../lib/utils'

export default function AccountMobileNav() {
  const pathname = usePathname()

  return (
    <nav className="sticky top-[81px] z-20 flex gap-1 overflow-x-auto border-b border-border bg-background px-4 py-2 md:hidden">
      {ACCOUNT_NAV.map((item) => {
        const active = pathname.startsWith(item.href)
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              'flex shrink-0 items-center gap-2 rounded-full px-3 py-1.5 text-sm font-medium transition-colors',
              active ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:bg-accent hover:text-foreground'
            )}
          >
            <GlassIcon icon={item.icon} size={14} />
            {item.label}
          </Link>
        )
      })}
    </nav>
  )
}
