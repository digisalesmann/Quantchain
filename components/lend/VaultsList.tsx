'use client'
import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import Button from '../ui/Button'
import CoinIcon from '../market/CoinIcon'
import { Dialog, DialogContent } from '../ui/Dialog'
import StakeForm from './StakeForm'
import SuccessScreen from '../ui/SuccessScreen'

export type Product = { id: string; name: string; asset: string; apy: string; lockupDays: number; logo: string; iconBg: string }
export type WalletBalance = { chain: string; asset: string; available: string }

export default function VaultsList({ userId, products, wallets }: { userId: string; products: Product[]; wallets: WalletBalance[] }) {
  const router = useRouter()
  const [openId, setOpenId] = useState<string | null>(null)
  const [success, setSuccess] = useState<{ asset: string; amount: string; apy: string; lockupDays: number } | null>(null)

  if (products.length === 0) {
    return <p className="py-8 text-center text-sm text-muted-foreground">No staking products available yet.</p>
  }

  return (
    <div className="divide-y divide-border border-y border-border">
      {products.map((p) => {
        const wallet = wallets.find((w) => w.asset === p.asset)
        return (
          <div key={p.id} className="flex items-center justify-between gap-3 py-4">
            <div className="flex min-w-0 items-center gap-3">
              <CoinIcon logo={p.logo} baseAsset={p.asset} iconBg={p.iconBg} size={36} className="shrink-0" />
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold">{p.name}</p>
                <p className="truncate text-xs text-muted-foreground">
                  Earn up to <span className="text-up">{parseFloat(p.apy).toFixed(2)}%</span> · {p.lockupDays === 0 ? 'Flexible' : `${p.lockupDays}-day lock`}
                </p>
              </div>
            </div>
            <Button variant="outline" size="sm" className="shrink-0 rounded-full px-5" onClick={() => setOpenId(p.id)}>
              Stake
            </Button>
            <Dialog open={openId === p.id} onOpenChange={(open) => setOpenId(open ? p.id : null)}>
              <DialogContent>
                <StakeForm
                  userId={userId}
                  product={p}
                  available={wallet?.available || '0'}
                  onStaked={(amount) => {
                    setOpenId(null)
                    setSuccess({ asset: p.asset, amount, apy: p.apy, lockupDays: p.lockupDays })
                  }}
                />
              </DialogContent>
            </Dialog>
          </div>
        )
      })}

      {success && (
        <SuccessScreen
          open
          onOpenChange={(open) => {
            if (!open) {
              setSuccess(null)
              router.refresh()
            }
          }}
          title="Stake confirmed"
          description={`You staked ${success.amount} ${success.asset}.`}
          rows={[
            { label: 'APY', value: `${parseFloat(success.apy).toFixed(2)}%` },
            { label: 'Lockup', value: success.lockupDays === 0 ? 'Withdraw anytime' : `${success.lockupDays} days` }
          ]}
          actionLabel="Done"
        />
      )}
    </div>
  )
}
