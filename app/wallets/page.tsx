import React from 'react'
import { requireSessionUserId } from '../../lib/session'
import prisma from '../../lib/prisma'
import { CHAIN_TO_SYMBOL, ASSET_TO_CHAIN, getAllMarkets } from '../../lib/prices'
import { buildTradableAssets, buildWalletOptions } from '../../lib/quickTrade'
import WalletsOverviewClient, { type WalletRowData } from '../../components/wallet/WalletsOverviewClient'

export default async function WalletsPage() {
  const userId = await requireSessionUserId()

  const [wallets, markets, dbMarkets, products, positions] = await Promise.all([
    prisma.wallet.findMany({ where: { userId }, orderBy: { createdAt: 'asc' } }),
    getAllMarkets(),
    prisma.market.findMany({ orderBy: { symbol: 'asc' } }),
    prisma.stakingProduct.findMany(),
    prisma.stakingPosition.findMany({ where: { userId }, include: { product: true } })
  ])

  const rows: WalletRowData[] = wallets
    .map((w) => {
      const symbol = CHAIN_TO_SYMBOL[w.chain]
      const market = markets.find((m) => m.symbol === symbol)
      if (!symbol || !market) return null
      return {
        id: w.id,
        label: w.label,
        name: market.name,
        baseAsset: market.baseAsset,
        symbol,
        logo: market.logo,
        iconBg: market.iconBg,
        available: w.available.toString(),
        price: market.price
      }
    })
    .filter((r): r is WalletRowData => r !== null)

  const holdings = rows.map((r) => ({ symbol: r.symbol, amount: parseFloat(r.available), initialPrice: r.price }))

  function priceForAsset(asset: string) {
    const chain = ASSET_TO_CHAIN[asset]
    const symbol = CHAIN_TO_SYMBOL[chain]
    return markets.find((m) => m.symbol === symbol)?.price ?? 0
  }

  const stakingLifetimeUsd = positions.reduce((sum, p) => {
    const principal = parseFloat(p.amount.toString())
    const apy = parseFloat(p.product.apy.toString())
    const elapsedDays = Math.max(0, (Date.now() - p.startedAt.getTime()) / (24 * 60 * 60 * 1000))
    const reward = principal * (apy / 100) * (elapsedDays / 365)
    return sum + reward * priceForAsset(p.product.asset)
  }, 0)

  const bestApy = products.length > 0 ? Math.max(...products.map((p) => parseFloat(p.apy.toString()))) : 0

  const tradableAssets = buildTradableAssets(dbMarkets, markets)
  const walletOptions = buildWalletOptions(wallets, markets)

  return (
    <WalletsOverviewClient
      rows={rows}
      holdings={holdings}
      assets={tradableAssets}
      wallets={walletOptions}
      stakingLifetimeUsd={stakingLifetimeUsd}
      bestApy={bestApy}
    />
  )
}
