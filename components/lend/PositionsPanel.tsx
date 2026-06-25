'use client'
import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Plus } from 'lucide-react'
import Button from '../ui/Button'
import Badge from '../ui/Badge'
import GlassIcon from '../ui/GlassIcon'
import CoinIcon from '../market/CoinIcon'
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '../ui/Dialog'
import SuccessScreen from '../ui/SuccessScreen'
import { formatCurrency, formatNumber } from '../../lib/utils'

export type Position = {
  id: string
  productName: string
  asset: string
  apy: string
  amount: string
  rewardUsd: number
  startedAt: string
  endsAt: string
  logo: string
  iconBg: string
}

export default function PositionsPanel({ userId, positions }: { userId: string; positions: Position[] }) {
  const router = useRouter()
  const [confirmingId, setConfirmingId] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState<{ asset: string; payout: number; reward: number } | null>(null)

  const confirming = positions.find((p) => p.id === confirmingId) ?? null

  async function confirmUnstake() {
    if (!confirming) return
    setSubmitting(true)
    try {
      const res = await fetch('/api/staking/close', { method: 'POST', body: JSON.stringify({ userId, positionId: confirming.id }) })
      const data = await res.json()
      if (!res.ok) {
        toast.error(data.error || 'Could not unstake')
      } else {
        setConfirmingId(null)
        setSuccess({ asset: confirming.asset, payout: data.payout, reward: data.reward })
      }
    } finally {
      setSubmitting(false)
    }
  }

  if (positions.length === 0) {
    return (
      <Button asChild variant="subtle" className="w-full justify-start px-4">
        <a href="#vaults">
          <GlassIcon icon={Plus} size={13} /> Stake
        </a>
      </Button>
    )
  }

  return (
    <div>
      <h2 className="mb-4 text-sm font-semibold tracking-tight text-muted-foreground">Your positions</h2>
      <div className="divide-y divide-border border-y border-border">
        {positions.map((pos) => {
          const unlocked = new Date(pos.endsAt).getTime() <= Date.now()
          return (
            <div key={pos.id} className="flex items-center justify-between gap-3 py-4">
              <div className="flex min-w-0 items-center gap-3">
                <CoinIcon logo={pos.logo} baseAsset={pos.asset} iconBg={pos.iconBg} size={32} className="shrink-0" />
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="truncate text-sm font-semibold">{pos.productName}</span>
                    <Badge variant={unlocked ? 'up' : 'neutral'} className="shrink-0">
                      {unlocked ? 'Unlocked' : new Date(pos.endsAt).toLocaleDateString()}
                    </Badge>
                  </div>
                  <div className="mt-0.5 truncate text-xs text-muted-foreground">
                    {formatNumber(parseFloat(pos.amount))} {pos.asset} &middot;{' '}
                    <span className="text-up">{formatCurrency(pos.rewardUsd)} reward</span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => setConfirmingId(pos.id)}
                className="shrink-0 text-xs font-medium text-muted-foreground transition-colors hover:text-destructive"
              >
                Unstake
              </button>
            </div>
          )
        })}
      </div>

      <Dialog open={!!confirming} onOpenChange={(open) => !open && setConfirmingId(null)}>
        <DialogContent>
          {confirming && (
            <>
              <DialogTitle>Unstake {confirming.asset}</DialogTitle>
              <DialogDescription>
                {new Date(confirming.endsAt).getTime() <= Date.now()
                  ? 'This position is unlocked — your principal and accrued reward will be returned to your wallet.'
                  : "You're unstaking before the lock period ends. Your principal and reward accrued so far will still be returned."}
              </DialogDescription>

              <div className="mt-5 flex items-center gap-3 rounded-xl border border-border p-4">
                <CoinIcon logo={confirming.logo} baseAsset={confirming.asset} iconBg={confirming.iconBg} size={32} />
                <div className="min-w-0">
                  <p className="text-sm font-semibold">{confirming.productName}</p>
                  <p className="text-xs text-muted-foreground">
                    {formatNumber(parseFloat(confirming.amount))} {confirming.asset} staked
                  </p>
                </div>
              </div>

              <div className="mt-4 space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Reward accrued</span>
                  <span className="font-medium text-up">{formatCurrency(confirming.rewardUsd)}</span>
                </div>
              </div>

              <div className="mt-6 flex gap-3">
                <Button variant="outline" className="w-full" onClick={() => setConfirmingId(null)} disabled={submitting}>
                  Cancel
                </Button>
                <Button variant="destructive" className="w-full" onClick={confirmUnstake} disabled={submitting}>
                  {submitting ? 'Unstaking…' : 'Confirm unstake'}
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {success && (
        <SuccessScreen
          open
          onOpenChange={(open) => {
            if (!open) {
              setSuccess(null)
              router.refresh()
            }
          }}
          title="Unstaked successfully"
          description={`Your ${success.asset} has been returned to your wallet.`}
          rows={[
            { label: 'Total payout', value: `${formatNumber(success.payout)} ${success.asset}` },
            { label: 'Reward earned', value: `${formatNumber(success.reward)} ${success.asset}` }
          ]}
          actionLabel="Done"
        />
      )}
    </div>
  )
}
