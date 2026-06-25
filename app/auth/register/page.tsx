'use client'
import React, { useMemo, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Check, X } from 'lucide-react'
import Button from '../../../components/ui/Button'
import Input from '../../../components/ui/Input'
import Divider from '../../../components/ui/Divider'
import Checkbox from '../../../components/ui/Checkbox'
import GoogleIcon from '../../../components/icons/GoogleIcon'
import GlassIcon from '../../../components/ui/GlassIcon'
import { cn } from '../../../lib/utils'
import { useSession } from '../../../lib/useSession'

const PASSWORD_RULES = [
  { label: 'At least 8 characters', test: (v: string) => v.length >= 8 },
  { label: 'One uppercase letter', test: (v: string) => /[A-Z]/.test(v) },
  { label: 'One number', test: (v: string) => /[0-9]/.test(v) }
]

export default function RegisterPage() {
  const router = useRouter()
  const { mutate } = useSession()
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [termsAccepted, setTermsAccepted] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const passwordChecks = useMemo(() => PASSWORD_RULES.map((rule) => ({ ...rule, met: rule.test(password) })), [password])
  const passwordValid = passwordChecks.every((c) => c.met)
  const passwordsMatch = confirmPassword.length > 0 && password === confirmPassword

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    if (!fullName.trim()) {
      toast.error('Enter your full name')
      return
    }
    if (!passwordValid) {
      toast.error('Password does not meet the requirements')
      return
    }
    if (!passwordsMatch) {
      toast.error('Passwords do not match')
      return
    }
    if (!termsAccepted) {
      toast.error('You must agree to the Terms of Service')
      return
    }
    setSubmitting(true)
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        body: JSON.stringify({ fullName, email, password, confirmPassword, termsAccepted })
      })
      const data = await res.json()
      if (!res.ok) {
        toast.error(data.error || 'Could not create account')
        return
      }
      await mutate()
      toast.success('Welcome to Quantchain')
      router.push('/onboarding')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="mx-auto max-w-sm py-20">
      <h1 className="text-4xl font-semibold tracking-tight">Create your account</h1>
      <p className="mt-3 text-muted-foreground">Access all that Quantchain has to offer with a single account.</p>

      <form onSubmit={submit} className="mt-8 space-y-4">
        <div>
          <label className="mb-1.5 block text-sm font-medium">Full name</label>
          <Input
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            type="text"
            autoComplete="name"
            placeholder="Your full name"
            required
            className="h-12 rounded-xl"
          />
        </div>
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
            autoComplete="new-password"
            placeholder="Your password"
            minLength={8}
            required
            className="h-12 rounded-xl"
          />
          <ul className="mt-2 space-y-1">
            {passwordChecks.map((rule) => (
              <li
                key={rule.label}
                className={cn('flex items-center gap-1.5 text-2xs', rule.met ? 'text-up' : 'text-muted-foreground')}
              >
                <GlassIcon icon={rule.met ? Check : X} size={11} />
                {rule.label}
              </li>
            ))}
          </ul>
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium">Confirm password</label>
          <Input
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            type="password"
            autoComplete="new-password"
            placeholder="Re-enter your password"
            required
            className={cn('h-12 rounded-xl', confirmPassword.length > 0 && !passwordsMatch && 'border-destructive focus-visible:ring-destructive')}
          />
          {confirmPassword.length > 0 && !passwordsMatch && (
            <p className="mt-1.5 text-2xs text-destructive">Passwords do not match</p>
          )}
        </div>

        <label className="flex items-start gap-2.5 pt-1">
          <Checkbox checked={termsAccepted} onCheckedChange={(v) => setTermsAccepted(v === true)} className="mt-0.5" />
          <span className="text-sm text-muted-foreground">
            I certify that I am over 18 and agree to the{' '}
            <Link href="/legal/terms" className="font-medium text-foreground underline-offset-4 hover:underline">Terms of Service</Link>{' '}
            and{' '}
            <Link href="/legal/privacy" className="font-medium text-foreground underline-offset-4 hover:underline">Privacy Policy</Link>.
          </span>
        </label>

        <Button type="submit" className="w-full" size="lg" disabled={submitting}>
          {submitting ? 'Creating account…' : 'Continue'}
        </Button>
      </form>

      <div className="my-6 flex items-center gap-3">
        <Divider className="flex-1" />
        <span className="text-2xs font-medium text-muted-foreground">OR</span>
        <Divider className="flex-1" />
      </div>

      <Button asChild variant="subtle" className="w-full justify-start px-5" size="lg">
        <a href="/api/auth/google/start">
          <GlassIcon size={16}><GoogleIcon size={14} /></GlassIcon> Sign up with Google
        </a>
      </Button>

      <p className="mt-8 text-center text-sm text-muted-foreground">
        Already have an account?{' '}
        <Link href="/auth/login" className="font-medium text-foreground underline-offset-4 hover:underline">
          Sign in
        </Link>
      </p>
    </div>
  )
}
