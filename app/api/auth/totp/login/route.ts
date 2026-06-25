import { NextRequest, NextResponse } from 'next/server'
import prisma from '../../../../../lib/prisma'
import { verifyTOTPToken } from '../../../../../lib/totp'
import { createAuthCookies, createSession } from '../../../../../lib/auth'

export async function POST(req: NextRequest) {
  try {
    const { userId, token } = await req.json()
    if (!userId || !token) return NextResponse.json({ error: 'Missing fields' }, { status: 400 })

    const user = await prisma.user.findUnique({ where: { id: userId } })
    if (!user || !user.totpEnabled || !user.totpSecret) {
      return NextResponse.json({ error: 'Two-factor authentication is not enabled for this account' }, { status: 400 })
    }

    const ok = verifyTOTPToken(user.totpSecret, token)
    if (!ok) return NextResponse.json({ error: 'Invalid code' }, { status: 401 })

    const [accessCookie, refreshCookie] = createAuthCookies(user.id)
    await createSession(user.id, { ip: req.headers.get('x-forwarded-for') ?? undefined, userAgent: req.headers.get('user-agent') ?? undefined })

    const res = NextResponse.json({ id: user.id, email: user.email })
    res.headers.append('Set-Cookie', accessCookie)
    res.headers.append('Set-Cookie', refreshCookie)
    return res
  } catch (e) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
