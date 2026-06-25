'use client'
import React, { useCallback, useEffect, useState } from 'react'
import { toast } from 'sonner'
import Badge from '../ui/Badge'
import { Table, THead, TBody, TR, TH, TD } from '../ui/Table'
import { formatNumber } from '../../lib/utils'

type Order = {
  id: string
  side: 'BUY' | 'SELL'
  type: 'LIMIT' | 'MARKET'
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

export default function OpenOrdersPanel({ userId, marketId, refreshToken }: { userId: string | null; marketId: string; refreshToken: number }) {
  const [orders, setOrders] = useState<Order[]>([])
  const [cancelingId, setCancelingId] = useState<string | null>(null)

  const refresh = useCallback(async () => {
    if (!userId) {
      setOrders([])
      return
    }
    try {
      const res = await fetch(`/api/orders/list?userId=${userId}&marketId=${marketId}`)
      const data = await res.json()
      setOrders(data.orders || [])
    } catch {
      // ignore transient errors
    }
  }, [userId, marketId])

  useEffect(() => {
    refresh()
    const timer = setInterval(refresh, 3000)
    return () => clearInterval(timer)
  }, [refresh, refreshToken])

  async function cancel(orderId: string) {
    if (!userId) return
    setCancelingId(orderId)
    try {
      const res = await fetch('/api/orders/cancel', { method: 'POST', body: JSON.stringify({ userId, orderId }) })
      const data = await res.json()
      if (!res.ok) toast.error(data.error || 'Could not cancel order')
      else {
        toast.success('Order canceled')
        refresh()
      }
    } finally {
      setCancelingId(null)
    }
  }

  if (!userId) {
    return <p className="py-6 text-sm text-muted-foreground">Sign in to view your orders for this market.</p>
  }

  return (
    <Table>
      <THead>
        <TR>
          <TH>Side</TH>
          <TH>Type</TH>
          <TH align="right">Price</TH>
          <TH align="right">Amount</TH>
          <TH align="right">Filled</TH>
          <TH>Status</TH>
          <TH align="right">{''}</TH>
        </TR>
      </THead>
      <TBody>
        {orders.map((o) => (
          <TR key={o.id}>
            <TD className={o.side === 'BUY' ? 'text-up font-medium' : 'text-down font-medium'}>{o.side}</TD>
            <TD className="text-muted-foreground">{o.type}</TD>
            <TD align="right" className="tabular">{o.price ? formatNumber(parseFloat(o.price)) : 'Market'}</TD>
            <TD align="right" className="tabular">{formatNumber(parseFloat(o.amount))}</TD>
            <TD align="right" className="tabular text-muted-foreground">{formatNumber(parseFloat(o.filled))}</TD>
            <TD><Badge variant={STATUS_VARIANT[o.status] || 'neutral'}>{o.status.replace('_', ' ')}</Badge></TD>
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
            <TD align="center" colSpan={7} className="py-8 text-muted-foreground">
              No orders yet
            </TD>
          </TR>
        )}
      </TBody>
    </Table>
  )
}
