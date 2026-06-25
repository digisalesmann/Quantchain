import { NextRequest, NextResponse } from 'next/server'
import prisma from '../../../../lib/prisma'
import { hashPassword, verifyPassword } from '../../../../lib/auth'

const PASSWORD_RULE = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^a-zA-Z0-9]).{8,}$/

export async function POST(req: NextRequest) {
  try {
    const { userId, currentPassword, newPassword } = await req.json()
    if (!userId || !currentPassword || !newPassword) return NextResponse.json({ error: 'Missing fields' }, { status: 400 })

    if (!PASSWORD_RULE.test(newPassword)) {
      return NextResponse.json({ error: 'Password does not meet requirements' }, { status: 400 })
    }

    const user = await prisma.user.findUnique({ where: { id: userId } })
    if (!user || !user.passwordHash) return NextResponse.json({ error: 'Account not found' }, { status: 404 })

    const ok = await verifyPassword(currentPassword, user.passwordHash)
    if (!ok) return NextResponse.json({ error: 'Current password is incorrect' }, { status: 401 })

    const passwordHash = await hashPassword(newPassword)
    await prisma.user.update({ where: { id: userId }, data: { passwordHash } })

    return NextResponse.json({ ok: true })
  } catch (e) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
