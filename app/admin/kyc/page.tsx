import { requireAdminUserId } from '../../../lib/session'
import prisma from '../../../lib/prisma'
import KycReviewList from '../../../components/admin/KycReviewList'

export default async function AdminKycPage() {
  await requireAdminUserId()

  const records = await prisma.kYCRecord.findMany({
    where: { submittedAt: { not: null } },
    include: { user: { select: { email: true } } },
    orderBy: { submittedAt: 'desc' }
  })

  return (
    <div className="py-8 sm:py-10">
      <h1 className="text-2xl font-semibold tracking-tight">Identity verification</h1>
      <p className="mt-1 text-sm text-muted-foreground">Review submitted documents and approve or reject identity verification requests.</p>

      <KycReviewList
        records={records.map((r) => ({
          id: r.id,
          email: r.user.email,
          status: r.status,
          documentType: r.documentType,
          submittedAt: r.submittedAt ? r.submittedAt.toISOString() : null,
          reviewedAt: r.reviewedAt ? r.reviewedAt.toISOString() : null
        }))}
      />
    </div>
  )
}
