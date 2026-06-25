import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from '../../../../lib/jwt'
import prisma from '../../../../lib/prisma'

export async function GET(req: NextRequest) {
  const cookie = req.cookies.get('access_token')?.value
  if (!cookie) return NextResponse.json({ authenticated: false })

  const payload = verifyToken(cookie as string) as { sub?: string } | null
  if (!payload?.sub) return NextResponse.json({ authenticated: false })

  const user = await prisma.user.findUnique({
    where: { id: payload.sub },
    select: { id: true, email: true, role: true, totpEnabled: true, profile: { select: { fullName: true } } }
  })
  if (!user) return NextResponse.json({ authenticated: false })

  return NextResponse.json({ authenticated: true, user })
}
