// Standalone WebSocket process that polls real live crypto prices from CoinGecko's
// public API and broadcasts ticker updates to subscribed clients. Runs alongside
// `next dev` via `npm run dev:ws`.
import { WebSocketServer, WebSocket } from 'ws'
import Redis from 'ioredis'
import prisma from '../lib/prisma'
import { tickerKey } from '../lib/prices'

const REDIS_URL = process.env.REDIS_URL || 'redis://127.0.0.1:6379'
const WS_PORT = parseInt(process.env.WS_PORT || '4001')
const TICK_MS = 30_000
const PUBLISH_CHANNEL = 'ticker-updates'
const COINGECKO_URL = 'https://api.coingecko.com/api/v3/coins/markets'

const redis = new Redis(REDIS_URL)
const publisher = new Redis(REDIS_URL)

// Catalog of polled markets — loaded once at boot from the Market table (populated by
// scripts/sync-markets.ts). Restart this process after running the sync script.
let MARKETS: { symbol: string; geckoId: string; basePrice: number }[] = []
let GECKO_ID_TO_SYMBOL: Record<string, string> = {}

async function loadMarkets() {
  const rows = await prisma.market.findMany({
    where: { geckoId: { not: null } },
    select: { symbol: true, geckoId: true, basePrice: true }
  })
  MARKETS = rows.map((r) => ({ symbol: r.symbol, geckoId: r.geckoId as string, basePrice: r.basePrice ? parseFloat(r.basePrice.toString()) : 0 }))
  GECKO_ID_TO_SYMBOL = Object.fromEntries(MARKETS.map((m) => [m.geckoId, m.symbol]))
}

type ClientState = { ws: WebSocket; symbols: Set<string> }
const clients = new Set<ClientState>()

type GeckoCoin = {
  id: string
  image: string
  current_price: number
  price_change_percentage_24h: number | null
  high_24h: number | null
  low_24h: number | null
  total_volume: number | null
  market_cap: number | null
  circulating_supply: number | null
  ath: number | null
  fully_diluted_valuation: number | null
}

async function seedFallback(symbol: string, basePrice: number) {
  const exists = await redis.exists(tickerKey(symbol))
  if (exists) return
  await redis.hset(tickerKey(symbol), {
    price: basePrice.toString(),
    change24h: '0',
    high24h: basePrice.toString(),
    low24h: basePrice.toString(),
    volume24h: '0',
    marketCap: '0',
    circulatingSupply: '0',
    ath: '0',
    fullyDilutedValuation: '0',
    updatedAt: '0'
  })
}

async function fetchLivePrices() {
  const ids = MARKETS.map((m) => m.geckoId).join(',')
  const url = `${COINGECKO_URL}?vs_currency=usd&ids=${ids}&per_page=${MARKETS.length || 50}`

  const res = await fetch(url, { headers: { Accept: 'application/json' } })
  if (!res.ok) throw new Error(`CoinGecko responded ${res.status}`)

  const coins = (await res.json()) as GeckoCoin[]
  const now = Date.now()

  for (const coin of coins) {
    const symbol = GECKO_ID_TO_SYMBOL[coin.id]
    if (!symbol) continue

    const payload = {
      symbol,
      price: coin.current_price,
      change24h: coin.price_change_percentage_24h ?? 0,
      high24h: coin.high_24h ?? coin.current_price,
      low24h: coin.low_24h ?? coin.current_price,
      volume24h: coin.total_volume ?? 0,
      marketCap: coin.market_cap ?? 0,
      circulatingSupply: coin.circulating_supply ?? 0,
      ath: coin.ath ?? 0,
      fullyDilutedValuation: coin.fully_diluted_valuation ?? 0,
      logo: coin.image
    }

    await redis.hset(tickerKey(symbol), {
      price: payload.price.toString(),
      change24h: payload.change24h.toString(),
      high24h: payload.high24h.toString(),
      low24h: payload.low24h.toString(),
      volume24h: payload.volume24h.toString(),
      marketCap: payload.marketCap.toString(),
      circulatingSupply: payload.circulatingSupply.toString(),
      ath: payload.ath.toString(),
      fullyDilutedValuation: payload.fullyDilutedValuation.toString(),
      logo: payload.logo,
      updatedAt: now.toString()
    })

    await publisher.publish(PUBLISH_CHANNEL, JSON.stringify(payload))
    broadcast(symbol, payload)
  }
}

function broadcast(symbol: string, payload: unknown) {
  const message = JSON.stringify({ type: 'ticker', ...((payload as object) || {}) })
  for (const client of clients) {
    if (client.ws.readyState === WebSocket.OPEN && client.symbols.has(symbol)) {
      client.ws.send(message)
    }
  }
}

async function main() {
  await loadMarkets()
  console.log(`[ws-server] loaded ${MARKETS.length} markets from the database`)

  for (const m of MARKETS) {
    await seedFallback(m.symbol, m.basePrice)
  }

  try {
    await fetchLivePrices()
    console.log('[ws-server] seeded live prices from CoinGecko')
  } catch (err) {
    console.error('[ws-server] initial live price fetch failed, using fallback prices', err)
  }

  const wss = new WebSocketServer({ port: WS_PORT })
  console.log(`[ws-server] listening on ws://localhost:${WS_PORT}`)

  wss.on('connection', (ws) => {
    const state: ClientState = { ws, symbols: new Set(MARKETS.map((m) => m.symbol)) }
    clients.add(state)

    ws.on('message', (raw) => {
      try {
        const msg = JSON.parse(raw.toString())
        if (msg.type === 'subscribe' && typeof msg.symbol === 'string') {
          state.symbols = new Set([msg.symbol])
        }
      } catch {
        // ignore malformed messages
      }
    })

    ws.on('close', () => clients.delete(state))
  })

  setInterval(() => {
    fetchLivePrices().catch((err) => console.error('[ws-server] live price fetch failed', err))
  }, TICK_MS)
}

main().catch((err) => {
  console.error('[ws-server] fatal error', err)
  process.exit(1)
})
