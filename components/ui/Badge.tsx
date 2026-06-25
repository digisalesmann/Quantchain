import React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '../../lib/utils'

const badgeVariants = cva('inline-flex items-center rounded-full px-2 py-0.5 text-2xs font-medium', {
  variants: {
    variant: {
      neutral: 'bg-muted text-muted-foreground',
      primary: 'bg-primary/10 text-primary',
      up: 'bg-up/10 text-up',
      down: 'bg-down/10 text-down',
      warning: 'bg-amber-500/10 text-amber-500',
      outline: 'border border-border text-foreground'
    }
  },
  defaultVariants: { variant: 'neutral' }
})

export default function Badge({
  className,
  variant,
  ...props
}: React.HTMLAttributes<HTMLSpanElement> & VariantProps<typeof badgeVariants>) {
  return <span className={cn(badgeVariants({ variant }), className)} {...props} />
}
