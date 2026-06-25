import { NextRequest, NextResponse } from 'next/server'
import prisma from '../../../../lib/prisma'

const STRING_FIELDS = [
  'fullName',
  'displayName',
  'country',
  'phone',
  'avatarUrl',
  'addressLine1',
  'addressLine2',
  'city',
  'state',
  'postalCode'
] as const

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json()
    const { userId, dateOfBirth } = body
    if (!userId) return NextResponse.json({ error: 'Missing userId' }, { status: 400 })

    const data: Record<string, string | null | Date> = {}
    for (const field of STRING_FIELDS) {
      if (typeof body[field] === 'string') data[field] = body[field].trim() || null
    }
    if (typeof dateOfBirth === 'string') data.dateOfBirth = dateOfBirth ? new Date(dateOfBirth) : (null as unknown as Date)

    const profile = await prisma.profile.upsert({
      where: { userId },
      create: { userId, ...data },
      update: data
    })

    return NextResponse.json({ profile })
  } catch (e) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
