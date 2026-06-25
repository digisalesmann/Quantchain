import React from 'react'
import { Check } from 'lucide-react'
import GlassIcon from './GlassIcon'
import { cn } from '../../lib/utils'

export default function Stepper({ steps, current }: { steps: string[]; current: number }) {
  return (
    <div className="flex items-center gap-2">
      {steps.map((label, i) => {
        const done = i < current
        const active = i === current
        return (
          <React.Fragment key={label}>
            <div className="flex items-center gap-2">
              <span
                className={cn(
                  'flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-2xs font-semibold transition-colors',
                  done && 'bg-primary text-primary-foreground',
                  active && 'border-2 border-primary text-primary',
                  !done && !active && 'border border-border text-muted-foreground'
                )}
              >
                {done ? <GlassIcon icon={Check} size={10} iconClassName="text-primary-foreground" /> : i + 1}
              </span>
              <span className={cn('hidden text-xs font-medium sm:inline', active ? 'text-foreground' : 'text-muted-foreground')}>{label}</span>
            </div>
            {i < steps.length - 1 && <div className={cn('h-px flex-1', done ? 'bg-primary' : 'bg-border')} />}
          </React.Fragment>
        )
      })}
    </div>
  )
}
