import React from 'react'

export const metadata = { title: 'Privacy Policy - Quantchain' }

export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-2xl py-16">
      <h1 className="text-3xl font-semibold tracking-tight">Privacy Policy</h1>
      <p className="mt-2 text-sm text-muted-foreground">Last updated June 2026</p>

      <div className="mt-8 space-y-6 text-sm leading-relaxed text-muted-foreground">
        <p>
          We collect the information you provide when creating an account, your name, email address, and
          authentication credentials, along with activity data such as orders, trades, and sessions, to operate
          the platform.
        </p>
        <p>
          If you sign in with Google, we receive your name, email address, and Google account identifier from
          Google in order to create or match your Quantchain account. We do not receive your Google password.
        </p>
        <p>
          We do not sell your data. Session and device information is retained so you can review and revoke
          active sessions from the Security page at any time.
        </p>
        <p>
          You may request deletion of your account and associated data by contacting support.
        </p>
      </div>
    </div>
  )
}
