'use client'
import React, { useRef } from 'react'
import Link from 'next/link'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import GlassIcon from '../ui/GlassIcon'
import CoinIcon from './CoinIcon'
import { LivePrice, LiveChange } from './Live'
import type { Market } from '../../lib/prices'

export default function RelatedMarketsCarousel({ markets }: { markets: Market[] }) {
  const scrollRef = useRef<HTMLDivElement>(null)

  if (markets.length === 0) return null

  function scroll(direction: 'left' | 'right') {
    scrollRef.current?.scrollBy({ left: direction === 'left' ? -240 : 240, behavior: 'smooth' })
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold tracking-tight">You may also like</h2>
        <div className="flex gap-1">
          <button
            onClick={() => scroll('left')}
            aria-label="Scroll left"
            className="inline-flex h-8 w-8 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
          >
            <GlassIcon icon={ChevronLeft} size={14} />
          </button>
          <button
            onClick={() => scroll('right')}
            aria-label="Scroll right"
            className="inline-flex h-8 w-8 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
          >
            <GlassIcon icon={ChevronRight} size={14} />
          </button>
        </div>
      </div>

      <div ref={scrollRef} className="mt-4 flex gap-3 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {markets.map((market) => (
          <Link
            key={market.symbol}
            href={`/markets/${market.symbol}`}
            className="flex shrink-0 flex-col gap-3 rounded-2xl border border-border p-4 transition-colors hover:bg-accent/50"
            style={{ width: 160 }}
          >
            <div className="flex items-center gap-2">
              <CoinIcon logo={market.logo} baseAsset={market.baseAsset} iconBg={market.iconBg} size={28} />
              <span className="truncate text-sm font-medium">{market.baseAsset}</span>
            </div>
            <div>
              <LivePrice
                symbol={market.symbol}
                initialPrice={market.price}
                maximumFractionDigits={market.price < 10 ? 4 : 2}
                className="block text-sm font-semibold"
              />
              <LiveChange symbol={market.symbol} initialChange={market.change24h} className="mt-0.5 block text-2xs" />
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
