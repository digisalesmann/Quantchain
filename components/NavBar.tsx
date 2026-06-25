'use client'
import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { AnimatePresence, motion } from 'framer-motion'
import { CandlestickChart, KeyRound, LineChart, Search, Wallet as WalletIcon } from 'lucide-react'
import ThemeToggle from './ui/ThemeToggle'
import HamburgerIcon from './ui/HamburgerIcon'
import GlassIcon from './ui/GlassIcon'
import Button from './ui/Button'
import ProductsMenu from './marketing/ProductsMenu'
import Logo from './Logo'
import { useSession } from '../lib/useSession'
import { cn } from '../lib/utils'

const MARKETING_NAV_LINKS = [
  { href: '/trade', label: 'Spot trading', icon: CandlestickChart },
  { href: '/wallets', label: 'Wallets', icon: WalletIcon },
  { href: '/markets', label: 'Markets & charts', icon: LineChart },
  { href: '/security', label: 'Security center', icon: KeyRound }
]

export default function NavBar() {
  const pathname = usePathname()
  const { user, isLoading } = useSession()
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => {
    setMobileOpen(false)
  }, [pathname])

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [mobileOpen])

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur-md">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-8">
          <Link href="/">
            <Logo />
          </Link>

          <nav className="hidden items-center gap-6 md:flex">
            <ProductsMenu />
            <Link href="/markets" className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">
              Markets
            </Link>
          </nav>
        </div>

        <div className="flex items-center gap-1.5 sm:gap-2">
          <Link
            href="/markets"
            aria-label="Search markets"
            className="hidden h-9 w-9 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-accent hover:text-foreground sm:inline-flex"
          >
            <GlassIcon icon={Search} size={15} />
          </Link>

          <ThemeToggle />

          {!isLoading && !user && (
            <div className="ml-1 hidden items-center gap-2 sm:flex">
              <Button asChild variant="subtle" size="sm">
                <Link href="/auth/login">Sign in</Link>
              </Button>
              <Button asChild size="sm">
                <Link href="/auth/register">Sign up</Link>
              </Button>
            </div>
          )}

          <button
            aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
            onClick={() => setMobileOpen((v) => !v)}
            className="inline-flex h-9 w-9 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-accent hover:text-foreground md:hidden"
          >
            <GlassIcon size={18}>
              <HamburgerIcon open={mobileOpen} />
            </GlassIcon>
          </button>
        </div>
      </div>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="fixed inset-x-0 top-16 z-40 flex h-[calc(100dvh-4rem)] flex-col overflow-y-auto bg-background md:hidden"
          >
            <nav className="container flex flex-1 flex-col justify-start gap-1 py-8">
              {MARKETING_NAV_LINKS.map((link, i) => {
                const active = pathname.startsWith(link.href)
                return (
                  <motion.div
                    key={link.href}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.25, delay: 0.04 * i, ease: 'easeOut' }}
                  >
                    <Link
                      href={link.href}
                      className={cn(
                        'flex items-center gap-4 rounded-xl px-3 py-4 text-lg font-medium transition-colors',
                        active ? 'bg-accent text-foreground' : 'text-foreground hover:bg-accent'
                      )}
                    >
                      <GlassIcon icon={link.icon} size={18} iconClassName="text-muted-foreground" />
                      {link.label}
                    </Link>
                  </motion.div>
                )
              })}
            </nav>

            <div className="container flex items-center gap-3 border-t border-border py-6">
              <Button asChild variant="subtle" size="lg" className="flex-1">
                <Link href="/auth/login">Sign in</Link>
              </Button>
              <Button asChild size="lg" className="flex-1">
                <Link href="/auth/register">Sign up</Link>
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}
