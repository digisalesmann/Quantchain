'use client'
import React, { useEffect, useRef, useState } from 'react'
import { useTicker } from '../../lib/marketStore'
import { cn, formatCurrency, formatPercent } from '../../lib/utils'

export function LivePrice({
  symbol,
  initialPrice,
  className,
  maximumFractionDigits = 2
}: {
  symbol: string
  initialPrice: number
  className?: string
  maximumFractionDigits?: number
}) {
  const ticker = useTicker(symbol)
  const price = ticker?.price ?? initialPrice
  const prevPrice = useRef(price)
  const [flash, setFlash] = useState<'up' | 'down' | null>(null)

  useEffect(() => {
    if (price > prevPrice.current) setFlash('up')
    else if (price < prevPrice.current) setFlash('down')
    prevPrice.current = price
    if (price !== prevPrice.current) return
  }, [price])

  useEffect(() => {
    if (!flash) return
    const t = setTimeout(() => setFlash(null), 500)
    return () => clearTimeout(t)
  }, [flash])

  return (
    <span className={cn('tabular transition-colors duration-300', flash === 'up' && 'text-up', flash === 'down' && 'text-down', className)}>
      {formatCurrency(price, 'USD', maximumFractionDigits)}
    </span>
  )
}

export function LiveChange({ symbol, initialChange, className }: { symbol: string; initialChange: number; className?: string }) {
  const ticker = useTicker(symbol)
  const change = ticker?.change24h ?? initialChange
  const positive = change >= 0

  return <span className={cn('tabular text-sm font-medium', positive ? 'text-up' : 'text-down', className)}>{formatPercent(change)}</span>
}
