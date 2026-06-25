'use client'
import React, { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { ArrowLeft, Check, Eye, EyeOff } from 'lucide-react'
import Button from '../../../../components/ui/Button'
import Input from '../../../../components/ui/Input'
import GlassIcon from '../../../../components/ui/GlassIcon'
import SuccessScreen from '../../../../components/ui/SuccessScreen'
import { useSession } from '../../../../lib/useSession'
import { cn } from '../../../../lib/utils'

const RULES = [
  { label: 'A minimum of 8 characters', test: (v: string) => v.length >= 8 },
  { label: 'Uppercase and lowercase letters', test: (v: string) => /[a-z]/.test(v) && /[A-Z]/.test(v) },
  { label: 'Must include a number', test: (v: string) => /\d/.test(v) },
  { label: 'At least 1 symbol', test: (v: string) => /[^a-zA-Z0-9]/.test(v) },
]

export default function ChangePasswordPage() {
  const router = useRouter()
  const { user } = useSession()
  const [current, setCurrent] = useState('')
  const [next, setNext] = useState('')
  const [confirm, setConfirm] = useState('')
  const [showNext, setShowNext] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)

  const rulesPassed = RULES.every((r) => r.test(next))
  const canSave = current.length > 0 && rulesPassed && next === confirm && confirm.length > 0

  async function handleSave() {
    if (!user) return
    setSubmitting(true)
    try {
      const res = await fetch('/api/auth/change-password', {
        method: 'POST',
        body: JSON.stringify({ userId: user.id, currentPassword: current, newPassword: next }),
      })
      const data = await res.json()
      if (!res.ok) {
        toast.error(data.error || 'Could not change password')
        return
      }
      setSuccess(true)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="mx-auto max-w-md py-10">
      <Link
        href="/account/security"
        aria-label="Back"
        className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-muted text-muted-foreground transition-colors hover:text-foreground"
      >
        <GlassIcon icon={ArrowLeft} size={16} />
      </Link>

      <h1 className="mt-6 text-2xl font-semibold tracking-tight">Change password</h1>

      <div className="mt-8 space-y-6">
        <div>
          <label className="mb-1.5 block text-sm font-medium">Current password</label>
          <Input type="password" value={current} onChange={(e) => setCurrent(e.target.value)} placeholder="Current password" />
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium">New password</label>
          <div className="relative">
            <Input
              type={showNext ? 'text' : 'password'}
              value={next}
              onChange={(e) => setNext(e.target.value)}
              placeholder="New password"
            />
            <button
              type="button"
              onClick={() => setShowNext((v) => !v)}
              aria-label={showNext ? 'Hide password' : 'Show password'}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <GlassIcon icon={showNext ? EyeOff : Eye} size={14} />
            </button>
          </div>

          <ul className="mt-3 space-y-1.5">
            {RULES.map((rule) => {
              const passed = rule.test(next)
              return (
                <li
                  key={rule.label}
                  className={cn('flex items-center gap-2 text-sm', passed ? 'text-foreground' : 'text-muted-foreground')}
                >
                  <GlassIcon icon={Check} size={10} iconClassName={passed ? 'text-up' : 'text-muted-foreground/40'} />
                  {rule.label}
                </li>
              )
            })}
          </ul>
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium">Confirm new password</label>
          <div className="relative">
            <Input
              type={showConfirm ? 'text' : 'password'}
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              placeholder="Confirm new password"
            />
            <button
              type="button"
              onClick={() => setShowConfirm((v) => !v)}
              aria-label={showConfirm ? 'Hide password' : 'Show password'}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <GlassIcon icon={showConfirm ? EyeOff : Eye} size={14} />
            </button>
          </div>
        </div>

        <Button onClick={handleSave} disabled={!canSave || submitting} className="w-full" size="lg">
          {submitting ? 'Saving…' : 'Save'}
        </Button>
      </div>

      <SuccessScreen
        open={success}
        onOpenChange={(next) => {
          if (!next) router.push('/account/security')
        }}
        title="Password updated"
        description="Use your new password the next time you sign in."
        actionLabel="Done"
      />
    </div>
  )
}
