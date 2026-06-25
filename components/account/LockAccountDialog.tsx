'use client'
import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import Button from '../ui/Button'
import { Dialog, DialogTrigger, DialogContent, DialogTitle, DialogDescription } from '../ui/Dialog'
import SuccessScreen from '../ui/SuccessScreen'

export default function LockAccountDialog({ userId, trigger }: { userId: string; trigger: React.ReactNode }) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [locked, setLocked] = useState(false)

  async function handleLock() {
    setSubmitting(true)
    try {
      const res = await fetch('/api/account/lock', { method: 'POST', body: JSON.stringify({ userId }) })
      if (!res.ok) {
        toast.error('Could not lock account')
        return
      }
      await fetch('/api/auth/logout', { method: 'POST' })
      setOpen(false)
      setLocked(true)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>{trigger}</DialogTrigger>
        <DialogContent>
          <DialogTitle>Lock your account</DialogTitle>
          <DialogDescription>
            This immediately signs you out of every device and blocks all sign-ins until support unlocks it. Use this if you believe your
            account has been compromised.
          </DialogDescription>
          <Button onClick={handleLock} disabled={submitting} variant="destructive" className="mt-6 w-full" size="lg">
            {submitting ? 'Locking…' : 'Lock account'}
          </Button>
        </DialogContent>
      </Dialog>

      <SuccessScreen
        open={locked}
        onOpenChange={(next) => {
          if (!next) {
            router.push('/')
            router.refresh()
          }
        }}
        title="Account locked"
        description="All sessions have been signed out. Contact support to unlock your account."
        actionLabel="Done"
      />
    </>
  )
}
