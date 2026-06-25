import { NextRequest, NextResponse } from 'next/server'
import prisma from '../../../../lib/prisma'

export async function POST(req: NextRequest) {
  try {
    const { userId } = await req.json()
    if (!userId) return NextResponse.json({ error: 'Missing userId' }, { status: 400 })

    await prisma.$transaction([
      prisma.user.update({ where: { id: userId }, data: { locked: true } }),
      prisma.session.updateMany({ where: { userId }, data: { revoked: true } })
    ])

    return NextResponse.json({ ok: true })
  } catch (e) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
