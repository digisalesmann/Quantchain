'use client'
import React, { useMemo, useState } from 'react'
import Link from 'next/link'
import { Table, THead, TBody, TR, TH, TD } from '../ui/Table'
import { LivePrice, LiveChange } from '../market/Live'
import CoinIcon from '../market/CoinIcon'
import WatchlistStarButton from '../market/WatchlistStarButton'
import { cn, formatCompact } from '../../lib/utils'
import type { Market } from '../../lib/prices'

const FILTERS = [
  { key: 'volume', label: 'Top volume' },
  { key: 'gainers', label: 'Top gainers' },
  { key: 'losers', label: 'Top losers' }
] as const
type FilterKey = (typeof FILTERS)[number]['key']

export default function TradeMarketsList({ markets, onBuy }: { markets: Market[]; onBuy: (symbol: string) => void }) {
  const [filter, setFilter] = useState<FilterKey>('volume')

  const rows = useMemo(() => {
    if (filter === 'gainers') return markets.filter((m) => m.change24h > 0).sort((a, b) => b.change24h - a.change24h)
    if (filter === 'losers') return markets.filter((m) => m.change24h < 0).sort((a, b) => a.change24h - b.change24h)
    return [...markets].sort((a, b) => b.volume24h - a.volume24h)
  }, [markets, filter])

  return (
    <div>
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-lg font-semibold tracking-tight">Crypto</h2>
        <Link href="/trade/advanced" className="shrink-0 text-sm font-medium text-muted-foreground hover:text-foreground">
          Advanced trading →
        </Link>
      </div>

      <div className="mt-4 flex gap-2 overflow-x-auto pb-1">
        {FILTERS.map((f) => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={cn(
              'shrink-0 rounded-full px-4 py-2 text-sm font-medium transition-colors',
              filter === f.key ? 'bg-foreground text-background' : 'bg-muted text-muted-foreground hover:bg-accent'
            )}
          >
            {f.label}
          </button>
        ))}
      </div>

      <div className="mt-4">
        <Table>
          <THead>
            <TR>
              <TH>Name</TH>
              <TH align="right">Market price</TH>
              <TH align="right">Volume</TH>
              <TH align="right">Market cap</TH>
              <TH align="right">Change</TH>
              <TH align="right">{''}</TH>
              <TH align="right">{''}</TH>
            </TR>
          </THead>
          <TBody>
            {rows.map((m) => (
              <TR key={m.symbol}>
                <TD>
                  <Link href={`/markets/${m.symbol}`} className="flex items-center gap-3 font-medium">
                    <CoinIcon logo={m.logo} baseAsset={m.baseAsset} iconBg={m.iconBg} size={32} />
                    <span>
                      {m.name}
                      <span className="ml-2 text-muted-foreground">{m.baseAsset}</span>
                    </span>
                  </Link>
                </TD>
                <TD align="right"><LivePrice symbol={m.symbol} initialPrice={m.price} maximumFractionDigits={m.price < 10 ? 4 : 2} /></TD>
                <TD align="right" className="tabular text-muted-foreground">${formatCompact(m.volume24h)}</TD>
                <TD align="right" className="tabular text-muted-foreground">${formatCompact(m.marketCap)}</TD>
                <TD align="right"><LiveChange symbol={m.symbol} initialChange={m.change24h} /></TD>
                <TD align="right">
                  <button onClick={() => onBuy(m.symbol)} className="font-medium text-primary hover:underline">
                    Buy
                  </button>
                </TD>
                <TD align="right"><WatchlistStarButton symbol={m.symbol} className="h-8 w-8" /></TD>
              </TR>
            ))}
            {rows.length === 0 && (
              <TR>
                <TD colSpan={7} align="center" className="py-10 text-muted-foreground">
                  No assets match this filter
                </TD>
              </TR>
            )}
          </TBody>
        </Table>
      </div>
    </div>
  )
}
