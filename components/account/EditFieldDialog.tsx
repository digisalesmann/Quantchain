'use client'
import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import Button from '../ui/Button'
import Input from '../ui/Input'
import { Dialog, DialogTrigger, DialogContent, DialogTitle, DialogDescription } from '../ui/Dialog'

export type EditField = { key: string; label: string; type?: 'text' | 'date' | 'tel'; placeholder?: string; value: string }

export default function EditFieldDialog({
  userId,
  title,
  description,
  fields,
  trigger
}: {
  userId: string
  title: string
  description?: string
  fields: EditField[]
  trigger: React.ReactNode
}) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [values, setValues] = useState<Record<string, string>>(() => Object.fromEntries(fields.map((f) => [f.key, f.value])))
  const [submitting, setSubmitting] = useState(false)

  async function handleSave() {
    setSubmitting(true)
    try {
      const res = await fetch('/api/profile/update', { method: 'PATCH', body: JSON.stringify({ userId, ...values }) })
      if (!res.ok) {
        toast.error('Update failed')
        return
      }
      toast.success('Saved')
      setOpen(false)
      router.refresh()
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent>
        <DialogTitle>{title}</DialogTitle>
        {description && <DialogDescription>{description}</DialogDescription>}

        <div className="mt-5 space-y-4">
          {fields.map((f) => (
            <div key={f.key}>
              <label className="mb-1.5 block text-xs font-medium text-muted-foreground">{f.label}</label>
              <Input
                type={f.type || 'text'}
                value={values[f.key]}
                onChange={(e) => setValues((v) => ({ ...v, [f.key]: e.target.value }))}
                placeholder={f.placeholder}
              />
            </div>
          ))}
        </div>

        <Button onClick={handleSave} disabled={submitting} className="mt-6 w-full" size="lg">
          {submitting ? 'Saving…' : 'Save'}
        </Button>
      </DialogContent>
    </Dialog>
  )
}
