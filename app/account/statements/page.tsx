import React from 'react'
import { Download, FileText } from 'lucide-react'
import { requireSessionUserId } from '../../../lib/session'
import prisma from '../../../lib/prisma'
import GlassIcon from '../../../components/ui/GlassIcon'
import { formatCurrency } from '../../../lib/utils'

export default async function AccountStatementsPage() {
  const userId = await requireSessionUserId()

  const transactions = await prisma.transaction.findMany({
    where: { wallet: { userId } },
    orderBy: { createdAt: 'desc' },
    select: { amount: true, createdAt: true }
  })

  const months = new Map<string, { label: string; count: number; net: number }>()
  for (const t of transactions) {
    const key = `${t.createdAt.getFullYear()}-${String(t.createdAt.getMonth() + 1).padStart(2, '0')}`
    const label = t.createdAt.toLocaleDateString(undefined, { year: 'numeric', month: 'long' })
    const amount = parseFloat(t.amount.toString())
    const existing = months.get(key)
    if (existing) {
      existing.count += 1
      existing.net += amount
    } else {
      months.set(key, { label, count: 1, net: amount })
    }
  }

  const rows = Array.from(months.entries())
    .sort((a, b) => (a[0] < b[0] ? 1 : -1))
    .map(([key, value]) => ({ key, ...value }))

  return (
    <div className="py-10">
      <h1 className="text-2xl font-semibold tracking-tight">Statements</h1>
      <p className="mt-1 text-sm text-muted-foreground">Download a CSV of your transaction history for any month.</p>

      <div className="mt-8 divide-y divide-border border-y border-border">
        {rows.map((r) => (
          <div key={r.key} className="flex items-center justify-between gap-3 py-4">
            <span className="flex min-w-0 items-center gap-3">
              <GlassIcon icon={FileText} size={15} />
              <span className="min-w-0">
                <span className="block text-sm font-semibold">{r.label}</span>
                <span className="block text-xs text-muted-foreground">
                  {r.count} transaction{r.count > 1 ? 's' : ''} &middot; net {formatCurrency(r.net)}
                </span>
              </span>
            </span>
            <a
              href={`/api/account/statements/csv?userId=${userId}&month=${r.key}`}
              className="inline-flex shrink-0 items-center gap-1.5 text-sm font-medium text-primary hover:underline"
            >
              <GlassIcon icon={Download} size={13} /> CSV
            </a>
          </div>
        ))}
        {rows.length === 0 && <p className="py-8 text-center text-sm text-muted-foreground">No transaction history yet</p>}
      </div>
    </div>
  )
}
