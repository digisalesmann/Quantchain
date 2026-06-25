'use client'
import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/Select'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../ui/Tabs'
import Divider from '../ui/Divider'
import CoinChart from '../market/CoinChart'
import { LivePrice, LiveChange } from '../market/Live'
import OrderBookPanel from './OrderBookPanel'
import RecentTradesPanel from './RecentTradesPanel'
import OrderForm from './OrderForm'
import OpenOrdersPanel from './OpenOrdersPanel'
import { useSession } from '../../lib/useSession'
import type { Candle } from '../../lib/marketTypes'

export type MarketSummary = {
  id: string
  symbol: string
  baseAsset: string
  quoteAsset: string
}

export default function TradeTerminal({
  markets,
  market,
  initialPrice,
  initialChange,
  initialCandles,
  initialSide
}: {
  markets: MarketSummary[]
  market: MarketSummary
  initialPrice: number
  initialChange: number
  initialCandles: Candle[]
  initialSide: 'BUY' | 'SELL'
}) {
  const router = useRouter()
  const { user } = useSession()
  const [refreshToken, setRefreshToken] = useState(0)
  const [rightTab, setRightTab] = useState<'book' | 'trades'>('book')

  return (
    <div className="grid grid-cols-12 gap-8 py-10">
      <div className="col-span-12 lg:col-span-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <Select value={market.symbol} onValueChange={(symbol) => router.push(`/trade/advanced?market=${symbol}`)}>
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {markets.map((m) => (
                <SelectItem key={m.symbol} value={m.symbol}>
                  {m.symbol}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <div className="flex items-baseline gap-3">
            <LivePrice symbol={market.symbol} initialPrice={initialPrice} className="text-2xl font-semibold" maximumFractionDigits={initialPrice < 10 ? 4 : 2} />
            <LiveChange symbol={market.symbol} initialChange={initialChange} />
          </div>
        </div>

        <div className="mt-6">
          <CoinChart symbol={market.symbol} initialCandles={initialCandles} />
        </div>

        <Divider className="mt-10" />

        <div className="py-8">
          <h2 className="mb-4 text-sm font-semibold tracking-tight">Your orders · {market.symbol}</h2>
          <OpenOrdersPanel userId={user?.id ?? null} marketId={market.id} refreshToken={refreshToken} />
        </div>
      </div>

      <div className="col-span-12 lg:col-span-4">
        <Tabs value={rightTab} onValueChange={(v) => setRightTab(v as 'book' | 'trades')}>
          <TabsList>
            <TabsTrigger value="book">Order book</TabsTrigger>
            <TabsTrigger value="trades">Trades</TabsTrigger>
          </TabsList>
          <TabsContent value="book" className="mt-4">
            <OrderBookPanel marketId={market.id} key={`book-${market.id}-${refreshToken}`} />
          </TabsContent>
          <TabsContent value="trades" className="mt-4">
            <RecentTradesPanel marketId={market.id} key={`trades-${market.id}-${refreshToken}`} />
          </TabsContent>
        </Tabs>

        <Divider className="my-8" />

        <OrderForm
          marketId={market.id}
          baseAsset={market.baseAsset}
          quoteAsset={market.quoteAsset}
          currentPrice={initialPrice}
          defaultSide={initialSide}
          onOrderPlaced={() => setRefreshToken((t) => t + 1)}
        />
      </div>
    </div>
  )
}
