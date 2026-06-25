import { NextRequest, NextResponse } from 'next/server'
import { getCandlesForRange } from '../../../../lib/prices'

export async function GET(req: NextRequest) {
  const symbol = req.nextUrl.searchParams.get('symbol')
  const range = req.nextUrl.searchParams.get('range') || '1D'
  if (!symbol) return NextResponse.json({ error: 'Missing symbol' }, { status: 400 })

  const candles = await getCandlesForRange(symbol, range)
  return NextResponse.json({ candles })
}
