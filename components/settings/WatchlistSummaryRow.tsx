'use client'
import React from 'react'
import Link from 'next/link'
import { Star } from 'lucide-react'
import Button from '../ui/Button'
import GlassIcon from '../ui/GlassIcon'
import { useWatchlist } from '../../lib/useWatchlist'

export default function WatchlistSummaryRow() {
  const { symbols, hydrated } = useWatchlist()

  return (
    <div>
      <h2 className="text-lg font-semibold tracking-tight">Market Activity</h2>
      <div className="mt-4 flex items-center justify-between gap-4 border-t border-border py-5">
        <div className="flex min-w-0 items-start gap-3">
          <GlassIcon icon={Star} size={15} className="mt-0.5 shrink-0" />
          <div className="min-w-0">
            <div className="text-sm font-semibold">Watchlist</div>
            <p className="mt-0.5 text-sm text-muted-foreground">Markets you&rsquo;re tracking for price moves.</p>
            <p className="mt-1.5 text-xs text-muted-foreground">
              {!hydrated ? '—' : symbols.length > 0 ? `${symbols.length} market${symbols.length > 1 ? 's' : ''} watched` : 'No markets watched yet'}
            </p>
          </div>
        </div>
        <Button asChild variant="subtle" size="sm" className="shrink-0">
          <Link href="/markets">Manage</Link>
        </Button>
      </div>
    </div>
  )
}
