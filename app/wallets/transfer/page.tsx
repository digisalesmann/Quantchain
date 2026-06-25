'use client'
import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import Button from '../../../components/ui/Button'
import Input from '../../../components/ui/Input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../components/ui/Select'
import SuccessScreen from '../../../components/ui/SuccessScreen'
import { useSession } from '../../../lib/useSession'

type Wallet = { id: string; chain: string; label: string | null; available: string }

export default function TransferPage() {
  const router = useRouter()
  const { user, isLoading } = useSession()
  const [wallets, setWallets] = useState<Wallet[]>([])
  const [fromWalletId, setFromWalletId] = useState('')
  const [toEmail, setToEmail] = useState('')
  const [amount, setAmount] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState<{ amount: string; chain: string; toEmail: string } | null>(null)

  useEffect(() => {
    if (!user) return
    fetch(`/api/wallets/list?userId=${user.id}`)
      .then((r) => r.json())
      .then((data) => {
        setWallets(data.wallets || [])
        if (data.wallets?.[0]) setFromWalletId(data.wallets[0].id)
      })
  }, [user])

  const selectedWallet = wallets.find((w) => w.id === fromWalletId)

  async function handleTransfer(e: React.FormEvent) {
    e.preventDefault()
    if (!user || !fromWalletId || !toEmail || !amount) {
      toast.error('Fill in all fields')
      return
    }
    setSubmitting(true)
    try {
      const res = await fetch('/api/wallets/transfer', {
        method: 'POST',
        body: JSON.stringify({ userId: user.id, fromWalletId, toEmail, amount }),
      })
      const data = await res.json()
      if (res.ok) {
        setSuccess({ amount, chain: selectedWallet?.chain || '', toEmail })
      } else {
        toast.error(data.error || 'Transfer failed')
      }
    } finally {
      setSubmitting(false)
    }
  }

  if (!isLoading && !user) {
    return <p className="py-20 text-center text-muted-foreground">Sign in to transfer funds.</p>
  }

  return (
    <div className="mx-auto max-w-md py-16">
      <h1 className="text-2xl font-semibold tracking-tight">Internal transfer</h1>
      <p className="mt-1 text-sm text-muted-foreground">Send crypto instantly to another Quantchain user, free of network fees.</p>

      <form onSubmit={handleTransfer} className="mt-8 space-y-5">
        <div>
          <label className="mb-1.5 block text-xs font-medium text-muted-foreground">From</label>
          <Select value={fromWalletId} onValueChange={setFromWalletId}>
            <SelectTrigger>
              <SelectValue placeholder="Select a wallet" />
            </SelectTrigger>
            <SelectContent>
              {wallets.map((w) => (
                <SelectItem key={w.id} value={w.id}>
                  {w.label || w.chain.toUpperCase()} · {w.available} available
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Recipient email</label>
          <Input value={toEmail} onChange={(e) => setToEmail(e.target.value)} type="email" placeholder="friend@example.com" />
        </div>

        <div>
          <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Amount</label>
          <Input value={amount} onChange={(e) => setAmount(e.target.value)} type="number" step="any" placeholder="0.00" />
          {selectedWallet && <p className="mt-1.5 text-2xs text-muted-foreground">{selectedWallet.available} available</p>}
        </div>

        <Button type="submit" className="w-full" size="lg" disabled={submitting}>
          {submitting ? 'Sending…' : 'Send transfer'}
        </Button>
      </form>

      {success && (
        <SuccessScreen
          open
          onOpenChange={(next) => {
            if (!next) router.push('/wallets')
          }}
          title="Transfer completed"
          description={`Sent to ${success.toEmail}, free of network fees.`}
          rows={[
            { label: 'Amount', value: `${success.amount} ${success.chain.toUpperCase()}` },
            { label: 'To', value: success.toEmail },
          ]}
          actionLabel="Done"
        />
      )}
    </div>
  )
}
