'use client'
import React, { useEffect, useState } from 'react'
import CoinAreaChart from './CoinAreaChart'
import { Tabs, TabsList, TabsTrigger } from '../ui/Tabs'
import { useTheme } from '../ui/ThemeProvider'
import { CHART_RANGES, type Candle } from '../../lib/marketTypes'

export default function CoinChart({ symbol, initialCandles }: { symbol: string; initialCandles: Candle[] }) {
  const [range, setRange] = useState<string>('1D')
  const [candles, setCandles] = useState<Candle[]>(initialCandles)
  const [loading, setLoading] = useState(false)
  const { theme } = useTheme()

  useEffect(() => {
    if (range === '1D') {
      setCandles(initialCandles)
      return
    }
    let cancelled = false
    setLoading(true)
    fetch(`/api/markets/candles?symbol=${symbol}&range=${range}`)
      .then((r) => r.json())
      .then((data) => {
        if (!cancelled) setCandles(data.candles || [])
      })
      .finally(() => !cancelled && setLoading(false))
    return () => {
      cancelled = true
    }
  }, [range, symbol, initialCandles])

  return (
    <div>
      <CoinAreaChart candles={candles} theme={theme} height={320} />
      <div className="mt-4 flex items-center justify-between gap-3">
        <Tabs value={range} onValueChange={setRange} className="min-w-0 overflow-x-auto">
          <TabsList>
            {CHART_RANGES.map((r) => (
              <TabsTrigger key={r} value={r}>
                {r}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
        {loading && <span className="shrink-0 text-2xs text-muted-foreground">Loading…</span>}
      </div>
    </div>
  )
}
