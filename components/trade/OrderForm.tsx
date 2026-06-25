'use client'
import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { toast } from 'sonner'
import Button from '../ui/Button'
import Input from '../ui/Input'
import { Tabs, TabsList, TabsTrigger } from '../ui/Tabs'
import SuccessScreen from '../ui/SuccessScreen'
import { useSession } from '../../lib/useSession'
import { cn } from '../../lib/utils'

export default function OrderForm({
  marketId,
  baseAsset,
  quoteAsset,
  currentPrice,
  defaultSide = 'BUY',
  onOrderPlaced,
}: {
  marketId: string
  baseAsset: string
  quoteAsset: string
  currentPrice: number
  defaultSide?: 'BUY' | 'SELL'
  onOrderPlaced?: () => void
}) {
  const { user } = useSession()
  const [side, setSide] = useState<'BUY' | 'SELL'>(defaultSide)
  const [type, setType] = useState<'LIMIT' | 'MARKET'>('LIMIT')
  const [price, setPrice] = useState(currentPrice.toString())
  const [amount, setAmount] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState<{ side: 'BUY' | 'SELL'; amount: string; trades?: number } | null>(null)

  useEffect(() => {
    setSide(defaultSide)
  }, [defaultSide])

  useEffect(() => {
    setPrice(currentPrice.toString())
  }, [currentPrice, marketId])

  const total = type === 'LIMIT' ? parseFloat(price || '0') * parseFloat(amount || '0') || 0 : null

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    if (!user) return
    if (!amount || parseFloat(amount) <= 0) {
      toast.error('Enter a valid amount')
      return
    }

    setSubmitting(true)
    try {
      const res = await fetch('/api/orders/place', {
        method: 'POST',
        body: JSON.stringify({
          userId: user.id,
          marketId,
          side,
          type,
          price: type === 'LIMIT' ? price : undefined,
          amount,
        }),
      })
      const data = await res.json()
      if (!res.ok) {
        toast.error(data.error || 'Order failed')
      } else {
        setSuccess({ side, amount, trades: data.trades })
        setAmount('')
        onOrderPlaced?.()
      }
    } catch {
      toast.error('Network error')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <>
      <form onSubmit={submit} className="space-y-4">
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => setSide('BUY')}
            className={cn(
              'rounded-md py-2 text-sm font-semibold transition-colors',
              side === 'BUY' ? 'bg-up text-up-foreground' : 'bg-muted text-muted-foreground hover:text-foreground',
            )}
          >
            Buy
          </button>
          <button
            type="button"
            onClick={() => setSide('SELL')}
            className={cn(
              'rounded-md py-2 text-sm font-semibold transition-colors',
              side === 'SELL' ? 'bg-down text-down-foreground' : 'bg-muted text-muted-foreground hover:text-foreground',
            )}
          >
            Sell
          </button>
        </div>

        <Tabs value={type} onValueChange={(v) => setType(v as 'LIMIT' | 'MARKET')}>
          <TabsList className="w-full">
            <TabsTrigger value="LIMIT" className="flex-1">
              Limit
            </TabsTrigger>
            <TabsTrigger value="MARKET" className="flex-1">
              Market
            </TabsTrigger>
          </TabsList>
        </Tabs>

        {type === 'LIMIT' && (
          <div>
            <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Price ({quoteAsset})</label>
            <Input value={price} onChange={(e) => setPrice(e.target.value)} type="number" step="any" inputMode="decimal" />
          </div>
        )}

        <div>
          <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Amount ({baseAsset})</label>
          <Input
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            type="number"
            step="any"
            inputMode="decimal"
            placeholder="0.00"
          />
        </div>

        {total !== null && (
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Total</span>
            <span className="tabular">
              {total.toLocaleString(undefined, { maximumFractionDigits: 2 })} {quoteAsset}
            </span>
          </div>
        )}

        {user ? (
          <Button type="submit" variant={side === 'BUY' ? 'up' : 'down'} className="w-full" size="lg" disabled={submitting}>
            {submitting ? 'Placing order…' : `${side === 'BUY' ? 'Buy' : 'Sell'} ${baseAsset}`}
          </Button>
        ) : (
          <Button asChild className="w-full" size="lg" variant="outline">
            <Link href="/auth/login">Sign in to trade</Link>
          </Button>
        )}
      </form>

      {success && (
        <SuccessScreen
          open
          onOpenChange={(nextOpen) => !nextOpen && setSuccess(null)}
          title={success.side === 'SELL' ? 'Sold successfully' : 'Bought successfully'}
          description={`${success.amount} ${baseAsset} ${success.side === 'SELL' ? 'sold' : 'bought'}.`}
          rows={success.trades ? [{ label: 'Trades filled', value: String(success.trades) }] : [{ label: 'Status', value: 'Order placed' }]}
          actionLabel="Done"
        />
      )}
    </>
  )
}
