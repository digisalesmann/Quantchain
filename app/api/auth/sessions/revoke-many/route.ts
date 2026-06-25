import { NextRequest, NextResponse } from 'next/server'
import prisma from '../../../../../lib/prisma'

export async function POST(req: NextRequest) {
  try {
    const { userId, sessionIds } = await req.json()
    if (!userId) return NextResponse.json({ error: 'Missing userId' }, { status: 400 })

    await prisma.session.updateMany({
      where: Array.isArray(sessionIds) && sessionIds.length > 0 ? { userId, id: { in: sessionIds } } : { userId },
      data: { revoked: true }
    })

    return NextResponse.json({ ok: true })
  } catch (e) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
