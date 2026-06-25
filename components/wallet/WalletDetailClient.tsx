'use client'
import React, { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { ArrowDown, ArrowUp, Check, Copy } from 'lucide-react'
import Button from '../ui/Button'
import GlassIcon from '../ui/GlassIcon'
import Divider from '../ui/Divider'
import CoinIcon from '../market/CoinIcon'
import { PortfolioValue } from '../market/PortfolioValue'
import { Dialog, DialogContent, DialogTitle, DialogDescription, DialogTrigger } from '../ui/Dialog'
import StakeForm, { type StakeProduct } from '../lend/StakeForm'
import PositionsPanel, { type Position } from '../lend/PositionsPanel'
import SendCryptoDialog from './SendCryptoDialog'
import SuccessScreen from '../ui/SuccessScreen'
import { formatNumber } from '../../lib/utils'

export type WalletDetail = {
  id: string
  address: string
  chain: string
  label: string | null
  name: string
  baseAsset: string
  symbol: string
  logo: string
  iconBg: string
  available: string
  price: number
}

export default function WalletDetailClient({
  userId,
  wallet,
  product,
  positions
}: {
  userId: string
  wallet: WalletDetail
  product: StakeProduct | null
  positions: Position[]
}) {
  const router = useRouter()
  const [copied, setCopied] = useState(false)
  const [stakeOpen, setStakeOpen] = useState(false)
  const [stakeSuccess, setStakeSuccess] = useState<{ amount: string } | null>(null)

  function copyAddress() {
    navigator.clipboard.writeText(wallet.address)
    setCopied(true)
    toast.success('Address copied')
    setTimeout(() => setCopied(false), 1500)
  }

  return (
    <div className="grid grid-cols-1 gap-8 py-8 sm:py-10 lg:grid-cols-3 lg:gap-10">
      <div className="lg:col-span-2">
        <div className="flex items-center gap-3">
          <CoinIcon logo={wallet.logo} baseAsset={wallet.baseAsset} iconBg={wallet.iconBg} size={36} />
          <h1 className="text-xl font-semibold tracking-tight">{wallet.label || wallet.name}</h1>
        </div>

        <PortfolioValue
          holdings={[{ symbol: wallet.symbol, amount: parseFloat(wallet.available), initialPrice: wallet.price }]}
          className="mt-4 block tabular text-4xl font-semibold tracking-tight sm:text-5xl"
        />
        <p className="mt-1 text-sm text-muted-foreground">
          {formatNumber(parseFloat(wallet.available))} {wallet.baseAsset}
        </p>

        <div className="mt-8 grid grid-cols-3 gap-4 text-2xs font-medium uppercase tracking-wide text-muted-foreground">
          <span>Name</span>
          <span>Balance</span>
          <span>APY</span>
        </div>
        <div className="mt-2 grid grid-cols-3 items-center gap-4 border-y border-border py-4 text-sm">
          <span className="flex items-center gap-3 font-medium">
            <CoinIcon logo={wallet.logo} baseAsset={wallet.baseAsset} iconBg={wallet.iconBg} size={28} />
            {wallet.baseAsset}
          </span>
          <span className="tabular">
            {formatNumber(parseFloat(wallet.available))} {wallet.baseAsset}
          </span>
          <span className="tabular text-up">{product ? `Up to ${parseFloat(product.apy).toFixed(2)}%` : '—'}</span>
        </div>

        {product && (
          <div className="py-8">
            <h2 className="text-lg font-semibold tracking-tight">Staking</h2>
            <div className="mt-4 overflow-hidden rounded-2xl border border-border bg-gradient-to-br from-muted/60 to-transparent p-6">
              <p className="text-base font-semibold">Earn up to {parseFloat(product.apy).toFixed(2)}%</p>
              <p className="mt-1 max-w-md text-sm text-muted-foreground">
                Stake your {wallet.baseAsset} to earn. {product.lockupDays === 0 ? 'Withdraw anytime.' : `Locked for ${product.lockupDays} days.`}
              </p>
              <Dialog open={stakeOpen} onOpenChange={setStakeOpen}>
                <DialogTrigger asChild>
                  <button className="mt-3 text-sm font-medium text-primary hover:underline">Start staking</button>
                </DialogTrigger>
                <DialogContent>
                  <StakeForm
                    userId={userId}
                    product={product}
                    available={wallet.available}
                    onStaked={(amount) => {
                      setStakeOpen(false)
                      setStakeSuccess({ amount })
                    }}
                  />
                </DialogContent>
              </Dialog>

              {stakeSuccess && (
                <SuccessScreen
                  open
                  onOpenChange={(open) => {
                    if (!open) {
                      setStakeSuccess(null)
                      router.refresh()
                    }
                  }}
                  title="Stake confirmed"
                  description={`You staked ${stakeSuccess.amount} ${product.asset}.`}
                  rows={[
                    { label: 'APY', value: `${parseFloat(product.apy).toFixed(2)}%` },
                    { label: 'Lockup', value: product.lockupDays === 0 ? 'Withdraw anytime' : `${product.lockupDays} days` }
                  ]}
                  actionLabel="Done"
                />
              )}
            </div>
          </div>
        )}

        {positions.length > 0 && (
          <>
            <Divider />
            <div className="py-8">
              <h2 className="mb-4 text-lg font-semibold tracking-tight">{wallet.baseAsset} rewards</h2>
              <PositionsPanel userId={userId} positions={positions} />
            </div>
          </>
        )}
      </div>

      <div className="lg:col-span-1">
        <div className="lg:sticky lg:top-24 space-y-4">
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="subtle" className="w-full justify-start px-4">
                <GlassIcon icon={ArrowDown} size={13} /> Receive {wallet.baseAsset}
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogTitle>Receive {wallet.baseAsset}</DialogTitle>
              <DialogDescription>
                Send only {wallet.baseAsset} to this {wallet.chain} address. Sending any other asset may result in permanent loss.
              </DialogDescription>
              <div className="mt-5 break-all rounded-md border border-border bg-muted px-4 py-3 font-mono text-xs">{wallet.address}</div>
              <Button onClick={copyAddress} variant="outline" className="mt-3 w-full">
                <GlassIcon icon={copied ? Check : Copy} size={13} /> {copied ? 'Copied' : 'Copy address'}
              </Button>
            </DialogContent>
          </Dialog>

          <SendCryptoDialog
            wallets={[{ id: wallet.id, chain: wallet.chain, baseAsset: wallet.baseAsset, available: wallet.available, logo: wallet.logo, iconBg: wallet.iconBg, price: wallet.price }]}
            initialWalletId={wallet.id}
            lockAsset
            trigger={
              <Button variant="subtle" className="w-full justify-start px-4">
                <GlassIcon icon={ArrowUp} size={13} /> Send {wallet.baseAsset}
              </Button>
            }
          />
        </div>
      </div>
    </div>
  )
}
