import React from 'react'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowDown, ArrowLeft, ArrowUp } from 'lucide-react'
import Button from '../../../components/ui/Button'
import GlassIcon from '../../../components/ui/GlassIcon'
import Divider from '../../../components/ui/Divider'
import { Table, THead, TBody, TR, TH, TD } from '../../../components/ui/Table'
import { LivePrice, LiveChange } from '../../../components/market/Live'
import CoinChart from '../../../components/market/CoinChart'
import WatchlistStarButton from '../../../components/market/WatchlistStarButton'
import CoinIcon from '../../../components/market/CoinIcon'
import RelatedMarketsCarousel from '../../../components/market/RelatedMarketsCarousel'
import AboutSection from '../../../components/market/AboutSection'
import { getMarket, getAllMarkets, getCandlesForRange, getMarketAbout, getMarketLinks } from '../../../lib/prices'
import prisma from '../../../lib/prisma'
import { formatCompact, formatNumber } from '../../../lib/utils'

export default async function MarketDetailPage({ params }: { params: Promise<{ symbol: string }> }) {
  const { symbol } = await params
  const market = await getMarket(symbol)
  if (!market) notFound()

  const [candles, dbMarket, allMarkets] = await Promise.all([
    getCandlesForRange(symbol, '1D'),
    prisma.market.findUnique({ where: { symbol } }),
    getAllMarkets()
  ])

  const trades = dbMarket
    ? await prisma.trade.findMany({ where: { marketId: dbMarket.id }, orderBy: { createdAt: 'desc' }, take: 15 })
    : []

  const related = allMarkets.filter((m) => m.symbol !== market.symbol)
  const about = await getMarketAbout(market.symbol)
  const links = await getMarketLinks(market.symbol)

  const isUp = market.change24h >= 0

  return (
    <div className="py-10">
      <Link href="/markets" className="mb-4 inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground">
        <GlassIcon icon={ArrowLeft} size={13} /> Markets
      </Link>

      <div className="flex flex-wrap items-start justify-between gap-6">
        <div>
          <div className="flex items-center gap-3">
            <CoinIcon logo={market.logo} baseAsset={market.baseAsset} iconBg={market.iconBg} size={36} />
            <div>
              <h1 className="text-xl font-semibold leading-tight">{market.name}</h1>
              <div className="text-sm text-muted-foreground">{market.symbol}</div>
            </div>
            <WatchlistStarButton symbol={market.symbol} />
          </div>

          <div className="mt-6 flex items-baseline gap-3">
            <LivePrice symbol={market.symbol} initialPrice={market.price} maximumFractionDigits={market.price < 10 ? 4 : 2} className="text-4xl font-semibold" />
            <span className={isUp ? 'text-up' : 'text-down'}>
              <LiveChange symbol={market.symbol} initialChange={market.change24h} />
            </span>
            <GlassIcon icon={isUp ? ArrowUp : ArrowDown} size={13} iconClassName={isUp ? 'text-up' : 'text-down'} />
          </div>

          <div className="mt-3 inline-flex items-center gap-2 rounded-full border border-border px-3 py-1.5 text-2xs text-muted-foreground">
            <CoinIcon logo={market.logo} baseAsset={market.baseAsset} iconBg={market.iconBg} size={16} />
            24h vol ${formatCompact(market.volume24h)}
          </div>
        </div>

        <div className="flex flex-wrap gap-3">
          <Button asChild variant="up" size="lg">
            <Link href={`/trade?market=${market.symbol}&side=BUY`}>Buy {market.baseAsset}</Link>
          </Button>
          <Button asChild variant="down" size="lg">
            <Link href={`/trade?market=${market.symbol}&side=SELL`}>Sell {market.baseAsset}</Link>
          </Button>
        </div>
      </div>

      <div className="mt-10">
        <CoinChart symbol={market.symbol} initialCandles={candles} />
      </div>

      {about && links && (
        <>
          <Divider className="mt-10" />
          <div className="py-10">
            <AboutSection name={market.name} about={about} website={links.website} whitepaper={links.whitepaper} />
          </div>
        </>
      )}

      <Divider />

      <div className="py-10">
        <h2 className="mb-6 text-lg font-semibold tracking-tight">Stats</h2>
        <div className="grid grid-cols-2 gap-6 sm:grid-cols-3">
          <Stat
            label="Market cap"
            value={`$${formatCompact(market.marketCap)}`}
            badge={<LiveChange symbol={market.symbol} initialChange={market.change24h} className="ml-1.5 text-xs" />}
          />
          <Stat label="24hr vol" value={`$${formatCompact(market.volume24h)}`} />
          <Stat label="Circ. supply" value={`${formatCompact(market.circulatingSupply)} ${market.baseAsset}`} />
          <Stat label="All time high" value={`$${formatNumber(market.ath)}`} />
          <Stat label="Fully diluted market cap" value={`$${formatCompact(market.fullyDilutedValuation)}`} />
          <Stat label="24h high / low" value={`$${formatNumber(market.high24h)} / $${formatNumber(market.low24h)}`} />
        </div>
      </div>

      <Divider />

      <div className="py-10">
        <h2 className="mb-6 text-lg font-semibold tracking-tight">Recent trades</h2>
        <Table>
          <THead>
            <TR>
              <TH>Price</TH>
              <TH align="right">Amount</TH>
              <TH align="right">Time</TH>
            </TR>
          </THead>
          <TBody>
            {trades.map((t) => (
              <TR key={t.id}>
                <TD className="tabular">${formatNumber(parseFloat(t.price.toString()))}</TD>
                <TD align="right" className="tabular text-muted-foreground">{formatNumber(parseFloat(t.amount.toString()))}</TD>
                <TD align="right" className="text-muted-foreground">{new Date(t.createdAt).toLocaleTimeString()}</TD>
              </TR>
            ))}
            {trades.length === 0 && (
              <TR>
                <TD align="center" colSpan={3} className="py-8 text-muted-foreground">No trades yet</TD>
              </TR>
            )}
          </TBody>
        </Table>
      </div>

      <Divider />

      <div className="py-10">
        <RelatedMarketsCarousel markets={related} />
      </div>

      <p className="text-2xs text-muted-foreground">
        Displayed prices exclude trading costs. Prices and statistics on this page are sourced from third-party market data and may differ slightly from live trading prices.
      </p>
    </div>
  )
}

function Stat({ label, value, badge }: { label: string; value: string; badge?: React.ReactNode }) {
  return (
    <div>
      <div className="text-2xs uppercase tracking-wide text-muted-foreground underline decoration-dotted decoration-muted-foreground/50 underline-offset-2">
        {label}
      </div>
      <div className="mt-1 font-medium tabular">
        {value}
        {badge}
      </div>
    </div>
  )
}
