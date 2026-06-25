import React from 'react'
import Link from 'next/link'
import Divider from '../ui/Divider'
import Logo from '../Logo'

const COLUMNS = [
  {
    title: 'Product',
    links: [
      { href: '/trade', label: 'Spot trading' },
      { href: '/wallets', label: 'Wallets' },
      { href: '/markets', label: 'Markets' },
      { href: '/security', label: 'Security center' }
    ]
  },
  {
    title: 'Account',
    links: [
      { href: '/auth/login', label: 'Sign in' },
      { href: '/auth/register', label: 'Create account' },
      { href: '/auth/passkey/authenticate', label: 'Sign in with a passkey' }
    ]
  },
  {
    title: 'Markets',
    links: [
      { href: '/markets/BTC-USD', label: 'Bitcoin' },
      { href: '/markets/ETH-USD', label: 'Ethereum' },
      { href: '/markets/SOL-USD', label: 'Solana' },
      { href: '/markets/XRP-USD', label: 'XRP' }
    ]
  }
]

export default function Footer() {
  return (
    <footer className="mt-16">
      <Divider />
      <div className="grid grid-cols-2 gap-10 py-12 md:grid-cols-4">
        <div>
          <Link href="/">
            <Logo />
          </Link>
          <p className="mt-3 max-w-[220px] text-sm text-muted-foreground">A premium, multi-chain cryptocurrency exchange.</p>
        </div>

        {COLUMNS.map((col) => (
          <div key={col.title}>
            <p className="text-2xs font-medium uppercase tracking-wide text-muted-foreground">{col.title}</p>
            <ul className="mt-3 space-y-2.5">
              {col.links.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="text-sm text-muted-foreground transition-colors hover:text-foreground">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <Divider />
      <div className="flex flex-col gap-3 py-6 text-2xs text-muted-foreground md:flex-row md:items-center md:justify-between">
        <p>&copy; {new Date().getFullYear()} Quantchain. Built as a demo trading platform — not a regulated exchange.</p>
        <p>Cryptocurrency investing involves significant risk of loss and is not suitable for every investor.</p>
      </div>
    </footer>
  )
}
