import { create } from 'zustand'

export type TickerData = {
  price: number
  change24h: number
  high24h: number
  low24h: number
  volume24h: number
}

type MarketState = {
  tickers: Record<string, TickerData>
  connected: boolean
  setTicker: (symbol: string, data: TickerData) => void
  setConnected: (connected: boolean) => void
}

export const useMarketStore = create<MarketState>((set) => ({
  tickers: {},
  connected: false,
  setTicker: (symbol, data) => set((state) => ({ tickers: { ...state.tickers, [symbol]: data } })),
  setConnected: (connected) => set({ connected })
}))

export function useTicker(symbol: string, fallback?: TickerData) {
  return useMarketStore((s) => s.tickers[symbol] || fallback)
}

export function useAllTickers() {
  return useMarketStore((s) => s.tickers)
}

export function useSocketConnected() {
  return useMarketStore((s) => s.connected)
}
