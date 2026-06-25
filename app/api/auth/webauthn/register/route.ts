import { NextRequest, NextResponse } from 'next/server'
import prisma from '../../../../../lib/prisma'
import { verifyRegistration, getChallenge } from '../../../../../lib/webauthn'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { userId, credential } = body
    if (!userId || !credential) return NextResponse.json({ error: 'Missing' }, { status: 400 })

    const expectedChallenge = getChallenge(userId)
    if (!expectedChallenge) return NextResponse.json({ error: 'No challenge' }, { status: 400 })

    const verification = await verifyRegistration(credential, expectedChallenge)
    if (!verification.verified) return NextResponse.json({ error: 'Verification failed' }, { status: 400 })

    const { registrationInfo } = verification
    const { id, publicKey, counter, transports } = registrationInfo.credential

    // store credential
    await prisma.webAuthnKey.create({
      data: {
        userId,
        credentialID: id,
        publicKey: Buffer.from(publicKey).toString('base64'),
        counter,
        transports: transports?.join(',')
      }
    })

    return NextResponse.json({ ok: true })
  } catch (e) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
