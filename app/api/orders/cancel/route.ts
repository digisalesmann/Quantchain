import { NextRequest, NextResponse } from 'next/server'
import prisma from '../../../../lib/prisma'
import { matchingEngine } from '../../../../lib/matching-engine'

export async function POST(req: NextRequest) {
  try {
    const { userId, orderId } = await req.json()
    if (!userId || !orderId) return NextResponse.json({ error: 'Missing fields' }, { status: 400 })

    const order = await prisma.order.findUnique({ where: { id: orderId } })
    if (!order || order.userId !== userId) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }

    if (order.status === 'FILLED' || order.status === 'CANCELED') {
      return NextResponse.json({ error: 'Cannot cancel order' }, { status: 400 })
    }

    // Cancel from matching engine
    await matchingEngine.cancelOrder(order.marketId, orderId)

    // Update database
    const updated = await prisma.order.update({
      where: { id: orderId },
      data: { status: 'CANCELED' }
    })

    return NextResponse.json({ ok: true, order: updated })
  } catch (e) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
