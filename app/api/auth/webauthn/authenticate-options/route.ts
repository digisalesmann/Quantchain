import { NextRequest, NextResponse } from 'next/server'
import prisma from '../../../../../lib/prisma'
import { makeAuthenticationOptions, saveChallenge } from '../../../../../lib/webauthn'

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json()
    if (!email) return NextResponse.json({ error: 'Missing email' }, { status: 400 })

    const user = await prisma.user.findUnique({ where: { email } })
    if (!user) return NextResponse.json({ error: 'No account found for that email' }, { status: 404 })

    const creds = await prisma.webAuthnKey.findMany({ where: { userId: user.id } })
    if (creds.length === 0) return NextResponse.json({ error: 'No passkey registered for this account' }, { status: 404 })

    const allow = creds.map((c) => ({
      id: c.credentialID,
      transports: c.transports ? (c.transports.split(',') as any) : undefined
    }))

    const options = await makeAuthenticationOptions(allow)
    saveChallenge(user.id, options.challenge)
    return NextResponse.json({ options, userId: user.id })
  } catch (e) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
