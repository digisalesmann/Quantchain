'use client'
import React, { useState } from 'react'
import { toast } from 'sonner'
import Button from '../ui/Button'
import Input from '../ui/Input'
import Badge from '../ui/Badge'
import SuccessScreen from '../ui/SuccessScreen'

export default function TwoFactorSection({ userId, initialEnabled }: { userId: string; initialEnabled: boolean }) {
  const [enabled, setEnabled] = useState(initialEnabled)
  const [setupSecret, setSetupSecret] = useState<string | null>(null)
  const [token, setToken] = useState('')
  const [busy, setBusy] = useState(false)
  const [showEnabled, setShowEnabled] = useState(false)

  async function startSetup() {
    setBusy(true)
    try {
      const res = await fetch('/api/auth/totp/setup', { method: 'POST', body: JSON.stringify({ userId }) })
      const data = await res.json()
      if (res.ok) setSetupSecret(data.base32)
      else toast.error(data.error || 'Could not start setup')
    } finally {
      setBusy(false)
    }
  }

  async function confirmSetup(e: React.FormEvent) {
    e.preventDefault()
    setBusy(true)
    try {
      const res = await fetch('/api/auth/totp/verify', { method: 'POST', body: JSON.stringify({ userId, token }) })
      const data = await res.json()
      if (res.ok) {
        setEnabled(true)
        setSetupSecret(null)
        setToken('')
        setShowEnabled(true)
      } else {
        toast.error(data.error || 'Invalid code')
      }
    } finally {
      setBusy(false)
    }
  }

  async function disable() {
    setBusy(true)
    try {
      await fetch('/api/auth/totp/disable', { method: 'POST', body: JSON.stringify({ userId }) })
      setEnabled(false)
      toast.success('Two-factor authentication disabled')
    } finally {
      setBusy(false)
    }
  }

  return (
    <>
      <div>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-sm font-medium">Authenticator app</p>
            <p className="mt-0.5 text-sm text-muted-foreground">Require a 6-digit code from an authenticator app when signing in.</p>
          </div>
          {enabled ? <Badge variant="up">Enabled</Badge> : <Badge variant="neutral">Disabled</Badge>}
        </div>

        <div className="mt-4">
          {enabled ? (
            <Button variant="outline" size="sm" onClick={disable} disabled={busy}>
              Disable 2FA
            </Button>
          ) : setupSecret ? (
            <form onSubmit={confirmSetup} className="max-w-sm space-y-3">
              <p className="text-xs text-muted-foreground">Add this key to your authenticator app, then enter the generated code.</p>
              <div className="break-all rounded-md border border-border bg-muted px-3 py-2 font-mono text-xs">{setupSecret}</div>
              <Input value={token} onChange={(e) => setToken(e.target.value)} placeholder="123456" inputMode="numeric" maxLength={6} />
              <Button type="submit" size="sm" disabled={busy || token.length < 6}>
                Confirm & enable
              </Button>
            </form>
          ) : (
            <Button variant="outline" size="sm" onClick={startSetup} disabled={busy}>
              Set up 2FA
            </Button>
          )}
        </div>
      </div>

      <SuccessScreen
        open={showEnabled}
        onOpenChange={setShowEnabled}
        title="Two-factor authentication enabled"
        description="Your account now requires a 6-digit code from your authenticator app when signing in."
        actionLabel="Done"
      />
    </>
  )
}
