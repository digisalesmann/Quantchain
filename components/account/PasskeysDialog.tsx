'use client'
import React from 'react'
import { Dialog, DialogTrigger, DialogContent, DialogTitle } from '../ui/Dialog'
import PasskeysSection, { type Passkey } from '../security/PasskeysSection'

export default function PasskeysDialog({ userId, initialPasskeys, trigger }: { userId: string; initialPasskeys: Passkey[]; trigger: React.ReactNode }) {
  return (
    <Dialog>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent>
        <DialogTitle>Passkeys</DialogTitle>
        <div className="mt-5">
          <PasskeysSection userId={userId} initialPasskeys={initialPasskeys} />
        </div>
      </DialogContent>
    </Dialog>
  )
}
