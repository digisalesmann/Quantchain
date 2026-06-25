import { NextRequest, NextResponse } from 'next/server'
import prisma from '../../../../lib/prisma'
import { generateWalletAddress } from '../../../../lib/wallet'
import { WALLET_CHAINS } from '../../../../lib/walletChains'

export async function POST(req: NextRequest) {
  try {
    const { userId, chain, label } = await req.json()
    if (!userId || !chain) return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
    if (!WALLET_CHAINS.some((c) => c.value === chain)) {
      return NextResponse.json({ error: 'Unsupported chain' }, { status: 400 })
    }

    const { address, publicKey } = await generateWalletAddress(chain)

    const wallet = await prisma.wallet.create({
      data: {
        userId,
        chain,
        address,
        label: label || `${chain} Wallet`,
        balance: '0',
        available: '0',
        reserved: '0',
        isHot: true
      }
    })

    return NextResponse.json(wallet)
  } catch (e) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
