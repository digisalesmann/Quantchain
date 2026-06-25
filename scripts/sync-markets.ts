// One-time/periodic sync: pulls CoinGecko's live top-50-by-market-cap snapshot and upserts it
// into the Market table (catalog metadata), downloads real logos into public/images/coins/,
// and seeds StakingProduct rows for the handful of assets that are both real proof-of-stake
// and wallet-backed (see WALLET_CHAIN_BY_GECKO_ID below). Run via `npm run db:sync-markets`.
// Restart `next dev` and `npm run dev:ws` afterwards — both cache Prisma/market data in memory.
import fs from 'fs'
import path from 'path'
import prisma from '../lib/prisma'
import type { Chain } from '../lib/walletChains'

const COINGECKO_URL = 'https://api.coingecko.com/api/v3/coins/markets'
const ICONS_DIR = path.join(process.cwd(), 'public', 'images', 'coins')
const DETAIL_DELAY_MS = 7000
const RETRY_DELAY_MS = 20000
const TOP_N = 50

type GeckoMarket = {
  id: string
  symbol: string
  name: string
  image: string
  current_price: number
  market_cap: number | null
  market_cap_rank: number | null
  total_volume: number | null
  circulating_supply: number | null
  ath: number | null
  fully_diluted_valuation: number | null
}

type GeckoDetail = {
  description?: { en?: string }
  links?: { homepage?: string[]; whitepaper?: string }
}

// Chains we have real generateWalletAddress() support for (lib/wallet.ts) — only these
// geckoIds get walletChain set; everything else stays market-only, same tier XRP/ADA already are.
const WALLET_CHAIN_BY_GECKO_ID: Record<string, Chain> = {
  bitcoin: 'bitcoin',
  ethereum: 'ethereum',
  solana: 'solana',
  litecoin: 'litecoin',
  dogecoin: 'dogecoin',
  binancecoin: 'bnb',
  'matic-network': 'polygon',
  'polygon-ecosystem-token': 'polygon',
  'avalanche-2': 'avalanche'
}

// Only mark assets stakeable if they're both real proof-of-stake AND wallet-backed above
// (staking debits a real wallet balance) — excludes BTC/LTC/DOGE, which aren't PoS in reality.
const STAKING_CONFIG: Record<string, { name: string; apy: string; lockupDays: number }> = {
  ethereum: { name: 'Ethereum 30-day lock', apy: '5.5', lockupDays: 30 },
  solana: { name: 'Solana 90-day lock', apy: '7.1', lockupDays: 90 },
  binancecoin: { name: 'BNB flexible earn', apy: '4.2', lockupDays: 0 },
  'matic-network': { name: 'Polygon 30-day lock', apy: '6.8', lockupDays: 30 },
  'polygon-ecosystem-token': { name: 'Polygon 30-day lock', apy: '6.8', lockupDays: 30 },
  'avalanche-2': { name: 'Avalanche 60-day lock', apy: '7.9', lockupDays: 60 }
}

// Confident, well-known official brand colors for the more recognizable coins; everything else
// defaults to white (matches how most of the original 6 markets were already configured).
const ICON_BG_OVERRIDES: Record<string, string> = {
  bitcoin: '#F7931A',
  dogecoin: '#C2A633',
  ripple: '#000000',
  litecoin: '#345D9D',
  binancecoin: '#F0B90B',
  'avalanche-2': '#E84142',
  'matic-network': '#8247E5',
  'polygon-ecosystem-token': '#8247E5',
  tron: '#EF0027',
  toncoin: '#0088CC',
  'shiba-inu': '#FFA409',
  chainlink: '#375BD2'
}

function decimalsForPrice(price: number) {
  if (price >= 1) return { baseDecimals: 8, quoteDecimals: 2, tickSize: '0.01', minOrderSize: '0.001' }
  if (price >= 0.01) return { baseDecimals: 6, quoteDecimals: 4, tickSize: '0.0001', minOrderSize: '1' }
  if (price >= 0.001) return { baseDecimals: 8, quoteDecimals: 5, tickSize: '0.00001', minOrderSize: '1' }
  return { baseDecimals: 8, quoteDecimals: 6, tickSize: '0.000001', minOrderSize: '10' }
}

function cleanDescription(html?: string) {
  if (!html) return null
  const text = html.replace(/<[^>]*>/g, '').replace(/\r\n/g, '\n').trim()
  if (!text) return null
  if (text.length <= 1200) return text
  const cut = text.slice(0, 1200)
  const lastSentence = cut.lastIndexOf('. ')
  return lastSentence > 200 ? cut.slice(0, lastSentence + 1) : cut
}

function isRealUrl(url?: string | null) {
  return !!url && /^https?:\/\//.test(url)
}

async function downloadIcon(baseAsset: string, imageUrl: string) {
  const filePath = path.join(ICONS_DIR, `${baseAsset.toLowerCase()}.png`)
  if (fs.existsSync(filePath)) return // preserve the existing, hand-verified icons
  try {
    const res = await fetch(imageUrl)
    if (!res.ok) return
    const buf = Buffer.from(await res.arrayBuffer())
    fs.writeFileSync(filePath, buf)
  } catch {
    // non-fatal — leave logoPath set, the file just won't exist locally yet
  }
}

async function fetchDetail(id: string, attempt = 1): Promise<GeckoDetail | null> {
  try {
    const res = await fetch(
      `https://api.coingecko.com/api/v3/coins/${id}?localization=false&tickers=false&market_data=false&community_data=false&developer_data=false&sparkline=false`,
      { headers: { Accept: 'application/json' } }
    )
    if (res.status === 429 && attempt < 3) {
      console.warn(`[sync-markets] rate-limited fetching ${id}, retrying in ${RETRY_DELAY_MS / 1000}s...`)
      await sleep(RETRY_DELAY_MS)
      return fetchDetail(id, attempt + 1)
    }
    if (!res.ok) return null
    return (await res.json()) as GeckoDetail
  } catch {
    return null
  }
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

async function main() {
  fs.mkdirSync(ICONS_DIR, { recursive: true })

  console.log(`[sync-markets] fetching top ${TOP_N} markets from CoinGecko...`)
  const res = await fetch(`${COINGECKO_URL}?vs_currency=usd&order=market_cap_desc&per_page=${TOP_N}&page=1`, {
    headers: { Accept: 'application/json' }
  })
  if (!res.ok) throw new Error(`CoinGecko /coins/markets responded ${res.status}`)
  const coins = (await res.json()) as GeckoMarket[]

  const seenAssets = new Set<string>()
  const seenSymbols = new Set<string>()
  let created = 0
  let updated = 0

  for (const coin of coins) {
    const baseAsset = coin.symbol.toUpperCase()
    if (seenAssets.has(baseAsset)) {
      console.warn(`[sync-markets] skipping duplicate ticker ${baseAsset} (${coin.id})`)
      continue
    }
    seenAssets.add(baseAsset)

    const symbol = `${baseAsset}-USD`
    seenSymbols.add(symbol)
    const detail = await fetchDetail(coin.id)
    await sleep(DETAIL_DELAY_MS)

    await downloadIcon(baseAsset, coin.image)

    const websiteCandidate = detail?.links?.homepage?.find(isRealUrl) ?? null
    const whitepaperCandidate = isRealUrl(detail?.links?.whitepaper) ? detail!.links!.whitepaper! : null
    const about = cleanDescription(detail?.description?.en)

    const walletChain = WALLET_CHAIN_BY_GECKO_ID[coin.id] ?? null
    const stakeable = coin.id in STAKING_CONFIG

    const metadata = {
      name: coin.name,
      geckoId: coin.id,
      marketCapRank: coin.market_cap_rank,
      logoPath: `/images/coins/${baseAsset.toLowerCase()}.png`,
      iconBg: ICON_BG_OVERRIDES[coin.id] ?? '#FFFFFF',
      about,
      website: websiteCandidate,
      whitepaper: whitepaperCandidate,
      walletChain,
      stakeable,
      basePrice: coin.current_price?.toString() ?? '0',
      marketCap: (coin.market_cap ?? 0).toString(),
      volume24h: (coin.total_volume ?? 0).toString(),
      circulatingSupply: (coin.circulating_supply ?? 0).toString(),
      ath: (coin.ath ?? 0).toString(),
      fullyDilutedValuation: (coin.fully_diluted_valuation ?? 0).toString()
    }

    const existing = await prisma.market.findUnique({ where: { symbol } })

    if (existing) {
      await prisma.market.update({ where: { symbol }, data: metadata })
      updated++
    } else {
      const precision = decimalsForPrice(coin.current_price ?? 1)
      await prisma.market.create({
        data: { symbol, baseAsset, quoteAsset: 'USD', status: 'ACTIVE', ...precision, ...metadata }
      })
      created++
    }

    console.log(`[sync-markets] ${symbol} ${existing ? 'updated' : 'created'}${walletChain ? ` (wallet: ${walletChain})` : ''}${stakeable ? ' (stakeable)' : ''}`)
  }

  console.log(`[sync-markets] markets: ${created} created, ${updated} updated`)

  // Drop markets that fell out of the live top 50 since the last sync — but only if nobody has
  // actually traded them (real orders/trades on a real, if now-smaller, market shouldn't vanish).
  const staleMarkets = await prisma.market.findMany({
    where: { symbol: { notIn: Array.from(seenSymbols) } },
    include: { _count: { select: { orders: true, trades: true } } }
  })
  for (const market of staleMarkets) {
    if (market._count.orders > 0 || market._count.trades > 0) {
      console.warn(`[sync-markets] leaving ${market.symbol} — fell out of top ${TOP_N} but has order/trade history`)
      continue
    }
    await prisma.market.delete({ where: { id: market.id } })
    console.log(`[sync-markets] removed ${market.symbol} — fell out of top ${TOP_N}`)
  }

  const stakeableAssets = new Set<string>()
  for (const [geckoId, config] of Object.entries(STAKING_CONFIG)) {
    const market = await prisma.market.findUnique({ where: { geckoId } })
    if (!market) continue
    stakeableAssets.add(market.baseAsset)
    const existingProduct = await prisma.stakingProduct.findFirst({ where: { asset: market.baseAsset } })
    if (existingProduct) {
      await prisma.stakingProduct.update({ where: { id: existingProduct.id }, data: { name: config.name, apy: config.apy, lockupDays: config.lockupDays } })
    } else {
      await prisma.stakingProduct.create({ data: { name: config.name, asset: market.baseAsset, apy: config.apy, lockupDays: config.lockupDays } })
    }
  }
  console.log(`[sync-markets] staking products synced for ${stakeableAssets.size} assets`)

  // Remove stale products for assets that are no longer in the stakeable set (e.g. an earlier
  // "Bitcoin flexible earn" product — BTC isn't proof-of-stake, so it shouldn't be stakeable).
  const staleProducts = await prisma.stakingProduct.findMany({
    where: { asset: { notIn: Array.from(stakeableAssets) } },
    include: { _count: { select: { positions: true } } }
  })
  for (const product of staleProducts) {
    if (product._count.positions > 0) {
      console.warn(`[sync-markets] leaving stale staking product "${product.name}" (${product.asset}) — has open positions`)
      continue
    }
    await prisma.stakingProduct.delete({ where: { id: product.id } })
    console.log(`[sync-markets] removed stale staking product "${product.name}" (${product.asset})`)
  }
}

main()
  .catch((err) => {
    console.error('[sync-markets] fatal error', err)
    process.exitCode = 1
  })
  .finally(() => prisma.$disconnect())
