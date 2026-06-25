'use client'
import React from 'react'
import { Star } from 'lucide-react'
import { useWatchlist } from '../../lib/useWatchlist'
import GlassIcon from '../ui/GlassIcon'
import { cn } from '../../lib/utils'

export default function WatchlistStarButton({ symbol, className }: { symbol: string; className?: string }) {
  const { isWatched, toggle } = useWatchlist()
  const watched = isWatched(symbol)

  return (
    <button
      onClick={() => toggle(symbol)}
      aria-label={watched ? 'Remove from watchlist' : 'Add to watchlist'}
      className={cn('inline-flex h-9 w-9 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-accent hover:text-foreground', className)}
    >
      <GlassIcon icon={Star} size={15} iconClassName={watched ? 'fill-primary text-primary' : ''} />
    </button>
  )
}
