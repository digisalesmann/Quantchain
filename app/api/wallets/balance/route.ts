import { NextRequest, NextResponse } from 'next/server'
import prisma from '../../../../lib/prisma'
import { getBalance, type Chain } from '../../../../lib/wallet'

export async function GET(req: NextRequest) {
  try {
    const walletId = req.nextUrl.searchParams.get('walletId')
    if (!walletId) return NextResponse.json({ error: 'Missing walletId' }, { status: 400 })

    const wallet = await prisma.wallet.findUnique({ where: { id: walletId } })
    if (!wallet) return NextResponse.json({ error: 'Wallet not found' }, { status: 404 })

    // Fetch live balance from chain
    const balance = await getBalance(wallet.chain as Chain, wallet.address)

    return NextResponse.json({ walletId, address: wallet.address, balance })
  } catch (e) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
