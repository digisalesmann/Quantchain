'use client'
import React from 'react'
import { Dialog, DialogTrigger, DialogContent, DialogTitle } from '../ui/Dialog'
import TwoFactorSection from '../security/TwoFactorSection'

export default function TwoFactorDialog({ userId, initialEnabled, trigger }: { userId: string; initialEnabled: boolean; trigger: React.ReactNode }) {
  return (
    <Dialog>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent>
        <DialogTitle>2-step verification</DialogTitle>
        <div className="mt-5">
          <TwoFactorSection userId={userId} initialEnabled={initialEnabled} />
        </div>
      </DialogContent>
    </Dialog>
  )
}
