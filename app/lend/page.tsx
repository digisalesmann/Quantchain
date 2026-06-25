import React from 'react'
import { requireSessionUserId } from '../../lib/session'
import prisma from '../../lib/prisma'
import { ASSET_TO_CHAIN, CHAIN_TO_SYMBOL, getAllMarkets, type Market } from '../../lib/prices'
import LendPageClient from '../../components/lend/LendPageClient'

function symbolForAsset(asset: string) {
  const chain = ASSET_TO_CHAIN[asset]
  return CHAIN_TO_SYMBOL[chain]
}

export default async function LendPage() {
  const userId = await requireSessionUserId()

  const [products, positions, wallets, markets] = await Promise.all([
    prisma.stakingProduct.findMany({ orderBy: { apy: 'desc' } }),
    prisma.stakingPosition.findMany({ where: { userId }, include: { product: true }, orderBy: { startedAt: 'desc' } }),
    prisma.wallet.findMany({ where: { userId } }),
    getAllMarkets()
  ])

  function marketForAsset(asset: string): Market | undefined {
    return markets.find((m) => m.symbol === symbolForAsset(asset))
  }

  function priceForAsset(asset: string) {
    return marketForAsset(asset)?.price ?? 0
  }

  const productList = products.map((p) => {
    const market = marketForAsset(p.asset)
    return {
      id: p.id,
      name: p.name,
      asset: p.asset,
      apy: p.apy.toString(),
      lockupDays: p.lockupDays,
      logo: market?.logo ?? '',
      iconBg: market?.iconBg ?? '#FFFFFF'
    }
  })

  const positionList = positions.map((p) => {
    const principal = parseFloat(p.amount.toString())
    const apy = parseFloat(p.product.apy.toString())
    const elapsedDays = Math.max(0, (Date.now() - p.startedAt.getTime()) / (24 * 60 * 60 * 1000))
    const reward = principal * (apy / 100) * (elapsedDays / 365)
    const price = priceForAsset(p.product.asset)
    const market = marketForAsset(p.product.asset)
    return {
      id: p.id,
      productName: p.product.name,
      asset: p.product.asset,
      apy: p.product.apy.toString(),
      amount: p.amount.toString(),
      rewardUsd: reward * price,
      startedAt: p.startedAt.toISOString(),
      endsAt: p.endsAt.toISOString(),
      logo: market?.logo ?? '',
      iconBg: market?.iconBg ?? '#FFFFFF'
    }
  })

  const walletOptions = wallets.map((w) => {
    const symbol = CHAIN_TO_SYMBOL[w.chain]
    const market = markets.find((m) => m.symbol === symbol)
    return { chain: w.chain, asset: market?.baseAsset || w.chain.toUpperCase(), available: w.available.toString() }
  })

  const stakedTotalUsd = positions.reduce((sum, p) => sum + parseFloat(p.amount.toString()) * priceForAsset(p.product.asset), 0)
  const pendingRewardsUsd = positionList.reduce((sum, p) => sum + p.rewardUsd, 0)
  const walletTotalUsd = wallets.reduce((sum, w) => {
    const symbol = CHAIN_TO_SYMBOL[w.chain]
    const price = markets.find((m) => m.symbol === symbol)?.price ?? 0
    return sum + parseFloat(w.available.toString()) * price
  }, 0)
  const bestApy = products.length > 0 ? Math.max(...products.map((p) => parseFloat(p.apy.toString()))) : 0
  const totalPool = stakedTotalUsd + walletTotalUsd
  const stakingPct = totalPool > 0 ? (stakedTotalUsd / totalPool) * 100 : 0

  return (
    <LendPageClient
      userId={userId}
      products={productList}
      positions={positionList}
      wallets={walletOptions}
      stakedTotalUsd={stakedTotalUsd}
      pendingRewardsUsd={pendingRewardsUsd}
      walletTotalUsd={walletTotalUsd}
      bestApy={bestApy}
      stakingPct={stakingPct}
    />
  )
}
