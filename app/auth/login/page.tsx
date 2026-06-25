'use client'
import React, { Suspense, useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { toast } from 'sonner'
import { KeyRound } from 'lucide-react'
import Button from '../../../components/ui/Button'
import Input from '../../../components/ui/Input'
import Divider from '../../../components/ui/Divider'
import GoogleIcon from '../../../components/icons/GoogleIcon'
import GlassIcon from '../../../components/ui/GlassIcon'
import { useSession } from '../../../lib/useSession'

const OAUTH_ERRORS: Record<string, string> = {
  oauth_failed: 'Could not sign in with Google. Please try again.',
  oauth_email_unverified: 'Your Google email is not verified.'
}

function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { mutate } = useSession()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    const error = searchParams.get('error')
    if (error) toast.error(OAUTH_ERRORS[error] || 'Something went wrong')
  }, [searchParams])

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setSubmitting(true)
    try {
      const res = await fetch('/api/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) })
      const data = await res.json()
      if (!res.ok) {
        toast.error(data.error || 'Could not sign in')
        return
      }
      if (data.requiresTotp) {
        router.push(`/auth/totp/verify?uid=${data.userId}`)
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
      <h1 className="text-4xl font-semibold tracking-tight">Sign in to Quantchain</h1>

      <form onSubmit={submit} className="mt-10 space-y-4">
        <div>
          <label className="mb-1.5 block text-sm font-medium">Email</label>
          <Input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            type="email"
            autoComplete="email"
            placeholder="Your email address"
            required
            className="h-12 rounded-xl"
          />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium">Password</label>
          <Input
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            type="password"
            autoComplete="current-password"
            placeholder="Your password"
            required
            className="h-12 rounded-xl"
          />
        </div>
        <Button type="submit" className="w-full" size="lg" disabled={submitting}>
          {submitting ? 'Signing in…' : 'Continue'}
        </Button>
      </form>

      <div className="my-6 flex items-center gap-3">
        <Divider className="flex-1" />
        <span className="text-2xs font-medium text-muted-foreground">OR</span>
        <Divider className="flex-1" />
      </div>

      <div className="space-y-3">
        <Button asChild variant="subtle" className="w-full justify-start px-5" size="lg">
          <Link href="/auth/passkey/authenticate">
            <GlassIcon icon={KeyRound} size={16} /> Sign in with passkey
          </Link>
        </Button>
        <Button asChild variant="subtle" className="w-full justify-start px-5" size="lg">
          <a href="/api/auth/google/start">
            <GlassIcon size={16}><GoogleIcon size={14} /></GlassIcon> Sign in with Google
          </a>
        </Button>
      </div>

      <p className="mt-8 text-center text-sm text-muted-foreground">
        Don&rsquo;t have an account?{' '}
        <Link href="/auth/register" className="font-medium text-foreground underline-offset-4 hover:underline">
          Sign up
        </Link>
      </p>

      <p className="mt-3 text-center text-2xs text-muted-foreground">
        Demo login: demo@quantchain.exchange / Demo1234!
      </p>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  )
}
