import redis from './redis'
import prisma from './prisma'
import { type Candle, type ChartRange, CHART_RANGES } from './marketTypes'
import { type Chain } from './walletChains'

export type { Candle, ChartRange }
export { CHART_RANGES }

export type Market = {
  symbol: string
  name: string
  baseAsset: string
  logo: string
  iconBg: string
  price: number
  change24h: number
  high24h: number
  low24h: number
  volume24h: number
  marketCap: number
  circulatingSupply: number
  ath: number
  fullyDilutedValuation: number
}

// Which chains we have real generateWalletAddress() support for, and the single asset each
// one backs. This is a statement about implemented wallet code, not catalog data — it stays a
// small static dict (unlike the other ~42 top-50 assets, which are market-only: no wallet).
export const CHAIN_TO_SYMBOL: Record<string, string> = {
  bitcoin: 'BTC-USD',
  ethereum: 'ETH-USD',
  solana: 'SOL-USD',
  litecoin: 'LTC-USD',
  dogecoin: 'DOGE-USD',
  bnb: 'BNB-USD',
  polygon: 'POL-USD',
  avalanche: 'AVAX-USD'
}

export const ASSET_TO_CHAIN: Record<string, Chain> = Object.fromEntries(
  Object.entries(CHAIN_TO_SYMBOL).map(([chain, symbol]) => [symbol.split('-')[0], chain as Chain])
) as Record<string, Chain>

export function tickerKey(symbol: string) {
  return `ticker:${symbol}`
}

async function readTickerHash(symbol: string) {
  try {
    const data = await redis.hgetall(tickerKey(symbol))
    if (!data || Object.keys(data).length === 0) return null
    return {
      price: parseFloat(data.price),
      change24h: parseFloat(data.change24h),
      high24h: parseFloat(data.high24h),
      low24h: parseFloat(data.low24h),
      volume24h: parseFloat(data.volume24h),
      marketCap: data.marketCap ? parseFloat(data.marketCap) : undefined,
      circulatingSupply: data.circulatingSupply ? parseFloat(data.circulatingSupply) : undefined,
      ath: data.ath ? parseFloat(data.ath) : undefined,
      fullyDilutedValuation: data.fullyDilutedValuation ? parseFloat(data.fullyDilutedValuation) : undefined,
      logo: data.logo || undefined,
      updatedAt: data.updatedAt ? parseInt(data.updatedAt, 10) : undefined
    }
  } catch {
    return null
  }
}

const LIVE_DATA_MAX_AGE_MS = 5 * 60 * 1000

type MarketRow = {
  symbol: string
  name: string | null
  baseAsset: string
  logoPath: string | null
  iconBg: string | null
  basePrice: { toString(): string } | null
  marketCap: { toString(): string } | null
  volume24h: { toString(): string } | null
  circulatingSupply: { toString(): string } | null
  ath: { toString(): string } | null
  fullyDilutedValuation: { toString(): string } | null
}

function num(value: { toString(): string } | null) {
  return value ? parseFloat(value.toString()) : 0
}

function toMarket(row: MarketRow, live: Awaited<ReturnType<typeof readTickerHash>>): Market {
  const isFresh = live?.updatedAt ? Date.now() - live.updatedAt < LIVE_DATA_MAX_AGE_MS : false
  const basePrice = num(row.basePrice)

  return {
    symbol: row.symbol,
    name: row.name ?? row.baseAsset,
    baseAsset: row.baseAsset,
    logo: row.logoPath ?? '',
    iconBg: row.iconBg ?? '#FFFFFF',
    price: isFresh ? live!.price : basePrice,
    change24h: isFresh ? live!.change24h : 0,
    high24h: isFresh ? live!.high24h : basePrice,
    low24h: isFresh ? live!.low24h : basePrice,
    volume24h: isFresh ? live!.volume24h : num(row.volume24h),
    marketCap: (isFresh && live!.marketCap) || num(row.marketCap),
    circulatingSupply: (isFresh && live!.circulatingSupply) || num(row.circulatingSupply),
    ath: (isFresh && live!.ath) || num(row.ath),
    fullyDilutedValuation: (isFresh && live!.fullyDilutedValuation) || num(row.fullyDilutedValuation)
  }
}

export async function getMarket(symbol?: string | null): Promise<Market | null> {
  if (!symbol) return null
  const row = await prisma.market.findUnique({ where: { symbol } })
  if (!row) return null

  const live = await readTickerHash(symbol)
  return toMarket(row, live)
}

export async function getAllMarkets(): Promise<Market[]> {
  const rows = await prisma.market.findMany({ orderBy: { marketCapRank: 'asc' } })
  const lives = await Promise.all(rows.map((r) => readTickerHash(r.symbol)))
  return rows.map((r, i) => toMarket(r, lives[i]))
}

export async function getMarketAbout(symbol: string): Promise<string> {
  const row = await prisma.market.findUnique({ where: { symbol }, select: { about: true } })
  return row?.about ?? ''
}

export async function getMarketLinks(symbol: string): Promise<{ website: string; whitepaper?: string } | null> {
  const row = await prisma.market.findUnique({ where: { symbol }, select: { website: true, whitepaper: true } })
  if (!row?.website) return null
  return { website: row.website, whitepaper: row.whitepaper ?? undefined }
}

export async function getTicker(symbol: string) {
  const market = await getMarket(symbol)
  if (!market) return null
  return {
    symbol,
    price: market.price,
    change24h: market.change24h,
    volume24h: market.volume24h,
    updatedAt: Date.now()
  }
}

export async function generateMockCandles(symbol: string, points = 120, stepSeconds = 60 * 60): Promise<Candle[]> {
  const market = await getMarket(symbol)
  const endPrice = market?.price ?? 100
  const volatility = endPrice * 0.006

  // Walk backwards from the current live price so the chart always ends on today's price.
  const reversed: Candle[] = []
  let price = endPrice
  const now = Math.floor(Date.now() / 1000)

  for (let i = 0; i < points; i++) {
    const time = now - i * stepSeconds
    const close = price
    const open = close + (Math.random() - 0.5) * volatility
    const high = Math.max(open, close) + Math.random() * volatility * 0.5
    const low = Math.min(open, close) - Math.random() * volatility * 0.5
    const volume = Math.random() * 1000
    reversed.push({ time, open, high, low, close: Math.max(0.0001, close), volume })
    price = open
  }

  return reversed.reverse()
}

const RANGE_CONFIG: Record<ChartRange, { points: number; stepSeconds: number }> = {
  '1H': { points: 60, stepSeconds: 60 },
  '1D': { points: 24, stepSeconds: 60 * 60 },
  '1W': { points: 7 * 24, stepSeconds: 60 * 60 },
  '1M': { points: 30, stepSeconds: 24 * 60 * 60 },
  '1Y': { points: 365, stepSeconds: 24 * 60 * 60 },
  All: { points: 730, stepSeconds: 24 * 60 * 60 }
}

export async function getCandlesForRange(symbol: string, range: string): Promise<Candle[]> {
  const config = RANGE_CONFIG[(range as ChartRange) in RANGE_CONFIG ? (range as ChartRange) : '1D']
  return generateMockCandles(symbol, config.points, config.stepSeconds)
}

export async function getOHLCV(symbol: string, _interval: string = '1H', limit = 120) {
  return generateMockCandles(symbol, limit)
}

export async function getPortfolioCandles(holdings: { symbol: string; amount: number }[], range: string): Promise<Candle[]> {
  if (holdings.length === 0) return []

  const perSymbol = await Promise.all(holdings.map((h) => getCandlesForRange(h.symbol, range)))
  const length = Math.min(...perSymbol.map((c) => c.length))
  if (length === 0) return []

  const combined: Candle[] = []
  for (let i = 0; i < length; i++) {
    let open = 0
    let high = 0
    let low = 0
    let close = 0
    let volume = 0
    holdings.forEach((h, idx) => {
      const candle = perSymbol[idx][i]
      open += candle.open * h.amount
      high += candle.high * h.amount
      low += candle.low * h.amount
      close += candle.close * h.amount
      volume += candle.volume
    })
    combined.push({ time: perSymbol[0][i].time, open, high, low, close, volume })
  }
  return combined
}
