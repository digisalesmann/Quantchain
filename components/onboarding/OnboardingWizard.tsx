'use client'
import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { ArrowLeft, BadgeCheck, CandlestickChart, Check, PiggyBank, ShieldCheck, type LucideIcon } from 'lucide-react'
import Image from 'next/image'
import Button from '../ui/Button'
import Input from '../ui/Input'
import GlassIcon from '../ui/GlassIcon'
import Stepper from '../ui/Stepper'
import Badge from '../ui/Badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/Select'
import TwoFactorSection from '../security/TwoFactorSection'

const STEP_LABELS = ['Welcome', 'Profile', 'Identity', 'Security', 'Done']

type KycStatus = 'PENDING' | 'VERIFIED' | 'REJECTED' | null

export default function OnboardingWizard({
  userId,
  email,
  initialFullName,
  initialCountry,
  initialPhone,
  initialKycStatus,
  initialTotpEnabled
}: {
  userId: string
  email: string
  initialFullName: string
  initialCountry: string
  initialPhone: string
  initialKycStatus: KycStatus
  initialTotpEnabled: boolean
}) {
  const router = useRouter()
  const [step, setStep] = useState(0)
  const [fullName, setFullName] = useState(initialFullName)
  const [country, setCountry] = useState(initialCountry)
  const [phone, setPhone] = useState(initialPhone)
  const [kycStatus, setKycStatus] = useState<KycStatus>(initialKycStatus)
  const [documentType, setDocumentType] = useState('')
  const [totpEnabled, setTotpEnabled] = useState(initialTotpEnabled)
  const [submitting, setSubmitting] = useState(false)

  async function finish() {
    await fetch('/api/onboarding/complete', { method: 'POST', body: JSON.stringify({ userId }) })
    router.push('/')
    router.refresh()
  }

  async function saveProfile() {
    setSubmitting(true)
    try {
      await fetch('/api/profile/update', { method: 'PATCH', body: JSON.stringify({ userId, fullName, country, phone }) })
      setStep(2)
    } finally {
      setSubmitting(false)
    }
  }

  async function submitKyc() {
    if (!documentType) {
      toast.error('Choose a document type')
      return
    }
    setSubmitting(true)
    try {
      const res = await fetch('/api/kyc/submit', { method: 'POST', body: JSON.stringify({ userId, documentType }) })
      const data = await res.json()
      if (!res.ok) {
        toast.error(data.error || 'Could not submit')
        return
      }
      setKycStatus('PENDING')
      toast.success('Submitted for review')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="mx-auto max-w-lg py-12">
      <div className="flex items-center justify-between">
        <Stepper steps={STEP_LABELS} current={step} />
      </div>
      {step > 0 && step < 4 && (
        <button onClick={() => setStep((s) => s - 1)} className="mt-6 text-muted-foreground transition-colors hover:text-foreground">
          <GlassIcon icon={ArrowLeft} size={14} />
        </button>
      )}

      {step === 0 && (
        <div className="mt-6 text-center">
          <Image src="/images/QuantChain.png" alt="Quantchain" width={64} height={64} className="mx-auto" />
          <h1 className="mt-6 text-2xl font-semibold tracking-tight">Welcome to Quantchain{fullName ? `, ${fullName.split(' ')[0]}` : ''}</h1>
          <p className="mt-2 text-sm text-muted-foreground">Let&rsquo;s get your account set up. This takes about 2 minutes.</p>

          <div className="mt-8 space-y-4 text-left">
            <FeatureLine icon={CandlestickChart} text="Buy, sell, and track crypto markets in real time" />
            <FeatureLine icon={PiggyBank} text="Stake eligible assets to earn rewards" />
            <FeatureLine icon={ShieldCheck} text="Secure your account with two-factor authentication" />
          </div>

          <Button onClick={() => setStep(1)} className="mt-8 w-full" size="lg">
            Get started
          </Button>
        </div>
      )}

      {step === 1 && (
        <div className="mt-6">
          <h1 className="text-2xl font-semibold tracking-tight">Complete your profile</h1>
          <p className="mt-1 text-sm text-muted-foreground">This helps us personalize your account.</p>

          <div className="mt-6 space-y-4">
            <div>
              <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Email</label>
              <Input value={email} disabled />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Full name</label>
              <Input value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Your full name" />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Country</label>
              <Input value={country} onChange={(e) => setCountry(e.target.value)} placeholder="United States" />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Phone</label>
              <Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+1 555 000 0000" />
            </div>
          </div>

          <Button onClick={saveProfile} disabled={submitting} className="mt-8 w-full" size="lg">
            {submitting ? 'Saving…' : 'Continue'}
          </Button>
          <button onClick={() => setStep(2)} className="mt-3 w-full text-center text-sm font-medium text-muted-foreground hover:text-foreground">
            Skip for now
          </button>
        </div>
      )}

      {step === 2 && (
        <div className="mt-6">
          <h1 className="text-2xl font-semibold tracking-tight">Verify your identity</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Identity verification raises your account limits and helps keep Quantchain secure for everyone.
          </p>

          {kycStatus === 'PENDING' || kycStatus === 'VERIFIED' ? (
            <div className="mt-6 rounded-2xl border border-border bg-muted/40 p-6">
              <div className="flex items-center gap-3">
                <GlassIcon icon={BadgeCheck} size={18} iconClassName={kycStatus === 'VERIFIED' ? 'text-up' : 'text-primary'} />
                <div>
                  <p className="text-sm font-semibold">{kycStatus === 'VERIFIED' ? 'Identity verified' : 'Submitted for review'}</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {kycStatus === 'VERIFIED' ? 'Your identity has been verified.' : 'This usually takes about 1 business day.'}
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="mt-6">
              <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Document type</label>
              <Select value={documentType} onValueChange={setDocumentType}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a document" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="passport">Passport</SelectItem>
                  <SelectItem value="drivers_license">Driver&rsquo;s license</SelectItem>
                  <SelectItem value="national_id">National ID</SelectItem>
                </SelectContent>
              </Select>
              <Button onClick={submitKyc} disabled={submitting} className="mt-4 w-full" size="lg">
                {submitting ? 'Submitting…' : 'Submit for review'}
              </Button>
            </div>
          )}

          <Button onClick={() => setStep(3)} variant={kycStatus ? 'primary' : 'subtle'} className="mt-4 w-full" size="lg">
            Continue
          </Button>
          {!kycStatus && (
            <button onClick={() => setStep(3)} className="mt-3 w-full text-center text-sm font-medium text-muted-foreground hover:text-foreground">
              Skip for now
            </button>
          )}
        </div>
      )}

      {step === 3 && (
        <div className="mt-6">
          <h1 className="text-2xl font-semibold tracking-tight">Secure your account</h1>
          <p className="mt-1 text-sm text-muted-foreground">Add two-factor authentication for an extra layer of protection.</p>

          <div className="mt-6 rounded-2xl border border-border p-5">
            <TwoFactorSection userId={userId} initialEnabled={totpEnabled} />
          </div>

          <Button onClick={() => setStep(4)} className="mt-6 w-full" size="lg">
            Continue
          </Button>
        </div>
      )}

      {step === 4 && (
        <div className="mt-6 text-center">
          <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-up/10">
            <GlassIcon icon={Check} size={22} iconClassName="text-up" />
          </span>
          <h1 className="mt-6 text-2xl font-semibold tracking-tight">You&rsquo;re all set</h1>
          <p className="mt-2 text-sm text-muted-foreground">Your account is ready to go.</p>

          <div className="mt-8 space-y-3 text-left text-sm">
            <SummaryLine done={!!fullName} label={fullName ? 'Profile updated' : 'Profile — add later from Account'} />
            <SummaryLine done={!!kycStatus} label={kycStatus ? 'Identity submitted for review' : 'Identity — verify later from Account'} />
            <SummaryLine done={totpEnabled} label={totpEnabled ? '2-step verification enabled' : '2-step verification, add later from Account'} />
          </div>

          <Button onClick={finish} className="mt-8 w-full" size="lg">
            Go to dashboard
          </Button>
        </div>
      )}
    </div>
  )
}

function FeatureLine({ icon, text }: { icon: LucideIcon; text: string }) {
  return (
    <div className="flex items-center gap-3 text-sm">
      <GlassIcon icon={icon} size={15} className="shrink-0" />
      {text}
    </div>
  )
}

function SummaryLine({ done, label }: { done: boolean; label: string }) {
  return (
    <div className="flex items-center gap-2.5">
      {done ? (
        <GlassIcon icon={Check} size={10} iconClassName="text-up" />
      ) : (
        <Badge variant="neutral" className="h-4 w-4 shrink-0 rounded-full p-0" />
      )}
      <span className={done ? 'text-foreground' : 'text-muted-foreground'}>{label}</span>
    </div>
  )
}
