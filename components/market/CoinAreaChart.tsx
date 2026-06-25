'use client'
import React, { useEffect, useRef } from 'react'
import { createChart, ColorType, LineStyle, type IChartApi } from 'lightweight-charts'
import type { Candle } from '../../lib/marketTypes'
import { formatNumber } from '../../lib/utils'

type Props = {
  candles: Candle[]
  theme?: 'light' | 'dark'
  height?: number
}

export default function CoinAreaChart({ candles, theme = 'dark', height = 320 }: Props) {
  const containerRef = useRef<HTMLDivElement>(null)
  const chartRef = useRef<IChartApi | null>(null)

  useEffect(() => {
    if (!containerRef.current || candles.length === 0) return

    const isUp = candles[candles.length - 1].close >= candles[0].close
    const lineColor = isUp ? '#16a34a' : '#ef4444'

    const chart = createChart(containerRef.current, {
      layout: {
        textColor: theme === 'dark' ? '#cbd5e1' : '#334155',
        background: { type: ColorType.Solid, color: 'transparent' }
      },
      grid: {
        vertLines: { visible: false },
        horzLines: { visible: false }
      },
      width: containerRef.current.clientWidth,
      height,
      timeScale: { visible: false },
      rightPriceScale: { visible: false },
      crosshair: { horzLine: { visible: false }, vertLine: { labelVisible: false } },
      handleScroll: false,
      handleScale: false
    })
    chartRef.current = chart

    const series = chart.addAreaSeries({
      lineColor,
      lineWidth: 2,
      topColor: isUp ? 'rgba(22,163,74,0.25)' : 'rgba(239,68,68,0.25)',
      bottomColor: isUp ? 'rgba(22,163,74,0.01)' : 'rgba(239,68,68,0.01)',
      priceLineVisible: false,
      lastValueVisible: false
    })

    series.setData(candles.map((c) => ({ time: c.time as any, value: c.close })))

    const last = candles[candles.length - 1]
    series.setMarkers([
      {
        time: last.time as any,
        position: 'inBar',
        color: lineColor,
        shape: 'circle',
        size: 1.4
      }
    ])

    chart.timeScale().fitContent()

    const handleResize = () => {
      if (containerRef.current) chart.applyOptions({ width: containerRef.current.clientWidth })
    }
    window.addEventListener('resize', handleResize)

    return () => {
      window.removeEventListener('resize', handleResize)
      chart.remove()
      chartRef.current = null
    }
  }, [candles, theme, height])

  const high = candles.length > 0 ? Math.max(...candles.map((c) => c.close)) : 0
  const low = candles.length > 0 ? Math.min(...candles.map((c) => c.close)) : 0

  return (
    <div className="relative w-full" style={{ height }}>
      {candles.length > 0 && (
        <div className="pointer-events-none absolute right-1 top-1 text-2xs font-medium tabular text-muted-foreground">
          {formatNumber(high)}
        </div>
      )}
      <div ref={containerRef} className="h-full w-full" />
      {candles.length > 0 && (
        <div className="pointer-events-none absolute bottom-1 right-1 text-2xs font-medium tabular text-muted-foreground">
          {formatNumber(low)}
        </div>
      )}
    </div>
  )
}
