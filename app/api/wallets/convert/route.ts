import { NextRequest, NextResponse } from 'next/server'
import prisma from '../../../../lib/prisma'
import { CHAIN_TO_SYMBOL, getMarket } from '../../../../lib/prices'

export async function POST(req: NextRequest) {
  try {
    const { userId, fromWalletId, toChain, amount } = await req.json()
    if (!userId || !fromWalletId || !toChain || !amount) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
    }

    const numAmount = parseFloat(amount)
    if (numAmount <= 0) return NextResponse.json({ error: 'Invalid amount' }, { status: 400 })

    const fromWallet = await prisma.wallet.findUnique({ where: { id: fromWalletId } })
    if (!fromWallet || fromWallet.userId !== userId) {
      return NextResponse.json({ error: 'Wallet not found' }, { status: 404 })
    }
    if (fromWallet.chain === toChain) {
      return NextResponse.json({ error: 'Choose two different assets' }, { status: 400 })
    }
    if (parseFloat(fromWallet.available.toString()) < numAmount) {
      return NextResponse.json({ error: 'Insufficient balance' }, { status: 400 })
    }

    const toWallet = await prisma.wallet.findFirst({ where: { userId, chain: toChain } })
    if (!toWallet) return NextResponse.json({ error: 'No wallet for that asset' }, { status: 404 })

    const [fromMarket, toMarket] = await Promise.all([
      getMarket(CHAIN_TO_SYMBOL[fromWallet.chain]),
      getMarket(CHAIN_TO_SYMBOL[toChain])
    ])
    if (!fromMarket || !toMarket) return NextResponse.json({ error: 'Pricing unavailable for this asset' }, { status: 400 })

    const targetAmount = (numAmount * fromMarket.price) / toMarket.price

    const [updatedFrom, updatedTo] = await prisma.$transaction([
      prisma.wallet.update({
        where: { id: fromWallet.id },
        data: { available: { decrement: numAmount }, balance: { decrement: numAmount } }
      }),
      prisma.wallet.update({
        where: { id: toWallet.id },
        data: { available: { increment: targetAmount }, balance: { increment: targetAmount } }
      }),
      prisma.transaction.create({
        data: { walletId: fromWallet.id, type: 'CONVERT', amount: -numAmount, status: 'COMPLETED', chain: fromWallet.chain }
      }),
      prisma.transaction.create({
        data: { walletId: toWallet.id, type: 'CONVERT', amount: targetAmount, status: 'COMPLETED', chain: toChain }
      })
    ])

    return NextResponse.json({ from: updatedFrom, to: updatedTo, targetAmount })
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
