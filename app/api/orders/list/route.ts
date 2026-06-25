import { NextRequest, NextResponse } from 'next/server'
import prisma from '../../../../lib/prisma'

export async function GET(req: NextRequest) {
  try {
    const userId = req.nextUrl.searchParams.get('userId')
    const marketId = req.nextUrl.searchParams.get('marketId')

    if (!userId) return NextResponse.json({ error: 'Missing userId' }, { status: 400 })

    const orders = await prisma.order.findMany({
      where: { userId, ...(marketId ? { marketId } : {}) },
      orderBy: { createdAt: 'desc' },
      take: 50
    })

    return NextResponse.json({ orders })
  } catch (e) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
