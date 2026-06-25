Trading Engine & Order Books

Overview
- In-memory matching engine with price-time priority
- Limit and Market order types
- Automatic trade execution on order placement
- Order book snapshots and recent trade history
- Per-market order books

Architecture

Matching Engine (lib/matching-engine.ts)
- Order storage per market (buy/sell sides)
- Automatic matching using price-time priority:
  - Buy orders: sorted by price desc, time asc
  - Sell orders: sorted by price asc, time asc
- Trade persistence to database
- Order status tracking (NEW, PARTIALLY_FILLED, FILLED, CANCELED)

Order Book
- Bids (buy orders) and asks (sell orders)
- Updated in real-time as orders match
- Snapshot available via API for UI rendering

API Routes

Place Order
POST /api/orders/place
```json
{
  "userId": "user-123",
  "marketId": "BTC-USD",
  "side": "BUY",
  "type": "LIMIT",
  "price": 42000,
  "amount": 0.5
}
```

Cancel Order
POST /api/orders/cancel
```json
{
  "userId": "user-123",
  "orderId": "order-abc"
}
```

Get Orderbook
GET /api/markets/orderbook?marketId=BTC-USD
Response:
```json
{
  "bids": [
    {"price": "42000", "amount": "0.5"},
    {"price": "41900", "amount": "1.0"}
  ],
  "asks": [
    {"price": "42100", "amount": "0.5"},
    {"price": "42200", "amount": "1.0"}
  ]
}
```

Recent Trades
GET /api/markets/trades?marketId=BTC-USD&limit=20

User Orders
GET /api/orders/list?userId=user-123

Frontend Pages
- /trade — real-time trading terminal with orderbook and order form
- /orders — view all orders and trade history, cancel orders

Matching Algorithm

1. Order received (BUY or SELL)
2. Check for matching orders on opposite side
3. For each potential match:
   - Price validation (BUY price >= SELL price for market orders)
   - Amount matching (trade minimum of both orders' remaining)
   - Create Trade record
   - Update order fills
4. Remove fully-filled orders from book
5. Add partially-filled or new orders to book

Example: BUY order at 42000 against existing SELLs
- SELL #1 @ 41900 qty 2.0 → MATCH (42000 >= 41900)
  - Trade: 1.0 @ 41900
- SELL #2 @ 42100 qty 2.0 → NO MATCH (42000 < 42100)
- BUY order: partially filled 1.0/1.5, remains on book @ 42000

Order Status Transitions
- NEW → (matching found) → PARTIALLY_FILLED (if more fills possible) OR FILLED
- NEW → (no matches) → remains in book awaiting counterparty
- (any non-terminal) → CANCELED (by user request)

Market Orders
- BUY: price = infinity (matches any sell)
- SELL: price = 0 (matches any buy)
- Executes at best available prices
- May leave unfilled amount if insufficient liquidity

Database Persistence
- Order table: id, userId, marketId, side, type, price, amount, filled, status
- Trade table: id, buyOrderId, sellOrderId, marketId, price, amount

Production Considerations
- In-memory engine OK for MVP; move to event-sourced system for scale
- Add WebSocket for push updates instead of polling
- Add circuit breakers and rate limiting
- Add risk checks (position limits, notional limits)
- Add post-only orders and iceberg orders
- Add order expiry (GTD, IOC, FOK order types)
- Add margin/leverage trading
- Add order modification (amend price/qty)
- Add multi-leg strategies
