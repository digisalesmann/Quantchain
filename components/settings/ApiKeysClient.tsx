'use client'
import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Check, Copy, Plus } from 'lucide-react'
import Button from '../ui/Button'
import Input from '../ui/Input'
import GlassIcon from '../ui/GlassIcon'
import Badge from '../ui/Badge'
import Checkbox from '../ui/Checkbox'
import { Table, THead, TBody, TR, TH, TD } from '../ui/Table'
import { Dialog, DialogTrigger, DialogContent, DialogTitle, DialogDescription } from '../ui/Dialog'

export type ApiKeyRow = { id: string; name: string; scopes: string; revoked: boolean; createdAt: string }

const AVAILABLE_SCOPES = ['read', 'trade']

export default function ApiKeysClient({ userId, initialKeys }: { userId: string; initialKeys: ApiKeyRow[] }) {
  const router = useRouter()
  const [keys, setKeys] = useState(initialKeys)
  const [createOpen, setCreateOpen] = useState(false)
  const [revealOpen, setRevealOpen] = useState(false)
  const [name, setName] = useState('')
  const [scopes, setScopes] = useState<string[]>(['read'])
  const [submitting, setSubmitting] = useState(false)
  const [plaintext, setPlaintext] = useState<{ key: string; secret: string } | null>(null)
  const [copied, setCopied] = useState<'key' | 'secret' | null>(null)

  function toggleScope(scope: string, checked: boolean) {
    setScopes((prev) => (checked ? [...prev, scope] : prev.filter((s) => s !== scope)))
  }

  async function handleCreate() {
    if (!name.trim()) {
      toast.error('Name your key')
      return
    }
    setSubmitting(true)
    try {
      const res = await fetch('/api/settings/api-keys', {
        method: 'POST',
        body: JSON.stringify({ userId, name: name.trim(), scopes })
      })
      const data = await res.json()
      if (!res.ok) {
        toast.error(data.error || 'Failed to create key')
        return
      }
      setKeys((prev) => [data.key, ...prev])
      setPlaintext(data.plaintext)
      setCreateOpen(false)
      setRevealOpen(true)
      setName('')
      setScopes(['read'])
    } finally {
      setSubmitting(false)
    }
  }

  async function handleRevoke(id: string) {
    const res = await fetch('/api/settings/api-keys/revoke', { method: 'POST', body: JSON.stringify({ userId, id }) })
    if (!res.ok) {
      toast.error('Failed to revoke key')
      return
    }
    setKeys((prev) => prev.map((k) => (k.id === id ? { ...k, revoked: true } : k)))
    toast.success('Key revoked')
    router.refresh()
  }

  function copy(value: string, which: 'key' | 'secret') {
    navigator.clipboard.writeText(value)
    setCopied(which)
    setTimeout(() => setCopied(null), 1500)
  }

  return (
    <div className="mt-8">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold tracking-tight">Your keys</h2>
        <Dialog open={createOpen} onOpenChange={setCreateOpen}>
          <DialogTrigger asChild>
            <Button size="sm">
              <GlassIcon icon={Plus} size={12} /> Create key
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogTitle>Create API key</DialogTitle>
            <DialogDescription>Choose a name and scopes for this key.</DialogDescription>
            <div className="mt-5 space-y-4">
              <div>
                <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Name</label>
                <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Trading bot" />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Scopes</label>
                <div className="space-y-2">
                  {AVAILABLE_SCOPES.map((scope) => (
                    <label key={scope} className="flex items-center gap-2 text-sm">
                      <Checkbox checked={scopes.includes(scope)} onCheckedChange={(v) => toggleScope(scope, v === true)} />
                      {scope}
                    </label>
                  ))}
                </div>
              </div>
            </div>
            <Button onClick={handleCreate} disabled={submitting} className="mt-6 w-full" size="lg">
              {submitting ? 'Creating…' : 'Create key'}
            </Button>
          </DialogContent>
        </Dialog>
      </div>

      <div className="mt-4">
        <Table>
          <THead>
            <TR>
              <TH>Name</TH>
              <TH>Scopes</TH>
              <TH>Created</TH>
              <TH>Status</TH>
              <TH align="right">&nbsp;</TH>
            </TR>
          </THead>
          <TBody>
            {keys.map((k) => (
              <TR key={k.id}>
                <TD className="font-medium">{k.name}</TD>
                <TD className="text-muted-foreground">{k.scopes}</TD>
                <TD className="text-muted-foreground">{new Date(k.createdAt).toLocaleDateString()}</TD>
                <TD>
                  <Badge variant={k.revoked ? 'neutral' : 'up'}>{k.revoked ? 'Revoked' : 'Active'}</Badge>
                </TD>
                <TD align="right">
                  {!k.revoked && (
                    <Button variant="ghost" size="sm" onClick={() => handleRevoke(k.id)} className="text-destructive">
                      Revoke
                    </Button>
                  )}
                </TD>
              </TR>
            ))}
            {keys.length === 0 && (
              <TR>
                <TD align="center" colSpan={5} className="py-8 text-muted-foreground">No API keys yet</TD>
              </TR>
            )}
          </TBody>
        </Table>
      </div>

      <Dialog open={revealOpen} onOpenChange={setRevealOpen}>
        <DialogContent>
          <DialogTitle>Save your key</DialogTitle>
          <DialogDescription>This is the only time your key and secret will be shown. Store them somewhere safe.</DialogDescription>
          {plaintext && (
            <div className="mt-5 space-y-3">
              <div>
                <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Key</label>
                <div className="flex items-center gap-2 rounded-md border border-border bg-muted px-3 py-2.5 font-mono text-xs">
                  <span className="min-w-0 flex-1 truncate">{plaintext.key}</span>
                  <button onClick={() => copy(plaintext.key, 'key')} className="shrink-0 text-muted-foreground hover:text-foreground">
                    <GlassIcon icon={copied === 'key' ? Check : Copy} size={12} />
                  </button>
                </div>
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Secret</label>
                <div className="flex items-center gap-2 rounded-md border border-border bg-muted px-3 py-2.5 font-mono text-xs">
                  <span className="min-w-0 flex-1 truncate">{plaintext.secret}</span>
                  <button onClick={() => copy(plaintext.secret, 'secret')} className="shrink-0 text-muted-foreground hover:text-foreground">
                    <GlassIcon icon={copied === 'secret' ? Check : Copy} size={12} />
                  </button>
                </div>
              </div>
            </div>
          )}
          <Button onClick={() => setRevealOpen(false)} className="mt-6 w-full" size="lg">
            Done
          </Button>
        </DialogContent>
      </Dialog>
    </div>
  )
}
