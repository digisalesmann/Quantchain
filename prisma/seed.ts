import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'
import { generateWalletAddress } from '../lib/wallet'
import { WALLET_CHAINS } from '../lib/walletChains'

const prisma = new PrismaClient()

// Market rows (BTC-USD, the rest of the top 50, metadata, icons) are owned by
// scripts/sync-markets.ts — run `npm run db:sync-markets` before this seed on a fresh database.

// Illustrative starter balances for the demo account, one per real wallet chain.
const DEMO_BALANCES: Record<string, string> = {
  bitcoin: '0.42150000',
  ethereum: '3.85000000',
  solana: '120.500000',
  litecoin: '12.50000000',
  dogecoin: '5000.00000000',
  bnb: '4.20000000',
  polygon: '850.00000000',
  avalanche: '18.00000000'
}

async function main() {
  const passwordHash = await bcrypt.hash('Demo1234!', 10)

  const demo = await prisma.user.upsert({
    where: { email: 'demo@quantchain.exchange' },
    update: {},
    create: {
      email: 'demo@quantchain.exchange',
      passwordHash,
      profile: { create: { fullName: 'Alex Morgan', country: 'US' } },
      kyc: { create: { status: 'VERIFIED', submittedAt: new Date(), reviewedAt: new Date() } }
    }
  })

  const maker = await prisma.user.upsert({
    where: { email: 'maker@quantchain.exchange' },
    update: {},
    create: { email: 'maker@quantchain.exchange', passwordHash, role: 'USER' }
  })

  await prisma.user.upsert({
    where: { email: 'admin@quantchain.exchange' },
    update: {},
    create: { email: 'admin@quantchain.exchange', passwordHash, role: 'ADMIN' }
  })

  for (const { value: chain, label } of WALLET_CHAINS) {
    const existing = await prisma.wallet.findFirst({ where: { userId: demo.id, chain } })
    if (!existing) {
      const { address } = await generateWalletAddress(chain)
      const balance = DEMO_BALANCES[chain] ?? '0'
      await prisma.wallet.create({
        data: {
          userId: demo.id,
          chain,
          address,
          label: `${label.replace(/\s*\(.*\)$/, '')} Wallet`,
          balance,
          available: balance,
          reserved: '0',
          isHot: true
        }
      })
    }
  }

  // Seed a resting order book + trade history on BTC-USD from the maker account
  const btc = await prisma.market.findUnique({ where: { symbol: 'BTC-USD' } })
  if (btc) {
    const existingOrders = await prisma.order.count({ where: { marketId: btc.id } })
    if (existingOrders === 0) {
      const basePrice = 42500
      const restingOrders = [
        ...[1, 2, 3, 4, 5].map((i) => ({ side: 'BUY' as const, price: basePrice - i * 12.5, amount: (0.05 + i * 0.03).toFixed(4) })),
        ...[1, 2, 3, 4, 5].map((i) => ({ side: 'SELL' as const, price: basePrice + i * 12.5, amount: (0.05 + i * 0.03).toFixed(4) }))
      ]

      for (const o of restingOrders) {
        await prisma.order.create({
          data: {
            userId: maker.id,
            marketId: btc.id,
            side: o.side,
            type: 'LIMIT',
            price: o.price,
            amount: o.amount,
            filled: '0',
            status: 'NEW'
          }
        })
      }

      const now = Date.now()
      for (let i = 30; i >= 0; i--) {
        const drift = (Math.random() - 0.5) * 80
        await prisma.trade.create({
          data: {
            marketId: btc.id,
            price: (basePrice + drift).toFixed(2),
            amount: (0.001 + Math.random() * 0.05).toFixed(4),
            createdAt: new Date(now - i * 60_000)
          }
        })
      }
    }
  }

  console.log('Seed complete. Demo login: demo@quantchain.exchange / Demo1234!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
