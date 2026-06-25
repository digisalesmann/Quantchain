import { CandlestickChart, LayoutDashboard, LineChart, PiggyBank, Receipt, Settings, UserCircle, Wallet as WalletIcon } from 'lucide-react'

export const PRIMARY_NAV = [
  { href: '/', label: 'Home', shortLabel: 'Home', icon: LayoutDashboard },
  { href: '/trade', label: 'Trade', shortLabel: 'Trade', icon: CandlestickChart },
  { href: '/lend', label: 'Lend', shortLabel: 'Lend', icon: PiggyBank },
  { href: '/transactions', label: 'Transactions', shortLabel: 'History', icon: Receipt }
]

export const SECONDARY_NAV = [
  { href: '/markets', label: 'Markets', icon: LineChart },
  { href: '/wallets', label: 'Wallets', icon: WalletIcon },
  { href: '/orders', label: 'Open orders', icon: Receipt },
  { href: '/account/profile', label: 'Account', icon: UserCircle },
  { href: '/settings', label: 'Settings', icon: Settings }
]

export const ROUTE_TITLES: Record<string, string> = {
  '/': 'Home',
  '/trade': 'Trade',
  '/lend': 'Lend',
  '/transactions': 'Transactions',
  '/markets': 'Markets',
  '/wallets': 'Wallets',
  '/orders': 'Open orders',
  '/settings': 'Settings'
}

export function titleForPath(pathname: string) {
  if (ROUTE_TITLES[pathname]) return ROUTE_TITLES[pathname]
  if (pathname.startsWith('/markets/')) return 'Markets'
  if (pathname.startsWith('/wallets/')) return 'Wallets'
  if (pathname.startsWith('/settings')) return 'Settings'
  return 'Quantchain'
}
