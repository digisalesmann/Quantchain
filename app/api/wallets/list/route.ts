import { NextRequest, NextResponse } from 'next/server'
import prisma from '../../../../lib/prisma'

export async function GET(req: NextRequest) {
  try {
    const userId = req.nextUrl.searchParams.get('userId')
    if (!userId) return NextResponse.json({ error: 'Missing userId' }, { status: 400 })

    const wallets = await prisma.wallet.findMany({
      where: { userId },
      select: {
        id: true,
        chain: true,
        address: true,
        label: true,
        balance: true,
        available: true,
        reserved: true,
        createdAt: true
      }
    })

    return NextResponse.json({ wallets })
  } catch (e) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
