import { NextRequest, NextResponse } from 'next/server'
import prisma from '../../../../lib/prisma'
import { ASSET_TO_CHAIN } from '../../../../lib/prices'

export async function POST(req: NextRequest) {
  try {
    const { userId, productId, amount } = await req.json()
    if (!userId || !productId || !amount) return NextResponse.json({ error: 'Missing fields' }, { status: 400 })

    const numAmount = parseFloat(amount)
    if (numAmount <= 0) return NextResponse.json({ error: 'Invalid amount' }, { status: 400 })

    const product = await prisma.stakingProduct.findUnique({ where: { id: productId } })
    if (!product) return NextResponse.json({ error: 'Product not found' }, { status: 404 })

    const chain = ASSET_TO_CHAIN[product.asset]
    const wallet = await prisma.wallet.findFirst({ where: { userId, chain } })
    if (!wallet) return NextResponse.json({ error: 'No wallet for this asset' }, { status: 404 })
    if (parseFloat(wallet.available.toString()) < numAmount) {
      return NextResponse.json({ error: 'Insufficient balance' }, { status: 400 })
    }

    const endsAt = new Date(Date.now() + product.lockupDays * 24 * 60 * 60 * 1000)

    const [, position] = await prisma.$transaction([
      prisma.wallet.update({
        where: { id: wallet.id },
        data: { available: { decrement: numAmount }, balance: { decrement: numAmount } }
      }),
      prisma.stakingPosition.create({
        data: { userId, productId, amount: numAmount, rewardAccrued: '0', endsAt }
      }),
      prisma.transaction.create({
        data: { walletId: wallet.id, type: 'STAKE', amount: -numAmount, status: 'COMPLETED', chain }
      })
    ])

    return NextResponse.json({ position })
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
