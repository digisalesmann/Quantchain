import React from 'react'
import Link from 'next/link'
import { ChevronRight } from 'lucide-react'
import GlassIcon from '../ui/GlassIcon'
import CoinIcon from '../market/CoinIcon'
import { PortfolioValue } from '../market/PortfolioValue'
import { formatNumber } from '../../lib/utils'

export default function WalletOverviewRow({
  id,
  label,
  name,
  baseAsset,
  symbol,
  logo,
  iconBg,
  available,
  price
}: {
  id: string
  label: string | null
  name: string
  baseAsset: string
  symbol: string
  logo: string
  iconBg: string
  available: string
  price: number
}) {
  return (
    <Link href={`/wallets/${id}`} className="flex items-center justify-between gap-4 py-4 transition-colors hover:bg-accent/50">
      <span className="flex min-w-0 items-center gap-3">
        <CoinIcon logo={logo} baseAsset={baseAsset} iconBg={iconBg} size={36} className="shrink-0" />
        <span className="min-w-0">
          <span className="block truncate text-sm font-semibold">{label || name}</span>
          <span className="block text-xs text-muted-foreground">{baseAsset}</span>
        </span>
      </span>
      <span className="flex shrink-0 items-center gap-1.5">
        <span className="text-right">
          <PortfolioValue holdings={[{ symbol, amount: parseFloat(available), initialPrice: price }]} className="block tabular text-sm font-medium" />
          <span className="block tabular text-xs text-muted-foreground">
            {formatNumber(parseFloat(available))} {baseAsset}
          </span>
        </span>
        <GlassIcon icon={ChevronRight} size={13} />
      </span>
    </Link>
  )
}
