import { NextRequest, NextResponse } from 'next/server'
import prisma from '../../../../lib/prisma'

export async function GET(req: NextRequest) {
  try {
    const marketId = req.nextUrl.searchParams.get('marketId')
    const limit = parseInt(req.nextUrl.searchParams.get('limit') || '20')

    if (!marketId) return NextResponse.json({ error: 'Missing marketId' }, { status: 400 })

    const trades = await prisma.trade.findMany({
      where: { marketId },
      orderBy: { createdAt: 'desc' },
      take: limit,
      select: { id: true, price: true, amount: true, createdAt: true }
    })

    return NextResponse.json({ trades })
  } catch (e) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
