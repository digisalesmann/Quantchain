import React from 'react'
import Link from 'next/link'

export default function DashboardFooter() {
  return (
    <footer className="mt-12 flex flex-col gap-3 border-t border-border py-6 text-2xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
      <div className="flex flex-wrap gap-x-5 gap-y-2">
        <Link href="/legal/terms" className="hover:text-foreground">Terms</Link>
        <Link href="/legal/privacy" className="hover:text-foreground">Privacy</Link>
        <Link href="/legal/accessibility" className="hover:text-foreground">Accessibility</Link>
      </div>
      <p>&copy; {new Date().getFullYear()} Quantchain. Not a regulated exchange.</p>
    </footer>
  )
}
