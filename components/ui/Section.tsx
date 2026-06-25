import React from 'react'
import { cn } from '../../lib/utils'

export function Section({ className, children }: { className?: string; children: React.ReactNode }) {
  return <section className={cn('py-10 first:pt-0', className)}>{children}</section>
}

export function SectionHeader({
  title,
  description,
  action,
  className
}: {
  title: string
  description?: string
  action?: React.ReactNode
  className?: string
}) {
  return (
    <div className={cn('mb-6 flex items-start justify-between gap-4', className)}>
      <div>
        <h2 className="text-lg font-semibold tracking-tight">{title}</h2>
        {description && <p className="mt-1 text-sm text-muted-foreground">{description}</p>}
      </div>
      {action}
    </div>
  )
}
