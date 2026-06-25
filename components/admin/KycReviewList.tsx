'use client'
import React, { useState } from 'react'
import { toast } from 'sonner'
import { Check, X } from 'lucide-react'
import Button from '../ui/Button'
import Badge from '../ui/Badge'
import GlassIcon from '../ui/GlassIcon'
import { formatRelativeTime } from '../../lib/utils'

type KycRow = {
  id: string
  email: string
  status: 'PENDING' | 'VERIFIED' | 'REJECTED'
  documentType: string | null
  submittedAt: string | null
  reviewedAt: string | null
}

const DOCUMENT_LABELS: Record<string, string> = {
  passport: 'Passport',
  drivers_license: "Driver's license",
  national_id: 'National ID'
}

export default function KycReviewList({ records }: { records: KycRow[] }) {
  const [rows, setRows] = useState(records)
  const [busyId, setBusyId] = useState<string | null>(null)

  async function review(id: string, action: 'VERIFIED' | 'REJECTED') {
    setBusyId(id)
    try {
      const res = await fetch('/api/admin/kyc/review', { method: 'POST', body: JSON.stringify({ kycId: id, action }) })
      const data = await res.json()
      if (!res.ok) {
        toast.error(data.error || 'Could not update')
        return
      }
      setRows((prev) => prev.map((r) => (r.id === id ? { ...r, status: action, reviewedAt: new Date().toISOString() } : r)))
      toast.success(action === 'VERIFIED' ? 'Identity verified' : 'Submission rejected')
    } finally {
      setBusyId(null)
    }
  }

  if (rows.length === 0) {
    return <p className="mt-10 text-sm text-muted-foreground">No identity submissions yet.</p>
  }

  return (
    <div className="mt-8 divide-y divide-border border-y border-border">
      {rows.map((r) => (
        <div key={r.id} className="flex items-center justify-between gap-4 py-4">
          <div className="min-w-0">
            <p className="truncate text-sm font-medium">{r.email}</p>
            <p className="mt-0.5 text-xs text-muted-foreground">
              {r.documentType ? DOCUMENT_LABELS[r.documentType] ?? r.documentType : '—'}
              {r.submittedAt && <> · Submitted {formatRelativeTime(r.submittedAt)}</>}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Badge variant={r.status === 'VERIFIED' ? 'up' : r.status === 'REJECTED' ? 'down' : 'neutral'}>
              {r.status === 'VERIFIED' ? 'Verified' : r.status === 'REJECTED' ? 'Rejected' : 'Pending'}
            </Badge>

            {r.status === 'PENDING' && (
              <div className="flex items-center gap-2">
                <Button size="sm" variant="subtle" disabled={busyId === r.id} onClick={() => review(r.id, 'REJECTED')}>
                  <GlassIcon icon={X} size={12} />
                  Reject
                </Button>
                <Button size="sm" disabled={busyId === r.id} onClick={() => review(r.id, 'VERIFIED')}>
                  <GlassIcon icon={Check} size={12} iconClassName="text-primary-foreground" />
                  Approve
                </Button>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}
