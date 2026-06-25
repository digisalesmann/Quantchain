import React from 'react'

export const metadata = { title: 'Accessibility Statement - Quantchain' }

export default function AccessibilityPage() {
  return (
    <div className="mx-auto max-w-2xl py-16">
      <h1 className="text-3xl font-semibold tracking-tight">Accessibility Statement</h1>
      <p className="mt-2 text-sm text-muted-foreground">Last updated June 2026</p>

      <div className="mt-8 space-y-6 text-sm leading-relaxed text-muted-foreground">
        <p>
          Quantchain is built with semantic HTML, keyboard-navigable menus and dialogs, and visible focus states
          throughout the trading interface, wallets, and account settings.
        </p>
        <p>
          We aim to meet WCAG 2.1 AA guidelines across color contrast, form labeling, and screen-reader support.
          This is an ongoing effort as the platform evolves.
        </p>
        <p>
          If you run into an accessibility barrier anywhere in the product, please reach out to support so we can
          investigate and address it.
        </p>
      </div>
    </div>
  )
}
