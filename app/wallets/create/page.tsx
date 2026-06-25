'use client'
import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import Button from '../../../components/ui/Button'
import Input from '../../../components/ui/Input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../components/ui/Select'
import SuccessScreen from '../../../components/ui/SuccessScreen'
import { useSession } from '../../../lib/useSession'
import { WALLET_CHAINS } from '../../../lib/walletChains'
import { truncateAddress } from '../../../lib/utils'

export default function CreateWalletPage() {
  const router = useRouter()
  const { user, isLoading } = useSession()
  const [chain, setChain] = useState('bitcoin')
  const [label, setLabel] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [created, setCreated] = useState<{ chain: string; address: string } | null>(null)

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    if (!user) return
    setSubmitting(true)
    try {
      const res = await fetch('/api/wallets/create', {
        method: 'POST',
        body: JSON.stringify({ userId: user.id, chain, label: label || undefined }),
      })
      const data = await res.json()
      if (res.ok) {
        setCreated({ chain: data.chain, address: data.address })
      } else {
        toast.error(data.error || 'Could not create wallet')
      }
    } finally {
      setSubmitting(false)
    }
  }

  if (!isLoading && !user) {
    return <p className="py-20 text-center text-muted-foreground">Sign in to create a wallet.</p>
  }

  return (
    <div className="mx-auto max-w-md py-16">
      <h1 className="text-2xl font-semibold tracking-tight">Add a wallet</h1>
      <p className="mt-1 text-sm text-muted-foreground">Generate a new address for an additional chain.</p>

      <form onSubmit={handleCreate} className="mt-8 space-y-5">
        <div>
          <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Chain</label>
          <Select value={chain} onValueChange={setChain}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {WALLET_CHAINS.map((c) => (
                <SelectItem key={c.value} value={c.value}>
                  {c.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Label (optional)</label>
          <Input value={label} onChange={(e) => setLabel(e.target.value)} placeholder="My savings wallet" />
        </div>

        <Button type="submit" className="w-full" size="lg" disabled={submitting}>
          {submitting ? 'Creating…' : 'Create wallet'}
        </Button>
      </form>

      {created && (
        <SuccessScreen
          open
          onOpenChange={(next) => {
            if (!next) router.push('/wallets')
          }}
          title="Wallet created"
          description="Your new address is ready to receive funds."
          rows={[
            { label: 'Chain', value: WALLET_CHAINS.find((c) => c.value === created.chain)?.label || created.chain },
            { label: 'Address', value: truncateAddress(created.address) },
          ]}
          actionLabel="Done"
        />
      )}
    </div>
  )
}
