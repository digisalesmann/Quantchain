import React from 'react'
import { requireSessionUserId } from '../../lib/session'
import prisma from '../../lib/prisma'
import { CHAIN_TO_SYMBOL, getAllMarkets, type Market } from '../../lib/prices'
import { buildTradableAssets, buildWalletOptions } from '../../lib/quickTrade'
import TransactionsFeed, { type ActivityRow } from '../../components/transactions/TransactionsFeed'

export default async function TransactionsPage() {
  const userId = await requireSessionUserId()

  const [transactions, withdrawals, trades, wallets, dbMarkets, markets] = await Promise.all([
    prisma.transaction.findMany({ where: { wallet: { userId } }, include: { wallet: true }, orderBy: { createdAt: 'desc' }, take: 100 }),
    prisma.withdrawal.findMany({ where: { userId }, orderBy: { requestedAt: 'desc' }, take: 100 }),
    prisma.trade.findMany({
      where: { OR: [{ buyOrder: { userId } }, { sellOrder: { userId } }] },
      include: { buyOrder: true, sellOrder: true, market: true },
      orderBy: { createdAt: 'desc' },
      take: 100
    }),
    prisma.wallet.findMany({ where: { userId } }),
    prisma.market.findMany({ orderBy: { symbol: 'asc' } }),
    getAllMarkets()
  ])

  function metaForChain(chain: string | null | undefined): Market | null {
    if (!chain) return null
    const symbol = CHAIN_TO_SYMBOL[chain]
    return symbol ? markets.find((m) => m.symbol === symbol) ?? null : null
  }

  function priceForSymbol(symbol?: string) {
    return markets.find((m) => m.symbol === symbol)?.price ?? 0
  }

  const TYPE_LABELS: Record<string, (asset: string, credit: boolean) => string> = {
    CONVERT: (asset, credit) => (credit ? `Received ${asset}` : `Converted ${asset}`),
    TRANSFER: (asset, credit) => (credit ? `Received ${asset}` : `Sent ${asset}`),
    STAKE: (asset) => `Staked ${asset}`,
    UNSTAKE: (asset) => `Unstaked ${asset}`
  }

  const rows: ActivityRow[] = [
    ...transactions.map((t) => {
      const meta = metaForChain(t.chain)
      const amount = parseFloat(t.amount.toString())
      const asset = meta?.baseAsset || t.chain?.toUpperCase() || ''
      const labelFn = TYPE_LABELS[t.type]
      return {
        id: t.id,
        type: t.type,
        label: labelFn ? labelFn(asset, amount >= 0) : `${t.type} ${asset}`,
        amount,
        asset,
        usdValue: Math.abs(amount) * priceForSymbol(meta?.symbol),
        status: t.status,
        date: t.createdAt.toISOString(),
        logo: meta?.logo || '',
        iconBg: meta?.iconBg || '#FFFFFF'
      }
    }),
    ...withdrawals.map((w) => {
      const meta = metaForChain(w.chain)
      const amount = -Math.abs(parseFloat(w.amount.toString()))
      const asset = meta?.baseAsset || w.chain.toUpperCase()
      return {
        id: w.id,
        type: 'WITHDRAWAL',
        label: `Withdrew ${asset}`,
        amount,
        asset,
        usdValue: Math.abs(amount) * priceForSymbol(meta?.symbol),
        status: w.status,
        date: w.requestedAt.toISOString(),
        logo: meta?.logo || '',
        iconBg: meta?.iconBg || '#FFFFFF'
      }
    }),
    ...trades.map((t) => {
      const isBuy = t.buyOrder?.userId === userId
      const amount = parseFloat(t.amount.toString()) * (isBuy ? 1 : -1)
      const market = markets.find((m) => m.symbol === t.market.symbol)
      return {
        id: t.id,
        type: isBuy ? 'BUY' : 'SELL',
        label: `${isBuy ? 'Bought' : 'Sold'} ${t.market.baseAsset}`,
        amount,
        asset: t.market.baseAsset,
        usdValue: Math.abs(amount) * (market?.price ?? 0),
        status: 'COMPLETED',
        date: t.createdAt.toISOString(),
        logo: market?.logo || '',
        iconBg: market?.iconBg || '#FFFFFF'
      }
    })
  ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

  const tradableAssets = buildTradableAssets(dbMarkets, markets)
  const walletOptions = buildWalletOptions(wallets, markets)

  return (
    <TransactionsFeed
      rows={rows}
      assets={tradableAssets}
      wallets={walletOptions}
    />
  )
}
