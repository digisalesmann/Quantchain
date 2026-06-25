'use client'
import React, { useEffect, useRef } from 'react'
import { createChart, ColorType, type IChartApi } from 'lightweight-charts'
import type { Candle } from '../lib/marketTypes'

type Props = {
  candles: Candle[]
  theme?: 'light' | 'dark'
  height?: number
}

export default function TradingViewChart({ candles, theme = 'dark', height = 400 }: Props) {
  const containerRef = useRef<HTMLDivElement>(null)
  const chartRef = useRef<IChartApi | null>(null)

  useEffect(() => {
    if (!containerRef.current || candles.length === 0) return

    const chart = createChart(containerRef.current, {
      layout: {
        textColor: theme === 'dark' ? '#cbd5e1' : '#334155',
        background: { type: ColorType.Solid, color: 'transparent' }
      },
      grid: {
        vertLines: { color: theme === 'dark' ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)' },
        horzLines: { color: theme === 'dark' ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)' }
      },
      width: containerRef.current.clientWidth,
      height,
      timeScale: { timeVisible: true, secondsVisible: false },
      rightPriceScale: { borderVisible: false },
      crosshair: { mode: 0 }
    })
    chartRef.current = chart

    const candlestickSeries = chart.addCandlestickSeries({
      upColor: '#16a34a',
      downColor: '#ef4444',
      borderUpColor: '#16a34a',
      borderDownColor: '#ef4444',
      wickUpColor: '#16a34a',
      wickDownColor: '#ef4444'
    })

    candlestickSeries.setData(
      candles.map((c) => ({ time: c.time as any, open: c.open, high: c.high, low: c.low, close: c.close }))
    )

    const volumeSeries = chart.addHistogramSeries({
      priceFormat: { type: 'volume' },
      priceScaleId: '',
      color: '#3b82f6'
    })
    volumeSeries.priceScale().applyOptions({ scaleMargins: { top: 0.85, bottom: 0 } })

    volumeSeries.setData(
      candles.map((c) => ({
        time: c.time as any,
        value: c.volume,
        color: c.close >= c.open ? 'rgba(22,163,74,0.35)' : 'rgba(239,68,68,0.35)'
      }))
    )

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
