'use client'
import React from 'react'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import Button from '../ui/Button'
import GlassIcon from '../ui/GlassIcon'
import Divider from '../ui/Divider'
import { PortfolioValue, PortfolioDelta, type Holding } from '../market/PortfolioValue'
import QuickTradePanel, { type TradableAsset, type WalletOption } from '../dashboard/QuickTradePanel'
import WalletOverviewRow from './WalletOverviewRow'
import { formatCurrency } from '../../lib/utils'

export type WalletRowData = {
  id: string
  label: string | null
  name: string
  baseAsset: string
  symbol: string
  logo: string
  iconBg: string
  available: string
  price: number
}

export default function WalletsOverviewClient({
  rows,
  holdings,
  assets,
  wallets,
  stakingLifetimeUsd,
  bestApy
}: {
  rows: WalletRowData[]
  holdings: Holding[]
  assets: TradableAsset[]
  wallets: WalletOption[]
  stakingLifetimeUsd: number
  bestApy: number
}) {
  return (
    <div className="grid grid-cols-1 gap-8 py-8 sm:py-10 lg:grid-cols-3 lg:gap-10">
      <div className="lg:col-span-2">
        <PortfolioValue holdings={holdings} className="tabular text-4xl font-semibold tracking-tight sm:text-5xl" />
        <PortfolioDelta holdings={holdings} className="mt-2 inline-block" />

        <div className="mt-8 divide-y divide-border border-y border-border">
          {rows.map((r) => (
            <WalletOverviewRow key={r.id} {...r} />
          ))}
        </div>

        {rows.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted-foreground">You don&rsquo;t have any wallets yet.</p>
        ) : (
          <Button asChild variant="subtle" className="mt-4 w-full">
            <Link href="/markets">Explore all crypto</Link>
          </Button>
        )}

        <Divider className="mt-10" />

        <div className="py-8">
          <Link href="/lend" className="flex items-center justify-between gap-3 transition-colors hover:text-primary">
            <div>
              <h2 className="text-lg font-semibold tracking-tight">Staking</h2>
              <p className="mt-1 text-sm">
                <span className="tabular font-medium text-up">{formatCurrency(stakingLifetimeUsd)}</span>{' '}
                <span className="text-muted-foreground">pending rewards</span>
              </p>
            </div>
            <GlassIcon icon={ArrowRight} size={15} className="shrink-0" />
          </Link>

          {bestApy > 0 && (
            <div className="mt-6 overflow-hidden rounded-2xl border border-border bg-gradient-to-br from-muted/60 to-transparent p-6">
              <p className="text-base font-semibold">Earn up to {bestApy.toFixed(2)}% APY</p>
              <p className="mt-1 max-w-md text-sm text-muted-foreground">Stake eligible assets you already hold to earn rewards in real time.</p>
              <Link href="/lend" className="mt-3 inline-block text-sm font-medium text-primary hover:underline">
                Explore assets
              </Link>
            </div>
          )}
        </div>
      </div>

      <div className="lg:col-span-1">
        <div className="lg:sticky lg:top-24">
          <QuickTradePanel assets={assets} wallets={wallets} />
        </div>
      </div>
    </div>
  )
}
