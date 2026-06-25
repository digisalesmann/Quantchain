'use client'
import React, { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { ArrowLeft, ChevronRight, Clock } from 'lucide-react'
import Button from '../ui/Button'
import Input from '../ui/Input'
import GlassIcon from '../ui/GlassIcon'
import { Select, SelectContent, SelectItem, SelectTrigger } from '../ui/Select'
import { Dialog, DialogTrigger, DialogContent, DialogTitle } from '../ui/Dialog'
import SuccessScreen from '../ui/SuccessScreen'
import CoinIcon from '../market/CoinIcon'
import { useSession } from '../../lib/useSession'
import { formatCurrency, formatNumber, formatRelativeTime, truncateAddress } from '../../lib/utils'
import type { WalletOption } from '../dashboard/QuickTradePanel'

const NETWORK_FEE: Record<string, number> = {
  bitcoin: 0.0005,
  ethereum: 0.002,
  solana: 0.01,
  litecoin: 0.001,
  dogecoin: 1,
  bnb: 0.0008,
  polygon: 0.01,
  avalanche: 0.001,
}
const NETWORK_NAME: Record<string, string> = {
  bitcoin: 'Bitcoin',
  ethereum: 'Ethereum',
  solana: 'Solana',
  litecoin: 'Litecoin',
  dogecoin: 'Dogecoin',
  bnb: 'BNB Smart Chain',
  polygon: 'Polygon',
  avalanche: 'Avalanche C-Chain',
}
const NETWORK_CONFIRM_TIME: Record<string, string> = {
  bitcoin: '~30 minutes',
  ethereum: '~3 minutes',
  solana: '~30 seconds',
  litecoin: '~5 minutes',
  dogecoin: '~2 minutes',
  bnb: '~10 seconds',
  polygon: '~10 seconds',
  avalanche: '~5 seconds',
}
const ADDRESS_PATTERN: Record<string, RegExp> = {
  ethereum: /^0x[a-fA-F0-9]{40}$/,
  bitcoin: /^([13][a-km-zA-HJ-NP-Z1-9]{25,34}|bc1[a-z0-9]{39,59})$/,
  solana: /^[1-9A-HJ-NP-Za-km-z]{32,44}$/,
  litecoin: /^([LM3][a-km-zA-HJ-NP-Z1-9]{25,34}|ltc1[a-z0-9]{39,59})$/,
  dogecoin: /^D[a-km-zA-HJ-NP-Z1-9]{25,34}$/,
  bnb: /^0x[a-fA-F0-9]{40}$/,
  polygon: /^0x[a-fA-F0-9]{40}$/,
  avalanche: /^0x[a-fA-F0-9]{40}$/,
}

type Step = 'recipient' | 'amount' | 'review'
type RecentAddress = { address: string; requestedAt: string }

export default function SendCryptoDialog({
  wallets,
  initialWalletId,
  lockAsset = false,
  trigger,
}: {
  wallets: WalletOption[]
  initialWalletId?: string
  lockAsset?: boolean
  trigger: React.ReactNode
}) {
  const router = useRouter()
  const { user } = useSession()
  const [open, setOpen] = useState(false)
  const [step, setStep] = useState<Step>('recipient')
  const [walletId, setWalletId] = useState(initialWalletId || wallets[0]?.id || '')
  const [address, setAddress] = useState('')
  const [usdAmount, setUsdAmount] = useState('')
  const [recent, setRecent] = useState<RecentAddress[]>([])
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState<{
    usdAmount: number
    nativeAmount: number
    baseAsset: string
    address: string
    chain: string
  } | null>(null)

  const wallet = wallets.find((w) => w.id === walletId) || wallets[0]

  useEffect(() => {
    if (!open || !user || !wallet) return
    fetch(`/api/wallets/recent-addresses?userId=${user.id}&chain=${wallet.chain}`)
      .then((r) => r.json())
      .then((data) => setRecent(data.addresses || []))
  }, [open, user, wallet?.chain])

  const addressValid = wallet ? (ADDRESS_PATTERN[wallet.chain]?.test(address) ?? address.length > 0) : false

  const feeNative = wallet ? NETWORK_FEE[wallet.chain] || 0 : 0
  const feeUsd = wallet ? feeNative * wallet.price : 0
  const numUsd = parseFloat(usdAmount) || 0
  const nativeAmount = wallet && wallet.price > 0 ? numUsd / wallet.price : 0
  const totalUsd = numUsd + feeUsd
  const availableUsd = wallet ? parseFloat(wallet.available) * wallet.price : 0
  const amountValid = numUsd > 0 && totalUsd <= availableUsd + 0.000001

  function handleOpenChange(next: boolean) {
    setOpen(next)
    if (!next) {
      setStep('recipient')
      setAddress('')
      setUsdAmount('')
    }
  }

  function handleMax() {
    if (!wallet) return
    setUsdAmount(String(Math.max(0, availableUsd - feeUsd)))
  }

  async function handleSend() {
    if (!user || !wallet) return
    setSubmitting(true)
    try {
      const res = await fetch('/api/wallets/withdraw', {
        method: 'POST',
        body: JSON.stringify({
          userId: user.id,
          walletId: wallet.id,
          chain: wallet.chain,
          toAddress: address,
          amount: nativeAmount.toString(),
          fee: feeNative.toString(),
        }),
      })
      const data = await res.json()
      if (!res.ok) {
        toast.error(data.error || 'Send failed')
        return
      }
      handleOpenChange(false)
      setSuccess({
        usdAmount: numUsd,
        nativeAmount,
        baseAsset: wallet.baseAsset,
        address,
        chain: wallet.chain,
      })
      router.refresh()
    } finally {
      setSubmitting(false)
    }
  }

  if (wallets.length === 0) return null

  return (
    <>
      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogTrigger asChild>{trigger}</DialogTrigger>
        <DialogContent>
          {step === 'recipient' && (
            <RecipientStep
              wallets={wallets}
              wallet={wallet}
              walletId={walletId}
              setWalletId={setWalletId}
              lockAsset={lockAsset}
              address={address}
              setAddress={setAddress}
              recent={recent}
              addressValid={addressValid}
              onContinue={() => setStep('amount')}
            />
          )}
          {step === 'amount' && wallet && (
            <AmountStep
              wallet={wallet}
              usdAmount={usdAmount}
              setUsdAmount={setUsdAmount}
              availableUsd={availableUsd}
              feeNative={feeNative}
              feeUsd={feeUsd}
              nativeAmount={nativeAmount}
              amountValid={amountValid}
              onBack={() => setStep('recipient')}
              onMax={handleMax}
              onContinue={() => setStep('review')}
            />
          )}
          {step === 'review' && wallet && (
            <ReviewStep
              wallet={wallet}
              address={address}
              usdAmount={numUsd}
              nativeAmount={nativeAmount}
              feeUsd={feeUsd}
              totalUsd={totalUsd}
              submitting={submitting}
              onBack={() => setStep('amount')}
              onSend={handleSend}
            />
          )}
        </DialogContent>
      </Dialog>

      {success && (
        <SuccessScreen
          open
          onOpenChange={(nextOpen) => !nextOpen && setSuccess(null)}
          title="Sent successfully"
          description={`${formatCurrency(success.usdAmount)} of ${success.baseAsset} is on its way.`}
          rows={[
            {
              label: 'Amount',
              value: `${formatNumber(success.nativeAmount)} ${success.baseAsset}`,
            },
            { label: 'To', value: truncateAddress(success.address) },
            {
              label: 'Network',
              value: NETWORK_NAME[success.chain] || success.chain,
            },
          ]}
          actionLabel="Done"
        />
      )}
    </>
  )
}

function RecipientStep({
  wallets,
  wallet,
  walletId,
  setWalletId,
  lockAsset,
  address,
  setAddress,
  recent,
  addressValid,
  onContinue,
}: {
  wallets: WalletOption[]
  wallet?: WalletOption
  walletId: string
  setWalletId: (id: string) => void
  lockAsset: boolean
  address: string
  setAddress: (v: string) => void
  recent: RecentAddress[]
  addressValid: boolean
  onContinue: () => void
}) {
  return (
    <div>
      <DialogTitle>Send {wallet?.baseAsset}</DialogTitle>

      {!lockAsset && wallets.length > 1 && (
        <div className="mt-4">
          <Select value={walletId} onValueChange={setWalletId}>
            <SelectTrigger
              hideDefaultIcon
              className="h-auto w-full items-center justify-between gap-3 rounded-xl border border-border bg-transparent px-3 py-2.5"
            >
              <span className="flex min-w-0 items-center gap-2.5">
                {wallet && <CoinIcon logo={wallet.logo} baseAsset={wallet.baseAsset} iconBg={wallet.iconBg} size={28} />}
                <span className="truncate text-sm font-medium">{wallet?.baseAsset}</span>
              </span>
              <GlassIcon icon={ChevronRight} size={12} />
            </SelectTrigger>
            <SelectContent align="start">
              {wallets.map((w) => (
                <SelectItem key={w.id} value={w.id}>
                  <span className="flex items-center gap-2">
                    <CoinIcon logo={w.logo} baseAsset={w.baseAsset} iconBg={w.iconBg} size={20} />
                    {w.baseAsset} · {formatNumber(parseFloat(w.available))} available
                  </span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      <div className="mt-4">
        <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Send to</label>
        <Input value={address} onChange={(e) => setAddress(e.target.value)} placeholder="0x… or bc1… address" className="font-mono" />
      </div>

      {recent.length > 0 && (
        <div className="mt-5">
          <p className="text-2xs font-medium uppercase tracking-wide text-muted-foreground">Recent addresses</p>
          <div className="mt-2 divide-y divide-border">
            {recent.map((r) => (
              <button
                key={r.address}
                onClick={() => setAddress(r.address)}
                className="flex w-full items-center justify-between gap-3 py-2.5 text-left transition-colors hover:text-primary"
              >
                <span className="truncate font-mono text-xs">{truncateAddress(r.address)}</span>
                <span className="flex shrink-0 items-center gap-1 text-2xs text-muted-foreground">
                  <GlassIcon icon={Clock} size={10} /> {formatRelativeTime(r.requestedAt)}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      <Button disabled={!addressValid} onClick={onContinue} className="mt-6 w-full" size="lg">
        Continue
      </Button>
    </div>
  )
}

function AmountStep({
  wallet,
  usdAmount,
  setUsdAmount,
  availableUsd,
  feeNative,
  feeUsd,
  nativeAmount,
  amountValid,
  onBack,
  onMax,
  onContinue,
}: {
  wallet: WalletOption
  usdAmount: string
  setUsdAmount: (v: string) => void
  availableUsd: number
  feeNative: number
  feeUsd: number
  nativeAmount: number
  amountValid: boolean
  onBack: () => void
  onMax: () => void
  onContinue: () => void
}) {
  return (
    <div>
      <button onClick={onBack} aria-label="Back" className="text-muted-foreground transition-colors hover:text-foreground">
        <GlassIcon icon={ArrowLeft} size={14} />
      </button>

      <div className="mt-6 flex items-center justify-between gap-3">
        <div className="flex min-w-0 flex-1 items-baseline gap-2">
          <input
            value={usdAmount}
            onChange={(e) => setUsdAmount(e.target.value)}
            type="number"
            step="any"
            inputMode="decimal"
            placeholder="0"
            autoFocus
            className="min-w-0 flex-1 bg-transparent text-4xl font-semibold tracking-tight outline-none placeholder:text-foreground"
          />
          <span className="shrink-0 text-4xl font-semibold text-muted-foreground/40">USD</span>
        </div>
        <Button variant="subtle" size="sm" className="shrink-0 rounded-full" onClick={onMax}>
          Max
        </Button>
      </div>

      <div className="mt-1 text-sm text-muted-foreground">
        {formatNumber(nativeAmount)} {wallet.baseAsset}
      </div>

      <div className="mt-6 flex items-center justify-between border-y border-border py-4 text-sm">
        <span className="flex items-center gap-3 font-medium">
          <CoinIcon logo={wallet.logo} baseAsset={wallet.baseAsset} iconBg={wallet.iconBg} size={28} />
          {wallet.baseAsset}
        </span>
        <span className="text-right text-muted-foreground">{formatCurrency(availableUsd)} available</span>
      </div>

      <p className="mt-3 text-2xs text-muted-foreground">
        Network fee ~{formatNumber(feeNative)} {wallet.baseAsset} ({formatCurrency(feeUsd)})
      </p>

      <Button disabled={!amountValid} onClick={onContinue} className="mt-6 w-full" size="lg">
        Preview send
      </Button>
    </div>
  )
}

function ReviewStep({
  wallet,
  address,
  usdAmount,
  nativeAmount,
  feeUsd,
  totalUsd,
  submitting,
  onBack,
  onSend,
}: {
  wallet: WalletOption
  address: string
  usdAmount: number
  nativeAmount: number
  feeUsd: number
  totalUsd: number
  submitting: boolean
  onBack: () => void
  onSend: () => void
}) {
  return (
    <div>
      <button onClick={onBack} aria-label="Back" className="text-muted-foreground transition-colors hover:text-foreground">
        <GlassIcon icon={ArrowLeft} size={14} />
      </button>

      <div className="mt-4 flex flex-col items-center text-center">
        <CoinIcon logo={wallet.logo} baseAsset={wallet.baseAsset} iconBg={wallet.iconBg} size={48} />
        <h2 className="mt-4 text-xl font-semibold tracking-tight">
          Send {formatCurrency(usdAmount)} in {wallet.baseAsset}
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          {formatNumber(nativeAmount)} {wallet.baseAsset}
        </p>
      </div>

      <div className="mt-6 space-y-3 text-sm">
        <Row label="Send to" value={truncateAddress(address)} mono />
        <Row label="Network" value={NETWORK_NAME[wallet.chain] || wallet.chain} />
        <Row label="Send time" value={NETWORK_CONFIRM_TIME[wallet.chain] || '—'} />
      </div>

      <div className="mt-4 rounded-lg bg-muted px-4 py-3 text-xs text-muted-foreground">
        Remember to double-check these details. Crypto transactions are irreversible.
      </div>

      <div className="mt-4 flex items-center justify-between border-t border-border pt-4">
        <div>
          <div className="text-sm font-medium">Total</div>
          <div className="text-2xs text-muted-foreground">incl. ~{formatCurrency(feeUsd)} network fee</div>
        </div>
        <div className="text-base font-semibold tabular">{formatCurrency(totalUsd)}</div>
      </div>

      <Button onClick={onSend} disabled={submitting} className="mt-6 w-full" size="lg">
        {submitting ? 'Sending…' : 'Send now'}
      </Button>
    </div>
  )
}

function Row({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-muted-foreground">{label}</span>
      <span className={mono ? 'font-mono text-xs' : 'font-medium'}>{value}</span>
    </div>
  )
}
