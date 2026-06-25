import { NextRequest, NextResponse } from 'next/server'
import prisma from '../../../../../lib/prisma'
import { makeRegistrationOptions, saveChallenge } from '../../../../../lib/webauthn'

export async function POST(req: NextRequest) {
  try {
    const { userId } = await req.json()
    if (!userId) return NextResponse.json({ error: 'Missing userId' }, { status: 400 })

    const user = await prisma.user.findUnique({ where: { id: userId } })
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 })

    // collect existing credentials to exclude
    const creds = await prisma.webAuthnKey.findMany({ where: { userId } })
    const exclude = creds.map((c) => ({
      id: c.credentialID,
      transports: c.transports ? (c.transports.split(',') as any) : undefined
    }))

    const options = await makeRegistrationOptions({ id: user.id, name: user.email, displayName: user.email }, exclude)
    // store challenge for verification keyed by userId
    saveChallenge(userId, options.challenge)

    return NextResponse.json(options)
  } catch (e) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
