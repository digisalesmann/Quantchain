'use client'
import React, { useMemo, useState } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { Search, ArrowUpDown, Star } from 'lucide-react'
import Input from '../ui/Input'
import GlassIcon from '../ui/GlassIcon'
import { Table, THead, TBody, TR, TH, TD } from '../ui/Table'
import { LivePrice, LiveChange } from './Live'
import CoinIcon from './CoinIcon'
import { cn, formatCompact } from '../../lib/utils'
import { useWatchlist } from '../../lib/useWatchlist'
import type { Market } from '../../lib/prices'

type SortKey = 'price' | 'change24h' | 'volume24h' | 'marketCap'

export default function MarketsExplorer({ markets }: { markets: Market[] }) {
  const searchParams = useSearchParams()
  const [query, setQuery] = useState(searchParams.get('q') || '')
  const [sortKey, setSortKey] = useState<SortKey>('marketCap')
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc')
  const { isWatched, toggle } = useWatchlist()

  function toggleSort(key: SortKey) {
    if (key === sortKey) setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))
    else {
      setSortKey(key)
      setSortDir('desc')
    }
  }

  const rows = useMemo(() => {
    const filtered = markets.filter(
      (m) => m.name.toLowerCase().includes(query.toLowerCase()) || m.baseAsset.toLowerCase().includes(query.toLowerCase())
    )
    return filtered.sort((a, b) => {
      const diff = a[sortKey] - b[sortKey]
      return sortDir === 'asc' ? diff : -diff
    })
  }, [markets, query, sortKey, sortDir])

  return (
    <div>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-semibold tracking-tight">Markets</h1>
        <div className="relative w-full sm:w-64">
          <GlassIcon icon={Search} size={13} className="absolute left-1.5 top-1/2 -translate-y-1/2" iconClassName="text-muted-foreground" />
          <Input placeholder="Search assets" value={query} onChange={(e) => setQuery(e.target.value)} className="pl-10" />
        </div>
      </div>

      <div className="mt-8">
        <Table>
          <THead>
            <TR>
              <TH className="w-8">{''}</TH>
              <TH>Name</TH>
              <SortableTH label="Price" active={sortKey === 'price'} dir={sortDir} onClick={() => toggleSort('price')} />
              <SortableTH label="24h change" active={sortKey === 'change24h'} dir={sortDir} onClick={() => toggleSort('change24h')} />
              <SortableTH label="Volume" active={sortKey === 'volume24h'} dir={sortDir} onClick={() => toggleSort('volume24h')} />
              <SortableTH label="Market cap" active={sortKey === 'marketCap'} dir={sortDir} onClick={() => toggleSort('marketCap')} />
            </TR>
          </THead>
          <TBody>
            {rows.map((m) => (
              <TR key={m.symbol}>
                <TD>
                  <button
                    onClick={() => toggle(m.symbol)}
                    aria-label={isWatched(m.symbol) ? 'Remove from watchlist' : 'Add to watchlist'}
                    className="flex h-6 w-6 items-center justify-center text-muted-foreground transition-colors hover:text-foreground"
                  >
                    <GlassIcon icon={Star} size={13} iconClassName={isWatched(m.symbol) ? 'fill-primary text-primary' : ''} />
                  </button>
                </TD>
                <TD>
                  <Link href={`/markets/${m.symbol}`} className="flex items-center gap-3 font-medium">
                    <CoinIcon logo={m.logo} baseAsset={m.baseAsset} iconBg={m.iconBg} size={32} />
                    <span>
                      {m.name}
                      <span className="ml-2 text-muted-foreground">{m.baseAsset}</span>
                    </span>
                  </Link>
                </TD>
                <TD align="right">
                  <LivePrice symbol={m.symbol} initialPrice={m.price} maximumFractionDigits={m.price < 10 ? 4 : 2} />
                </TD>
                <TD align="right">
                  <LiveChange symbol={m.symbol} initialChange={m.change24h} />
                </TD>
                <TD align="right" className="tabular text-muted-foreground">${formatCompact(m.volume24h)}</TD>
                <TD align="right" className="tabular text-muted-foreground">${formatCompact(m.marketCap)}</TD>
              </TR>
            ))}
            {rows.length === 0 && (
              <TR>
                <TD colSpan={6} className="py-10 text-center text-muted-foreground" align="center">
                  No assets match &ldquo;{query}&rdquo;
                </TD>
              </TR>
            )}
          </TBody>
        </Table>
      </div>
    </div>
  )
}

function SortableTH({ label, active, dir, onClick }: { label: string; active: boolean; dir: 'asc' | 'desc'; onClick: () => void }) {
  return (
    <TH align="right">
      <button onClick={onClick} className={cn('inline-flex items-center gap-1 transition-colors hover:text-foreground', active && 'text-foreground')}>
        {label}
        <GlassIcon icon={ArrowUpDown} size={10} className={cn(active && dir === 'asc' && 'rotate-180')} />
      </button>
    </TH>
  )
}
