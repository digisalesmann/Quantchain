import { NextRequest, NextResponse } from 'next/server'
import prisma from '../../../../../lib/prisma'

export async function POST(req: NextRequest) {
  try {
    const { userId, id } = await req.json()
    if (!userId || !id) return NextResponse.json({ error: 'Missing fields' }, { status: 400 })

    const key = await prisma.apiKey.findUnique({ where: { id } })
    if (!key || key.userId !== userId) return NextResponse.json({ error: 'Key not found' }, { status: 404 })

    await prisma.apiKey.update({ where: { id }, data: { revoked: true } })

    return NextResponse.json({ ok: true })
  } catch (e) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
