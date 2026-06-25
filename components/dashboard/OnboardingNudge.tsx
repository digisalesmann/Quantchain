'use client'
import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { ArrowRight, Sparkles, X } from 'lucide-react'
import GlassIcon from '../ui/GlassIcon'

const DISMISS_KEY = 'onboarding_nudge_dismissed'

export default function OnboardingNudge() {
  const [dismissed, setDismissed] = useState(true)

  useEffect(() => {
    setDismissed(localStorage.getItem(DISMISS_KEY) === '1')
  }, [])

  if (dismissed) return null

  return (
    <div className="mb-8 flex flex-col gap-2 border-b border-border pb-4 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
      <Link href="/onboarding" className="flex min-w-0 items-center gap-3">
        <GlassIcon icon={Sparkles} size={16} className="shrink-0" />
        <span className="min-w-0 text-sm">
          <span className="block font-medium">Finish setting up your account</span>
          <span className="block text-muted-foreground">Add your profile and security details</span>
        </span>
      </Link>
      <div className="flex shrink-0 items-center gap-3 pl-8 sm:pl-0">
        <Link href="/onboarding" className="flex items-center gap-1 text-sm font-medium text-primary hover:underline">
          Continue
          <GlassIcon icon={ArrowRight} size={11} />
        </Link>
        <button
          onClick={() => {
            localStorage.setItem(DISMISS_KEY, '1')
            setDismissed(true)
          }}
          className="text-muted-foreground transition-colors hover:text-foreground"
        >
          <GlassIcon icon={X} size={12} />
        </button>
      </div>
    </div>
  )
}
