import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(value: number, currency = 'USD', maximumFractionDigits = 2) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency, maximumFractionDigits, minimumFractionDigits: Math.min(2, maximumFractionDigits) }).format(value)
}

export function formatNumber(value: number, maximumFractionDigits = 6) {
  return new Intl.NumberFormat('en-US', { maximumFractionDigits }).format(value)
}

export function formatCompact(value: number) {
  return new Intl.NumberFormat('en-US', { notation: 'compact', maximumFractionDigits: 2 }).format(value)
}

export function formatPercent(value: number) {
  const sign = value > 0 ? '+' : ''
  return `${sign}${value.toFixed(2)}%`
}

export function formatRelativeTime(date: Date | string) {
  const then = typeof date === 'string' ? new Date(date) : date
  const seconds = Math.max(0, (Date.now() - then.getTime()) / 1000)

  const units: [string, number][] = [
    ['year', 60 * 60 * 24 * 365],
    ['mo.', 60 * 60 * 24 * 30],
    ['day', 60 * 60 * 24],
    ['hour', 60 * 60],
    ['minute', 60]
  ]

  for (const [label, secondsInUnit] of units) {
    const value = Math.floor(seconds / secondsInUnit)
    if (value >= 1) return `${value} ${label}${value > 1 && label !== 'mo.' ? 's' : ''} ago`
  }
  return 'just now'
}

export function truncateAddress(address: string, lead = 6, trail = 6) {
  if (address.length <= lead + trail + 3) return address
  return `${address.slice(0, lead)}...${address.slice(-trail)}`
}
