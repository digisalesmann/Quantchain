import { NextRequest, NextResponse } from 'next/server'
import prisma from '../../../../lib/prisma'

const FIELDS = ['accountActivity', 'advancedTransaction', 'securityAlerts', 'news', 'offers'] as const

export async function GET(req: NextRequest) {
  try {
    const userId = req.nextUrl.searchParams.get('userId')
    if (!userId) return NextResponse.json({ error: 'Missing userId' }, { status: 400 })

    const preference = await prisma.notificationPreference.upsert({
      where: { userId },
      create: { userId },
      update: {}
    })

    return NextResponse.json({ preference })
  } catch (e) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json()
    const { userId, ...rest } = body
    if (!userId) return NextResponse.json({ error: 'Missing userId' }, { status: 400 })

    const data: Record<string, boolean> = {}
    for (const field of FIELDS) {
      if (typeof rest[field] === 'boolean') data[field] = rest[field]
    }

    const preference = await prisma.notificationPreference.upsert({
      where: { userId },
      create: { userId, ...data },
      update: data
    })

    return NextResponse.json({ preference })
  } catch (e) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
