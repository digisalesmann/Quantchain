import React from 'react'

export const metadata = { title: 'Terms of Service - Quantchain' }

export default function TermsPage() {
  return (
    <div className="mx-auto max-w-2xl py-16">
      <h1 className="text-3xl font-semibold tracking-tight">Terms of Service</h1>
      <p className="mt-2 text-sm text-muted-foreground">Last updated June 2026</p>

      <div className="mt-8 space-y-6 text-sm leading-relaxed text-muted-foreground">
        <p>
          Quantchain is a demo cryptocurrency trading platform built for educational and portfolio purposes.
          By creating an account, you acknowledge that this is not a regulated financial service and that any
          assets, balances, or trades within the platform hold no real-world monetary value.
        </p>
        <p>
          You must be at least 18 years old to create an account. You are responsible for keeping your
          credentials, passkeys, and two-factor authentication methods secure.
        </p>
        <p>
          We may suspend or terminate accounts that violate these terms, abuse the matching engine, or attempt
          to interfere with the normal operation of the platform.
        </p>
        <p>
          These terms may be updated from time to time. Continued use of Quantchain after changes are published
          constitutes acceptance of the revised terms.
        </p>
      </div>
    </div>
  )
}
