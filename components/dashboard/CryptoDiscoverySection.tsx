import React from 'react'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import Button from '../ui/Button'
import GlassIcon from '../ui/GlassIcon'
import CoinIcon from '../market/CoinIcon'
import type { Market } from '../../lib/prices'

const FEATURED: { symbol: string; tag: string }[] = [
  { symbol: 'BTC-USD', tag: 'Most popular' },
  { symbol: 'ETH-USD', tag: 'Most popular' },
  { symbol: 'DOGE-USD', tag: 'Most traded today' }
]

export default function CryptoDiscoverySection({ markets }: { markets: Market[] }) {
  const featured = FEATURED.map((f) => {
    const market = markets.find((m) => m.symbol === f.symbol)
    return market ? { market, tag: f.tag } : null
  }).filter((r): r is { market: Market; tag: string } => r !== null)

  if (featured.length === 0) return null

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold tracking-tight">Crypto</h2>
          <p className="text-sm text-muted-foreground">Trade millions of assets</p>
        </div>
        <Button asChild variant="ghost" size="icon">
          <Link href="/markets" aria-label="View all markets">
            <GlassIcon icon={ArrowRight} size={15} />
          </Link>
        </Button>
      </div>

      <div className="mt-4 divide-y divide-border border-y border-border">
        {featured.map(({ market, tag }) => (
          <div key={market.symbol} className="flex items-center justify-between gap-3 py-4">
            <Link href={`/markets/${market.symbol}`} className="flex min-w-0 items-center gap-3">
              <CoinIcon logo={market.logo} baseAsset={market.baseAsset} iconBg={market.iconBg} size={36} className="shrink-0" />
              <div className="min-w-0">
                <div className="truncate text-sm font-medium">{market.name}</div>
                <div className="truncate text-2xs text-muted-foreground">{tag}</div>
              </div>
            </Link>
            <Button asChild size="sm" variant="outline" className="shrink-0 rounded-full px-5">
              <Link href={`/trade?market=${market.symbol}&side=BUY`}>Buy</Link>
            </Button>
          </div>
        ))}
      </div>
    </div>
  )
}
