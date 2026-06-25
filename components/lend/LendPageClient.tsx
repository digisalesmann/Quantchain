'use client'
import React from 'react'
import Link from 'next/link'
import { ChevronRight, PiggyBank } from 'lucide-react'
import Button from '../ui/Button'
import GlassIcon from '../ui/GlassIcon'
import Divider from '../ui/Divider'
import VaultsList, { type Product, type WalletBalance } from './VaultsList'
import PositionsPanel, { type Position } from './PositionsPanel'
import { formatCurrency } from '../../lib/utils'

export default function LendPageClient({
  userId,
  products,
  positions,
  wallets,
  stakedTotalUsd,
  pendingRewardsUsd,
  walletTotalUsd,
  bestApy,
  stakingPct
}: {
  userId: string
  products: Product[]
  positions: Position[]
  wallets: WalletBalance[]
  stakedTotalUsd: number
  pendingRewardsUsd: number
  walletTotalUsd: number
  bestApy: number
  stakingPct: number
}) {
  const hasPositions = positions.length > 0

  return (
    <div className="grid grid-cols-1 gap-8 py-8 sm:py-10 lg:grid-cols-3 lg:gap-10">
      <div className="lg:col-span-2">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="tabular text-4xl font-semibold tracking-tight sm:text-5xl">{formatCurrency(stakedTotalUsd)}</p>
            <p className="mt-1 text-sm text-muted-foreground">Currently staking</p>
          </div>
          <GlassIcon icon={PiggyBank} size={20} className="shrink-0" />
        </div>

        <div className="mt-8 grid grid-cols-2 gap-6 border-y border-border py-4">
          <div>
            <p className="text-2xs uppercase tracking-wide text-muted-foreground">Earning rate</p>
            <p className="mt-1 text-2xl font-semibold text-up">Up to {bestApy.toFixed(2)}%</p>
          </div>
          <div>
            <p className="text-2xs uppercase tracking-wide text-muted-foreground">Pending rewards</p>
            <p className="mt-1 tabular text-2xl font-semibold">{hasPositions ? formatCurrency(pendingRewardsUsd) : '--'}</p>
          </div>
        </div>

        <Divider className="mt-10" />

        <div className="py-8">
          <h2 className="text-lg font-semibold tracking-tight">Earn more</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Stake your idle crypto to start earning real yield, right alongside your other holdings.
          </p>

          <div className="mt-6 h-1 w-full overflow-hidden rounded-full bg-muted">
            <div className="h-full rounded-full bg-primary" style={{ width: `${Math.min(100, stakingPct)}%` }} />
          </div>
          <div className="mt-4 flex items-center justify-between gap-4">
            <div>
              <p className="tabular text-lg font-semibold">{formatCurrency(stakedTotalUsd)}</p>
              <p className="text-xs text-muted-foreground">{stakingPct.toFixed(0)}% staking</p>
            </div>
            <div className="text-right">
              <p className="tabular text-lg font-semibold">{formatCurrency(walletTotalUsd)}</p>
              <p className="text-xs text-muted-foreground">{(100 - stakingPct).toFixed(0)}% not staking</p>
            </div>
          </div>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <Button asChild variant="outline">
              <Link href="/wallets">Fund a wallet</Link>
            </Button>
            <Button asChild>
              <a href="#vaults">Stake</a>
            </Button>
          </div>
        </div>

        <Divider />

        <div id="vaults" className="py-8">
          <h2 className="mb-4 text-lg font-semibold tracking-tight">Vaults</h2>
          <VaultsList userId={userId} products={products} wallets={wallets} />
        </div>

        <Divider />

        <div className="py-8">
          <h2 className="mb-4 text-lg font-semibold tracking-tight">More info</h2>
          <div className="divide-y divide-border border-y border-border">
            <InfoLink href="/legal/terms" label="Terms of Service" />
            <InfoLink href="/legal/privacy" label="Privacy Policy" />
          </div>
        </div>
      </div>

      <div className="lg:col-span-1">
        <div className="lg:sticky lg:top-24">
          <PositionsPanel userId={userId} positions={positions} />
        </div>
      </div>
    </div>
  )
}

function InfoLink({ href, label }: { href: string; label: string }) {
  return (
    <Link href={href} className="flex items-center justify-between py-4 text-sm font-medium transition-colors hover:text-primary">
      {label}
      <GlassIcon icon={ChevronRight} size={13} />
    </Link>
  )
}
