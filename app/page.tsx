import React from 'react'
import Link from 'next/link'
import { CandlestickChart, ChevronRight, Coins, KeyRound, PiggyBank, Receipt, ShieldCheck, TrendingUp, Wallet as WalletIcon } from 'lucide-react'
import { getSessionUserId } from '../lib/session'
import prisma from '../lib/prisma'
import { getAllMarkets, getPortfolioCandles, CHAIN_TO_SYMBOL } from '../lib/prices'
import Button from '../components/ui/Button'
import { Section, SectionHeader } from '../components/ui/Section'
import Divider from '../components/ui/Divider'
import { Table, THead, TBody, TR, TH, TD } from '../components/ui/Table'
import { LivePrice, LiveChange } from '../components/market/Live'
import { PortfolioValue, PortfolioDelta, type Holding } from '../components/market/PortfolioValue'
import PortfolioChart from '../components/market/PortfolioChart'
import QuickTradePanel from '../components/dashboard/QuickTradePanel'
import { buildTradableAssets, buildWalletOptions } from '../lib/quickTrade'
import WatchlistSection from '../components/dashboard/WatchlistSection'
import CryptoDiscoverySection from '../components/dashboard/CryptoDiscoverySection'
import StakingPromo from '../components/dashboard/StakingPromo'
import OnboardingNudge from '../components/dashboard/OnboardingNudge'
import PhoneVideo from '../components/marketing/PhoneVideo'
import FeatureRow from '../components/marketing/FeatureRow'
import Footer from '../components/marketing/Footer'
import OrderBookPanel from '../components/trade/OrderBookPanel'
import GlassIcon from '../components/ui/GlassIcon'
import CoinIcon from '../components/market/CoinIcon'
import { formatCompact, formatCurrency } from '../lib/utils'

export default async function DashboardPage() {
  const userId = await getSessionUserId()
  const markets = await getAllMarkets()

  if (!userId) {
    const btcMarket = await prisma.market.findUnique({ where: { symbol: 'BTC-USD' } })
    return <LoggedOutHome markets={markets} btcMarketId={btcMarket?.id ?? null} />
  }

  const [wallets, openOrderCount, stakingPositions, dbMarkets, sessionUser, stakingProducts] = await Promise.all([
    prisma.wallet.findMany({ where: { userId } }),
    prisma.order.count({ where: { userId, status: { in: ['NEW', 'PARTIALLY_FILLED'] } } }),
    prisma.stakingPosition.findMany({ where: { userId } }),
    prisma.market.findMany({ where: { symbol: { in: Object.values(CHAIN_TO_SYMBOL) } } }),
    prisma.user.findUnique({ where: { id: userId }, select: { onboardingCompletedAt: true } }),
    prisma.stakingProduct.findMany({ orderBy: { apy: 'desc' }, take: 3 })
  ])

  const holdings: Holding[] = wallets
    .map((w) => {
      const symbol = CHAIN_TO_SYMBOL[w.chain]
      const market = markets.find((m) => m.symbol === symbol)
      if (!symbol || !market) return null
      return { symbol, amount: parseFloat(w.balance.toString()), initialPrice: market.price }
    })
    .filter((h): h is Holding => h !== null)

  const cryptoTotal = holdings.reduce((sum, h) => sum + h.amount * h.initialPrice, 0)
  const earnTotal = stakingPositions.reduce((sum, p) => sum + parseFloat(p.amount.toString()) + parseFloat(p.rewardAccrued.toString()), 0)

  const candles = await getPortfolioCandles(
    holdings.map((h) => ({ symbol: h.symbol, amount: h.amount })),
    '1D'
  )

  const tradableAssets = buildTradableAssets(dbMarkets, markets)
  const walletOptions = buildWalletOptions(wallets, markets)
  const stakingCoins = stakingProducts.map((p) => {
    const market = markets.find((m) => m.baseAsset === p.asset)
    return { baseAsset: p.asset, logo: market?.logo ?? '', iconBg: market?.iconBg ?? '#FFFFFF' }
  })

  return (
    <div className="grid grid-cols-1 gap-8 py-8 sm:py-10 lg:grid-cols-3 lg:gap-10">
      <div className="lg:col-span-2">
        {!sessionUser?.onboardingCompletedAt && <OnboardingNudge />}

        <div className="flex items-baseline gap-3">
          <PortfolioValue holdings={holdings} className="text-4xl font-semibold tracking-tight sm:text-5xl" />
        </div>
        <PortfolioDelta holdings={holdings} className="mt-2 inline-block" />

        <div className="mt-8">
          <PortfolioChart initialCandles={candles} />
        </div>

        <div className="mt-8 divide-y divide-border border-y border-border">
          <BreakdownRow href="/wallets" icon={Coins} label="Crypto" value={formatCurrency(cryptoTotal)} />
          <BreakdownRow href="/lend" icon={PiggyBank} label="Earn" value={formatCurrency(earnTotal)} />
          <BreakdownRow href="/orders" icon={Receipt} label="Open orders" value={`${openOrderCount} ${openOrderCount === 1 ? 'order' : 'orders'}`} />
        </div>

        <div className="mt-10 flex items-center justify-between">
          <h2 className="text-lg font-semibold tracking-tight">Watchlist</h2>
          <Button asChild variant="ghost" size="sm"><Link href="/markets">View all markets</Link></Button>
        </div>
        <div className="mt-4">
          <WatchlistSection markets={markets} />
        </div>

        <Divider className="mt-10" />

        <div className="py-8">
          <CryptoDiscoverySection markets={markets} />
        </div>

        <Divider />

        <Section>
          <SectionHeader title="Markets" description="Live prices across supported assets" action={
            <Button asChild variant="ghost" size="sm"><Link href="/markets">View all markets</Link></Button>
          } />
          <MarketsTable markets={markets} />
        </Section>

        <div className="py-8">
          <StakingPromo coins={stakingCoins} />
        </div>
      </div>

      <div className="lg:col-span-1">
        <div className="lg:sticky lg:top-24">
          <QuickTradePanel assets={tradableAssets} wallets={walletOptions} />
        </div>
      </div>
    </div>
  )
}

function BreakdownRow({ href, icon: Icon, label, value }: { href: string; icon: typeof Coins; label: string; value: string }) {
  return (
    <Link href={href} className="flex items-center justify-between py-4 transition-colors hover:text-primary">
      <span className="flex items-center gap-3 text-sm font-medium">
        <GlassIcon icon={Icon} size={16} iconClassName="text-foreground" />
        {label}
      </span>
      <span className="flex items-center gap-1.5 text-sm tabular text-muted-foreground">
        {value}
        <GlassIcon icon={ChevronRight} size={13} />
      </span>
    </Link>
  )
}

function LoggedOutHome({
  markets,
  btcMarketId
}: {
  markets: Awaited<ReturnType<typeof getAllMarkets>>
  btcMarketId: string | null
}) {
  const TRUST_BADGES = [`${markets.length} assets supported`, 'Real-time order matching', '2FA & passkeys', 'Multi-chain wallets']

  return (
    <>
      <Section className="grid grid-cols-1 items-center gap-12 pb-8 first:pt-16 sm:first:pt-20 md:grid-cols-2 md:first:pt-28">
        <div>
          <h1 className="text-4xl font-semibold leading-[1.1] tracking-tight sm:text-5xl md:text-6xl md:leading-[1.05]">
            Buy, sell, and hold crypto with confidence
          </h1>
          <p className="mt-5 max-w-md text-lg text-muted-foreground">
            Spot trading, self-custody multi-chain wallets and bank-grade security, built for first-time buyers and professional traders alike.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Button asChild size="lg">
              <Link href="/auth/register">Get started</Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href="/markets">Explore markets</Link>
            </Button>
          </div>
          <div className="mt-8 flex flex-wrap items-center gap-x-2.5 gap-y-2 text-sm text-muted-foreground">
            {TRUST_BADGES.map((b, i) => (
              <React.Fragment key={b}>
                {i > 0 && <span className="text-muted-foreground/40">·</span>}
                <span>{b}</span>
              </React.Fragment>
            ))}
          </div>
        </div>

        <PhoneVideo src="/videos/wallet-trade.mp4" />
      </Section>

      <Divider className="mt-8" />

      <section className="relative left-1/2 w-screen -translate-x-1/2 bg-zinc-950 text-white">
        <div className="container grid grid-cols-1 items-center gap-12 py-20 md:grid-cols-2">
          <PhoneVideo src="/videos/portfolio-app.mp4" className="md:order-2" />
          <div className="md:order-1">
            <p className="text-2xs font-medium uppercase tracking-wide text-primary">Portfolio tracking</p>
            <h2 className="mt-3 text-4xl font-semibold leading-tight tracking-tight">Your whole portfolio, always in view</h2>
            <p className="mt-4 max-w-md text-zinc-400">
              Track balances, watch your top movers, and jump straight into a trade, all from one clean, fast dashboard that updates the moment the market does.
            </p>
            <Button asChild size="lg" variant="secondary" className="mt-6 bg-white text-black hover:bg-white/90">
              <Link href="/auth/register">See it in action</Link>
            </Button>
          </div>
        </div>
      </section>

      <FeatureRow
        icon={CandlestickChart}
        eyebrow="Spot trading"
        title="A real order book, not a simulation"
        description="Place limit and market orders against a live matching engine, with order book depth and trade history updating in real time."
      >
        {btcMarketId && (
          <div className="border-t border-border pt-5">
            <p className="mb-3 text-2xs font-medium uppercase tracking-wide text-muted-foreground">BTC-USD order book</p>
            <OrderBookPanel marketId={btcMarketId} />
          </div>
        )}
      </FeatureRow>

      <Divider />

      <FeatureRow
        icon={WalletIcon}
        eyebrow="Multi-chain wallets"
        title="Self-custody wallets for every major chain"
        description="Every account comes with dedicated Bitcoin, Ethereum, and Solana wallets, deposit, withdraw, and transfer between users instantly."
        align="right"
      >
        <div className="space-y-4 border-t border-border pt-5">
          {[
            { asset: 'BTC', logo: '/images/coins/btc.png', iconBg: '#F7931A', address: 'bc1qxy2k…83kkfjhx0wlh' },
            { asset: 'ETH', logo: '/images/coins/eth.png', iconBg: '#FFFFFF', address: '0x71C7…1B5f6d8976' },
            { asset: 'SOL', logo: '/images/coins/sol.png', iconBg: '#FFFFFF', address: '4Nd1m…3hHNHRdLNmMa' }
          ].map((w) => (
            <div key={w.asset} className="flex items-center justify-between">
              <span className="flex items-center gap-2 text-sm font-medium">
                <CoinIcon logo={w.logo} baseAsset={w.asset} iconBg={w.iconBg} size={28} />
                {w.asset}
              </span>
              <span className="font-mono text-2xs text-muted-foreground">{w.address}</span>
            </div>
          ))}
        </div>
      </FeatureRow>

      <Divider />

      <FeatureRow
        icon={ShieldCheck}
        eyebrow="Security"
        title="Security that doesn't get in your way"
        description="Two-factor authentication, passkeys, and full session visibility, set it up once in the security center and stay protected."
      >
        <ul className="space-y-4 border-t border-border pt-5">
          {[
            { icon: KeyRound, label: 'Passkey & biometric sign-in' },
            { icon: ShieldCheck, label: 'Authenticator app 2FA' },
            { icon: TrendingUp, label: 'Real-time session & device tracking' }
          ].map((item) => (
            <li key={item.label} className="flex items-center gap-3 text-sm">
              <GlassIcon icon={item.icon} size={15} iconClassName="text-up" />
              {item.label}
            </li>
          ))}
        </ul>
      </FeatureRow>

      <Divider />

      <Section>
        <SectionHeader title="Markets" description="Live prices, updated in real time" />
        <MarketsTable markets={markets} />
      </Section>

      <section className="relative left-1/2 w-screen -translate-x-1/2 bg-zinc-950 text-white">
        <div className="container grid grid-cols-1 items-center gap-12 py-20 md:grid-cols-2">
          <PhoneVideo src="/videos/quant.mp4" />
          <div>
            <p className="text-2xs font-medium uppercase tracking-wide text-primary">Quant-grade engine</p>
            <h2 className="mt-3 text-4xl font-semibold leading-tight tracking-tight">Built on a real matching engine</h2>
            <p className="mt-4 max-w-md text-zinc-400">
              Every order runs through a genuine price-time priority matching engine, the same mechanics that power professional exchanges, visualized in real time.
            </p>
            <Button asChild size="lg" variant="secondary" className="mt-6 bg-white text-black hover:bg-white/90">
              <Link href="/trade/advanced">Open the trading terminal</Link>
            </Button>
          </div>
        </div>
      </section>

      <Divider />

      <Section className="py-20 text-center">
        <h2 className="text-3xl font-semibold tracking-tight">Ready to start trading?</h2>
        <p className="mx-auto mt-3 max-w-md text-muted-foreground">Create an account in minutes, no manual ID entry, no paperwork to get started.</p>
        <Button asChild size="lg" className="mt-6">
          <Link href="/auth/register">Create your account</Link>
        </Button>
      </Section>

      <Footer />
    </>
  )
}

function MarketsTable({ markets }: { markets: Awaited<ReturnType<typeof getAllMarkets>> }) {
  return (
    <Table>
      <THead>
        <TR>
          <TH>Name</TH>
          <TH align="right">Price</TH>
          <TH align="right">24h change</TH>
          <TH align="right">Volume</TH>
          <TH align="right">Market cap</TH>
        </TR>
      </THead>
      <TBody>
        {markets.map((m) => (
          <TR key={m.symbol}>
            <TD>
              <Link href={`/markets/${m.symbol}`} className="flex items-center gap-3 font-medium">
                <CoinIcon logo={m.logo} baseAsset={m.baseAsset} iconBg={m.iconBg} size={28} />
                <span>
                  {m.name}
                  <span className="ml-2 text-muted-foreground">{m.baseAsset}</span>
                </span>
              </Link>
            </TD>
            <TD align="right"><LivePrice symbol={m.symbol} initialPrice={m.price} maximumFractionDigits={m.price < 10 ? 4 : 2} /></TD>
            <TD align="right"><LiveChange symbol={m.symbol} initialChange={m.change24h} /></TD>
            <TD align="right" className="tabular text-muted-foreground">${formatCompact(m.volume24h)}</TD>
            <TD align="right" className="tabular text-muted-foreground">${formatCompact(m.marketCap)}</TD>
          </TR>
        ))}
      </TBody>
    </Table>
  )
}
