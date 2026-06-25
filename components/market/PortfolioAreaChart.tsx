'use client'
import React, { useEffect, useRef } from 'react'
import { createChart, ColorType, LineStyle, type IChartApi } from 'lightweight-charts'
import type { Candle } from '../../lib/marketTypes'

type Props = {
  candles: Candle[]
  theme?: 'light' | 'dark'
  height?: number
}

export default function PortfolioAreaChart({ candles, theme = 'dark', height = 260 }: Props) {
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
      priceLineVisible: true,
      priceLineStyle: LineStyle.Dotted,
      priceLineColor: lineColor,
      lastValueVisible: true
    })

    series.setData(candles.map((c) => ({ time: c.time as any, value: c.close })))
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

  return <div ref={containerRef} className="w-full" style={{ height }} />
}
