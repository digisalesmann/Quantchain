'use client'
import React, { useEffect, useState } from 'react'
import { formatNumber } from '../../lib/utils'

type Level = { price?: string; amount: string }
type Snapshot = { bids: Level[]; asks: Level[] }

export default function OrderBookPanel({ marketId }: { marketId: string }) {
  const [book, setBook] = useState<Snapshot>({ bids: [], asks: [] })

  useEffect(() => {
    let cancelled = false
    async function refresh() {
      try {
        const res = await fetch(`/api/markets/orderbook?marketId=${marketId}`)
        const data = await res.json()
        if (!cancelled) setBook({ bids: data.bids || [], asks: data.asks || [] })
      } catch {
        // ignore transient errors
      }
    }
    refresh()
    const timer = setInterval(refresh, 1500)
    return () => {
      cancelled = true
      clearInterval(timer)
    }
  }, [marketId])

  const asks = book.asks.slice(0, 8).reverse()
  const bids = book.bids.slice(0, 8)
  const maxAmount = Math.max(1, ...asks.map((a) => parseFloat(a.amount)), ...bids.map((b) => parseFloat(b.amount)))

  return (
    <div>
      <div className="mb-3 grid grid-cols-2 text-2xs uppercase tracking-wide text-muted-foreground">
        <span>Price</span>
        <span className="text-right">Amount</span>
      </div>

      <div className="space-y-px">
        {asks.map((a, i) => (
          <DepthRow key={`ask-${i}`} price={a.price} amount={a.amount} maxAmount={maxAmount} side="down" />
        ))}
      </div>

      <div className="my-2 border-y border-border py-1.5 text-center text-2xs text-muted-foreground">
        {asks[asks.length - 1]?.price && bids[0]?.price
          ? `Spread ${(parseFloat(asks[asks.length - 1].price!) - parseFloat(bids[0].price!)).toFixed(2)}`
          : '—'}
      </div>

      <div className="space-y-px">
        {bids.map((b, i) => (
          <DepthRow key={`bid-${i}`} price={b.price} amount={b.amount} maxAmount={maxAmount} side="up" />
        ))}
      </div>
    </div>
  )
}

function DepthRow({ price, amount, maxAmount, side }: { price?: string; amount: string; maxAmount: number; side: 'up' | 'down' }) {
  const pct = Math.min(100, (parseFloat(amount) / maxAmount) * 100)
  return (
    <div className="relative grid grid-cols-2 overflow-hidden rounded-sm px-1.5 py-1 text-xs tabular">
      <div
        className={side === 'up' ? 'absolute inset-y-0 right-0 bg-up/10' : 'absolute inset-y-0 right-0 bg-down/10'}
        style={{ width: `${pct}%` }}
      />
      <span className={side === 'up' ? 'relative text-up' : 'relative text-down'}>{price ? formatNumber(parseFloat(price)) : '—'}</span>
      <span className="relative text-right text-muted-foreground">{formatNumber(parseFloat(amount))}</span>
    </div>
  )
}
