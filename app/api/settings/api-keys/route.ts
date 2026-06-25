import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'
import prisma from '../../../../lib/prisma'
import { hashPassword } from '../../../../lib/auth'

export async function GET(req: NextRequest) {
  try {
    const userId = req.nextUrl.searchParams.get('userId')
    if (!userId) return NextResponse.json({ error: 'Missing userId' }, { status: 400 })

    const keys = await prisma.apiKey.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      select: { id: true, name: true, scopes: true, revoked: true, createdAt: true }
    })

    return NextResponse.json({ keys })
  } catch (e) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const { userId, name, scopes } = await req.json()
    if (!userId || !name) return NextResponse.json({ error: 'Missing fields' }, { status: 400 })

    const key = `qc_live_${crypto.randomBytes(16).toString('hex')}`
    const secret = crypto.randomBytes(24).toString('hex')
    const [keyHash, secretHash] = await Promise.all([hashPassword(key), hashPassword(secret)])

    const created = await prisma.apiKey.create({
      data: {
        userId,
        name,
        keyHash,
        secretHash,
        scopes: Array.isArray(scopes) && scopes.length > 0 ? scopes.join(',') : 'read'
      },
      select: { id: true, name: true, scopes: true, revoked: true, createdAt: true }
    })

    return NextResponse.json({ key: created, plaintext: { key, secret } })
  } catch (e) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
