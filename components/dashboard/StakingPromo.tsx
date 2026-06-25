import React from 'react'
import Link from 'next/link'
import Button from '../ui/Button'

export type StakingPromoCoin = { baseAsset: string; logo: string; iconBg: string }

export default function StakingPromo({ coins }: { coins: StakingPromoCoin[] }) {
  if (coins.length === 0) return null

  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-gradient-to-br from-muted/60 to-transparent p-6 sm:p-8">
      <div className="flex flex-col items-start gap-6 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex min-w-0 items-center gap-5">
          <div className="relative h-12 w-[120px] flex-shrink-0 sm:h-14">
            {coins.map((c, i) => (
              <span
                key={c.baseAsset}
                className="absolute top-0 flex h-11 w-11 items-center justify-center rounded-full ring-4 ring-background sm:h-12 sm:w-12"
                style={{ backgroundColor: c.iconBg, left: i * 32, zIndex: i }}
              >
                <img src={c.logo} alt="" className="h-7 w-7 object-contain" />
              </span>
            ))}
          </div>
          <div className="min-w-0">
            <h3 className="text-base font-semibold">Earn staking rewards while you hold</h3>
            <p className="mt-1 max-w-md text-sm text-muted-foreground">
              Stake {coins.map((c) => c.baseAsset).join(', ')} at a fixed APY and watch rewards accrue in real time, right alongside your other holdings.
            </p>
          </div>
        </div>
        <Button asChild size="lg" className="w-full shrink-0 sm:w-auto">
          <Link href="/lend">Start earning</Link>
        </Button>
      </div>
    </div>
  )
}
