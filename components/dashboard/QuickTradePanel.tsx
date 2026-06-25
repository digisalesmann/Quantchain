'use client'
import React, { useMemo, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { ArrowDown, ArrowUp, ArrowUpDown, ChevronDown, ChevronRight } from 'lucide-react'
import Button from '../ui/Button'
import { Tabs, TabsList, TabsTrigger } from '../ui/Tabs'
import { Select, SelectContent, SelectItem, SelectTrigger } from '../ui/Select'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../ui/DropdownMenu'
import GlassIcon from '../ui/GlassIcon'
import CoinIcon from '../market/CoinIcon'
import SendCryptoDialog from '../wallet/SendCryptoDialog'
import SuccessScreen from '../ui/SuccessScreen'
import { useSession } from '../../lib/useSession'
import { formatCurrency, formatNumber } from '../../lib/utils'

type SuccessInfo =
  | { kind: 'buy'; usd: number; baseAsset: string }
  | {
      kind: 'order'
      side: 'BUY' | 'SELL'
      usd: number
      baseAsset: string
      trades?: number
    }
  | { kind: 'convert'; usd: number; fromAsset: string; toAsset: string }

const QUICK_BUY_PRESETS = [25, 50, 100, 250]

export type TradableAsset = {
  marketId: string
  symbol: string
  chain: string
  baseAsset: string
  quoteAsset: string
  price: number
  logo: string
  iconBg: string
}
export type WalletOption = {
  id: string
  chain: string
  baseAsset: string
  available: string
  logo: string
  iconBg: string
  price: number
}

type Side = 'BUY' | 'SELL' | 'CONVERT'

export default function QuickTradePanel({
  assets,
  wallets,
  initialSymbol,
  initialSide,
}: {
  assets: TradableAsset[]
  wallets: WalletOption[]
  initialSymbol?: string
  initialSide?: 'BUY' | 'SELL'
}) {
  const router = useRouter()
  const { user } = useSession()
  const [side, setSide] = useState<Side>(initialSide || 'BUY')
  const [assetSymbol, setAssetSymbol] = useState(initialSymbol || assets[0]?.symbol || '')
  const [payWithId, setPayWithId] = useState(wallets[0]?.id || '')
  const [amount, setAmount] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState<SuccessInfo | null>(null)

  const asset = assets.find((a) => a.symbol === assetSymbol) || assets[0]
  const payWith = wallets.find((w) => w.id === payWithId) || wallets[0]
  const sellWallet = wallets.find((w) => w.chain === asset?.chain)

  const convertTo = useMemo(() => wallets.filter((w) => w.id !== payWithId), [wallets, payWithId])
  const [toWalletId, setToWalletId] = useState(convertTo[0]?.id || '')
  const toWallet = wallets.find((w) => w.id === toWalletId)

  const priceForChain = (chain?: string) => assets.find((a) => a.chain === chain)?.price

  // Coinbase's quick panel always takes USD as the primary input for every mode —
  // the small line below shows the equivalent amount in whichever crypto is relevant.
  const equivalent = useMemo(() => {
    const numAmount = parseFloat(amount)
    if (!numAmount || numAmount <= 0) return null
    if ((side === 'BUY' || side === 'SELL') && asset) {
      return `${formatNumber(numAmount / asset.price)} ${asset.baseAsset}`
    }
    if (side === 'CONVERT' && payWith) {
      const fromPrice = priceForChain(payWith.chain)
      if (fromPrice) return `${formatNumber(numAmount / fromPrice)} ${payWith.baseAsset}`
    }
    return null
  }, [amount, side, asset, payWith, assets])

  if (assets.length === 0 || wallets.length === 0) {
    return <p className="text-sm text-muted-foreground">Set up a wallet to start trading.</p>
  }

  function availableUsd(wallet?: WalletOption) {
    if (!wallet) return null
    const price = priceForChain(wallet.chain)
    if (!price) return null
    return formatCurrency(parseFloat(wallet.available) * price)
  }

  function handleMax() {
    if (side === 'SELL') {
      const price = sellWallet ? priceForChain(sellWallet.chain) : undefined
      if (sellWallet && price) setAmount(String(parseFloat(sellWallet.available) * price))
      return
    }
    const wallet = payWith
    const price = wallet ? priceForChain(wallet.chain) : undefined
    if (wallet && price) setAmount(String(parseFloat(wallet.available) * price))
  }

  async function quickBuy(usd: number) {
    if (!user) return
    const defaultAsset = assets[0]
    if (!defaultAsset) return
    setSubmitting(true)
    try {
      const baseAmount = usd / defaultAsset.price
      const res = await fetch('/api/orders/place', {
        method: 'POST',
        body: JSON.stringify({
          userId: user.id,
          marketId: defaultAsset.marketId,
          side: 'BUY',
          type: 'MARKET',
          amount: baseAmount,
        }),
      })
      const data = await res.json()
      if (!res.ok) {
        toast.error(data.error || 'Order failed')
        return
      }
      setSuccess({ kind: 'buy', usd, baseAsset: defaultAsset.baseAsset })
      router.refresh()
    } finally {
      setSubmitting(false)
    }
  }

  async function submit() {
    if (!user) return
    const numAmount = parseFloat(amount)
    if (!numAmount || numAmount <= 0) {
      toast.error('Enter a valid amount')
      return
    }

    setSubmitting(true)
    try {
      if (side === 'CONVERT') {
        if (!payWith) return
        const fromPrice = priceForChain(payWith.chain)
        if (!fromPrice) return
        const nativeAmount = numAmount / fromPrice
        const res = await fetch('/api/wallets/convert', {
          method: 'POST',
          body: JSON.stringify({
            userId: user.id,
            fromWalletId: payWithId,
            toChain: toWallet?.chain,
            amount: nativeAmount,
          }),
        })
        const data = await res.json()
        if (!res.ok) {
          toast.error(data.error || 'Conversion failed')
          return
        }
        setSuccess({
          kind: 'convert',
          usd: numAmount,
          fromAsset: payWith.baseAsset,
          toAsset: toWallet?.baseAsset || '',
        })
      } else {
        if (!asset) return
        const baseAmount = numAmount / asset.price
        const res = await fetch('/api/orders/place', {
          method: 'POST',
          body: JSON.stringify({
            userId: user.id,
            marketId: asset.marketId,
            side,
            type: 'MARKET',
            amount: baseAmount,
          }),
        })
        const data = await res.json()
        if (!res.ok) {
          toast.error(data.error || 'Order failed')
          return
        }
        setSuccess({
          kind: 'order',
          side,
          usd: numAmount,
          baseAsset: asset.baseAsset,
          trades: data.trades,
        })
      }
      setAmount('')
      router.refresh()
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <>
      <div>
        <div className="flex flex-wrap items-center gap-2">
          <Tabs value={side} onValueChange={(v) => setSide(v as Side)} className="min-w-0">
            <TabsList className="rounded-full bg-muted p-1">
              <TabsTrigger
                value="BUY"
                className="rounded-full px-3 sm:px-4 data-[state=active]:bg-foreground data-[state=active]:text-background"
              >
                Buy
              </TabsTrigger>
              <TabsTrigger
                value="SELL"
                className="rounded-full px-3 sm:px-4 data-[state=active]:bg-foreground data-[state=active]:text-background"
              >
                Sell
              </TabsTrigger>
              <TabsTrigger
                value="CONVERT"
                className="rounded-full px-3 sm:px-4 data-[state=active]:bg-foreground data-[state=active]:text-background"
              >
                Convert
              </TabsTrigger>
            </TabsList>
          </Tabs>

          {user && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="subtle" size="sm" disabled={submitting} className="shrink-0 gap-1 rounded-full">
                  Quick buy <GlassIcon icon={ChevronDown} size={11} />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                {QUICK_BUY_PRESETS.map((preset) => (
                  <DropdownMenuItem key={preset} onSelect={() => quickBuy(preset)}>
                    Buy {formatCurrency(preset)} of {assets[0]?.baseAsset}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>

        <div className="mt-8 flex items-center justify-between gap-3">
          <div className="flex min-w-0 flex-1 items-baseline gap-2">
            <input
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              type="number"
              step="any"
              inputMode="decimal"
              placeholder="0"
              className="min-w-0 flex-1 bg-transparent text-4xl font-semibold tracking-tight outline-none placeholder:text-foreground sm:text-5xl"
            />
            <span className="shrink-0 text-4xl font-semibold text-muted-foreground/40 sm:text-5xl">USD</span>
          </div>
          <Button variant="subtle" size="sm" className="shrink-0 rounded-full" onClick={handleMax}>
            Max
          </Button>
        </div>

        <div className="mt-2 flex items-center gap-1.5 text-sm font-medium text-primary">
          <GlassIcon icon={ArrowUpDown} size={12} iconClassName="text-primary" />
          {equivalent || `0 ${side === 'CONVERT' ? payWith?.baseAsset : asset?.baseAsset}`}
        </div>

        <div className="mt-6 border-y border-border">
          {side === 'BUY' && (
            <>
              <PickerRow
                icon={payWith}
                title="Pay with"
                subtitle={payWith?.baseAsset || ''}
                rightValue={availableUsd(payWith)}
                value={payWithId}
                onValueChange={setPayWithId}
                options={wallets.map((w) => ({
                  value: w.id,
                  icon: w,
                  title: w.baseAsset,
                }))}
              />
              <Connector />
              <PickerRow
                icon={asset}
                title="Buy"
                subtitle={asset?.baseAsset || ''}
                value={assetSymbol}
                onValueChange={setAssetSymbol}
                options={assets.map((a) => ({
                  value: a.symbol,
                  icon: a,
                  title: a.baseAsset,
                }))}
              />
            </>
          )}

          {side === 'SELL' && (
            <PickerRow
              icon={asset}
              title="Sell"
              subtitle={asset?.baseAsset || ''}
              rightValue={availableUsd(sellWallet)}
              value={assetSymbol}
              onValueChange={setAssetSymbol}
              options={assets.map((a) => ({
                value: a.symbol,
                icon: a,
                title: a.baseAsset,
              }))}
            />
          )}

          {side === 'CONVERT' && (
            <>
              <PickerRow
                icon={payWith}
                title="From"
                subtitle={payWith?.baseAsset || ''}
                rightValue={availableUsd(payWith)}
                value={payWithId}
                onValueChange={setPayWithId}
                options={wallets.map((w) => ({
                  value: w.id,
                  icon: w,
                  title: w.baseAsset,
                }))}
              />
              <Connector />
              <PickerRow
                icon={toWallet}
                title="To"
                subtitle={toWallet?.baseAsset || ''}
                value={toWalletId}
                onValueChange={setToWalletId}
                options={convertTo.map((w) => ({
                  value: w.id,
                  icon: w,
                  title: w.baseAsset,
                }))}
              />
            </>
          )}
        </div>

        {user ? (
          <Button onClick={submit} disabled={submitting} className="mt-6 w-full" size="lg">
            {submitting ? 'Submitting…' : 'Review order'}
          </Button>
        ) : (
          <Button asChild className="mt-6 w-full" size="lg" variant="outline">
            <Link href="/auth/login">Sign in to trade</Link>
          </Button>
        )}

        <div className="mt-6 flex flex-col gap-4 border-t border-border pt-6">
          {user ? (
            <SendCryptoDialog
              wallets={wallets}
              trigger={
                <button className="flex items-center gap-3 text-left text-sm font-medium">
                  <GlassIcon icon={ArrowUp} size={14} />
                  Send crypto
                </button>
              }
            />
          ) : (
            <Link href="/auth/login" className="flex items-center gap-3 text-sm font-medium">
              <GlassIcon icon={ArrowUp} size={14} />
              Send crypto
            </Link>
          )}
          <Link href="/wallets" className="flex items-center gap-3 text-sm font-medium">
            <GlassIcon icon={ArrowDown} size={14} />
            Receive crypto
          </Link>
        </div>
      </div>

      {success && (
        <SuccessScreen
          open
          onOpenChange={(nextOpen) => !nextOpen && setSuccess(null)}
          title={
            success.kind === 'order' && success.side === 'SELL'
              ? 'Sold successfully'
              : success.kind === 'convert'
                ? 'Conversion complete'
                : 'Bought successfully'
          }
          description={
            success.kind === 'convert'
              ? `${formatCurrency(success.usd)} converted from ${success.fromAsset} to ${success.toAsset}.`
              : `${formatCurrency(success.usd)} of ${success.baseAsset}.`
          }
          rows={success.kind === 'order' && success.trades ? [{ label: 'Trades filled', value: String(success.trades) }] : undefined}
          actionLabel="Done"
        />
      )}
    </>
  )
}

type RowIcon = { logo: string; baseAsset: string; iconBg: string } | undefined

function PickerRow({
  icon,
  title,
  subtitle,
  rightValue,
  value,
  onValueChange,
  options,
}: {
  icon: RowIcon
  title: string
  subtitle: string
  rightValue?: string | null
  value: string
  onValueChange: (v: string) => void
  options: { value: string; icon: RowIcon; title: string }[]
}) {
  return (
    <Select value={value} onValueChange={onValueChange}>
      <SelectTrigger
        hideDefaultIcon
        className="h-auto w-full items-center justify-between gap-3 border-none bg-transparent p-0 py-4 hover:bg-transparent focus:ring-0"
      >
        <span className="flex min-w-0 items-center gap-3">
          {icon && <CoinIcon logo={icon.logo} baseAsset={icon.baseAsset} iconBg={icon.iconBg} size={36} className="shrink-0" />}
          <span className="min-w-0 text-left">
            <span className="block truncate text-sm font-semibold">{title}</span>
            <span className="block truncate text-xs text-muted-foreground">{subtitle}</span>
          </span>
        </span>
        <span className="flex shrink-0 items-center gap-1.5">
          {rightValue && (
            <span className="text-right">
              <span className="block text-sm font-medium">{rightValue}</span>
              <span className="block text-2xs text-primary">Available</span>
            </span>
          )}
          <GlassIcon icon={ChevronRight} size={13} />
        </span>
      </SelectTrigger>
      <SelectContent align="start">
        {options.map((o) => (
          <SelectItem key={o.value} value={o.value}>
            <span className="flex items-center gap-2">
              {o.icon && <CoinIcon logo={o.icon.logo} baseAsset={o.icon.baseAsset} iconBg={o.icon.iconBg} size={20} />}
              {o.title}
            </span>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}

function Connector() {
  return <div className="ml-[17px] h-3 w-px bg-border" />
}
