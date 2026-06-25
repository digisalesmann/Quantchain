import React from 'react'
import { requireSessionUserId } from '../../lib/session'
import prisma from '../../lib/prisma'
import OrdersHistoryTable from '../../components/trade/OrdersHistoryTable'

export default async function OrdersPage() {
  const userId = await requireSessionUserId()
  const orders = await prisma.order.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    take: 100,
    include: { market: { select: { symbol: true } } }
  })

  const rows = orders.map((o) => ({
    id: o.id,
    marketSymbol: o.market.symbol,
    side: o.side,
    type: o.type,
    price: o.price?.toString() ?? null,
    amount: o.amount.toString(),
    filled: o.filled.toString(),
    status: o.status,
    createdAt: o.createdAt.toISOString()
  }))

  return (
    <div className="py-10">
      <h1 className="text-2xl font-semibold tracking-tight">Orders & trades</h1>
      <p className="mt-1 text-sm text-muted-foreground">Your order history across all markets.</p>

      <div className="mt-8">
        <OrdersHistoryTable userId={userId} initialOrders={rows} />
      </div>
    </div>
  )
}
