import { NextRequest, NextResponse } from 'next/server'
import prisma from '../../../../lib/prisma'

export async function GET(req: NextRequest) {
  const userId = req.nextUrl.searchParams.get('userId')
  if (!userId) return NextResponse.json({ error: 'Missing userId' }, { status: 400 })

  const sessions = await prisma.session.findMany({
    where: { userId, revoked: false, expiresAt: { gt: new Date() } },
    orderBy: { lastSeenAt: 'desc' }
  })

  return NextResponse.json({ sessions })
}
