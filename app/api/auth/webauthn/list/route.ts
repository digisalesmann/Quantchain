import { NextRequest, NextResponse } from 'next/server'
import prisma from '../../../../../lib/prisma'

export async function GET(req: NextRequest) {
  const userId = req.nextUrl.searchParams.get('userId')
  if (!userId) return NextResponse.json({ error: 'Missing userId' }, { status: 400 })

  const keys = await prisma.webAuthnKey.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    select: { id: true, createdAt: true, transports: true }
  })

  return NextResponse.json({ passkeys: keys })
}
