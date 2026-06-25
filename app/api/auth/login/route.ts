import { NextRequest, NextResponse } from 'next/server'
import prisma from '../../../../lib/prisma'
import { verifyPassword, createAuthCookies, createSession } from '../../../../lib/auth'

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json()
    if (!email || !password) return NextResponse.json({ error: 'Missing' }, { status: 400 })

    const user = await prisma.user.findUnique({ where: { email } })
    if (!user || !user.passwordHash) return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })

    const ok = await verifyPassword(password, user.passwordHash)
    if (!ok) return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })

    if (user.locked) {
      return NextResponse.json({ error: 'This account has been locked. Contact support to unlock it.' }, { status: 403 })
    }

    if (user.totpEnabled) {
      return NextResponse.json({ requiresTotp: true, userId: user.id })
    }

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
