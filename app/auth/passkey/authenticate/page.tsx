'use client'
import React, { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import Button from '../../../../components/ui/Button'
import Input from '../../../../components/ui/Input'
import { authenticateWithPasskey } from '../../../../lib/useWebAuthn'
import { useSession } from '../../../../lib/useSession'

export default function PasskeyAuthPage() {
  const router = useRouter()
  const { mutate } = useSession()
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleAuth(e: React.FormEvent) {
    e.preventDefault()
    if (!email) return
    setLoading(true)
    try {
      const result = await authenticateWithPasskey(email)
      if (result.ok) {
        await mutate()
        router.push('/')
      } else {
        toast.error(result.error || 'Could not authenticate')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mx-auto max-w-sm py-20">
      <h1 className="text-2xl font-semibold tracking-tight">Sign in with a passkey</h1>
      <p className="mt-1 text-sm text-muted-foreground">Use your device&rsquo;s biometrics or security key.</p>

      <form onSubmit={handleAuth} className="mt-8 space-y-4">
        <Input value={email} onChange={(e) => setEmail(e.target.value)} type="email" placeholder="you@example.com" autoFocus required />
        <Button type="submit" className="w-full" size="lg" disabled={loading}>
          {loading ? 'Waiting for device…' : 'Continue with passkey'}
        </Button>
      </form>

      <p className="mt-8 text-center text-sm text-muted-foreground">
        Prefer a password?{' '}
        <Link href="/auth/login" className="font-medium text-foreground underline-offset-4 hover:underline">
          Sign in
        </Link>
      </p>
    </div>
  )
}
