import { NextRequest, NextResponse } from 'next/server'
import prisma from '../../../../lib/prisma'

const DOCUMENT_TYPES = ['passport', 'drivers_license', 'national_id']

export async function POST(req: NextRequest) {
  try {
    const { userId, documentType } = await req.json()
    if (!userId || !DOCUMENT_TYPES.includes(documentType)) {
      return NextResponse.json({ error: 'Missing or invalid fields' }, { status: 400 })
    }

    const record = await prisma.kYCRecord.upsert({
      where: { userId },
      create: { userId, status: 'PENDING', documentType, submittedAt: new Date() },
      update: { status: 'PENDING', documentType, submittedAt: new Date(), reviewedAt: null, reviewerId: null }
    })

    return NextResponse.json({ kyc: record })
  } catch (e) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
