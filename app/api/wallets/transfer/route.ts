import { NextRequest, NextResponse } from 'next/server'
import prisma from '../../../../lib/prisma'

export async function POST(req: NextRequest) {
  try {
    const { userId, fromWalletId, toEmail, amount } = await req.json()
    if (!userId || !fromWalletId || !toEmail || !amount) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
    }

    const numAmount = parseFloat(amount)
    if (numAmount <= 0) return NextResponse.json({ error: 'Invalid amount' }, { status: 400 })

    // Get sender wallet
    const fromWallet = await prisma.wallet.findUnique({
      where: { id: fromWalletId }
    })
    if (!fromWallet || fromWallet.userId !== userId) {
      return NextResponse.json({ error: 'Wallet not found' }, { status: 404 })
    }

    if (parseFloat(fromWallet.available.toString()) < numAmount) {
      return NextResponse.json({ error: 'Insufficient balance' }, { status: 400 })
    }

    const recipient = await prisma.user.findUnique({ where: { email: toEmail } })
    if (!recipient) {
      return NextResponse.json({ error: 'No account found for that email' }, { status: 404 })
    }
    if (recipient.id === userId) {
      return NextResponse.json({ error: 'Cannot transfer to yourself' }, { status: 400 })
    }

    // Get recipient (use same chain wallet if available)
    const toWallet = await prisma.wallet.findFirst({
      where: { userId: recipient.id, chain: fromWallet.chain }
    })
    if (!toWallet) {
      return NextResponse.json({ error: 'Recipient has no wallet for this asset' }, { status: 404 })
    }

    // Execute transfer atomically — decrement/increment avoid lost updates under concurrent transfers.
    const [updated1, updated2] = await prisma.$transaction([
      prisma.wallet.update({
        where: { id: fromWalletId },
        data: { available: { decrement: numAmount }, balance: { decrement: numAmount } }
      }),
      prisma.wallet.update({
        where: { id: toWallet.id },
        data: { available: { increment: numAmount }, balance: { increment: numAmount } }
      }),
      prisma.transaction.create({
        data: {
          walletId: fromWalletId,
          type: 'TRANSFER',
          amount: -numAmount,
          status: 'COMPLETED',
          chain: fromWallet.chain
        }
      }),
      prisma.transaction.create({
        data: {
          walletId: toWallet.id,
          type: 'TRANSFER',
          amount: numAmount,
          status: 'COMPLETED',
          chain: fromWallet.chain
        }
      })
    ])

    return NextResponse.json({ ok: true, from: updated1, to: updated2 })
  } catch (e) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
