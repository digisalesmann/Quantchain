'use client'
import React, { Suspense, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { toast } from 'sonner'
import Button from '../../../../components/ui/Button'
import Input from '../../../../components/ui/Input'
import { useSession } from '../../../../lib/useSession'

function VerifyForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { mutate } = useSession()
  const userId = searchParams.get('uid') || ''
  const [token, setToken] = useState('')
  const [submitting, setSubmitting] = useState(false)

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setSubmitting(true)
    try {
      const res = await fetch('/api/auth/totp/login', { method: 'POST', body: JSON.stringify({ userId, token }) })
      const data = await res.json()
      if (!res.ok) {
        toast.error(data.error || 'Invalid code')
        return
      }
      await mutate()
      router.push('/')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="mx-auto max-w-sm py-20">
      <h1 className="text-2xl font-semibold tracking-tight">Two-factor authentication</h1>
      <p className="mt-1 text-sm text-muted-foreground">Enter the 6-digit code from your authenticator app.</p>

      <form onSubmit={submit} className="mt-8 space-y-4">
        <Input
          value={token}
          onChange={(e) => setToken(e.target.value)}
          inputMode="numeric"
          maxLength={6}
          placeholder="000000"
          className="text-center text-lg tracking-[0.5em]"
          autoFocus
        />
        <Button type="submit" className="w-full" size="lg" disabled={submitting || token.length < 6}>
          {submitting ? 'Verifying…' : 'Verify'}
        </Button>
      </form>
    </div>
  )
}

export default function TotpVerifyPage() {
  return (
    <Suspense>
      <VerifyForm />
    </Suspense>
  )
}
