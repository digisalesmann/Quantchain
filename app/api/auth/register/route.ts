import { NextRequest, NextResponse } from 'next/server'
import prisma from '../../../../lib/prisma'
import { createUser, createAuthCookies, createSession } from '../../../../lib/auth'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { email, password, confirmPassword, fullName, termsAccepted } = body
    if (!email || !password || !fullName) return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
    if (password.length < 8) return NextResponse.json({ error: 'Password must be at least 8 characters' }, { status: 400 })
    if (confirmPassword !== undefined && password !== confirmPassword) {
      return NextResponse.json({ error: 'Passwords do not match' }, { status: 400 })
    }
    if (!termsAccepted) return NextResponse.json({ error: 'You must agree to the Terms of Service' }, { status: 400 })

    const existing = await prisma.user.findUnique({ where: { email } })
    if (existing) return NextResponse.json({ error: 'An account with that email already exists' }, { status: 409 })

    const user = await createUser(email, password, fullName)
    const [accessCookie, refreshCookie] = createAuthCookies(user.id)
    await createSession(user.id, { ip: req.headers.get('x-forwarded-for') ?? undefined, userAgent: req.headers.get('user-agent') ?? undefined })

    const res = NextResponse.json({ id: user.id, email: user.email })
    res.headers.append('Set-Cookie', accessCookie)
    res.headers.append('Set-Cookie', refreshCookie)
    return res
  } catch (err) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
