import { NextRequest, NextResponse } from 'next/server'
import { matchingEngine } from '../../../../lib/matching-engine'

export async function GET(req: NextRequest) {
  try {
    const marketId = req.nextUrl.searchParams.get('marketId')
    if (!marketId) return NextResponse.json({ error: 'Missing marketId' }, { status: 400 })

    const snapshot = await matchingEngine.getOrderBook2(marketId)
    return NextResponse.json(snapshot)
  } catch (e) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
