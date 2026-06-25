import React from 'react'
import { notFound } from 'next/navigation'
import { requireSessionUserId } from '../../../lib/session'
import prisma from '../../../lib/prisma'
import { CHAIN_TO_SYMBOL, ASSET_TO_CHAIN, getMarket } from '../../../lib/prices'
import WalletDetailClient from '../../../components/wallet/WalletDetailClient'

export default async function WalletDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const userId = await requireSessionUserId()

  const wallet = await prisma.wallet.findUnique({ where: { id } })
  if (!wallet || wallet.userId !== userId) notFound()

  const symbol = CHAIN_TO_SYMBOL[wallet.chain]
  const market = await getMarket(symbol)
  if (!market) notFound()

  const product = await prisma.stakingProduct.findFirst({ where: { asset: market.baseAsset } })

  const positions = product
    ? await prisma.stakingPosition.findMany({ where: { userId, product: { asset: market.baseAsset } }, include: { product: true } })
    : []

  const walletChain = wallet.chain
  const priceForAsset = (asset: string) => {
    const chain = ASSET_TO_CHAIN[asset]
    return chain === walletChain ? market.price : 0
  }

  const positionList = positions.map((p) => {
    const principal = parseFloat(p.amount.toString())
    const apy = parseFloat(p.product.apy.toString())
    const elapsedDays = Math.max(0, (Date.now() - p.startedAt.getTime()) / (24 * 60 * 60 * 1000))
    const reward = principal * (apy / 100) * (elapsedDays / 365)
    return {
      id: p.id,
      productName: p.product.name,
      asset: p.product.asset,
      apy: p.product.apy.toString(),
      amount: p.amount.toString(),
      rewardUsd: reward * priceForAsset(p.product.asset),
      startedAt: p.startedAt.toISOString(),
      endsAt: p.endsAt.toISOString(),
      logo: market.logo,
      iconBg: market.iconBg
    }
  })

  return (
    <WalletDetailClient
      userId={userId}
      wallet={{
        id: wallet.id,
        address: wallet.address,
        chain: wallet.chain,
        label: wallet.label,
        name: market.name,
        baseAsset: market.baseAsset,
        symbol,
        logo: market.logo,
        iconBg: market.iconBg,
        available: wallet.available.toString(),
        price: market.price
      }}
      product={
        product
          ? { id: product.id, asset: product.asset, apy: product.apy.toString(), lockupDays: product.lockupDays }
          : null
      }
      positions={positionList}
    />
  )
}
