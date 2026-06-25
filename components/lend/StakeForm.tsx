'use client'
import React, { useState } from 'react'
import { toast } from 'sonner'
import Button from '../ui/Button'
import Input from '../ui/Input'
import { DialogTitle, DialogDescription } from '../ui/Dialog'
import { formatNumber } from '../../lib/utils'

export type StakeProduct = { id: string; asset: string; apy: string; lockupDays: number }

export default function StakeForm({
  userId,
  product,
  available,
  onStaked
}: {
  userId: string
  product: StakeProduct
  available: string
  onStaked: (amount: string) => void
}) {
  const [amount, setAmount] = useState('')
  const [submitting, setSubmitting] = useState(false)

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setSubmitting(true)
    try {
      const res = await fetch('/api/staking/open', {
        method: 'POST',
        body: JSON.stringify({ userId, productId: product.id, amount })
      })
      const data = await res.json()
      if (!res.ok) {
        toast.error(data.error || 'Could not open position')
      } else {
        onStaked(formatNumber(parseFloat(amount)))
        setAmount('')
      }
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      <DialogTitle>Stake {product.asset}</DialogTitle>
      <DialogDescription>
        Earn {parseFloat(product.apy).toFixed(2)}% APY. {product.lockupDays === 0 ? 'Withdraw anytime.' : `Locked for ${product.lockupDays} days.`}
      </DialogDescription>
      <div>
        <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Amount ({product.asset})</label>
        <Input value={amount} onChange={(e) => setAmount(e.target.value)} type="number" step="any" placeholder="0.00" />
        <p className="mt-1.5 text-2xs text-muted-foreground">{formatNumber(parseFloat(available))} available</p>
      </div>
      <Button type="submit" className="w-full" disabled={submitting}>
        {submitting ? 'Staking…' : `Stake ${product.asset}`}
      </Button>
    </form>
  )
}
