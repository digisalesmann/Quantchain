import { NextRequest, NextResponse } from 'next/server'
import prisma from '../../../../lib/prisma'
import { validateAddress } from '../../../../lib/wallet'

export async function POST(req: NextRequest) {
  try {
    const { userId, walletId, chain, toAddress, amount, fee } = await req.json()
    if (!userId || !walletId || !chain || !toAddress || !amount) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
    }

    // Validate recipient address
    const valid = await validateAddress(chain, toAddress)
    if (!valid) return NextResponse.json({ error: 'Invalid address' }, { status: 400 })

    // Check wallet balance
    const wallet = await prisma.wallet.findUnique({ where: { id: walletId } })
    if (!wallet || wallet.userId !== userId) {
      return NextResponse.json({ error: 'Wallet not found' }, { status: 404 })
    }

    const totalAmount = parseFloat(amount) + (parseFloat(fee) || 0)
    if (parseFloat(wallet.available.toString()) < totalAmount) {
      return NextResponse.json({ error: 'Insufficient balance' }, { status: 400 })
    }

    // Create withdrawal record and reserve funds atomically
    const [withdrawal] = await prisma.$transaction([
      prisma.withdrawal.create({
        data: {
          userId,
          walletId,
          chain,
          address: toAddress,
          amount: parseFloat(amount),
          fee: parseFloat(fee) || 0,
          status: 'PENDING'
        }
      }),
      prisma.wallet.update({
        where: { id: walletId },
        data: { reserved: { increment: totalAmount }, available: { decrement: totalAmount } }
      })
    ])

    return NextResponse.json(withdrawal)
  } catch (e) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
