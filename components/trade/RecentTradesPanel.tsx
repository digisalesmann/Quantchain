'use client'
import React, { useEffect, useState } from 'react'
import { formatNumber } from '../../lib/utils'

type Trade = { id: string; price: string; amount: string; createdAt: string }

export default function RecentTradesPanel({ marketId }: { marketId: string }) {
  const [trades, setTrades] = useState<Trade[]>([])

  useEffect(() => {
    let cancelled = false
    async function refresh() {
      try {
        const res = await fetch(`/api/markets/trades?marketId=${marketId}&limit=15`)
        const data = await res.json()
        if (!cancelled) setTrades(data.trades || [])
      } catch {
        // ignore transient errors
      }
    }
    refresh()
    const timer = setInterval(refresh, 2000)
    return () => {
      cancelled = true
      clearInterval(timer)
    }
  }, [marketId])

  return (
    <div>
      <div className="mb-3 grid grid-cols-3 text-2xs uppercase tracking-wide text-muted-foreground">
        <span>Price</span>
        <span className="text-right">Amount</span>
        <span className="text-right">Time</span>
      </div>
      <div className="space-y-1 text-xs">
        {trades.map((t) => (
          <div key={t.id} className="grid grid-cols-3 tabular">
            <span className="text-foreground">{formatNumber(parseFloat(t.price))}</span>
            <span className="text-right text-muted-foreground">{formatNumber(parseFloat(t.amount))}</span>
            <span className="text-right text-muted-foreground">{new Date(t.createdAt).toLocaleTimeString()}</span>
          </div>
        ))}
        {trades.length === 0 && <div className="py-6 text-center text-muted-foreground">No trades yet</div>}
      </div>
    </div>
  )
}
