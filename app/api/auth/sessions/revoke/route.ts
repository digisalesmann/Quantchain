import { NextRequest, NextResponse } from 'next/server'
import prisma from '../../../../../lib/prisma'

export async function POST(req: NextRequest) {
  try {
    const { userId, sessionId } = await req.json()
    if (!userId || !sessionId) return NextResponse.json({ error: 'Missing fields' }, { status: 400 })

    const session = await prisma.session.findUnique({ where: { id: sessionId } })
    if (!session || session.userId !== userId) return NextResponse.json({ error: 'Session not found' }, { status: 404 })

    await prisma.session.update({ where: { id: sessionId }, data: { revoked: true } })
    return NextResponse.json({ ok: true })
  } catch (e) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
