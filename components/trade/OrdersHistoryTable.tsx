'use client'
import React, { useState } from 'react'
import Link from 'next/link'
import { toast } from 'sonner'
import Badge from '../ui/Badge'
import { Table, THead, TBody, TR, TH, TD } from '../ui/Table'
import { formatNumber } from '../../lib/utils'

export type OrderHistoryRow = {
  id: string
  marketSymbol: string
  side: 'BUY' | 'SELL'
  type: string
  price: string | null
  amount: string
  filled: string
  status: string
  createdAt: string
}

const STATUS_VARIANT: Record<string, 'neutral' | 'up' | 'down' | 'warning'> = {
  NEW: 'neutral',
  PARTIALLY_FILLED: 'warning',
  FILLED: 'up',
  CANCELED: 'down',
  REJECTED: 'down'
}

export default function OrdersHistoryTable({ userId, initialOrders }: { userId: string; initialOrders: OrderHistoryRow[] }) {
  const [orders, setOrders] = useState(initialOrders)
  const [cancelingId, setCancelingId] = useState<string | null>(null)

  async function cancel(orderId: string) {
    setCancelingId(orderId)
    try {
      const res = await fetch('/api/orders/cancel', { method: 'POST', body: JSON.stringify({ userId, orderId }) })
      const data = await res.json()
      if (!res.ok) {
        toast.error(data.error || 'Could not cancel order')
      } else {
        toast.success('Order canceled')
        setOrders((prev) => prev.map((o) => (o.id === orderId ? { ...o, status: 'CANCELED' } : o)))
      }
    } finally {
      setCancelingId(null)
    }
  }

  return (
    <Table>
      <THead>
        <TR>
          <TH>Market</TH>
          <TH>Side</TH>
          <TH>Type</TH>
          <TH align="right">Price</TH>
          <TH align="right">Amount</TH>
          <TH align="right">Filled</TH>
          <TH>Status</TH>
          <TH>Date</TH>
          <TH align="right">{''}</TH>
        </TR>
      </THead>
      <TBody>
        {orders.map((o) => (
          <TR key={o.id}>
            <TD>
              <Link href={`/markets/${o.marketSymbol}`} className="font-medium hover:underline">
                {o.marketSymbol}
              </Link>
            </TD>
            <TD className={o.side === 'BUY' ? 'text-up font-medium' : 'text-down font-medium'}>{o.side}</TD>
            <TD className="text-muted-foreground">{o.type}</TD>
            <TD align="right" className="tabular">{o.price ? formatNumber(parseFloat(o.price)) : 'Market'}</TD>
            <TD align="right" className="tabular">{formatNumber(parseFloat(o.amount))}</TD>
            <TD align="right" className="tabular text-muted-foreground">{formatNumber(parseFloat(o.filled))}</TD>
            <TD><Badge variant={STATUS_VARIANT[o.status] || 'neutral'}>{o.status.replace('_', ' ')}</Badge></TD>
            <TD className="text-muted-foreground">{new Date(o.createdAt).toLocaleString()}</TD>
            <TD align="right">
              {(o.status === 'NEW' || o.status === 'PARTIALLY_FILLED') && (
                <button
                  onClick={() => cancel(o.id)}
                  disabled={cancelingId === o.id}
                  className="text-xs font-medium text-muted-foreground hover:text-destructive disabled:opacity-50"
                >
                  Cancel
                </button>
              )}
            </TD>
          </TR>
        ))}
        {orders.length === 0 && (
          <TR>
            <TD colSpan={9} align="center" className="py-12 text-muted-foreground">
              No orders yet, head to <Link href="/trade" className="underline">Trade</Link> to place your first order.
            </TD>
          </TR>
        )}
      </TBody>
    </Table>
  )
}
