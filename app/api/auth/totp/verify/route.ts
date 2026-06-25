import { NextRequest, NextResponse } from 'next/server'
import prisma from '../../../../../lib/prisma'
import { verifyTOTPToken } from '../../../../../lib/totp'

export async function POST(req: NextRequest) {
  try {
    const { userId, token } = await req.json()
    if (!userId || !token) return NextResponse.json({ error: 'Missing fields' }, { status: 400 })

    const user = await prisma.user.findUnique({ where: { id: userId } })
    if (!user || !user.totpSecret) return NextResponse.json({ error: 'No TOTP setup' }, { status: 400 })

    const ok = verifyTOTPToken(user.totpSecret, token)
    if (!ok) return NextResponse.json({ verified: false }, { status: 400 })

    await prisma.user.update({ where: { id: userId }, data: { totpEnabled: true } })
    return NextResponse.json({ verified: true })
  } catch (e) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
