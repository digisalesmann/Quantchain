'use client'
import { useEffect, useState } from 'react'

const KEY = 'quantchain:watchlist'

function read(): string[] {
  try {
    const raw = localStorage.getItem(KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

export function useWatchlist() {
  const [symbols, setSymbols] = useState<string[]>([])
  const [hydrated, setHydrated] = useState(false)

  useEffect(() => {
    setSymbols(read())
    setHydrated(true)
    const onStorage = () => setSymbols(read())
    window.addEventListener('storage', onStorage)
    return () => window.removeEventListener('storage', onStorage)
  }, [])

  function toggle(symbol: string) {
    setSymbols((prev) => {
      const next = prev.includes(symbol) ? prev.filter((s) => s !== symbol) : [...prev, symbol]
      localStorage.setItem(KEY, JSON.stringify(next))
      return next
    })
  }

  return { symbols: hydrated ? symbols : [], isWatched: (s: string) => symbols.includes(s), toggle, hydrated }
}
