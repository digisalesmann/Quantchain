'use client'
import React from 'react'
import { Check } from 'lucide-react'
import { Dialog, DialogContent } from './Dialog'
import GlassIcon from './GlassIcon'
import Button from './Button'

export type SuccessRow = { label: string; value: string }

export default function SuccessScreen({
  open,
  onOpenChange,
  title,
  description,
  rows,
  actionLabel = 'Done',
  onAction,
  secondaryLabel,
  onSecondary
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description?: string
  rows?: SuccessRow[]
  actionLabel?: string
  onAction?: () => void
  secondaryLabel?: string
  onSecondary?: () => void
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="text-center">
        <div className="flex flex-col items-center pt-2">
          <span className="flex h-14 w-14 items-center justify-center rounded-full bg-up/10">
            <GlassIcon icon={Check} size={22} iconClassName="text-up" />
          </span>
          <h2 className="mt-4 text-xl font-semibold tracking-tight">{title}</h2>
          {description && <p className="mt-1.5 text-sm text-muted-foreground">{description}</p>}
        </div>

        {rows && rows.length > 0 && (
          <div className="mt-6 space-y-3 border-t border-border pt-4 text-left text-sm">
            {rows.map((r) => (
              <div key={r.label} className="flex items-center justify-between gap-3">
                <span className="text-muted-foreground">{r.label}</span>
                <span className="font-medium">{r.value}</span>
              </div>
            ))}
          </div>
        )}

        <div className="mt-6 flex flex-col gap-2">
          <Button
            onClick={() => {
              onOpenChange(false)
              onAction?.()
            }}
            className="w-full"
            size="lg"
          >
            {actionLabel}
          </Button>
          {secondaryLabel && (
            <Button
              variant="ghost"
              onClick={() => {
                onOpenChange(false)
                onSecondary?.()
              }}
              className="w-full"
            >
              {secondaryLabel}
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
