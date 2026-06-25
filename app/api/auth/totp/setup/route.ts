import { NextRequest, NextResponse } from 'next/server'
import prisma from '../../../../../lib/prisma'
import { generateTOTPSecret } from '../../../../../lib/totp'

export async function POST(req: NextRequest) {
  try {
    const { userId } = await req.json()
    if (!userId) return NextResponse.json({ error: 'Missing userId' }, { status: 400 })

    const user = await prisma.user.findUnique({ where: { id: userId } })
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 })

    const secret = generateTOTPSecret({ account: user.email })

    // store base32 secret in user record temporarily until verification
    await prisma.user.update({ where: { id: userId }, data: { totpSecret: secret.base32, totpEnabled: false } })

    return NextResponse.json({ otpauth_url: secret.otpauth_url, base32: secret.base32 })
  } catch (e) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
