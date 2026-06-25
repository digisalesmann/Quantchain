'use client'
import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import GlassIcon from '../ui/GlassIcon'
import { ACCOUNT_NAV } from './accountNav'
import { cn } from '../../lib/utils'

export default function AccountSidebar() {
  const pathname = usePathname()

  return (
    <aside className="fixed bottom-0 left-0 top-[81px] z-20 hidden w-64 flex-col border-r border-border bg-background px-4 py-5 md:flex">
      <nav className="flex flex-col gap-1">
        {ACCOUNT_NAV.map((item) => {
          const active = pathname.startsWith(item.href)
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
      </nav>
    </aside>
  )
}
