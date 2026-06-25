import React from 'react'
import { getSessionUserId } from '../../lib/session'
import prisma from '../../lib/prisma'
import { getAllMarkets } from '../../lib/prices'
import { buildTradableAssets, buildWalletOptions } from '../../lib/quickTrade'
import TradePageClient from '../../components/trade/TradePageClient'

export default async function TradePage({ searchParams }: { searchParams: Promise<{ market?: string; side?: string }> }) {
  const params = await searchParams
  const userId = await getSessionUserId()

  const [markets, dbMarkets, wallets] = await Promise.all([
    getAllMarkets(),
    prisma.market.findMany({ orderBy: { symbol: 'asc' } }),
    userId ? prisma.wallet.findMany({ where: { userId } }) : Promise.resolve([])
  ])

  const tradableAssets = buildTradableAssets(dbMarkets, markets)
  const walletOptions = buildWalletOptions(wallets, markets)

  const initialSymbol = markets.find((m) => m.symbol === params.market)?.symbol || tradableAssets[0]?.symbol || ''
  const initialSide = params.side === 'SELL' ? 'SELL' : 'BUY'

  return (
    <TradePageClient
      markets={markets}
      assets={tradableAssets}
      wallets={walletOptions}
      initialSymbol={initialSymbol}
      initialSide={initialSide}
    />
  )
}
