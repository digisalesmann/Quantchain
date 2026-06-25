import { NextRequest, NextResponse } from 'next/server'
import prisma from '../../../../lib/prisma'

export async function GET(req: NextRequest) {
  try {
    const userId = req.nextUrl.searchParams.get('userId')
    const chain = req.nextUrl.searchParams.get('chain')
    if (!userId || !chain) return NextResponse.json({ error: 'Missing userId or chain' }, { status: 400 })

    const withdrawals = await prisma.withdrawal.findMany({
      where: { userId, chain },
      orderBy: { requestedAt: 'desc' },
      distinct: ['address'],
      take: 5,
      select: { address: true, requestedAt: true }
    })

    return NextResponse.json({ addresses: withdrawals })
  } catch (e) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
