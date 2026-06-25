import prisma from './prisma'
import bcrypt from 'bcryptjs'
import { signAccessToken, signRefreshToken } from './jwt'
import { serialize } from 'cookie'
import { generateWalletAddress, WALLET_CHAINS, type Chain } from './wallet'

export async function hashPassword(password: string) {
  const salt = await bcrypt.genSalt(10)
  return bcrypt.hash(password, salt)
}

export async function verifyPassword(password: string, hash: string) {
  return bcrypt.compare(password, hash)
}

const STARTER_CHAINS: Chain[] = WALLET_CHAINS.map((c) => c.value)

export async function createUser(email: string, password: string, fullName?: string) {
  const passwordHash = await hashPassword(password)
  const user = await prisma.user.create({
    data: {
      email,
      passwordHash,
      profile: fullName ? { create: { fullName } } : undefined
    }
  })
  await createStarterWallets(user.id)
  return user
}

export async function createOAuthUser(email: string, googleId: string) {
  const user = await prisma.user.create({ data: { email, googleId } })
  await createStarterWallets(user.id)
  return user
}

async function createStarterWallets(userId: string) {
  // Give every new account a starter wallet per supported chain, like Coinbase does on sign-up.
  await Promise.all(
    STARTER_CHAINS.map(async (chain) => {
      const { address } = await generateWalletAddress(chain)
      const chainName = WALLET_CHAINS.find((c) => c.value === chain)?.label.replace(/\s*\(.*\)$/, '') ?? chain
      const label = `${chainName} Wallet`
      return prisma.wallet.create({
        data: { userId, chain, address, label, balance: '0', available: '0', reserved: '0' }
      })
    })
  )
}

export function createSession(userId: string, meta: { ip?: string; userAgent?: string }) {
  return prisma.session.create({
    data: {
      userId,
      ip: meta.ip,
      userAgent: meta.userAgent,
      device: parseDevice(meta.userAgent),
      expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7)
    }
  })
}

function parseDevice(userAgent?: string) {
  if (!userAgent) return 'Unknown device'
  if (/mobile/i.test(userAgent)) return 'Mobile device'
  if (/Macintosh/i.test(userAgent)) return 'Mac'
  if (/Windows/i.test(userAgent)) return 'Windows PC'
  if (/Linux/i.test(userAgent)) return 'Linux'
  return 'Unknown device'
}

export function createAuthCookies(userId: string) {
  const access = signAccessToken({ sub: userId })
  const refresh = signRefreshToken({ sub: userId })

  const accessCookie = serialize('access_token', access, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 15
  })

  const refreshCookie = serialize('refresh_token', refresh, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 7
  })

  return [accessCookie, refreshCookie]
}
