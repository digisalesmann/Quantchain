import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { verifyToken } from './jwt'
import prisma from './prisma'

export async function getSessionUserId() {
  const store = await cookies()
  const token = store.get('access_token')?.value
  if (!token) return null
  const payload = verifyToken(token) as { sub?: string } | null
  return payload?.sub ?? null
}

export async function requireSessionUserId(redirectTo = '/auth/login') {
  const userId = await getSessionUserId()
  if (!userId) redirect(redirectTo)
  return userId
}

export async function requireAdminUserId(redirectTo = '/') {
  const userId = await requireSessionUserId()
  const user = await prisma.user.findUnique({ where: { id: userId }, select: { role: true } })
  if (user?.role !== 'ADMIN') redirect(redirectTo)
  return userId
}

export async function getSessionUser() {
  const userId = await getSessionUserId()
  if (!userId) return null
  return prisma.user.findUnique({ where: { id: userId }, include: { profile: true } })
}

export async function getSessionPayload() {
  const userId = await getSessionUserId()
  if (!userId) return { authenticated: false as const }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, email: true, role: true, totpEnabled: true, profile: { select: { fullName: true } } }
  })
  if (!user) return { authenticated: false as const }

  return { authenticated: true as const, user }
}
