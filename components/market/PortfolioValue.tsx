'use client'
import React from 'react'
import { useAllTickers } from '../../lib/marketStore'
import { cn, formatCurrency } from '../../lib/utils'

export type Holding = { symbol: string; amount: number; initialPrice: number }

export function PortfolioValue({ holdings, className }: { holdings: Holding[]; className?: string }) {
  const tickers = useAllTickers()
  const total = holdings.reduce((sum, h) => sum + h.amount * (tickers[h.symbol]?.price ?? h.initialPrice), 0)
  return <span className={cn('tabular', className)}>{formatCurrency(total)}</span>
}

export function PortfolioDelta({ holdings, className }: { holdings: Holding[]; className?: string }) {
  const tickers = useAllTickers()
  let value = 0
  let prevValue = 0
  for (const h of holdings) {
    const change24h = tickers[h.symbol]?.change24h ?? 0
    const price = tickers[h.symbol]?.price ?? h.initialPrice
    const openPrice = price / (1 + change24h / 100)
    value += h.amount * price
    prevValue += h.amount * openPrice
  }
  const delta = value - prevValue
  const pct = prevValue > 0 ? (delta / prevValue) * 100 : 0
  const positive = delta >= 0

  return (
    <span className={cn('tabular text-sm font-medium', positive ? 'text-up' : 'text-down', className)}>
      {positive ? '+' : ''}
      {formatCurrency(delta)} ({positive ? '+' : ''}
      {pct.toFixed(2)}%) today
    </span>
  )
}
