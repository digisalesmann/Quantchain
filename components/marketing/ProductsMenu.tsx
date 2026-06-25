'use client'
import React from 'react'
import Link from 'next/link'
import { ChevronDown, CandlestickChart, Wallet, LineChart, ShieldCheck } from 'lucide-react'
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from '../ui/DropdownMenu'
import GlassIcon from '../ui/GlassIcon'

const ITEMS = [
  {
    href: '/trade',
    icon: CandlestickChart,
    title: 'Spot trading',
    description: 'Buy and sell crypto instantly with live order books and depth.'
  },
  {
    href: '/wallets',
    icon: Wallet,
    title: 'Multi-chain wallets',
    description: 'Self-custody wallets for Bitcoin, Ethereum, and Solana.'
  },
  {
    href: '/markets',
    icon: LineChart,
    title: 'Markets & charts',
    description: 'Real-time prices and professional-grade candlestick charts.'
  },
  {
    href: '/security',
    icon: ShieldCheck,
    title: 'Security center',
    description: 'Two-factor authentication, passkeys, and session controls.'
  }
]

export default function ProductsMenu() {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">
          Products
          <GlassIcon icon={ChevronDown} size={12} />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-[420px] p-2">
        <div className="grid grid-cols-2 gap-1">
          {ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex flex-col gap-2 rounded-md p-3 transition-colors hover:bg-accent"
            >
              <GlassIcon icon={item.icon} size={18} iconClassName="text-primary" />
              <div>
                <div className="text-sm font-medium">{item.title}</div>
                <div className="mt-0.5 text-xs leading-snug text-muted-foreground">{item.description}</div>
              </div>
            </Link>
          ))}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
