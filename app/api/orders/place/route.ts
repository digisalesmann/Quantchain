import { NextRequest, NextResponse } from 'next/server'
import prisma from '../../../../lib/prisma'
import { matchingEngine, Order } from '../../../../lib/matching-engine'
import Decimal from 'decimal.js'

export async function POST(req: NextRequest) {
  try {
    const { userId, marketId, side, type, price, amount } = await req.json()
    if (!userId || !marketId || !side || !type || !amount) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
    }

    // Validate market exists
    const market = await prisma.market.findUnique({ where: { id: marketId } })
    if (!market) return NextResponse.json({ error: 'Market not found' }, { status: 404 })

    // Create order
    const order: Order = {
      id: `order-${Date.now()}-${Math.random()}`,
      userId,
      marketId,
      side: side as 'BUY' | 'SELL',
      type: type as 'LIMIT' | 'MARKET',
      price: price ? new Decimal(price) : undefined,
      amount: new Decimal(amount),
      filled: new Decimal(0),
      status: 'NEW',
      createdAt: new Date()
    }

    // Match and execute
    const trades = await matchingEngine.placeOrder(order)

    // Persist order
    const dbOrder = await prisma.order.create({
      data: {
        id: order.id,
        userId,
        marketId,
        side: order.side,
        type: order.type,
        price: order.price?.toNumber(),
        amount: order.amount.toNumber(),
        filled: order.filled.toNumber(),
        status: order.status
      }
    })

    // Persist trades
    for (const trade of trades) {
      await prisma.trade.create({
        data: {
          id: trade.id,
          buyOrderId: trade.buyOrderId,
          sellOrderId: trade.sellOrderId,
          marketId: trade.marketId,
          price: trade.price.toNumber(),
          amount: trade.amount.toNumber()
        }
      })
    }

    // The matching engine updates resting (maker) orders in memory only —
    // persist their new fill state to the DB too.
    const makerFillDeltas = new Map<string, Decimal>()
    for (const trade of trades) {
      const makerOrderId = trade.buyOrderId === order.id ? trade.sellOrderId : trade.buyOrderId
      const prev = makerFillDeltas.get(makerOrderId) || new Decimal(0)
      makerFillDeltas.set(makerOrderId, prev.plus(trade.amount))
    }

    for (const [makerOrderId, delta] of makerFillDeltas) {
      const makerOrder = await prisma.order.update({
        where: { id: makerOrderId },
        data: { filled: { increment: delta.toNumber() } }
      })
      const isFilled = new Decimal(makerOrder.filled.toString()).gte(new Decimal(makerOrder.amount.toString()))
      const newStatus = isFilled ? 'FILLED' : 'PARTIALLY_FILLED'
      if (makerOrder.status !== newStatus) {
        await prisma.order.update({ where: { id: makerOrderId }, data: { status: newStatus } })
      }
    }

    return NextResponse.json({ order: dbOrder, trades: trades.length > 0 ? trades.length : undefined })
  } catch (e) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
