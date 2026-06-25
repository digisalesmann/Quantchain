'use client'
import { useEffect } from 'react'
import { useMarketStore } from '../lib/marketStore'

export default function MarketSocketProvider() {
  useEffect(() => {
    let socket: WebSocket | null = null
    let reconnectTimer: ReturnType<typeof setTimeout> | null = null
    let closedByEffect = false

    function connect() {
      // In production the WS server runs on a separate host (e.g. Render) from the
      // Next.js app (e.g. Vercel), so a same-hostname + port URL won't reach it —
      // NEXT_PUBLIC_WS_URL carries the full cross-origin URL there. Locally both run
      // on localhost on different ports, so the port-based fallback still works.
      let url = process.env.NEXT_PUBLIC_WS_URL
      if (!url) {
        const port = process.env.NEXT_PUBLIC_WS_PORT || '4001'
        const protocol = window.location.protocol === 'https:' ? 'wss' : 'ws'
        url = `${protocol}://${window.location.hostname}:${port}`
      }
      socket = new WebSocket(url)

      socket.onopen = () => useMarketStore.getState().setConnected(true)
      socket.onclose = () => {
        useMarketStore.getState().setConnected(false)
        if (!closedByEffect) reconnectTimer = setTimeout(connect, 2000)
      }
      socket.onerror = () => socket?.close()
      socket.onmessage = (event) => {
        try {
          const msg = JSON.parse(event.data)
          if (msg.type === 'ticker' && msg.symbol) {
            useMarketStore.getState().setTicker(msg.symbol, {
              price: msg.price,
              change24h: msg.change24h,
              high24h: msg.high24h,
              low24h: msg.low24h,
              volume24h: msg.volume24h,
            })
          }
        } catch {
          // ignore malformed messages
        }
      }
    }

    connect()

    return () => {
      closedByEffect = true
      if (reconnectTimer) clearTimeout(reconnectTimer)
      socket?.close()
    }
  }, [])

  return null
}
