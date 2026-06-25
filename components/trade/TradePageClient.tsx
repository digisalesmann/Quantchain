'use client'
import React, { useRef, useState } from 'react'
import QuickTradePanel, { type TradableAsset, type WalletOption } from '../dashboard/QuickTradePanel'
import TradeMarketsList from './TradeMarketsList'
import type { Market } from '../../lib/prices'

export default function TradePageClient({
  markets,
  assets,
  wallets,
  initialSymbol,
  initialSide
}: {
  markets: Market[]
  assets: TradableAsset[]
  wallets: WalletOption[]
  initialSymbol: string
  initialSide: 'BUY' | 'SELL'
}) {
  const [selected, setSelected] = useState({ symbol: initialSymbol, side: initialSide })
  const panelRef = useRef<HTMLDivElement>(null)

  function handleBuy(symbol: string) {
    setSelected({ symbol, side: 'BUY' })
    if (typeof window !== 'undefined' && window.innerWidth < 1024) {
      panelRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }

  return (
    <div className="grid grid-cols-1 gap-8 py-8 sm:py-10 lg:grid-cols-3 lg:gap-10">
      <div className="lg:col-span-2">
        <TradeMarketsList markets={markets} onBuy={handleBuy} />
      </div>

      <div className="lg:col-span-1">
        <div ref={panelRef} className="lg:sticky lg:top-24">
          <QuickTradePanel
            key={`${selected.symbol}-${selected.side}`}
            assets={assets}
            wallets={wallets}
            initialSymbol={selected.symbol}
            initialSide={selected.side}
          />
        </div>
      </div>
    </div>
  )
}
