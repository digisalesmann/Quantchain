'use client'
import React, { useState } from 'react'
import { toast } from 'sonner'
import { KeyRound } from 'lucide-react'
import Button from '../ui/Button'
import GlassIcon from '../ui/GlassIcon'
import SuccessScreen from '../ui/SuccessScreen'
import { registerPasskey } from '../../lib/useWebAuthn'

export type Passkey = { id: string; createdAt: string; transports: string | null }

export default function PasskeysSection({ userId, initialPasskeys }: { userId: string; initialPasskeys: Passkey[] }) {
  const [passkeys, setPasskeys] = useState(initialPasskeys)
  const [busy, setBusy] = useState(false)
  const [added, setAdded] = useState(false)

  async function addPasskey() {
    setBusy(true)
    try {
      const result = await registerPasskey(userId)
      if (result.ok) {
        const res = await fetch(`/api/auth/webauthn/list?userId=${userId}`)
        const data = await res.json()
        setPasskeys(data.passkeys || [])
        setAdded(true)
      } else {
        toast.error(result.error || 'Could not register passkey')
      }
    } finally {
      setBusy(false)
    }
  }

  async function removePasskey(id: string) {
    setBusy(true)
    try {
      const res = await fetch('/api/auth/webauthn/delete', { method: 'POST', body: JSON.stringify({ userId, id }) })
      if (res.ok) {
        setPasskeys((prev) => prev.filter((p) => p.id !== id))
        toast.success('Passkey removed')
      }
    } finally {
      setBusy(false)
    }
  }

  return (
    <>
      <div>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-sm font-medium">Passkeys</p>
            <p className="mt-0.5 text-sm text-muted-foreground">
              Sign in with biometrics or a hardware security key instead of a password.
            </p>
          </div>
          <Button variant="outline" size="sm" onClick={addPasskey} disabled={busy}>
            Add passkey
          </Button>
        </div>

        {passkeys.length > 0 && (
          <ul className="mt-4 divide-y divide-border">
            {passkeys.map((p) => (
              <li key={p.id} className="flex items-center justify-between py-3 text-sm">
                <span className="flex items-center gap-2">
                  <GlassIcon icon={KeyRound} size={13} iconClassName="text-muted-foreground" />
                  Added {new Date(p.createdAt).toLocaleDateString()}
                </span>
                <button onClick={() => removePasskey(p.id)} className="text-xs font-medium text-muted-foreground hover:text-destructive">
                  Remove
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <SuccessScreen
        open={added}
        onOpenChange={setAdded}
        title="Passkey added"
        description="You can now sign in with biometrics or a hardware security key on this device."
        actionLabel="Done"
      />
    </>
  )
}
