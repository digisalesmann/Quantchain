import { NextRequest, NextResponse } from 'next/server'
import prisma from '../../../../../lib/prisma'
import { getSessionUserId } from '../../../../../lib/session'

export async function POST(req: NextRequest) {
  try {
    const adminId = await getSessionUserId()
    if (!adminId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const admin = await prisma.user.findUnique({ where: { id: adminId }, select: { role: true } })
    if (admin?.role !== 'ADMIN') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

    const { kycId, action } = await req.json()
    if (!kycId || (action !== 'VERIFIED' && action !== 'REJECTED')) {
      return NextResponse.json({ error: 'Missing or invalid fields' }, { status: 400 })
    }

    const record = await prisma.kYCRecord.update({
      where: { id: kycId },
      data: { status: action, reviewedAt: new Date(), reviewerId: adminId }
    })

    return NextResponse.json({ kyc: record })
  } catch (e) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
