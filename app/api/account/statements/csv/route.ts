import { NextRequest, NextResponse } from 'next/server'
import prisma from '../../../../../lib/prisma'

export async function GET(req: NextRequest) {
  const userId = req.nextUrl.searchParams.get('userId')
  const month = req.nextUrl.searchParams.get('month')
  if (!userId || !month) return NextResponse.json({ error: 'Missing userId or month' }, { status: 400 })

  const [year, monthNum] = month.split('-').map(Number)
  if (!year || !monthNum) return NextResponse.json({ error: 'Invalid month' }, { status: 400 })

  const start = new Date(year, monthNum - 1, 1)
  const end = new Date(year, monthNum, 1)

  const transactions = await prisma.transaction.findMany({
    where: { wallet: { userId }, createdAt: { gte: start, lt: end } },
    include: { wallet: { select: { chain: true, label: true } } },
    orderBy: { createdAt: 'asc' }
  })

  const header = 'Date,Type,Chain,Wallet,Amount,Fee,Status,Tx Hash'
  const lines = transactions.map((t) =>
    [
      t.createdAt.toISOString(),
      t.type,
      t.chain || t.wallet.chain,
      t.wallet.label || t.wallet.chain,
      t.amount.toString(),
      t.fee.toString(),
      t.status,
      t.txHash || ''
    ]
      .map((v) => `"${String(v).replace(/"/g, '""')}"`)
      .join(',')
  )

  const csv = [header, ...lines].join('\n')

  return new NextResponse(csv, {
    headers: {
      'Content-Type': 'text/csv',
      'Content-Disposition': `attachment; filename="statement-${month}.csv"`
    }
  })
}
