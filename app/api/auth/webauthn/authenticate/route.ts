import { NextRequest, NextResponse } from 'next/server'
import prisma from '../../../../../lib/prisma'
import { verifyAuthentication, getChallenge } from '../../../../../lib/webauthn'
import { createAuthCookies, createSession } from '../../../../../lib/auth'

export async function POST(req: NextRequest) {
  try {
    const { userId, credential } = await req.json()
    if (!userId || !credential) return NextResponse.json({ error: 'Missing' }, { status: 400 })

    const expectedChallenge = getChallenge(userId)
    if (!expectedChallenge) return NextResponse.json({ error: 'No challenge' }, { status: 400 })

    const stored = await prisma.webAuthnKey.findFirst({ where: { userId } })
    if (!stored) return NextResponse.json({ error: 'No credential' }, { status: 400 })

    const verification = await verifyAuthentication(credential, expectedChallenge, {
      id: stored.credentialID,
      publicKey: new Uint8Array(Buffer.from(stored.publicKey, 'base64')),
      counter: stored.counter,
      transports: stored.transports ? (stored.transports.split(',') as any) : undefined
    })
    if (!verification.verified) return NextResponse.json({ error: 'Authentication failed' }, { status: 401 })

    // update counter
    await prisma.webAuthnKey.update({ where: { id: stored.id }, data: { counter: verification.authenticationInfo.newCounter } })

    const [accessCookie, refreshCookie] = createAuthCookies(userId)
    await createSession(userId, { ip: req.headers.get('x-forwarded-for') ?? undefined, userAgent: req.headers.get('user-agent') ?? undefined })
    const res = NextResponse.json({ ok: true })
    res.headers.append('Set-Cookie', accessCookie)
    res.headers.append('Set-Cookie', refreshCookie)
    return res
  } catch (e) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
