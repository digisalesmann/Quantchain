import { NextRequest, NextResponse } from 'next/server'
import { getSessionUserId } from '../../../../lib/session'
import prisma from '../../../../lib/prisma'
import { CHAIN_TO_SYMBOL, getPortfolioCandles } from '../../../../lib/prices'

export async function GET(req: NextRequest) {
  const userId = await getSessionUserId()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const range = req.nextUrl.searchParams.get('range') || '1D'
  const wallets = await prisma.wallet.findMany({ where: { userId } })

  const holdings = wallets
    .map((w) => {
      const symbol = CHAIN_TO_SYMBOL[w.chain]
      if (!symbol) return null
      return { symbol, amount: parseFloat(w.available.toString()) }
    })
    .filter((h): h is { symbol: string; amount: number } => h !== null)

  const candles = await getPortfolioCandles(holdings, range)
  return NextResponse.json({ candles })
}
