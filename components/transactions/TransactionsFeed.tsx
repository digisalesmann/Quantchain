'use client'
import React, { useMemo, useState } from 'react'
import { ChevronDown } from 'lucide-react'
import Button from '../ui/Button'
import Badge from '../ui/Badge'
import GlassIcon from '../ui/GlassIcon'
import CoinIcon from '../market/CoinIcon'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../ui/DropdownMenu'
import QuickTradePanel, { type TradableAsset, type WalletOption } from '../dashboard/QuickTradePanel'
import { cn, formatCurrency, formatNumber } from '../../lib/utils'

export type ActivityRow = {
  id: string
  type: string
  label: string
  amount: number
  asset: string
  usdValue: number
  status: string
  date: string
  logo: string
  iconBg: string
}

const STATUS_VARIANT: Record<string, 'neutral' | 'up' | 'down' | 'warning'> = {
  COMPLETED: 'up',
  PENDING: 'warning',
  PROCESSING: 'warning',
  REJECTED: 'down',
  CANCELLED: 'down'
}

const ACTIVITY_LABELS: Record<string, string> = {
  BUY: 'Buy',
  SELL: 'Sell',
  CONVERT: 'Convert',
  TRANSFER: 'Transfer',
  WITHDRAWAL: 'Withdrawal',
  STAKE: 'Stake',
  UNSTAKE: 'Unstake'
}

const DATE_RANGES = ['All time', 'This month', 'Last 3 months', 'This year'] as const
type DateRange = (typeof DATE_RANGES)[number]

function monthLabel(date: Date) {
  const now = new Date()
  if (date.getFullYear() === now.getFullYear() && date.getMonth() === now.getMonth()) return 'This month'
  const month = date.toLocaleDateString('en-US', { month: 'long' })
  return date.getFullYear() === now.getFullYear() ? month : `${month} ${date.getFullYear()}`
}

function withinRange(date: Date, range: DateRange) {
  const now = new Date()
  if (range === 'All time') return true
  if (range === 'This month') return date.getFullYear() === now.getFullYear() && date.getMonth() === now.getMonth()
  if (range === 'This year') return date.getFullYear() === now.getFullYear()
  const cutoff = new Date(now.getFullYear(), now.getMonth() - 3, now.getDate())
  return date >= cutoff
}

export default function TransactionsFeed({
  rows,
  assets,
  wallets
}: {
  rows: ActivityRow[]
  assets: TradableAsset[]
  wallets: WalletOption[]
}) {
  const [activity, setActivity] = useState('All')
  const [status, setStatus] = useState('All')
  const [asset, setAsset] = useState('All')
  const [dateRange, setDateRange] = useState<DateRange>('All time')

  const assetOptions = useMemo(() => ['All', ...Array.from(new Set(rows.map((r) => r.asset))).sort()], [rows])
  const statusOptions = useMemo(() => ['All', ...Array.from(new Set(rows.map((r) => r.status)))], [rows])
  const activityOptions = useMemo(() => ['All', ...Array.from(new Set(rows.map((r) => r.type)))], [rows])

  const filtered = useMemo(() => {
    return rows.filter((r) => {
      if (activity !== 'All' && r.type !== activity) return false
      if (status !== 'All' && r.status !== status) return false
      if (asset !== 'All' && r.asset !== asset) return false
      if (!withinRange(new Date(r.date), dateRange)) return false
      return true
    })
  }, [rows, activity, status, asset, dateRange])

  const groups = useMemo(() => {
    const map = new Map<string, ActivityRow[]>()
    for (const row of filtered) {
      const label = monthLabel(new Date(row.date))
      if (!map.has(label)) map.set(label, [])
      map.get(label)!.push(row)
    }
    return Array.from(map.entries())
  }, [filtered])

  return (
    <div className="grid grid-cols-1 gap-8 py-8 sm:py-10 lg:grid-cols-3 lg:gap-10">
      <div className="lg:col-span-2">
        <div className="flex gap-2 overflow-x-auto pb-1">
          <FilterDropdown label="Activity" value={activity} options={activityOptions} labels={ACTIVITY_LABELS} onChange={setActivity} />
          <FilterDropdown label="Status" value={status} options={statusOptions} onChange={setStatus} />
          <FilterDropdown label="Asset" value={asset} options={assetOptions} onChange={setAsset} />
          <FilterDropdown label="Date" value={dateRange} options={[...DATE_RANGES]} onChange={(v) => setDateRange(v as DateRange)} />
        </div>

        <div className="mt-8 space-y-8">
          {groups.map(([label, items]) => (
            <div key={label}>
              <h2 className="mb-2 text-sm font-semibold text-muted-foreground">{label}</h2>
              <div className="divide-y divide-border border-y border-border">
                {items.map((row) => (
                  <div key={row.id} className="flex items-center justify-between gap-4 py-4">
                    <div className="flex min-w-0 items-center gap-3">
                      <CoinIcon logo={row.logo} baseAsset={row.asset} iconBg={row.iconBg} size={36} className="shrink-0" />
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold">{row.label}</p>
                        {row.status !== 'COMPLETED' && (
                          <Badge variant={STATUS_VARIANT[row.status] || 'neutral'} className="mt-1">
                            {row.status.toLowerCase()}
                          </Badge>
                        )}
                      </div>
                    </div>
                    <div className="shrink-0 text-right">
                      <p className="tabular text-sm font-medium">{formatCurrency(row.usdValue)}</p>
                      <p className={cn('tabular text-xs', row.amount >= 0 ? 'text-up' : 'text-muted-foreground')}>
                        {row.amount >= 0 ? '+' : ''}
                        {formatNumber(row.amount)} {row.asset}
                      </p>
                    </div>
                    <p className="hidden shrink-0 text-sm text-muted-foreground sm:block">
                      {new Date(row.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          ))}

          {groups.length === 0 && <p className="py-12 text-center text-sm text-muted-foreground">No activity matches these filters.</p>}
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

function FilterDropdown({
  label,
  value,
  options,
  labels,
  onChange
}: {
  label: string
  value: string
  options: string[]
  labels?: Record<string, string>
  onChange: (v: string) => void
}) {
  function display(opt: string) {
    if (opt === 'All') return `All ${label.toLowerCase()}`
    return labels?.[opt] || opt.charAt(0) + opt.slice(1).toLowerCase()
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="subtle" size="sm" className="shrink-0 gap-1 rounded-full">
          {label}
          <GlassIcon icon={ChevronDown} size={11} />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start">
        {options.map((opt) => (
          <DropdownMenuItem key={opt} onSelect={() => onChange(opt)} className={cn(opt === value && 'font-medium text-primary')}>
            {display(opt)}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
