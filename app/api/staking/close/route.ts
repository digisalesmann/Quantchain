import { NextRequest, NextResponse } from 'next/server'
import prisma from '../../../../lib/prisma'
import { ASSET_TO_CHAIN } from '../../../../lib/prices'

export async function POST(req: NextRequest) {
  try {
    const { userId, positionId } = await req.json()
    if (!userId || !positionId) return NextResponse.json({ error: 'Missing fields' }, { status: 400 })

    const position = await prisma.stakingPosition.findUnique({ where: { id: positionId }, include: { product: true } })
    if (!position || position.userId !== userId) return NextResponse.json({ error: 'Position not found' }, { status: 404 })

    const chain = ASSET_TO_CHAIN[position.product.asset]
    const wallet = await prisma.wallet.findFirst({ where: { userId, chain } })
    if (!wallet) return NextResponse.json({ error: 'No wallet for this asset' }, { status: 404 })

    const elapsedDays = Math.max(0, (Date.now() - position.startedAt.getTime()) / (24 * 60 * 60 * 1000))
    const principal = parseFloat(position.amount.toString())
    const apy = parseFloat(position.product.apy.toString())
    const reward = principal * (apy / 100) * (elapsedDays / 365)
    const payout = principal + reward

    const [updatedWallet] = await prisma.$transaction([
      prisma.wallet.update({
        where: { id: wallet.id },
        data: { available: { increment: payout }, balance: { increment: payout } }
      }),
      prisma.stakingPosition.delete({ where: { id: positionId } }),
      prisma.transaction.create({
        data: { walletId: wallet.id, type: 'UNSTAKE', amount: payout, status: 'COMPLETED', chain }
      })
    ])

    return NextResponse.json({ wallet: updatedWallet, payout, reward })
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
