// In-memory matching engine for spot trading

import Decimal from 'decimal.js'
import prisma from './prisma'

export type Order = {
  id: string
  userId: string
  marketId: string
  side: 'BUY' | 'SELL'
  type: 'LIMIT' | 'MARKET'
  price?: Decimal
  amount: Decimal
  filled: Decimal
  status: 'NEW' | 'PARTIALLY_FILLED' | 'FILLED' | 'CANCELED'
  createdAt: Date
}

export type Trade = {
  id: string
  buyOrderId: string
  sellOrderId: string
  marketId: string
  price: Decimal
  amount: Decimal
  createdAt: Date
}

// In-memory order book per market
class OrderBook {
  buyOrders: Order[] = [] // sorted by price desc, then time asc
  sellOrders: Order[] = [] // sorted by price asc, then time asc
  trades: Trade[] = []

  addOrder(order: Order) {
    if (order.side === 'BUY') {
      this.buyOrders.push(order)
      this.buyOrders.sort((a, b) => {
        const priceCmp = (b.price || new Decimal(0)).cmp(a.price || new Decimal(0))
        return priceCmp !== 0 ? priceCmp : a.createdAt.getTime() - b.createdAt.getTime()
      })
    } else {
      this.sellOrders.push(order)
      this.sellOrders.sort((a, b) => {
        const priceCmp = (a.price || new Decimal(0)).cmp(b.price || new Decimal(0))
        return priceCmp !== 0 ? priceCmp : a.createdAt.getTime() - b.createdAt.getTime()
      })
    }
  }

  removeOrder(orderId: string) {
    this.buyOrders = this.buyOrders.filter((o) => o.id !== orderId)
    this.sellOrders = this.sellOrders.filter((o) => o.id !== orderId)
  }

  getSnapshot() {
    return {
      bids: this.buyOrders.map((o) => ({ price: o.price?.toString(), amount: o.amount.minus(o.filled).toString() })),
      asks: this.sellOrders.map((o) => ({ price: o.price?.toString(), amount: o.amount.minus(o.filled).toString() }))
    }
  }
}

class MatchingEngine {
  orderBooks: Map<string, OrderBook> = new Map()
  hydrated: Set<string> = new Set()
  hydrating: Map<string, Promise<void>> = new Map()

  getOrderBook(marketId: string) {
    if (!this.orderBooks.has(marketId)) {
      this.orderBooks.set(marketId, new OrderBook())
    }
    return this.orderBooks.get(marketId)!
  }

  // Resting orders placed before this process started (e.g. via seed data, or
  // a previous server instance) only exist in Postgres. Hydrate the in-memory
  // book from the DB once per market so the matching engine sees them.
  async ensureHydrated(marketId: string) {
    if (this.hydrated.has(marketId)) return
    if (this.hydrating.has(marketId)) return this.hydrating.get(marketId)

    const promise = (async () => {
      const restingOrders = await prisma.order.findMany({
        where: { marketId, status: { in: ['NEW', 'PARTIALLY_FILLED'] } },
        orderBy: { createdAt: 'asc' }
      })

      const book = this.getOrderBook(marketId)
      for (const dbOrder of restingOrders) {
        book.addOrder({
          id: dbOrder.id,
          userId: dbOrder.userId,
          marketId: dbOrder.marketId,
          side: dbOrder.side,
          type: dbOrder.type as 'LIMIT' | 'MARKET',
          price: dbOrder.price ? new Decimal(dbOrder.price.toString()) : undefined,
          amount: new Decimal(dbOrder.amount.toString()),
          filled: new Decimal(dbOrder.filled.toString()),
          status: dbOrder.status as Order['status'],
          createdAt: dbOrder.createdAt
        })
      }

      this.hydrated.add(marketId)
    })()

    this.hydrating.set(marketId, promise)
    await promise
    this.hydrating.delete(marketId)
  }

  async placeOrder(order: Order): Promise<Trade[]> {
    await this.ensureHydrated(order.marketId)
    const book = this.getOrderBook(order.marketId)
    const trades: Trade[] = []

    // Try to match against opposing orders
    if (order.side === 'BUY') {
      while (order.filled.lt(order.amount) && book.sellOrders.length > 0) {
        const seller = book.sellOrders[0]
        const sellerPrice = seller.price || new Decimal(0)

        // Price check
        const buyPrice = order.price || new Decimal(999999) // market orders buy at any price
        if (buyPrice.lt(sellerPrice)) break

        // Execute trade
        const tradeAmount = Decimal.min(order.amount.minus(order.filled), seller.amount.minus(seller.filled))
        const trade: Trade = {
          id: `trade-${Date.now()}-${Math.random()}`,
          buyOrderId: order.id,
          sellOrderId: seller.id,
          marketId: order.marketId,
          price: sellerPrice,
          amount: tradeAmount,
          createdAt: new Date()
        }

        trades.push(trade)
        book.trades.push(trade)

        // Update fills
        order.filled = order.filled.plus(tradeAmount)
        seller.filled = seller.filled.plus(tradeAmount)

        // Remove filled orders
        if (seller.filled.eq(seller.amount)) {
          seller.status = 'FILLED'
          book.removeOrder(seller.id)
        } else {
          seller.status = 'PARTIALLY_FILLED'
        }
      }
    } else {
      while (order.filled.lt(order.amount) && book.buyOrders.length > 0) {
        const buyer = book.buyOrders[0]
        const buyerPrice = buyer.price || new Decimal(0)

        // Price check
        const sellPrice = order.price || new Decimal(0) // market orders sell at any price
        if (buyerPrice.lt(sellPrice)) break

        // Execute trade
        const tradeAmount = Decimal.min(order.amount.minus(order.filled), buyer.amount.minus(buyer.filled))
        const trade: Trade = {
          id: `trade-${Date.now()}-${Math.random()}`,
          buyOrderId: buyer.id,
          sellOrderId: order.id,
          marketId: order.marketId,
          price: buyerPrice,
          amount: tradeAmount,
          createdAt: new Date()
        }

        trades.push(trade)
        book.trades.push(trade)

        // Update fills
        order.filled = order.filled.plus(tradeAmount)
        buyer.filled = buyer.filled.plus(tradeAmount)

        // Remove filled orders
        if (buyer.filled.eq(buyer.amount)) {
          buyer.status = 'FILLED'
          book.removeOrder(buyer.id)
        } else {
          buyer.status = 'PARTIALLY_FILLED'
        }
      }
    }

    // Update order status
    if (order.filled.eq(order.amount)) {
      order.status = 'FILLED'
    } else if (order.filled.gt(0)) {
      order.status = 'PARTIALLY_FILLED'
    }

    // Add remainder to book if not fully filled
    if (order.filled.lt(order.amount)) {
      book.addOrder(order)
    }

    return trades
  }

  async cancelOrder(marketId: string, orderId: string) {
    await this.ensureHydrated(marketId)
    const book = this.getOrderBook(marketId)
    book.removeOrder(orderId)
  }

  async getOrderBook2(marketId: string) {
    await this.ensureHydrated(marketId)
    const book = this.getOrderBook(marketId)
    return book.getSnapshot()
  }

  getRecentTrades(marketId: string, limit: number = 20) {
    const book = this.getOrderBook(marketId)
    return book.trades.slice(-limit)
  }
}

export const matchingEngine = new MatchingEngine()
