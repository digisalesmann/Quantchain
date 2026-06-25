import { CHAIN_TO_SYMBOL, type Market } from './prices'

export function buildTradableAssets(
  dbMarkets: { id: string; symbol: string; baseAsset: string; quoteAsset: string }[],
  markets: Market[]
) {
  return dbMarkets.map((m) => {
    const chain = Object.entries(CHAIN_TO_SYMBOL).find(([, symbol]) => symbol === m.symbol)?.[0] || ''
    const market = markets.find((mk) => mk.symbol === m.symbol)
    return {
      marketId: m.id,
      symbol: m.symbol,
      chain,
      baseAsset: m.baseAsset,
      quoteAsset: m.quoteAsset,
      price: market?.price ?? 0,
      logo: market?.logo ?? '',
      iconBg: market?.iconBg ?? '#FFFFFF'
    }
  })
}

export function buildWalletOptions(
  wallets: { id: string; chain: string; available: { toString(): string } }[],
  markets: Market[]
) {
  return wallets.map((w) => {
    const symbol = CHAIN_TO_SYMBOL[w.chain]
    const market = markets.find((mk) => mk.symbol === symbol)
    return {
      id: w.id,
      chain: w.chain,
      baseAsset: market?.baseAsset || w.chain.toUpperCase(),
      available: w.available.toString(),
      logo: market?.logo ?? '',
      iconBg: market?.iconBg ?? '#FFFFFF',
      price: market?.price ?? 0
    }
  })
}
