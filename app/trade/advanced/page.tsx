import React from 'react'
import prisma from '../../../lib/prisma'
import { getMarket, getCandlesForRange } from '../../../lib/prices'
import TradeTerminal from '../../../components/trade/TradeTerminal'

export default async function AdvancedTradePage({ searchParams }: { searchParams: Promise<{ market?: string; side?: string }> }) {
  const params = await searchParams
  const markets = await prisma.market.findMany({ orderBy: { symbol: 'asc' } })

  if (markets.length === 0) {
    return <div className="py-20 text-center text-muted-foreground">No markets available yet.</div>
  }

  const selected = markets.find((m) => m.symbol === params.market) || markets.find((m) => m.symbol === 'BTC-USD') || markets[0]
  const market = await getMarket(selected.symbol)
  const candles = await getCandlesForRange(selected.symbol, '1D')
  const side = params.side === 'SELL' ? 'SELL' : 'BUY'

  return (
    <TradeTerminal
      markets={markets.map((m) => ({ id: m.id, symbol: m.symbol, baseAsset: m.baseAsset, quoteAsset: m.quoteAsset }))}
      market={{ id: selected.id, symbol: selected.symbol, baseAsset: selected.baseAsset, quoteAsset: selected.quoteAsset }}
      initialPrice={market?.price ?? 0}
      initialChange={market?.change24h ?? 0}
      initialCandles={candles}
      initialSide={side}
    />
  )
}
