import React from 'react'
import { type LucideIcon } from 'lucide-react'
import { cn } from '../../lib/utils'
import GlassIcon from '../ui/GlassIcon'

export default function FeatureRow({
  icon: Icon,
  eyebrow,
  title,
  description,
  align = 'left',
  children
}: {
  icon: LucideIcon
  eyebrow: string
  title: string
  description: string
  align?: 'left' | 'right'
  children?: React.ReactNode
}) {
  return (
    <div className={cn('grid items-center gap-10 py-14 md:grid-cols-2', align === 'right' && 'md:[direction:rtl]')}>
      <div className="md:[direction:ltr]">
        <GlassIcon icon={Icon} size={20} iconClassName="text-primary" />
        <p className="mt-5 text-2xs font-medium uppercase tracking-wide text-primary">{eyebrow}</p>
        <h3 className="mt-2 text-2xl font-semibold tracking-tight">{title}</h3>
        <p className="mt-3 max-w-md text-muted-foreground">{description}</p>
      </div>
      <div className="md:[direction:ltr]">{children}</div>
    </div>
  )
}
