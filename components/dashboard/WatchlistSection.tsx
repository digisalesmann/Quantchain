'use client'
import React from 'react'
import Link from 'next/link'
import Button from '../ui/Button'
import { LivePrice, LiveChange } from '../market/Live'
import CoinIcon from '../market/CoinIcon'
import { useWatchlist } from '../../lib/useWatchlist'
import type { Market } from '../../lib/prices'

const ILLUSTRATION_COINS = [
  { baseAsset: 'BTC', logo: '/images/coins/btc.png', iconBg: '#F7931A', rotate: '-rotate-6', offset: 'left-0' },
  { baseAsset: 'ETH', logo: '/images/coins/eth.png', iconBg: '#FFFFFF', rotate: '', offset: 'left-8 z-10' },
  { baseAsset: 'SOL', logo: '/images/coins/sol.png', iconBg: '#FFFFFF', rotate: 'rotate-6', offset: 'left-16' }
]

function WatchlistIllustration() {
  return (
    <div className="relative h-14 w-[120px]">
      {ILLUSTRATION_COINS.map((c) => (
        <span
          key={c.baseAsset}
          className={`absolute top-0 flex h-12 w-12 items-center justify-center rounded-full ring-4 ring-background ${c.rotate} ${c.offset}`}
          style={{ backgroundColor: c.iconBg }}
        >
          <img src={c.logo} alt="" className="h-7 w-7 object-contain" />
        </span>
      ))}
    </div>
  )
}

export default function WatchlistSection({ markets }: { markets: Market[] }) {
  const { symbols, hydrated } = useWatchlist()
  const watched = markets.filter((m) => symbols.includes(m.symbol))

  if (!hydrated) return null

  if (watched.length === 0) {
    return (
      <div className="flex flex-col items-center rounded-xl border border-border px-6 py-10 text-center">
        <WatchlistIllustration />
        <h3 className="mt-4 text-base font-semibold">Build your watchlist</h3>
        <p className="mt-1.5 max-w-sm text-sm text-muted-foreground">
          Star your favorite assets from any market page to track their prices right here on Home.
        </p>
        <Button asChild className="mt-5 w-full max-w-xs">
          <Link href="/markets">Add to watchlist</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="divide-y divide-border border-y border-border">
      {watched.map((m) => (
        <Link
          key={m.symbol}
          href={`/markets/${m.symbol}`}
          className="flex items-center justify-between gap-4 py-4 transition-colors hover:bg-accent/50"
        >
          <span className="flex min-w-0 items-center gap-3">
            <CoinIcon logo={m.logo} baseAsset={m.baseAsset} iconBg={m.iconBg} size={36} className="shrink-0" />
            <span className="min-w-0">
              <span className="block truncate text-sm font-semibold">{m.name}</span>
              <span className="block text-xs text-muted-foreground">{m.baseAsset}</span>
            </span>
          </span>
          <span className="shrink-0 text-right">
            <LivePrice symbol={m.symbol} initialPrice={m.price} maximumFractionDigits={m.price < 10 ? 4 : 2} className="block text-sm font-semibold tabular" />
            <LiveChange symbol={m.symbol} initialChange={m.change24h} className="block text-xs" />
          </span>
        </Link>
      ))}
    </div>
  )
}
